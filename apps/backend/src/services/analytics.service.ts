import { prisma } from '../config/prisma';
import { Prisma } from '@prisma/client';

/* ═══════════════════════════════════════════════════════════════════════════════
   ANALYTICS SERVICE — Enterprise data analytics for admin dashboards
   
   All queries are tenant-scoped via institutionId.
   Uses raw SQL aggregations for performance on time-series data.
   ═══════════════════════════════════════════════════════════════════════════════ */

/**
 * Application trend — daily counts for the last N days
 */
export const getApplicationTrend = async (institutionId: string, days = 30) => {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const rows = await prisma.$queryRaw<Array<{ date: string; count: bigint }>>`
    SELECT DATE("createdAt") as date, COUNT(*)::bigint as count
    FROM applications
    WHERE "institutionId" = ${institutionId}
      AND "createdAt" >= ${since}
    GROUP BY DATE("createdAt")
    ORDER BY date ASC
  `;

  // Fill gaps (days with 0 applications)
  const result: Array<{ date: string; count: number }> = [];
  const dateMap = new Map(rows.map(r => [r.date.toString().slice(0, 10), Number(r.count)]));
  
  for (let i = days; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    result.push({ date: key, count: dateMap.get(key) ?? 0 });
  }

  return result;
};

/**
 * Admission funnel — conversion rates through pipeline stages
 */
export const getAdmissionFunnel = async (institutionId: string) => {
  const [total, submitted, underReview, approved, rejected] = await Promise.all([
    prisma.application.count({ where: { institutionId } }),
    prisma.application.count({
      where: { institutionId, submittedAt: { not: null } },
    }),
    prisma.application.count({
      where: { institutionId, status: 'UNDER_REVIEW' },
    }),
    prisma.application.count({
      where: { institutionId, status: 'APPROVED' },
    }),
    prisma.application.count({
      where: { institutionId, status: 'REJECTED' },
    }),
  ]);

  const stages = [
    { stage: 'Created', count: total, rate: 100 },
    { stage: 'Submitted', count: submitted, rate: total > 0 ? Math.round((submitted / total) * 100) : 0 },
    { stage: 'Under Review', count: underReview + approved + rejected, rate: total > 0 ? Math.round(((underReview + approved + rejected) / total) * 100) : 0 },
    { stage: 'Approved', count: approved, rate: total > 0 ? Math.round((approved / total) * 100) : 0 },
  ];

  return { stages, total, approved, rejected };
};

/**
 * Revenue analytics — daily revenue + breakdowns
 */
export const getRevenueAnalytics = async (institutionId: string, days = 30) => {
  const since = new Date();
  since.setDate(since.getDate() - days);

  // Daily revenue trend
  const dailyRevenue = await prisma.$queryRaw<Array<{ date: string; total: any }>>`
    SELECT DATE(p."paidAt") as date, SUM(p.amount)::numeric as total
    FROM payments p
    JOIN applications a ON a.id = p."applicationId"
    WHERE a."institutionId" = ${institutionId}
      AND p.status = 'SUCCESS'
      AND p."paidAt" >= ${since}
    GROUP BY DATE(p."paidAt")
    ORDER BY date ASC
  `;

  // Revenue by program (top 10)
  const byProgram = await prisma.$queryRaw<Array<{ name: string; total: any; count: bigint }>>`
    SELECT pr.name, SUM(p.amount)::numeric as total, COUNT(*)::bigint as count
    FROM payments p
    JOIN applications a ON a.id = p."applicationId"
    JOIN programs pr ON pr.id = a."programId"
    WHERE a."institutionId" = ${institutionId}
      AND p.status = 'SUCCESS'
    GROUP BY pr.name
    ORDER BY total DESC
    LIMIT 10
  `;

  // Revenue by college
  const byCollege = await prisma.$queryRaw<Array<{ name: string; total: any; count: bigint }>>`
    SELECT c.name, SUM(p.amount)::numeric as total, COUNT(*)::bigint as count
    FROM payments p
    JOIN applications a ON a.id = p."applicationId"
    JOIN programs pr ON pr.id = a."programId"
    JOIN colleges c ON c.id = pr."collegeId"
    WHERE a."institutionId" = ${institutionId}
      AND p.status = 'SUCCESS'
    GROUP BY c.name
    ORDER BY total DESC
    LIMIT 10
  `;

  // Fill daily revenue gaps
  const revenueMap = new Map(
    dailyRevenue.map(r => [r.date.toString().slice(0, 10), Number(r.total)])
  );
  const trend: Array<{ date: string; revenue: number }> = [];
  for (let i = days; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    trend.push({ date: key, revenue: revenueMap.get(key) ?? 0 });
  }

  return {
    trend,
    byProgram: byProgram.map(r => ({ name: r.name, total: Number(r.total), count: Number(r.count) })),
    byCollege: byCollege.map(r => ({ name: r.name, total: Number(r.total), count: Number(r.count) })),
  };
};

