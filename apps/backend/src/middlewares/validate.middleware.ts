import { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodError, ZodRawShape } from 'zod';
import { AppError } from '../utils/appError';

export const validate = (schema: ZodObject<ZodRawShape>) => 
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        return res.status(400).json({
          status: 'fail',
          message: 'Validation failed',
          errors,
        });
      }
      next(error);
    }
  };
