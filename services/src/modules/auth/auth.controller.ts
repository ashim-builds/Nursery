import { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware.js';
import { ApiError } from '../../utils/ApiError.js';

const setAuthCookies = (res: Response, accessToken: string, refreshToken?: string) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('ktm_access_token', accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
  if (refreshToken) {
    res.cookie('ktm_refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      path: '/',
    });
  }
};

export class AuthController {
  static sendOtp = asyncHandler(async (req: Request, res: Response) => {
    const { email, type, fullName } = req.body;
    const result = await AuthService.sendOtp(email, type, fullName);
    res.status(200).json(ApiResponse.success(result, result.message));
  });

  static verifyOtpRegister = asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.verifyOtpRegister(req.body);
    setAuthCookies(res, result.accessToken, result.refreshToken);
    res.status(201).json(ApiResponse.created(result, 'Account created and verified successfully'));
  });

  static verifyOtpLogin = asyncHandler(async (req: Request, res: Response) => {
    const { email, otp } = req.body;
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
    const result = await AuthService.verifyOtpLogin(email, otp, ipAddress);
    setAuthCookies(res, result.accessToken, result.refreshToken);
    res.status(200).json(ApiResponse.success(result, 'Logged in successfully'));
  });

  static register = asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.register(req.body);
    setAuthCookies(res, result.accessToken, result.refreshToken);
    res.status(201).json(ApiResponse.created(result, 'Account created successfully'));
  });

  static login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
    const result = await AuthService.login(email, password, ipAddress);
    setAuthCookies(res, result.accessToken, result.refreshToken);
    res.status(200).json(ApiResponse.success(result, 'Logged in successfully'));
  });

  static adminPasswordLogin = asyncHandler(async (req: Request, res: Response) => {
    const { password } = req.body;
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
    const result = await AuthService.adminPasswordLogin(password, ipAddress);
    setAuthCookies(res, result.accessToken, result.refreshToken);
    res.status(200).json(ApiResponse.success(result, 'Admin authenticated successfully'));
  });

  static logout = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const refreshToken = req.body?.refreshToken || (req.headers['x-refresh-token'] as string);
    const userId = req.user?.id;
    const result = await AuthService.logout(refreshToken, userId);
    res.clearCookie('ktm_access_token', { path: '/' });
    res.clearCookie('ktm_refresh_token', { path: '/' });
    res.status(200).json(ApiResponse.success(result, 'Logged out successfully'));
  });

  static refresh = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.body?.refreshToken || (req.headers['x-refresh-token'] as string);
    if (!refreshToken) {
      throw ApiError.badRequest('Refresh token is required');
    }
    const result = await AuthService.refreshToken(refreshToken);
    res.status(200).json(ApiResponse.success(result, 'Token refreshed successfully'));
  });

  static getMe = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const profile = await AuthService.getMe(userId);
    res.status(200).json(ApiResponse.success(profile, 'User profile retrieved'));
  });
}
