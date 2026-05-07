import type { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Always log the full error in development
  console.error(`[Error] ${err.name}: ${err.message}`);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Mongoose ValidationError → 400 with the first validation message
  if (err.name === 'ValidationError') {
    const mongooseErr = err as any;
    const firstMsg = Object.values(mongooseErr.errors ?? {})[0] as any;
    res.status(400).json({
      success: false,
      message: firstMsg?.message ?? err.message,
    });
    return;
  }

  // Mongoose CastError (invalid ObjectId etc.) → 400
  if (err.name === 'CastError') {
    res.status(400).json({
      success: false,
      message: `Invalid value for field: ${(err as any).path}`,
    });
    return;
  }

  // Mongoose duplicate key → 409
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue ?? {})[0] ?? 'field';
    res.status(409).json({
      success: false,
      message: `Duplicate value for ${field}`,
    });
    return;
  }

  const statusCode = err.statusCode ?? 500;
  res.status(statusCode).json({
    success: false,
    message: err.message ?? 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
