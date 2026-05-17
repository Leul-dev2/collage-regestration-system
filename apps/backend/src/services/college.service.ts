import { prisma } from '../config/prisma';
import { AppError } from '../utils/appError';

interface CollegeQuery {
  institutionId: string;
  page?: number;
  limit?: number;
  search?: string;
  location?: string;
  isActive?: boolean;
}

export const getColleges = async (query: CollegeQuery) => {
  const page = query.page || 1;
  const limit = query.limit || 10;
  const skip = (page - 1) * limit;

  const where: any = { institutionId: query.institutionId };
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { code: { contains: query.search, mode: 'insensitive' } },
      { description: { contains: query.search, mode: 'insensitive' } },
    ];
  }
  if (query.location) {
    where.location = { contains: query.location, mode: 'insensitive' };
  }
  if (query.isActive !== undefined) {
    where.isActive = query.isActive;
  }

  const [colleges, total] = await Promise.all([
    prisma.college.findMany({
      where,
      skip,
      take: limit,
      orderBy: { name: 'asc' },
      include: { _count: { select: { programs: true } } },
    }),
    prisma.college.count({ where }),
  ]);

  return {
    data: colleges,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getCollegeById = async (id: string, institutionId: string) => {
  const college = await prisma.college.findFirst({
    where: { id, institutionId },
    include: { programs: { where: { isActive: true } } },
  });
  if (!college) throw new AppError('College not found', 404);
  return college;
};

export const createCollege = async (data: {
  institutionId: string;
  name: string;
  code: string;
  description?: string;
  location?: string;
}) => {
  const existing = await prisma.college.findUnique({ 
    where: { 
      institutionId_code: {
        institutionId: data.institutionId,
        code: data.code
      }
    } 
  });
  if (existing) throw new AppError('College code already exists in this institution', 400);

  return prisma.college.create({ data });
};

export const updateCollege = async (id: string, institutionId: string, data: any) => {
  const college = await prisma.college.findFirst({ where: { id, institutionId } });
  if (!college) throw new AppError('College not found', 404);

  return prisma.college.update({ where: { id }, data });
};

export const deleteCollege = async (id: string, institutionId: string) => {
  const college = await prisma.college.findFirst({ where: { id, institutionId } });
  if (!college) throw new AppError('College not found', 404);

  // Soft delete
  return prisma.college.update({ where: { id }, data: { isActive: false } });
};
