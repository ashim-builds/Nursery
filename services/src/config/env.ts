import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Multi-path .env resolution: supports local development, cPanel Passenger, and Docker
const candidateNames = ['.env', 'env', '.env.txt', 'env.txt', 'production.env', '.env.production'];
const candidateDirs = [
  process.cwd(),
  __dirname,
  path.resolve(__dirname, '..'),
  path.resolve(__dirname, '../..'),
  '/home/rjflower/api.rjflowers.com',
];

let envLoaded = false;
for (const dir of candidateDirs) {
  for (const name of candidateNames) {
    try {
      const fullPath = path.resolve(dir, name);
      if (fs.existsSync(fullPath)) {
        dotenv.config({ path: fullPath });
        envLoaded = true;
        break;
      }
    } catch {
      // continue
    }
  }
  if (envLoaded) break;
}
if (!envLoaded) {
  dotenv.config();
}

export const ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'nursery_super_secret_jwt_access_token_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'nursery_super_secret_jwt_refresh_token_2026',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  COOKIE_SECRET: process.env.COOKIE_SECRET || 'nursery_secure_cookie_signing_secret_2026',
  FRONTEND_URL: process.env.FRONTEND_URL || process.env.CLIENT_URL || 'https://rjflowers.com',
  BACKEND_URL: process.env.BACKEND_URL || 'https://api.rjflowers.com',
  CORS_ORIGIN: process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'https://rjflowers.com',

  // Google OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
  VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY || '',
  VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY || '',

  // SMTP Email Configuration
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 465,
  SMTP_SECURE: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : true, // true for 465, false for other ports
  SMTP_USER: (process.env.SMTP_USER || 'ashim.sandbox@gmail.com').trim(),
  SMTP_PASS: (process.env.SMTP_PASS || 'cgydhteodxikdiud').replace(/\s+/g, ''),
  SMTP_FROM: process.env.SMTP_FROM || 'RJ Flowers & Nursery <ashim.sandbox@gmail.com>',
};
