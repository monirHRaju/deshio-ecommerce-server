import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';
import AppError from '../utils/AppError';

const validate = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const issues = (result.error as any).errors ?? (result.error as any).issues ?? [];
    const message = issues.map((e: any) => e.message).join(', ') || 'Validation failed';
      return next(new AppError(message, 400));
    }
    req.body = result.data;
    next();
  };
};

export default validate;
