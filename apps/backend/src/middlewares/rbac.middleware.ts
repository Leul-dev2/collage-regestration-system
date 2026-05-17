import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';

/**
 * Enterprise RBAC Permission Matrix
 * Maps roles to their allowed permission scopes.
 */
const PERMISSIONS: Record<string, string[]> = {
  SUPER_ADMIN: ['*'], // Wildcard – can do everything

  INSTITUTION_ADMIN: [
    'dashboard:view',
    'applications:view', 'applications:review', 'applications:export',
    'colleges:view', 'colleges:manage',
    'programs:view', 'programs:manage',
    'users:view', 'users:manage',
    'payments:view',
    'documents:view', 'documents:verify',
    'notifications:manage',
    'audit:view',
    'settings:manage',
  ],

  ADMISSION_OFFICER: [
    'dashboard:view',
    'applications:view', 'applications:review',
    'documents:view', 'documents:verify',
    'notifications:view',
  ],

  FINANCE_OFFICER: [
    'dashboard:view',
    'applications:view',
    'payments:view', 'payments:verify',
    'notifications:view',
  ],

  REGISTRAR: [
    'dashboard:view',
    'applications:view', 'applications:review', 'applications:export',
    'documents:view', 'documents:verify',
    'users:view',
    'notifications:view',
  ],

  STUDENT: [
    'applications:own',
    'documents:own',
    'payments:own',
    'notifications:own',
    'profile:own',
  ],
};

/**
 * Check if the authenticated user has the required permission.
 * Usage: router.get('/route', protect, checkPermission('applications:review'), handler)
 */
export const checkPermission = (...requiredPermissions: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const userRole = (req as any).user?.role;
    if (!userRole) {
      return next(new AppError('Authentication required', 401));
    }

    const rolePermissions = PERMISSIONS[userRole] || [];

    // Wildcard check (SUPER_ADMIN)
    if (rolePermissions.includes('*')) {
      return next();
    }

    const hasPermission = requiredPermissions.every(perm => rolePermissions.includes(perm));
    if (!hasPermission) {
      return next(new AppError('You do not have the required permissions for this action', 403));
    }

    next();
  };
};

/**
 * Get all permissions for a given role (useful for frontend to show/hide UI elements).
 */
export const getPermissionsForRole = (role: string): string[] => {
  return PERMISSIONS[role] || [];
};
