import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError.js';
import { ENV } from '../config/env.js';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let error = err;

  // Ensure CORS headers are explicitly set on error responses
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  let message = error?.message || 'Internal Server Error';
  if (message.includes('Error validating datasource `db`') || message.includes('DATABASE_URL')) {
    message = 'Database configuration error: Please verify that DATABASE_URL is properly configured in the server .env file (must start with mysql://).';
  }

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    error = new ApiError(statusCode, message, [], err?.stack);
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
