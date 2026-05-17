import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/appError';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      institutionId?: string;
      institution?: {
        id: string;
        slug: string;
        name: string;
      };
    }
  }
}

export const tenantMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // Identification strategy: 
  // 1. Check for X-Tenant-ID header (useful for API testing/development)
  // 2. Check for subdomain (e.g. aau.platform.com)
  
  let tenantSlug = req.headers['x-tenant-slug'] as string;

  if (!tenantSlug) {
    const host = req.headers.host || '';
    const parts = host.split('.');
    if (parts.length >= 3) {
      tenantSlug = parts[0];
    }
  }

  // Fallback for development if no tenant specified
  if (!tenantSlug && process.env.NODE_ENV === 'development') {
    tenantSlug = 'aau'; // Default to AAU for now
  }

  if (!tenantSlug) {
    return next(new AppError('No institution specified', 400));
  }

  try {
    const institution = await prisma.institution.findUnique({
      where: { slug: tenantSlug, isActive: true },
      select: { id: true, slug: true, name: true }
    });

    if (!institution) {
      return next(new AppError('Institution not found or inactive', 404));
    }

    req.institutionId = institution.id;
    req.institution = institution;
    
    next();
  } catch (error) {
    next(error);
  }
};
