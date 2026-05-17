import { prisma } from '../config/prisma';
import { AppError } from '../utils/appError';
import bcrypt from 'bcrypt';

export const createInstitution = async (data: {
  name: string;
  slug: string;
  adminEmail: string;
  adminPassword?: string;
  primaryColor?: string;
}) => {
  const { name, slug, adminEmail, adminPassword, primaryColor } = data;

  // Check if slug or name already exists
  const existing = await prisma.institution.findFirst({
    where: { OR: [{ slug }, { name }] }
  });
  if (existing) {
    throw new AppError('Institution with this name or slug already exists', 400);
  }

  return prisma.$transaction(async (tx: any) => {
    // 1. Create Institution
    const institution = await tx.institution.create({
      data: {
        name,
        slug,
        primaryColor: primaryColor || '#1e40af',
        contactEmail: adminEmail,
      },
    });

    // 2. Create Initial Admin for this institution
    const passwordHash = await bcrypt.hash(adminPassword || 'Admin@123', 12);
    await tx.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        role: 'INSTITUTION_ADMIN',
        institutionId: institution.id,
        isVerified: true,
      },
    });

    return institution;
  });
};

export const getInstitutions = async () => {
  return prisma.institution.findMany({
    include: {
      _count: {
        select: {
          users: true,
          applications: true,
        },
      },
    },
  });
};

export const getInstitutionById = async (id: string) => {
  const inst = await prisma.institution.findUnique({
    where: { id },
    include: {
      colleges: true,
      _count: { select: { users: true, applications: true } }
    }
  });
  if (!inst) throw new AppError('Institution not found', 404);
  return inst;
};
