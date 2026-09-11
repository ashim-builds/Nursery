import { prisma } from '../config/database.js';
import crypto from 'crypto';

interface InMemoryOtp {
  id: string;
  email: string;
  otp: string;
  type: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

// In-memory fallback map: email:type -> InMemoryOtp[]
const memoryOtpStore = new Map<string, InMemoryOtp[]>();

let tableInitialized = false;

async function ensureOtpTable() {
  if (tableInitialized) return;
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS \`email_otps\` (
        \`id\` VARCHAR(191) NOT NULL,
        \`email\` VARCHAR(191) NOT NULL,
        \`otp\` VARCHAR(191) NOT NULL,
        \`type\` VARCHAR(191) NOT NULL DEFAULT 'AUTH',
        \`expiresAt\` DATETIME(3) NOT NULL,
        \`used\` BOOLEAN NOT NULL DEFAULT FALSE,
        \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        PRIMARY KEY (\`id\`),
        INDEX \`email_otps_email_otp_idx\` (\`email\`, \`otp\`),
        INDEX \`email_otps_email_type_idx\` (\`email\`, \`type\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    tableInitialized = true;
  } catch (err: any) {
    // If DB has permission restrictions, ignore and rely on memory store
  }
}

export class OtpService {
  static async saveOtp(email: string, otp: string, type: 'REGISTER' | 'LOGIN'): Promise<void> {
    const normalizedEmail = email.trim().toLowerCase();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    const id = crypto.randomUUID();

    // 1. Save in memory store
    const key = `${normalizedEmail}:${type}`;
    const list = memoryOtpStore.get(key) || [];
    // Mark old ones used
    list.forEach(item => { item.used = true; });
    list.push({
      id,
      email: normalizedEmail,
      otp: otp.trim(),
      type,
      expiresAt,
      used: false,
      createdAt: new Date(),
    });
    memoryOtpStore.set(key, list);

    // 2. Try DB storage (Prisma or raw SQL)
    await ensureOtpTable();
    try {
      if ((prisma as any).emailOtp?.create) {
        await (prisma as any).emailOtp.create({
          data: {
            id,
            email: normalizedEmail,
            otp: otp.trim(),
            type,
            expiresAt,
            used: false,
          },
        });
        return;
      }
    } catch {
      // fallback to raw SQL
    }

    try {
      await prisma.$executeRawUnsafe(
        'INSERT INTO `email_otps` (`id`, `email`, `otp`, `type`, `expiresAt`, `used`, `createdAt`) VALUES (?, ?, ?, ?, ?, ?, NOW())',
        id,
        normalizedEmail,
        otp.trim(),
        type,
        expiresAt,
        false
      );
    } catch (dbErr: any) {
      console.warn('⚠️ [OTP] Failed to persist OTP to SQL table, using memory store:', dbErr.message);
    }
  }

  static async verifyAndConsumeOtp(email: string, otp: string, type: 'REGISTER' | 'LOGIN'): Promise<boolean> {
    const normalizedEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();
    const now = new Date();

    // 1. Check in-memory store first
    const key = `${normalizedEmail}:${type}`;
    const memoryList = memoryOtpStore.get(key) || [];
    const memoryMatch = memoryList
      .filter(item => !item.used && item.otp === cleanOtp && item.expiresAt > now)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

    if (memoryMatch) {
      memoryMatch.used = true;
      // Also mark in DB if possible
      try {
        await prisma.$executeRawUnsafe('UPDATE `email_otps` SET `used` = TRUE WHERE `id` = ?', memoryMatch.id);
      } catch {}
      return true;
    }

    // 2. Check via Prisma Model if available
    try {
      if ((prisma as any).emailOtp?.findFirst) {
        const record = await (prisma as any).emailOtp.findFirst({
          where: {
            email: normalizedEmail,
            otp: cleanOtp,
            type,
            used: false,
            expiresAt: { gt: now },
          },
          orderBy: { createdAt: 'desc' },
        });

        if (record) {
          await (prisma as any).emailOtp.update({
            where: { id: record.id },
            data: { used: true },
          });
          return true;
        }
      }
    } catch {
      // fallback to raw query
    }

    // 3. Check via raw SQL query
    try {
      const records: any = await prisma.$queryRawUnsafe(
        'SELECT `id`, `expiresAt`, `used` FROM `email_otps` WHERE `email` = ? AND `otp` = ? AND `type` = ? AND `used` = 0 AND `expiresAt` > NOW() ORDER BY `createdAt` DESC LIMIT 1',
        normalizedEmail,
        cleanOtp,
        type
      );

      if (records && records.length > 0) {
        const found = records[0];
        await prisma.$executeRawUnsafe('UPDATE `email_otps` SET `used` = 1 WHERE `id` = ?', found.id);
        return true;
      }
    } catch (sqlErr: any) {
      console.warn('⚠️ [OTP] Error checking raw SQL OTP:', sqlErr.message);
    }

    return false;
  }
}
