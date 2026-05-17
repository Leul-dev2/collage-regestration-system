import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { AppError } from '../utils/appError';
import { prisma } from '../config/prisma';

export interface AuthRequest extends Request {
  user: {
    id: string;
    role: string;
  };
}

/**
 * Protect routes – verifies the JWT access token.
 * Uses stateless JWT claims for role (no DB hit on every request).
 * Only hits DB if the token is valid but we need to verify user still exists.
 */
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('You are not logged in. Please log in to get access.', 401));
    }

    const decoded = verifyAccessToken(token);

    // Lightweight DB check – only verify existence + verification status
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, role: true, isVerified: true },
    });

    if (!user) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    (req as any).user = { id: user.id, role: user.role, isVerified: user.isVerified };
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Your token has expired. Please log in again.', 401));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token. Please log in again.', 401));
    }
    next(error);
  }
};

/**
 * Require that the authenticated user has verified their email.
 * Use after protect() middleware.
 */
export const requireVerified = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (!user) {
    return next(new AppError('Authentication required', 401));
  }
  if (!user.isVerified) {
    return next(new AppError('Please verify your email address before proceeding. Check your inbox for the verification link.', 403));
  }
  next();
};

/**
 * Restrict access to specific roles.
 */
export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes((req as any).user?.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};
