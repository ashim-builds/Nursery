import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database.js';
import { ENV } from '../../config/env.js';
import { ApiError } from '../../utils/ApiError.js';
import { UserRole } from '@prisma/client';

export interface TokenPayload {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

export class AuthService {
  static async generateTokens(payload: TokenPayload) {
    const accessToken = jwt.sign(payload, ENV.JWT_SECRET, {
      expiresIn: (ENV.JWT_EXPIRES_IN || '7d') as any,
    });

    const refreshTokenString = jwt.sign(
      { id: payload.id, email: payload.email },
      ENV.JWT_REFRESH_SECRET,
      { expiresIn: (ENV.JWT_REFRESH_EXPIRES_IN || '30d') as any }
    );

    // Calculate expiry date for DB record (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Persist refresh token in database for server-side revocability
    await prisma.refreshToken.create({
      data: {
        userId: payload.id,
        token: refreshTokenString,
        expiresAt,
      },
    });

    return { accessToken, refreshToken: refreshTokenString };
  }

  static async register(data: {
    name?: string;
    fullName?: string;
    email: string;
    password: string;
    phoneNumber?: string;
    address?: string;
    city?: string;
  }) {
    const name = data.name || data.fullName || 'Gardener';
    const email = data.email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw ApiError.conflict('An account with this email address already exists');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        phoneNumber: data.phoneNumber,
        role: UserRole.CUSTOMER,
        addresses: data.address
          ? {
              create: [
                {
                  label: 'Default',
                  fullName: name,
                  phoneNumber: data.phoneNumber || '',
                  streetAddress: data.address,
                  city: data.city || 'Kathmandu',
                  isDefault: true,
                },
              ],
            }
          : undefined,
        cart: {
          create: {},
        },
        wishlist: {
          create: {},
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        phoneNumber: true,
        role: true,
        createdAt: true,
        addresses: true,
      },
    });

    const tokens = await this.generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_REGISTER',
        resource: 'User',
        resourceId: user.id,
        details: { email: user.email, role: user.role },
      },
    });

    const defaultAddr = user.addresses[0];

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        fullName: user.name,
        phoneNumber: user.phoneNumber,
        role: user.role,
        address: defaultAddr?.streetAddress,
        city: defaultAddr?.city || 'Kathmandu',
        createdAt: user.createdAt,
      },
      ...tokens,
    };
  }

  static async adminPasswordLogin(password: string, ipAddress?: string) {
    if (!password) {
      throw ApiError.badRequest('Password is required');
    }

    let admin = await prisma.user.findFirst({
      where: { role: UserRole.ADMIN },
    });

    if (!admin) {
      const passwordHash = await bcrypt.hash('admin123', 10);
      admin = await prisma.user.create({
        data: {
          name: 'RJ Flowers Admin',
          email: 'admin@rjflowers.com',
          passwordHash,
          role: UserRole.ADMIN,
        },
      });
    }

    const isValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isValid) {
      throw ApiError.unauthorized('Incorrect admin password');
    }

    const tokens = await this.generateTokens({
      id: admin.id,
      email: admin.email,
      role: admin.role,
      name: admin.name,
    });

    return {
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        fullName: admin.name,
        role: admin.role,
      },
      ...tokens,
    };
  }

  static async login(email: string, password: string, ipAddress?: string) {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        addresses: { where: { isDefault: true } },
        staffProfile: true,
      },
    });

    if (!user || !user.isActive) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const tokens = await this.generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const defaultAddress = user.addresses[0];

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_LOGIN',
        resource: 'User',
        resourceId: user.id,
        details: { role: user.role },
        ipAddress,
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        fullName: user.name,
        phoneNumber: user.phoneNumber,
        role: user.role,
        staffProfile: user.staffProfile,
        address: defaultAddress?.streetAddress,
        city: defaultAddress?.city || 'Kathmandu',
        createdAt: user.createdAt,
      },
      ...tokens,
    };
  }

  static async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, ENV.JWT_REFRESH_SECRET) as {
        id: string;
        email: string;
      };

      // Verify token exists in database and has not been revoked
      const tokenRecord = await prisma.refreshToken.findFirst({
        where: {
          token: refreshToken,
          userId: decoded.id,
          revokedAt: null,
          expiresAt: { gt: new Date() },
        },
      });

      if (!tokenRecord) {
        throw ApiError.unauthorized('Refresh token is invalid, expired, or revoked');
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true, role: true, name: true, isActive: true },
      });

      if (!user || !user.isActive) {
        throw ApiError.unauthorized('User account is inactive or not found');
      }

      // Revoke old refresh token (Token Rotation)
      await prisma.refreshToken.update({
        where: { id: tokenRecord.id },
        data: { revokedAt: new Date() },
      });

      // Generate new access & refresh token pair
      const tokens = await this.generateTokens({
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      });

      return tokens;
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }
  }

  static async logout(refreshToken?: string, userId?: string) {
    if (refreshToken) {
      await prisma.refreshToken.updateMany({
        where: { token: refreshToken, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    } else if (userId) {
      // Revoke all tokens for user on total logout
      await prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }

    if (userId) {
      await prisma.auditLog.create({
        data: {
          userId,
          action: 'USER_LOGOUT',
          resource: 'User',
          resourceId: userId,
        },
      });
    }

    return { message: 'Logged out successfully' };
  }

  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phoneNumber: true,
        role: true,
        isActive: true,
        createdAt: true,
        addresses: true,
        staffProfile: true,
        _count: {
          select: {
            orders: true,
            reviews: true,
            notifications: { where: { isRead: false } },
          },
        },
      },
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const defaultAddr = user.addresses.find((a) => a.isDefault) || user.addresses[0];

    return {
      ...user,
      fullName: user.name,
      address: defaultAddr?.streetAddress,
      city: defaultAddr?.city || 'Kathmandu',
      unreadNotifications: user._count.notifications,
    };
  }
}
