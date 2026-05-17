import { prisma } from '../config/prisma';

export const getDashboardStats = async (institutionId: string) => {
  const tenantFilter = { institutionId };

  const [
    totalStudents,
    totalApplications,
    totalColleges,
    totalPrograms,
    pendingReview,
    approved,
    rejected,
    pendingPayment,
    incompleteCount,
    paidCount,
    recentApplications,
    applicationsByStatus,
    recentPayments,
    totalRevenue,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'STUDENT', ...tenantFilter } }),
    prisma.application.count({ where: tenantFilter }),
    prisma.college.count({ where: { isActive: true, ...tenantFilter } }),
    prisma.program.count({ where: { isActive: true, ...tenantFilter } }),
    prisma.application.count({ where: { status: 'UNDER_REVIEW', ...tenantFilter } }),
    prisma.application.count({ where: { status: 'APPROVED', ...tenantFilter } }),
    prisma.application.count({ where: { status: 'REJECTED', ...tenantFilter } }),
    prisma.application.count({ where: { status: 'PENDING_PAYMENT', ...tenantFilter } }),
    prisma.application.count({ where: { status: 'INCOMPLETE', ...tenantFilter } }),
    prisma.payment.count({ where: { status: 'SUCCESS', application: tenantFilter } }),
    prisma.application.findMany({
      take: 10,
      where: tenantFilter,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            email: true,
            studentProfile: { select: { firstName: true, lastName: true } },
          },
        },
        program: {
          select: {
            name: true,
            college: { select: { name: true } },
          },
        },
      },
    }),
    prisma.application.groupBy({
      by: ['status'],
      where: tenantFilter,
      _count: { status: true },
    }),
    prisma.payment.findMany({
      take: 10,
      where: { status: 'SUCCESS', application: tenantFilter },
      orderBy: { createdAt: 'desc' },
      include: {
        application: {
          include: {
            user: {
              select: { studentProfile: { select: { firstName: true, lastName: true } } },
            },
            program: { select: { name: true } },
          },
        },
      },
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'SUCCESS', application: tenantFilter },
    }),
  ]);

  return {
    overview: {
      totalStudents,
      totalApplications,
      totalColleges,
      totalPrograms,
      pendingReview,
      approved,
      rejected,
      pendingPayment,
      pendingPaymentCount: pendingPayment,
      incompleteCount,
      paidCount,
      totalRevenue: totalRevenue._sum.amount || 0,
    },
    applicationsByStatus,
    recentApplications,
    recentPayments,
  };
};

export const getUsers = async (query: {
  institutionId: string;
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}) => {
  const page = query.page || 1;
  const limit = query.limit || 20;
  const skip = (page - 1) * limit;

  const where: any = { institutionId: query.institutionId };
  if (query.role) where.role = query.role;
  if (query.search) {
    where.OR = [
      { email: { contains: query.search, mode: 'insensitive' } },
      { studentProfile: { firstName: { contains: query.search, mode: 'insensitive' } } },
      { studentProfile: { lastName: { contains: query.search, mode: 'insensitive' } } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        role: true,
        isVerified: true,
        createdAt: true,
        studentProfile: {
          select: { firstName: true, lastName: true, phone: true, region: true },
        },
        _count: { select: { applications: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    data: users,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

export const getAuditLogs = async (query: {
  institutionId: string;
  page?: number;
  limit?: number;
}) => {
  const page = query.page || 1;
  const limit = query.limit || 50;
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where: { institutionId: query.institutionId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { email: true, studentProfile: { select: { firstName: true, lastName: true } } },
        },
      },
    }),
    prisma.auditLog.count({ where: { institutionId: query.institutionId } }),
  ]);

  return {
    data: logs,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

export const getPayments = async (query: {
  institutionId: string;
  page?: number;
  limit?: number;
  status?: string;
}) => {
  const page = query.page || 1;
  const limit = query.limit || 20;
  const skip = (page - 1) * limit;

  const appFilter = { institutionId: query.institutionId };
  const where: any = { application: appFilter };
  if (query.status) where.status = query.status;

  const [payments, total, successCount, pendingCount, totalRevenueAgg] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        application: {
          include: {
            user: {
              select: {
                email: true,
                studentProfile: { select: { firstName: true, lastName: true } },
              },
            },
            program: { select: { name: true } },
          },
        },
      },
    }),
    prisma.payment.count({ where }),
    prisma.payment.count({ where: { status: 'SUCCESS', application: appFilter } }),
    prisma.payment.count({ where: { status: 'PENDING', application: appFilter } }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'SUCCESS', application: appFilter },
    }),
  ]);

  return {
    data: payments,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    stats: {
      successCount,
      pendingCount,
      totalRevenue: totalRevenueAgg._sum.amount || 0,
    },
  };
};
