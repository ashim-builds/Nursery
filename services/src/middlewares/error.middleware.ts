import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError.js';
import { ENV } from '../config/env.js';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, [], err.stack);
  }

  const response: {
    success: boolean;
    message: string;
    errors: any[];
    stack?: string;
  } = {
    success: false,
    message: error.message,
    errors: error.errors || [],
    ...(ENV.NODE_ENV === 'development' ? { stack: error.stack } : {}),
  };

  console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, error.message);

  res.status(error.statusCode).json(response);
};
