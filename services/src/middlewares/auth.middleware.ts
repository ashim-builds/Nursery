import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { prisma } from '../config/database.js';
import { UserRole } from '@prisma/client';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    name: string;
  };
}

export const extractCookie = (req: Request, name: string): string | undefined => {
  if ((req as any).cookies && (req as any).cookies[name]) {
    return (req as any).cookies[name];
  }
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return undefined;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
};

export const authenticateJWT = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    let token = extractCookie(req, 'ktm_access_token');
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw ApiError.unauthorized('Authentication token is required');
    }

    const decoded = jwt.verify(token, ENV.JWT_SECRET) as { id: string; email: string; role: UserRole; name: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true, name: true, isActive: true },
    });

    if (!user || !user.isActive) {
      throw ApiError.unauthorized('User account is inactive or not found');
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      next(ApiError.unauthorized('Token has expired. Please log in again.'));
    } else if (error.name === 'JsonWebTokenError') {
      next(ApiError.unauthorized('Invalid authentication token'));
    } else {
      next(error);
    }
  }
};

export const optionalAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    let token = extractCookie(req, 'ktm_access_token');
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(token, ENV.JWT_SECRET) as { id: string; email: string; role: UserRole; name: string };
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true, role: true, name: true, isActive: true },
      });
      if (user && user.isActive) {
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
        };
      }
    }
    next();
  } catch {
    next();
  }
};

export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden(`Access restricted to roles: ${allowedRoles.join(', ')}`));
    }

    next();
  };
};
