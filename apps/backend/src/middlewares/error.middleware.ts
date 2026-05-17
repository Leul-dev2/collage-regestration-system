import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';
import { env } from '../config/env';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  console.error('ERROR:', err.name, err.message, err.code);

  // Extract a clean user-friendly message
  let message = err.message || 'Something went wrong';

  // Handle Prisma errors
  if (err.code === 'P2002') {
    message = 'A record with this value already exists';
    err.statusCode = 400;
  } else if (err.code === 'P2025') {
    message = 'Record not found';
    err.statusCode = 404;
  } else if (err.name === 'PrismaClientValidationError') {
    message = 'Invalid data provided';
    err.statusCode = 400;
  } else if (err.name === 'PrismaClientKnownRequestError') {
    message = 'Database request error';
    err.statusCode = 400;
  }

  // Handle multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    message = 'File size exceeds the 10MB limit';
    err.statusCode = 400;
  }

  // Handle Zod validation errors
  if (err.issues) {
    message = err.issues.map((i: any) => i.message).join(', ');
    err.statusCode = 400;
  }

  // Always return a clean JSON response (no stack traces or error objects to frontend)
  const response: any = {
    status: err.status,
    message,
  };

  // Only add stack in dev for debugging (won't affect toast display)
  if (env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(err.statusCode).json(response);
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
};