/**
 * Top programs by application count
 */
export const getTopPrograms = async (institutionId: string, limit = 10) => {
  const programs = await prisma.program.findMany({
    where: { institutionId, isActive: true },
    select: {
      id: true,
      name: true,
      degreeLevel: true,
      college: { select: { name: true } },
      _count: { select: { applications: true } },
    },
    orderBy: { applications: { _count: 'desc' } },
    take: limit,
  });

  return programs.map(p => ({
    name: p.name,
    degreeLevel: p.degreeLevel,
    college: p.college.name,
    applications: p._count.applications,
  }));
};

/**
 * Processing metrics — review performance stats
 */
export const getProcessingMetrics = async (institutionId: string) => {
  // Applications currently in review queue
  const queueDepth = await prisma.application.count({
    where: { institutionId, status: 'UNDER_REVIEW' },
  });

  // Oldest pending application age (days)
  const oldest = await prisma.application.findFirst({
    where: { institutionId, status: 'UNDER_REVIEW' },
    orderBy: { submittedAt: 'asc' },
    select: { submittedAt: true },
  });

  const oldestPendingDays = oldest?.submittedAt
    ? Math.floor((Date.now() - new Date(oldest.submittedAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  // Average review time (for approved/rejected apps)
  const avgReview = await prisma.$queryRaw<Array<{ avg_days: any }>>`
    SELECT AVG(
      EXTRACT(EPOCH FROM (
        (SELECT MIN(sh."createdAt") FROM application_status_history sh 
         WHERE sh."applicationId" = a.id AND sh.status IN ('APPROVED', 'REJECTED'))
        - a."submittedAt"
      )) / 86400
    )::numeric as avg_days
    FROM applications a
    WHERE a."institutionId" = ${institutionId}
      AND a.status IN ('APPROVED', 'REJECTED')
      AND a."submittedAt" IS NOT NULL
  `;

  const avgReviewTimeDays = avgReview[0]?.avg_days ? Math.round(Number(avgReview[0].avg_days) * 10) / 10 : null;

  // Today's processed count
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const processedToday = await prisma.applicationStatusHistory.count({
    where: {
      application: { institutionId },
      status: { in: ['APPROVED', 'REJECTED'] },
      createdAt: { gte: today },
    },
  });

  // Pending payment > 48h (stale)
  const staleDate = new Date();
  staleDate.setHours(staleDate.getHours() - 48);
  const stalePayments = await prisma.application.count({
    where: {
      institutionId,
      status: 'PENDING_PAYMENT',
      updatedAt: { lte: staleDate },
    },
  });

  return {
    queueDepth,
    oldestPendingDays,
    avgReviewTimeDays,
    processedToday,
    stalePayments,
  };
};

/**
 * Recent activity feed — last N actions across the platform
 */
export const getActivityFeed = async (institutionId: string, limit = 20) => {
  const logs = await prisma.auditLog.findMany({
    where: { institutionId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      user: {
        select: {
          email: true,
          role: true,
          studentProfile: { select: { firstName: true, lastName: true } },
        },
      },
    },
  });

  return logs.map(log => ({
    id: log.id,
    action: log.action,
    entity: log.entity,
    entityId: log.entityId,
    details: log.details,
    actor: log.user
      ? {
          email: log.user.email,
          name: log.user.studentProfile
            ? `${log.user.studentProfile.firstName} ${log.user.studentProfile.lastName}`
            : log.user.email.split('@')[0],
          role: log.user.role,
        }
      : null,
    timestamp: log.createdAt,
  }));
};

/**
 * Applications by region — geographic distribution
 */
export const getApplicationsByRegion = async (institutionId: string) => {
  const data = await prisma.$queryRaw<Array<{ region: string; count: bigint }>>`
    SELECT COALESCE(sp.region, 'Unknown') as region, COUNT(*)::bigint as count
    FROM applications a
    JOIN users u ON u.id = a."userId"
    LEFT JOIN student_profiles sp ON sp."userId" = u.id
    WHERE a."institutionId" = ${institutionId}
    GROUP BY COALESCE(sp.region, 'Unknown')
    ORDER BY count DESC
  `;

  return data.map(r => ({ region: r.region, count: Number(r.count) }));
};

/**
 * Export applications as CSV data (returns array of row objects)
 */
export const exportApplicationsCSV = async (institutionId: string, filters?: { status?: string; startDate?: string; endDate?: string }) => {
  const where: any = { institutionId };
  if (filters?.status) where.status = filters.status;
  if (filters?.startDate && filters?.endDate) {
    where.createdAt = { gte: new Date(filters.startDate), lte: new Date(filters.endDate) };
  }

  const apps = await prisma.application.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          email: true,
          studentProfile: { select: { firstName: true, lastName: true, phone: true, region: true } },
        },
      },
      program: { select: { name: true, code: true, college: { select: { name: true } } } },
      payments: { where: { status: 'SUCCESS' }, select: { amount: true, paidAt: true } },
    },
  });

  return apps.map(a => ({
    'Application #': a.applicationNumber ?? '',
    'Status': a.status,
    'Student Name': a.user?.studentProfile ? `${a.user.studentProfile.firstName} ${a.user.studentProfile.lastName}` : '',
    'Email': a.user?.email ?? '',
    'Phone': a.user?.studentProfile?.phone ?? '',
    'Region': a.user?.studentProfile?.region ?? '',
    'Program': a.program?.name ?? '',
    'Program Code': a.program?.code ?? '',
    'College': a.program?.college?.name ?? '',
    'Payment': a.payments[0] ? `${a.payments[0].amount} ETB` : 'Unpaid',
    'Submitted': a.submittedAt?.toISOString() ?? '',
    'Created': a.createdAt.toISOString(),
  }));
};

/**
 * Export payments as CSV data
 */
export const exportPaymentsCSV = async (institutionId: string, filters?: { status?: string; startDate?: string; endDate?: string }) => {
  const where: any = { application: { institutionId } };
  if (filters?.status) where.status = filters.status;
  if (filters?.startDate && filters?.endDate) {
    where.createdAt = { gte: new Date(filters.startDate), lte: new Date(filters.endDate) };
  }

  const payments = await prisma.payment.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      application: {
        include: {
          user: { select: { email: true, studentProfile: { select: { firstName: true, lastName: true } } } },
          program: { select: { name: true } },
        },
      },
    },
  });

  return payments.map(p => ({
    'Transaction Ref': p.chapaTxRef,
    'Status': p.status,
    'Amount': Number(p.amount),
    'Currency': p.currency,
    'Student': p.application?.user?.studentProfile ? `${p.application.user.studentProfile.firstName} ${p.application.user.studentProfile.lastName}` : '',
    'Email': p.application?.user?.email ?? '',
    'Program': p.application?.program?.name ?? '',
    'Paid At': p.paidAt?.toISOString() ?? '',
    'Created': p.createdAt.toISOString(),
  }));
};
