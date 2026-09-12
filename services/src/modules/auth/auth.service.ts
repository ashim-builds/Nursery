import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database.js';
import { ENV } from '../../config/env.js';
import { ApiError } from '../../utils/ApiError.js';
import { UserRole } from '@prisma/client';
import { sendOtpEmail } from '../../services/email.service.js';
import { OtpService } from '../../services/otp.service.js';

export interface TokenPayload {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

export class AuthService {
  static async sendOtp(email: string, type: 'REGISTER' | 'LOGIN' = 'REGISTER', fullName?: string) {
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (type === 'REGISTER' && existingUser) {
      throw ApiError.conflict('An account with this email address already exists. Please log in.');
    }

    if (type === 'LOGIN' && !existingUser) {
      throw ApiError.notFound('No account found with this email address. Please register first.');
    }

    if (type === 'LOGIN' && existingUser && !existingUser.isActive) {
      throw ApiError.unauthorized('Account is suspended. Please contact support.');
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Persist OTP via resilient OtpService
    await OtpService.saveOtp(normalizedEmail, otp, type);

    const recipientName = fullName || existingUser?.name;
    const emailResult = await sendOtpEmail({
      to: normalizedEmail,
      otp,
      type,
      userName: recipientName,
    });

    if (!emailResult.success && !emailResult.simulated) {
      throw ApiError.badRequest(`Could not send OTP email: ${emailResult.error || 'SMTP delivery error'}. Please verify your email or try again.`);
    }

    return {
      message: emailResult.simulated
        ? `OTP generated (Check server console in development: ${otp})`
        : `Verification code sent to ${normalizedEmail}`,
      email: normalizedEmail,
      type,
      simulated: emailResult.simulated,
    };
  }

  static async verifyOtpRegister(data: {
    fullName: string;
    email: string;
    password: string;
    otp: string;
    phoneNumber?: string;
    address?: string;
    city?: string;
  }) {
    const email = data.email.trim().toLowerCase();
    const otp = data.otp.trim();

    // Verify OTP via resilient OtpService
    const isValid = await OtpService.verifyAndConsumeOtp(email, otp, 'REGISTER');

    if (!isValid) {
      throw ApiError.badRequest('Invalid or expired verification code. Please request a new one.');
    }

    // Delegate to register
    return await this.register({
      fullName: data.fullName,
      name: data.fullName,
      email,
      password: data.password,
      phoneNumber: data.phoneNumber,
      address: data.address,
      city: data.city,
    });
  }

  static async verifyOtpLogin(email: string, otp: string, ipAddress?: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    // Verify OTP via resilient OtpService
    const isValid = await OtpService.verifyAndConsumeOtp(normalizedEmail, cleanOtp, 'LOGIN');

    if (!isValid) {
      throw ApiError.badRequest('Invalid or expired verification code. Please request a new one.');
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        addresses: { where: { isDefault: true } },
        staffProfile: true,
      },
    });

    if (!user || !user.isActive) {
      throw ApiError.unauthorized('Account not found or inactive');
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
        action: 'USER_OTP_LOGIN',
        resource: 'User',
        resourceId: user.id,
        details: { role: user.role, method: 'OTP' },
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
        city: defaultAddress?.city || 'Pokhara',
        createdAt: user.createdAt,
      },
      ...tokens,
    };
  }

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
                  city: data.city || 'Pokhara',
                  isDefault: true,
                },
              ],
            }
          : undefined,
        cart: {
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
        city: defaultAddr?.city || 'Pokhara',
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
      const passwordHash = await bcrypt.hash('Rjflowers@2026!', 10);
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
