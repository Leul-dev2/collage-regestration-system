import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import * as adminService from '../services/admin.service';
import * as analyticsService from '../services/analytics.service';

const router = Router();

// All admin routes require authentication + admin role
router.use(protect, restrictTo('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'ADMISSION_OFFICER', 'FINANCE_OFFICER', 'REGISTRAR'));

/* ═══════════════════════════════════════════════════════════════════════════════
   CORE DASHBOARD
   ═══════════════════════════════════════════════════════════════════════════════ */

router.get('/dashboard', asyncHandler(async (req, res) => {
  const stats = await adminService.getDashboardStats(req.institutionId!);
  res.status(200).json({ status: 'success', data: stats });
}));

/* ═══════════════════════════════════════════════════════════════════════════════
   ENTERPRISE ANALYTICS
   ═══════════════════════════════════════════════════════════════════════════════ */

// Time-series application trend (last N days)
router.get('/analytics/application-trend', asyncHandler(async (req, res) => {
  const days = Number(req.query.days) || 30;
  const data = await analyticsService.getApplicationTrend(req.institutionId!, days);
  res.status(200).json({ status: 'success', data });
}));

// Admission funnel (conversion rates)
router.get('/analytics/funnel', asyncHandler(async (req, res) => {
  const data = await analyticsService.getAdmissionFunnel(req.institutionId!);
  res.status(200).json({ status: 'success', data });
}));

// Revenue analytics (trends + breakdowns)
router.get('/analytics/revenue', restrictTo('SUPER_ADMIN', 'FINANCE_OFFICER'), asyncHandler(async (req, res) => {
  const days = Number(req.query.days) || 30;
  const data = await analyticsService.getRevenueAnalytics(req.institutionId!, days);
  res.status(200).json({ status: 'success', data });
}));

// Top programs by application count
router.get('/analytics/top-programs', asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 10;
  const data = await analyticsService.getTopPrograms(req.institutionId!, limit);
  res.status(200).json({ status: 'success', data });
}));

// Processing metrics (queue depth, avg review time, stale payments)
router.get('/analytics/processing', asyncHandler(async (req, res) => {
  const data = await analyticsService.getProcessingMetrics(req.institutionId!);
  res.status(200).json({ status: 'success', data });
}));

// Activity feed (recent audit log entries)
router.get('/analytics/activity', asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 20;
  const data = await analyticsService.getActivityFeed(req.institutionId!, limit);
  res.status(200).json({ status: 'success', data });
}));

// Applications by region
router.get('/analytics/regions', asyncHandler(async (req, res) => {
  const data = await analyticsService.getApplicationsByRegion(req.institutionId!);
  res.status(200).json({ status: 'success', data });
}));

/* ═══════════════════════════════════════════════════════════════════════════════
   CSV EXPORTS
   ═══════════════════════════════════════════════════════════════════════════════ */

function toCSV(rows: Record<string, any>[]): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(','),
    ...rows.map(row =>
      headers.map(h => {
        const val = String(row[h] ?? '');
        // Escape values containing commas or quotes
        return val.includes(',') || val.includes('"') || val.includes('\n')
          ? `"${val.replace(/"/g, '""')}"`
          : val;
      }).join(',')
    ),
  ];
  return lines.join('\n');
}

router.get('/export/applications', restrictTo('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'REGISTRAR'), asyncHandler(async (req, res) => {
  const { status, startDate, endDate } = req.query;
  const data = await analyticsService.exportApplicationsCSV(req.institutionId!, {
    status: status as string,
    startDate: startDate as string,
    endDate: endDate as string,
  });
  
  const csv = toCSV(data);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=applications_${new Date().toISOString().slice(0, 10)}.csv`);
  res.send(csv);
}));

router.get('/export/payments', restrictTo('SUPER_ADMIN', 'FINANCE_OFFICER'), asyncHandler(async (req, res) => {
  const { status, startDate, endDate } = req.query;
  const data = await analyticsService.exportPaymentsCSV(req.institutionId!, {
    status: status as string,
    startDate: startDate as string,
    endDate: endDate as string,
  });
  
  const csv = toCSV(data);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=payments_${new Date().toISOString().slice(0, 10)}.csv`);
  res.send(csv);
}));

/* ═══════════════════════════════════════════════════════════════════════════════
   EXISTING ENDPOINTS (preserved)
   ═══════════════════════════════════════════════════════════════════════════════ */

router.get('/users', asyncHandler(async (req, res) => {
  const { page, limit, search, role } = req.query;
  const result = await adminService.getUsers({
    institutionId: req.institutionId!,
    page: Number(page) || 1,
    limit: Number(limit) || 20,
    search: search as string,
    role: role as string,
  });
  res.status(200).json({ status: 'success', ...result });
}));

router.get('/audit-logs', restrictTo('SUPER_ADMIN', 'INSTITUTION_ADMIN'), asyncHandler(async (req, res) => {
  const result = await adminService.getAuditLogs({
    institutionId: req.institutionId!,
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 50,
  });
  res.status(200).json({ status: 'success', ...result });
}));

router.get('/payments', asyncHandler(async (req, res) => {
  const { page, limit, status } = req.query;
  const result = await adminService.getPayments({
    institutionId: req.institutionId!,
    page: Number(page) || 1,
    limit: Number(limit) || 20,
    status: status as string,
  });
  res.status(200).json({ status: 'success', ...result });
}));

export default router;
