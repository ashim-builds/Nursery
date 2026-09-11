import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../../config/database.js';
import { ENV } from '../../config/env.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { AuthService } from './auth.service.js';

export class OAuthController {
  /**
   * 1. Get Google OAuth Authorization URL
   */
  static getGoogleAuthUrl = asyncHandler(async (_req: Request, res: Response) => {
    if (!ENV.GOOGLE_CLIENT_ID || !ENV.GOOGLE_CLIENT_SECRET) {
      return res.status(200).json(
        ApiResponse.success(
          { url: null, configured: false, clientId: null },
          'Google OAuth is not configured on this server'
        )
      );
    }

    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const options = {
      redirect_uri: ENV.GOOGLE_CALLBACK_URL,
      client_id: ENV.GOOGLE_CLIENT_ID,
      access_type: 'offline',
      response_type: 'code',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
      ].join(' '),
    };

    const qs = new URLSearchParams(options).toString();
    const url = `${rootUrl}?${qs}`;

    return res.status(200).json(
      ApiResponse.success(
        { url, configured: true, clientId: ENV.GOOGLE_CLIENT_ID },
        'Google OAuth URL generated'
      )
    );
  });

  /**
   * 2. Handle Google OAuth Callback / Token Exchange
   */
  static handleGoogleAuth = asyncHandler(async (req: Request, res: Response) => {
    const code = (req.body?.code || req.query?.code) as string;
    const credential = req.body?.credential as string;

    let googleUser: {
      sub: string;
      email: string;
      name: string;
      picture?: string;
    };

    if (credential) {
      // Decode JWT credential from Google One Tap / Google Sign-In SDK
      try {
        const parts = credential.split('.');
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
        googleUser = {
          sub: payload.sub,
          email: payload.email,
          name: payload.name || payload.given_name || 'Botanical Customer',
          picture: payload.picture,
        };
      } catch (err) {
        throw ApiError.badRequest('Invalid Google ID token payload');
      }
    } else if (code) {
      // Exchange authorization code with Google token endpoint
      try {
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            code,
            client_id: ENV.GOOGLE_CLIENT_ID,
            client_secret: ENV.GOOGLE_CLIENT_SECRET,
            redirect_uri: ENV.GOOGLE_CALLBACK_URL,
            grant_type: 'authorization_code',
          }),
        });

        const tokenData = await tokenRes.json();
        if (!tokenRes.ok || !tokenData.access_token) {
          throw new Error(tokenData.error_description || 'Failed to exchange Google OAuth code');
        }

        const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });

        const profile = await userRes.json();
        googleUser = {
          sub: profile.sub,
          email: profile.email,
          name: profile.name || 'Botanical Customer',
          picture: profile.picture,
        };
      } catch (err: any) {
        throw ApiError.badRequest(`Google OAuth exchange failed: ${err.message}`);
      }
    } else {
      throw ApiError.badRequest('Either Google code or credential must be provided');
    }

    if (!googleUser.email) {
      throw ApiError.badRequest('Google did not provide a valid email address');
    }

    const email = googleUser.email.toLowerCase();

    // Check if user exists or create new user
    let user = await prisma.user.findUnique({
      where: { email },
      include: { oauthAccounts: true },
    });

    if (!user) {
      // Sanitize name to remove any accidental numeric characters per requirement
      const cleanName = googleUser.name.replace(/[0-9]/g, '').trim() || 'Botanical Customer';
      const randomPassword = await bcrypt.hash(Math.random().toString(36), 12);

      user = await prisma.user.create({
        data: {
          email,
          name: cleanName,
          passwordHash: randomPassword,
          role: 'CUSTOMER',
          isActive: true,
          oauthAccounts: {
            create: {
              provider: 'google',
              providerUserId: googleUser.sub,
              email,
            },
          },
        },
        include: { oauthAccounts: true },
      });
    } else {
      // Link Google OAuth account if not already linked
      const hasGoogle = user.oauthAccounts.some((acc) => acc.provider === 'google');
      if (!hasGoogle) {
        await prisma.oAuthAccount.create({
          data: {
            userId: user.id,
            provider: 'google',
            providerUserId: googleUser.sub,
            email,
          },
        });
      }
    }

    // Generate tokens via AuthService
    const { accessToken, refreshToken } = await AuthService.generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    // Set auth cookies
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('ktm_access_token', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });
    res.cookie('ktm_refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    // If initiated from standard browser redirect (GET), redirect to frontend
    if (req.method === 'GET') {
      const frontendUrl = ENV.FRONTEND_URL || 'https://rjflowers.com';
      return res.redirect(`${frontendUrl}/`);
    }

    return res.status(200).json(
      ApiResponse.success(
        {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.name,
            role: user.role,
          },
          accessToken,
          refreshToken,
        },
        'Google authentication successful'
      )
    );
  });
}
