import { prisma } from '../config/prisma';
import { AppError } from '../utils/appError';

interface ProgramQuery {
  institutionId: string;
  page?: number;
  limit?: number;
  search?: string;
  collegeId?: string;
  degreeLevel?: string;
  isActive?: boolean;
}

export const getPrograms = async (query: ProgramQuery) => {
  const page = query.page || 1;
  const limit = query.limit || 10;
  const skip = (page - 1) * limit;

  const where: any = { institutionId: query.institutionId };
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { code: { contains: query.search, mode: 'insensitive' } },
    ];
  }
  if (query.collegeId) where.collegeId = query.collegeId;
  if (query.degreeLevel) where.degreeLevel = query.degreeLevel;
  if (query.isActive !== undefined) where.isActive = query.isActive;

  const [programs, total] = await Promise.all([
    prisma.program.findMany({
      where,
      skip,
      take: limit,
      orderBy: { name: 'asc' },
      include: { college: { select: { id: true, name: true } } },
    }),
    prisma.program.count({ where }),
  ]);

  return {
    data: programs,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getProgramById = async (id: string, institutionId: string) => {
  const program = await prisma.program.findFirst({
    where: { id, institutionId },
    include: { college: true },
  });
  if (!program) throw new AppError('Program not found', 404);
  return program;
};

export const createProgram = async (data: {
  institutionId: string;
  collegeId: string;
  name: string;
  code: string;
  degreeLevel: string;
  durationYears: number;
  registrationFee: number;
  tuitionFee: number;
  requirements?: string;
}) => {
  // Check if college belongs to the same institution
  const college = await prisma.college.findFirst({
    where: { id: data.collegeId, institutionId: data.institutionId }
  });
  if (!college) throw new AppError('College not found in this institution', 404);

  const existing = await prisma.program.findUnique({
    where: {
      institutionId_code: {
        institutionId: data.institutionId,
        code: data.code
      }
    }
  });
  if (existing) throw new AppError('Program code already exists in this institution', 400);

  return prisma.program.create({ data });
};

export const updateProgram = async (id: string, institutionId: string, data: any) => {
  const program = await prisma.program.findFirst({ where: { id, institutionId } });
  if (!program) throw new AppError('Program not found', 404);

  return prisma.program.update({ where: { id }, data });
};

export const deleteProgram = async (id: string, institutionId: string) => {
  const program = await prisma.program.findFirst({ where: { id, institutionId } });
  if (!program) throw new AppError('Program not found', 404);

  // Soft delete
  return prisma.program.update({ where: { id }, data: { isActive: false } });
};
