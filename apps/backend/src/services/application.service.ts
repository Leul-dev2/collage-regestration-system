import { prisma } from '../config/prisma';
import { AppError } from '../utils/appError';
import { ApplicationStatus } from '@prisma/client';
import crypto from 'crypto';

const generateApplicationNumber = (slug: string) => {
  const year = new Date().getFullYear();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${slug.toUpperCase()}-${year}-${random}`;
};

interface ApplicationQuery {
  page?: number;
  limit?: number;
  status?: ApplicationStatus;
  userId?: string;
  programId?: string;
  institutionId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export const getApplications = async (query: ApplicationQuery) => {
  const page = query.page || 1;
  const limit = query.limit || 10;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (query.status) where.status = query.status;
  if (query.userId) where.userId = query.userId;
  if (query.programId) where.programId = query.programId;
  if (query.institutionId) where.institutionId = query.institutionId;

  if (query.search) {
    where.OR = [
      { applicationNumber: { contains: query.search, mode: 'insensitive' } },
      { user: { email: { contains: query.search, mode: 'insensitive' } } },
      { user: { studentProfile: { firstName: { contains: query.search, mode: 'insensitive' } } } },
      { user: { studentProfile: { lastName: { contains: query.search, mode: 'insensitive' } } } },
    ];
  }

  if (query.startDate && query.endDate) {
    where.createdAt = {
      gte: new Date(query.startDate),
      lte: new Date(query.endDate),
    };
  }

  const [applications, total] = await Promise.all([
    prisma.application.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        program: { include: { college: { select: { id: true, name: true } } } },
        user: {
          select: {
            id: true,
            email: true,
            studentProfile: { select: { firstName: true, lastName: true } },
          },
        },
        documents: true,
        payments: true,
        _count: { select: { statusHistory: true } },
      },
    }),
    prisma.application.count({ where }),
  ]);

  return {
    data: applications,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

export const getApplicationById = async (id: string, institutionId?: string) => {
  const where: any = { id };
  if (institutionId) where.institutionId = institutionId;

  const application = await prisma.application.findFirst({
    where,
    include: {
      program: { include: { college: true } },
      user: {
        select: {
          id: true,
          email: true,
          studentProfile: true,
        },
      },
      documents: true,
      payments: { orderBy: { createdAt: 'desc' } },
      statusHistory: { orderBy: { createdAt: 'desc' } },
    },
  });
  if (!application) throw new AppError('Application not found', 404);
  return application;
};

/**
 * Check if a user already has an application for a given program.
 * Returns the existing application (for "resume draft" UX) or null.
 */
export const checkDuplicateApplication = async (userId: string, programId: string, institutionId: string) => {
  const existing = await prisma.application.findFirst({
    where: { userId, programId, institutionId },
    include: {
      program: { include: { college: { select: { id: true, name: true } } } },
      documents: true,
      payments: true,
    },
  });
  return existing; // null if none found
};

/**
 * Save partial draft data (autosave). Only works for DRAFT/INCOMPLETE applications.
 * Currently a no-op on the Application model itself (no extra fields needed),
 * but triggers an updatedAt bump so the frontend can track last-save time.
 */
export const saveDraft = async (applicationId: string, userId: string) => {
  const application = await prisma.application.findUnique({ where: { id: applicationId } });
  if (!application) throw new AppError('Application not found', 404);
  if (application.userId !== userId) throw new AppError('Not authorized', 403);
  if (!['DRAFT', 'INCOMPLETE'].includes(application.status)) {
    throw new AppError('Cannot save draft at this stage', 400);
  }

  // Touch updatedAt
  const updated = await prisma.application.update({
    where: { id: applicationId },
    data: { updatedAt: new Date() },
  });

  return updated;
};

export const createApplication = async (userId: string, programId: string, institutionId: string) => {
  // Check program exists and is active in the current institution
  const program = await prisma.program.findFirst({ 
    where: { id: programId, institutionId } 
  });
  
  if (!program || !program.isActive) {
    throw new AppError('Program not found or not accepting applications', 400);
  }

  // Check for duplicate application (unique constraint on userId+programId)
  const existing = await prisma.application.findUnique({
    where: { userId_programId: { userId, programId } },
  });
  
  if (existing) {
    throw new AppError('You have already applied to this program', 400);
  }

  // Get institution slug for number generation
  const inst = await prisma.institution.findUnique({ where: { id: institutionId } });
  const applicationNumber = generateApplicationNumber(inst?.slug || 'APP');

  const application = await prisma.$transaction(async (tx: any) => {
    const app = await tx.application.create({
      data: {
        userId,
        programId,
        institutionId,
        applicationNumber,
        status: 'DRAFT',
      },
      include: {
        program: { include: { college: { select: { id: true, name: true } } } },
      },
    });

    await tx.applicationStatusHistory.create({
      data: {
        applicationId: app.id,
        status: 'DRAFT',
        notes: 'Application created',
      },
    });

    return app;
  });

  return application;
};

export const submitApplication = async (applicationId: string, userId: string, institutionId: string) => {
  const application = await prisma.application.findFirst({
    where: { id: applicationId, institutionId },
    include: { documents: true },
  });

  if (!application) throw new AppError('Application not found', 404);
  if (application.userId !== userId) throw new AppError('Not authorized', 403);
  if (!['DRAFT', 'INCOMPLETE'].includes(application.status)) {
    throw new AppError('Application has already been submitted', 400);
  }

  // Validate that required documents are uploaded
  if (application.documents.length === 0) {
    throw new AppError('Please upload required documents before submitting', 400);
  }

  const updated = await prisma.$transaction(async (tx: any) => {
    const app = await tx.application.update({
      where: { id: applicationId },
      data: { status: 'PENDING_PAYMENT', submittedAt: new Date() },
    });

    await tx.applicationStatusHistory.create({
      data: {
        applicationId: app.id,
        status: 'PENDING_PAYMENT',
        notes: 'Application submitted, awaiting payment',
      },
    });

    return app;
  });

  return updated;
};

export const updateApplicationStatus = async (
  applicationId: string,
  status: ApplicationStatus,
  notes: string | undefined,
  changedBy: string,
  institutionId: string
) => {
  const application = await prisma.application.findFirst({ 
    where: { id: applicationId, institutionId } 
  });
  
  if (!application) throw new AppError('Application not found', 404);

  const updated = await prisma.$transaction(async (tx: any) => {
    const app = await tx.application.update({
      where: { id: applicationId },
      data: { status },
    });

    await tx.applicationStatusHistory.create({
      data: {
        applicationId: app.id,
        status,
        notes,
        changedBy,
      },
    });

    // Create notification for student
    let title = '';
    let message = '';
    switch (status) {
      case 'UNDER_REVIEW':
        title = 'Application Under Review';
        message = `Your application ${application.applicationNumber} is now under review.`;
        break;
      case 'APPROVED':
        title = 'Application Approved!';
        message = `Congratulations! Your application ${application.applicationNumber} has been approved.`;
        break;
      case 'REJECTED':
        title = 'Application Update';
        message = `Your application ${application.applicationNumber} was not approved. ${notes ? `Reason: ${notes}` : ''}`;
        break;
      case 'INCOMPLETE':
        title = 'Application Incomplete';
        message = `Your application ${application.applicationNumber} requires additional information. ${notes || ''}`;
        break;
    }

    if (title) {
      await tx.notification.create({
        data: {
          userId: application.userId,
          institutionId,
          title,
          message,
        },
      });
    }

    // Audit log
    await tx.auditLog.create({
      data: {
        userId: changedBy,
        institutionId,
        action: `STATUS_CHANGE_${status}`,
        entity: 'Application',
        entityId: applicationId,
        details: { previousStatus: application.status, newStatus: status, notes },
      },
    });

    return app;
  });

  return updated;
};
