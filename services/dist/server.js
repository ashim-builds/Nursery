"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/server.ts
var server_exports = {};
__export(server_exports, {
  default: () => server_default
});
module.exports = __toCommonJS(server_exports);
var import_path2 = __toESM(require("path"));
var import_http = __toESM(require("http"));
var import_express12 = __toESM(require("express"));
var import_cors = __toESM(require("cors"));
var import_helmet = __toESM(require("helmet"));
var import_morgan = __toESM(require("morgan"));
var import_compression = __toESM(require("compression"));
var import_express_rate_limit = __toESM(require("express-rate-limit"));

// src/config/env.ts
var import_dotenv = __toESM(require("dotenv"));
import_dotenv.default.config();
var ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5e3,
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL: process.env.DATABASE_URL || "mysql://root:root@localhost:3306/nursery_db",
  JWT_SECRET: process.env.JWT_SECRET || "nursery_super_secret_jwt_access_token_2026",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "nursery_super_secret_jwt_refresh_token_2026",
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  COOKIE_SECRET: process.env.COOKIE_SECRET || "nursery_secure_cookie_signing_secret_2026",
  FRONTEND_URL: process.env.FRONTEND_URL || process.env.CLIENT_URL || "http://localhost",
  BACKEND_URL: process.env.BACKEND_URL || "http://localhost:5000",
  CORS_ORIGIN: process.env.CORS_ORIGIN || process.env.FRONTEND_URL || "http://localhost",
  // Google OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback",
  VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY || "",
  VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY || "",
  // SMTP Email Configuration
  SMTP_HOST: process.env.SMTP_HOST || "smtp.gmail.com",
  SMTP_PORT: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 465,
  SMTP_SECURE: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : true,
  // true for 465, false for other ports
  SMTP_USER: (process.env.SMTP_USER || "ashim.sandbox@gmail.com").trim(),
  SMTP_PASS: (process.env.SMTP_PASS || "cgydhteodxikdiud").replace(/\s+/g, ""),
  SMTP_FROM: process.env.SMTP_FROM || "RJ Flowers & Nursery <ashim.sandbox@gmail.com>"
};

// src/config/database.ts
var import_client = require("@prisma/client");
var globalForPrisma = globalThis;
var prisma = globalForPrisma.prismaGlobal ?? new import_client.PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"]
});
globalForPrisma.prismaGlobal = prisma;
async function connectDB() {
  try {
    await prisma.$connect();
    console.log("\u{1F332} Successfully connected to MySQL database via Prisma");
  } catch (error) {
    console.error("\u274C Failed to connect to MySQL database:", error.message);
  }
}

// src/utils/ApiError.ts
var ApiError = class _ApiError extends Error {
  statusCode;
  errors;
  isOperational;
  constructor(statusCode, message, errors = [], stack = "") {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
  static badRequest(message, errors = []) {
    return new _ApiError(400, message, errors);
  }
  static unauthorized(message = "Unauthorized access") {
    return new _ApiError(401, message);
  }
  static forbidden(message = "Forbidden: Insufficient privileges") {
    return new _ApiError(403, message);
  }
  static notFound(message = "Resource not found") {
    return new _ApiError(404, message);
  }
  static conflict(message = "Conflict: Resource already exists") {
    return new _ApiError(409, message);
  }
  static internal(message = "Internal server error") {
    return new _ApiError(500, message);
  }
};

// src/middlewares/error.middleware.ts
var errorHandler = (err, req, res, next) => {
  let error = err;
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    error = new ApiError(statusCode, message, [], err.stack);
  }
  const response = {
    success: false,
    message: error.message,
    errors: error.errors || [],
    ...ENV.NODE_ENV === "development" ? { stack: error.stack } : {}
  };
  console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, error.message);
  res.status(error.statusCode).json(response);
};

// src/utils/cache.ts
var MemoryCache = class {
  store = /* @__PURE__ */ new Map();
  maxSize;
  hits = 0;
  misses = 0;
  constructor(maxSize = 1e3) {
    this.maxSize = maxSize;
    const cleanupTimer = setInterval(() => this.pruneExpired(), 6e4);
    if (typeof cleanupTimer.unref === "function") {
      cleanupTimer.unref();
    }
  }
  /**
   * Prune expired entries to maintain a tight memory footprint
   */
  pruneExpired() {
    const now = Date.now();
    let pruned = 0;
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
        pruned++;
      }
    }
    return pruned;
  }
  /**
   * Retrieve a value from the cache if not expired.
   */
  get(key) {
    const entry = this.store.get(key);
    if (!entry) {
      this.misses++;
      return null;
    }
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.misses++;
      return null;
    }
    this.store.delete(key);
    this.store.set(key, entry);
    this.hits++;
    return entry.value;
  }
  /**
   * Store a value with a TTL (in seconds).
   */
  set(key, value, ttlSeconds = 300) {
    if (this.store.size >= this.maxSize) {
      const oldestKey = this.store.keys().next().value;
      if (oldestKey) {
        this.store.delete(oldestKey);
      }
    }
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1e3
    });
  }
  /**
   * Delete a specific cache key.
   */
  del(key) {
    return this.store.delete(key);
  }
  /**
   * Invalidate all keys matching a prefix or regex pattern.
   * e.g., clearPattern('products:*') or clearPattern('categories:*')
   */
  clearPattern(pattern) {
    let cleared = 0;
    const isRegex = pattern instanceof RegExp;
    const prefix = typeof pattern === "string" && pattern.endsWith("*") ? pattern.slice(0, -1) : null;
    for (const key of this.store.keys()) {
      let match = false;
      if (isRegex) {
        match = pattern.test(key);
      } else if (prefix) {
        match = key.startsWith(prefix);
      } else {
        match = key.includes(pattern);
      }
      if (match) {
        this.store.delete(key);
        cleared++;
      }
    }
    return cleared;
  }
  /**
   * Clear all items.
   */
  clear() {
    this.store.clear();
    this.hits = 0;
    this.misses = 0;
  }
  /**
   * Get cached value or fetch fresh from producer function.
   */
  async getOrSet(key, fetcher, ttlSeconds = 300) {
    const cached = this.get(key);
    if (cached !== null) {
      return cached;
    }
    const fresh = await fetcher();
    this.set(key, fresh, ttlSeconds);
    return fresh;
  }
  /**
   * Cache diagnostics and statistics.
   */
  getStats() {
    return {
      size: this.store.size,
      maxSize: this.maxSize,
      hits: this.hits,
      misses: this.misses,
      hitRatio: this.hits + this.misses > 0 ? (this.hits / (this.hits + this.misses)).toFixed(3) : "0.000"
    };
  }
};
var appCache = new MemoryCache(1500);
var siteSettingsCache = new MemoryCache(100);
var catalogCache = new MemoryCache(800);

// src/utils/socket.ts
var import_socket = require("socket.io");
var io = null;
function initSocketIO(httpServer2, allowedOrigin = true) {
  io = new import_socket.Server(httpServer2, {
    cors: {
      origin: (origin, callback) => callback(null, true),
      methods: ["GET", "POST", "OPTIONS"],
      credentials: true,
      allowedHeaders: ["*"]
    },
    path: "/socket.io",
    transports: ["polling", "websocket"],
    allowEIO3: true,
    pingTimeout: 6e4,
    pingInterval: 25e3
  });
  io.on("connection", (socket) => {
    socket.on("join", (room) => {
      if (room && typeof room === "string") {
        socket.join(room);
      }
    });
    socket.on("leave", (room) => {
      if (room && typeof room === "string") {
        socket.leave(room);
      }
    });
  });
  return io;
}
function emitLiveEvent(event, payload, room) {
  if (!io) return;
  const data = {
    ...payload,
    _timestamp: Date.now()
  };
  if (room) {
    io.to(room).emit(event, data);
  } else {
    io.emit(event, data);
  }
}

// src/modules/auth/auth.routes.ts
var import_express = require("express");

// src/modules/auth/auth.service.ts
var import_bcryptjs = __toESM(require("bcryptjs"));
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));
var import_client2 = require("@prisma/client");

// src/services/email.service.ts
var transporter = null;
async function getTransporter() {
  if (transporter) return transporter;
  const user = ENV.SMTP_USER ? ENV.SMTP_USER.trim() : "";
  const pass = ENV.SMTP_PASS ? ENV.SMTP_PASS.replace(/\s+/g, "") : "";
  if (!pass) {
    console.warn("\u26A0\uFE0F [EMAIL] SMTP_PASS not set in environment. Email delivery will be simulated in console.");
    return null;
  }
  try {
    const nodemailer = (await import("nodemailer")).default;
    const isGmail = ENV.SMTP_HOST.includes("gmail") || user.includes("@gmail.com");
    if (isGmail) {
      transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user,
          pass
        },
        connectionTimeout: 8e3,
        // 8 seconds
        greetingTimeout: 8e3,
        socketTimeout: 1e4,
        tls: {
          rejectUnauthorized: false
        }
      });
    } else {
      transporter = nodemailer.createTransport({
        host: ENV.SMTP_HOST,
        port: ENV.SMTP_PORT,
        secure: ENV.SMTP_SECURE,
        auth: {
          user,
          pass
        },
        connectionTimeout: 8e3,
        // 8 seconds
        greetingTimeout: 8e3,
        socketTimeout: 1e4,
        tls: {
          rejectUnauthorized: false
        }
      });
    }
    return transporter;
  } catch (error) {
    console.warn("\u26A0\uFE0F [EMAIL] Could not load nodemailer or connect to SMTP:", error.message);
    return null;
  }
}
async function sendOtpEmail({ to, otp, type, userName }) {
  const mailClient = await getTransporter();
  const title = type === "REGISTER" ? "Verify Your Email to Complete Registration" : "Your Login Verification Code";
  const subtitle = type === "REGISTER" ? "Thank you for joining RJ Flowers & Nursery! Use the OTP below to verify your account." : "Use the OTP below to securely log in to your RJ Flowers account.";
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4fbf7; margin: 0; padding: 0; }
        .container { max-width: 540px; margin: 30px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2f0e7; box-shadow: 0 4px 16px rgba(0,0,0,0.04); }
        .header { background: linear-gradient(135deg, #15803d 0%, #166534 100%); padding: 32px 24px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
        .header p { color: #dcfce7; margin: 6px 0 0; font-size: 14px; }
        .content { padding: 32px 28px; color: #374151; }
        .greeting { font-size: 16px; font-weight: 600; margin-bottom: 12px; color: #111827; }
        .desc { font-size: 14px; line-height: 1.6; color: #4b5563; margin-bottom: 24px; }
        .otp-card { background: #f0fdf4; border: 2px dashed #86efac; border-radius: 12px; text-align: center; padding: 24px 16px; margin-bottom: 24px; }
        .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #15803d; margin: 0; }
        .otp-expiry { font-size: 13px; color: #65a30d; margin-top: 10px; font-weight: 500; }
        .footer { background-color: #f9fafb; padding: 20px 24px; text-align: center; border-top: 1px solid #f3f4f6; font-size: 12px; color: #9ca3af; }
        .footer p { margin: 4px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>\u{1F338} RJ Flowers & Nursery</h1>
          <p>Fresh Blooms & Botanical Care</p>
        </div>
        <div class="content">
          <div class="greeting">Hello ${userName ? userName : "there"},</div>
          <div class="desc">${subtitle}</div>
          
          <div class="otp-card">
            <div class="otp-code">${otp}</div>
            <div class="otp-expiry">\u23F1\uFE0F This code is valid for 10 minutes.</div>
          </div>

          <div class="desc" style="font-size: 13px; color: #6b7280; margin-bottom: 0;">
            If you did not request this verification code, please ignore this email or contact our support team. Never share this code with anyone.
          </div>
        </div>
        <div class="footer">
          <p>\xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} RJ Flowers & Nursery. All rights reserved.</p>
          <p>Pokhara-26, Arghau Chowk, Pokhara, Nepal</p>
        </div>
      </div>
    </body>
    </html>
  `;
  const textContent = `
RJ Flowers & Nursery
-------------------------------------
${title}

Hello ${userName || "there"},

${subtitle}

YOUR ONE-TIME PASSWORD (OTP):
${otp}

(This code is valid for 10 minutes. Do not share it with anyone.)

If you did not request this, please ignore this email.
  `.trim();
  console.log(`
========================================`);
  console.log(`\u{1F4E8} [OTP EMAIL - ${type}] to: ${to}`);
  console.log(`\u{1F511} OTP CODE: [ ${otp} ]`);
  console.log(`========================================
`);
  if (!mailClient) {
    return { success: true, simulated: true };
  }
  try {
    await mailClient.sendMail({
      from: ENV.SMTP_FROM,
      to,
      subject: type === "REGISTER" ? `${otp} is your RJ Flowers registration code` : `${otp} is your RJ Flowers login code`,
      text: textContent,
      html: htmlContent
    });
    console.log(`\u2705 [EMAIL] Successfully sent OTP email to ${to}`);
    return { success: true, simulated: false };
  } catch (error) {
    console.error(`\u274C [EMAIL] Error sending email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
}

// src/services/otp.service.ts
var import_crypto = __toESM(require("crypto"));
var memoryOtpCache = new MemoryCache(1e3);
var tableInitialized = false;
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
  } catch (err) {
  }
}
var OtpService = class {
  static async saveOtp(email, otp, type) {
    const normalizedEmail = email.trim().toLowerCase();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1e3);
    const id = import_crypto.default.randomUUID();
    const key = `otp:${normalizedEmail}:${type}`;
    const list = memoryOtpCache.get(key) || [];
    list.forEach((item) => {
      item.used = true;
    });
    list.push({
      id,
      email: normalizedEmail,
      otp: otp.trim(),
      type,
      expiresAt,
      used: false,
      createdAt: /* @__PURE__ */ new Date()
    });
    memoryOtpCache.set(key, list, 600);
    await ensureOtpTable();
    try {
      if (prisma.emailOtp?.create) {
        await prisma.emailOtp.create({
          data: {
            id,
            email: normalizedEmail,
            otp: otp.trim(),
            type,
            expiresAt,
            used: false
          }
        });
        return;
      }
    } catch {
    }
    try {
      await prisma.$executeRawUnsafe(
        "INSERT INTO `email_otps` (`id`, `email`, `otp`, `type`, `expiresAt`, `used`, `createdAt`) VALUES (?, ?, ?, ?, ?, ?, NOW())",
        id,
        normalizedEmail,
        otp.trim(),
        type,
        expiresAt,
        false
      );
    } catch (dbErr) {
      console.warn("\u26A0\uFE0F [OTP] Failed to persist OTP to SQL table, using memory store:", dbErr.message);
    }
  }
  static async verifyAndConsumeOtp(email, otp, type) {
    const normalizedEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();
    const now = /* @__PURE__ */ new Date();
    const key = `otp:${normalizedEmail}:${type}`;
    const memoryList = memoryOtpCache.get(key) || [];
    const memoryMatch = memoryList.filter((item) => !item.used && item.otp === cleanOtp && item.expiresAt > now).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
    if (memoryMatch) {
      memoryMatch.used = true;
      try {
        await prisma.$executeRawUnsafe("UPDATE `email_otps` SET `used` = TRUE WHERE `id` = ?", memoryMatch.id);
      } catch {
      }
      return true;
    }
    try {
      if (prisma.emailOtp?.findFirst) {
        const record = await prisma.emailOtp.findFirst({
          where: {
            email: normalizedEmail,
            otp: cleanOtp,
            type,
            used: false,
            expiresAt: { gt: now }
          },
          orderBy: { createdAt: "desc" }
        });
        if (record) {
          await prisma.emailOtp.update({
            where: { id: record.id },
            data: { used: true }
          });
          return true;
        }
      }
    } catch {
    }
    try {
      const records = await prisma.$queryRawUnsafe(
        "SELECT `id`, `expiresAt`, `used` FROM `email_otps` WHERE `email` = ? AND `otp` = ? AND `type` = ? AND `used` = 0 AND `expiresAt` > NOW() ORDER BY `createdAt` DESC LIMIT 1",
        normalizedEmail,
        cleanOtp,
        type
      );
      if (records && records.length > 0) {
        const found = records[0];
        await prisma.$executeRawUnsafe("UPDATE `email_otps` SET `used` = 1 WHERE `id` = ?", found.id);
        return true;
      }
    } catch (sqlErr) {
      console.warn("\u26A0\uFE0F [OTP] Error checking raw SQL OTP:", sqlErr.message);
    }
    return false;
  }
};

// src/modules/auth/auth.service.ts
var AuthService = class {
  static async sendOtp(email, type = "REGISTER", fullName) {
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });
    if (type === "REGISTER" && existingUser) {
      throw ApiError.conflict("An account with this email address already exists. Please log in.");
    }
    if (type === "LOGIN" && !existingUser) {
      throw ApiError.notFound("No account found with this email address. Please register first.");
    }
    if (type === "LOGIN" && existingUser && !existingUser.isActive) {
      throw ApiError.unauthorized("Account is suspended. Please contact support.");
    }
    const otp = Math.floor(1e5 + Math.random() * 9e5).toString();
    await OtpService.saveOtp(normalizedEmail, otp, type);
    const recipientName = fullName || existingUser?.name;
    const emailResult = await sendOtpEmail({
      to: normalizedEmail,
      otp,
      type,
      userName: recipientName
    });
    if (!emailResult.success && !emailResult.simulated) {
      throw ApiError.badRequest(`Could not send OTP email: ${emailResult.error || "SMTP delivery error"}. Please verify your email or try again.`);
    }
    return {
      message: emailResult.simulated ? `OTP generated (Check server console in development: ${otp})` : `Verification code sent to ${normalizedEmail}`,
      email: normalizedEmail,
      type,
      simulated: emailResult.simulated
    };
  }
  static async verifyOtpRegister(data) {
    const email = data.email.trim().toLowerCase();
    const otp = data.otp.trim();
    const isValid = await OtpService.verifyAndConsumeOtp(email, otp, "REGISTER");
    if (!isValid) {
      throw ApiError.badRequest("Invalid or expired verification code. Please request a new one.");
    }
    return await this.register({
      fullName: data.fullName,
      name: data.fullName,
      email,
      password: data.password,
      phoneNumber: data.phoneNumber,
      address: data.address,
      city: data.city
    });
  }
  static async verifyOtpLogin(email, otp, ipAddress) {
    const normalizedEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();
    const isValid = await OtpService.verifyAndConsumeOtp(normalizedEmail, cleanOtp, "LOGIN");
    if (!isValid) {
      throw ApiError.badRequest("Invalid or expired verification code. Please request a new one.");
    }
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        addresses: { where: { isDefault: true } },
        staffProfile: true
      }
    });
    if (!user || !user.isActive) {
      throw ApiError.unauthorized("Account not found or inactive");
    }
    const tokens = await this.generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    });
    const defaultAddress = user.addresses[0];
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "USER_OTP_LOGIN",
        resource: "User",
        resourceId: user.id,
        details: { role: user.role, method: "OTP" },
        ipAddress
      }
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
        city: defaultAddress?.city || "Pokhara",
        createdAt: user.createdAt
      },
      ...tokens
    };
  }
  static async generateTokens(payload) {
    const accessToken = import_jsonwebtoken.default.sign(payload, ENV.JWT_SECRET, {
      expiresIn: ENV.JWT_EXPIRES_IN || "7d"
    });
    const refreshTokenString = import_jsonwebtoken.default.sign(
      { id: payload.id, email: payload.email },
      ENV.JWT_REFRESH_SECRET,
      { expiresIn: ENV.JWT_REFRESH_EXPIRES_IN || "30d" }
    );
    const expiresAt = /* @__PURE__ */ new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    await prisma.refreshToken.create({
      data: {
        userId: payload.id,
        token: refreshTokenString,
        expiresAt
      }
    });
    return { accessToken, refreshToken: refreshTokenString };
  }
  static async register(data) {
    const name = data.name || data.fullName || "Gardener";
    const email = data.email.trim().toLowerCase();
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    if (existingUser) {
      throw ApiError.conflict("An account with this email address already exists");
    }
    const passwordHash = await import_bcryptjs.default.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        phoneNumber: data.phoneNumber,
        role: import_client2.UserRole.CUSTOMER,
        addresses: data.address ? {
          create: [
            {
              label: "Default",
              fullName: name,
              phoneNumber: data.phoneNumber || "",
              streetAddress: data.address,
              city: data.city || "Pokhara",
              isDefault: true
            }
          ]
        } : void 0,
        cart: {
          create: {}
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        phoneNumber: true,
        role: true,
        createdAt: true,
        addresses: true
      }
    });
    const tokens = await this.generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    });
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "USER_REGISTER",
        resource: "User",
        resourceId: user.id,
        details: { email: user.email, role: user.role }
      }
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
        city: defaultAddr?.city || "Pokhara",
        createdAt: user.createdAt
      },
      ...tokens
    };
  }
  static async adminPasswordLogin(password, ipAddress) {
    if (!password) {
      throw ApiError.badRequest("Password is required");
    }
    let admin = await prisma.user.findFirst({
      where: { role: import_client2.UserRole.ADMIN }
    });
    if (!admin) {
      const passwordHash = await import_bcryptjs.default.hash("Rjflowers@2026!", 10);
      admin = await prisma.user.create({
        data: {
          name: "RJ Flowers Admin",
          email: "admin@rjflowers.com",
          passwordHash,
          role: import_client2.UserRole.ADMIN
        }
      });
    }
    const isValid = await import_bcryptjs.default.compare(password, admin.passwordHash);
    if (!isValid) {
      throw ApiError.unauthorized("Incorrect admin password");
    }
    const tokens = await this.generateTokens({
      id: admin.id,
      email: admin.email,
      role: admin.role,
      name: admin.name
    });
    return {
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        fullName: admin.name,
        role: admin.role
      },
      ...tokens
    };
  }
  static async login(email, password, ipAddress) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        addresses: { where: { isDefault: true } },
        staffProfile: true
      }
    });
    if (!user || !user.isActive) {
      throw ApiError.unauthorized("Invalid email or password");
    }
    const isPasswordValid = await import_bcryptjs.default.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw ApiError.unauthorized("Invalid email or password");
    }
    const tokens = await this.generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    });
    const defaultAddress = user.addresses[0];
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "USER_LOGIN",
        resource: "User",
        resourceId: user.id,
        details: { role: user.role },
        ipAddress
      }
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
        city: defaultAddress?.city || "Kathmandu",
        createdAt: user.createdAt
      },
      ...tokens
    };
  }
  static async refreshToken(refreshToken) {
    try {
      const decoded = import_jsonwebtoken.default.verify(refreshToken, ENV.JWT_REFRESH_SECRET);
      const tokenRecord = await prisma.refreshToken.findFirst({
        where: {
          token: refreshToken,
          userId: decoded.id,
          revokedAt: null,
          expiresAt: { gt: /* @__PURE__ */ new Date() }
        }
      });
      if (!tokenRecord) {
        throw ApiError.unauthorized("Refresh token is invalid, expired, or revoked");
      }
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true, role: true, name: true, isActive: true }
      });
      if (!user || !user.isActive) {
        throw ApiError.unauthorized("User account is inactive or not found");
      }
      await prisma.refreshToken.update({
        where: { id: tokenRecord.id },
        data: { revokedAt: /* @__PURE__ */ new Date() }
      });
      const tokens = await this.generateTokens({
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      });
      return tokens;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw ApiError.unauthorized("Invalid or expired refresh token");
    }
  }
  static async logout(refreshToken, userId) {
    if (refreshToken) {
      await prisma.refreshToken.updateMany({
        where: { token: refreshToken, revokedAt: null },
        data: { revokedAt: /* @__PURE__ */ new Date() }
      });
    } else if (userId) {
      await prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: /* @__PURE__ */ new Date() }
      });
    }
    if (userId) {
      await prisma.auditLog.create({
        data: {
          userId,
          action: "USER_LOGOUT",
          resource: "User",
          resourceId: userId
        }
      });
    }
    return { message: "Logged out successfully" };
  }
  static async getMe(userId) {
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
            notifications: { where: { isRead: false } }
          }
        }
      }
    });
    if (!user) {
      throw ApiError.notFound("User not found");
    }
    const defaultAddr = user.addresses.find((a) => a.isDefault) || user.addresses[0];
    return {
      ...user,
      fullName: user.name,
      address: defaultAddr?.streetAddress,
      city: defaultAddr?.city || "Kathmandu",
      unreadNotifications: user._count.notifications
    };
  }
};

// src/utils/ApiResponse.ts
var ApiResponse = class _ApiResponse {
  success;
  message;
  data;
  meta;
  constructor(statusCode, message, data, meta) {
    this.success = statusCode >= 200 && statusCode < 300;
    this.message = message;
    this.data = data;
    if (meta) this.meta = meta;
  }
  static success(data, message = "Success", statusCode = 200, meta) {
    return new _ApiResponse(statusCode, message, data, meta);
  }
  static created(data, message = "Created successfully") {
    return new _ApiResponse(201, message, data);
  }
};

// src/utils/asyncHandler.ts
var asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// src/modules/auth/auth.controller.ts
var setAuthCookies = (res, accessToken, refreshToken) => {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("ktm_access_token", accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1e3,
    // 7 days
    path: "/"
  });
  if (refreshToken) {
    res.cookie("ktm_refresh_token", refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1e3,
      // 30 days
      path: "/"
    });
  }
};
var AuthController = class {
  static sendOtp = asyncHandler(async (req, res) => {
    const { email, type, fullName } = req.body;
    const result = await AuthService.sendOtp(email, type, fullName);
    res.status(200).json(ApiResponse.success(result, result.message));
  });
  static verifyOtpRegister = asyncHandler(async (req, res) => {
    const result = await AuthService.verifyOtpRegister(req.body);
    setAuthCookies(res, result.accessToken, result.refreshToken);
    res.status(201).json(ApiResponse.created(result, "Account created and verified successfully"));
  });
  static verifyOtpLogin = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;
    const ipAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const result = await AuthService.verifyOtpLogin(email, otp, ipAddress);
    setAuthCookies(res, result.accessToken, result.refreshToken);
    res.status(200).json(ApiResponse.success(result, "Logged in successfully"));
  });
  static register = asyncHandler(async (req, res) => {
    const result = await AuthService.register(req.body);
    setAuthCookies(res, result.accessToken, result.refreshToken);
    res.status(201).json(ApiResponse.created(result, "Account created successfully"));
  });
  static login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const ipAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const result = await AuthService.login(email, password, ipAddress);
    setAuthCookies(res, result.accessToken, result.refreshToken);
    res.status(200).json(ApiResponse.success(result, "Logged in successfully"));
  });
  static adminPasswordLogin = asyncHandler(async (req, res) => {
    const { password } = req.body;
    const ipAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const result = await AuthService.adminPasswordLogin(password, ipAddress);
    setAuthCookies(res, result.accessToken, result.refreshToken);
    res.status(200).json(ApiResponse.success(result, "Admin authenticated successfully"));
  });
  static logout = asyncHandler(async (req, res) => {
    const refreshToken = req.body?.refreshToken || req.headers["x-refresh-token"];
    const userId = req.user?.id;
    const result = await AuthService.logout(refreshToken, userId);
    res.clearCookie("ktm_access_token", { path: "/" });
    res.clearCookie("ktm_refresh_token", { path: "/" });
    res.status(200).json(ApiResponse.success(result, "Logged out successfully"));
  });
  static refresh = asyncHandler(async (req, res) => {
    const refreshToken = req.body?.refreshToken || req.headers["x-refresh-token"];
    if (!refreshToken) {
      throw ApiError.badRequest("Refresh token is required");
    }
    const result = await AuthService.refreshToken(refreshToken);
    res.status(200).json(ApiResponse.success(result, "Token refreshed successfully"));
  });
  static getMe = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const profile = await AuthService.getMe(userId);
    res.status(200).json(ApiResponse.success(profile, "User profile retrieved"));
  });
};

// src/modules/auth/oauth.controller.ts
var import_bcryptjs2 = __toESM(require("bcryptjs"));
var OAuthController = class {
  /**
   * 1. Get Google OAuth Authorization URL
   */
  static getGoogleAuthUrl = asyncHandler(async (_req, res) => {
    if (!ENV.GOOGLE_CLIENT_ID || !ENV.GOOGLE_CLIENT_SECRET) {
      return res.status(200).json(
        ApiResponse.success(
          { url: null, configured: false, clientId: null },
          "Google OAuth is not configured on this server"
        )
      );
    }
    const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    const options = {
      redirect_uri: ENV.GOOGLE_CALLBACK_URL,
      client_id: ENV.GOOGLE_CLIENT_ID,
      access_type: "offline",
      response_type: "code",
      prompt: "consent",
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email"
      ].join(" ")
    };
    const qs = new URLSearchParams(options).toString();
    const url = `${rootUrl}?${qs}`;
    return res.status(200).json(
      ApiResponse.success(
        { url, configured: true, clientId: ENV.GOOGLE_CLIENT_ID },
        "Google OAuth URL generated"
      )
    );
  });
  /**
   * 2. Handle Google OAuth Callback / Token Exchange
   */
  static handleGoogleAuth = asyncHandler(async (req, res) => {
    const code = req.body?.code || req.query?.code;
    const credential = req.body?.credential;
    let googleUser;
    if (credential) {
      try {
        const parts = credential.split(".");
        const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf8"));
        googleUser = {
          sub: payload.sub,
          email: payload.email,
          name: payload.name || payload.given_name || "Botanical Customer",
          picture: payload.picture
        };
      } catch (err) {
        throw ApiError.badRequest("Invalid Google ID token payload");
      }
    } else if (code) {
      try {
        const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            code,
            client_id: ENV.GOOGLE_CLIENT_ID,
            client_secret: ENV.GOOGLE_CLIENT_SECRET,
            redirect_uri: ENV.GOOGLE_CALLBACK_URL,
            grant_type: "authorization_code"
          }),
          signal: AbortSignal.timeout(8e3)
          // 8-second timeout guard
        });
        const tokenData = await tokenRes.json();
        if (!tokenRes.ok || !tokenData.access_token) {
          throw new Error(tokenData.error_description || "Failed to exchange Google OAuth code");
        }
        const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
          signal: AbortSignal.timeout(8e3)
          // 8-second timeout guard
        });
        const profile = await userRes.json();
        googleUser = {
          sub: profile.sub,
          email: profile.email,
          name: profile.name || "Botanical Customer",
          picture: profile.picture
        };
      } catch (err) {
        throw ApiError.badRequest(`Google OAuth exchange failed: ${err.message}`);
      }
    } else {
      throw ApiError.badRequest("Either Google code or credential must be provided");
    }
    if (!googleUser.email) {
      throw ApiError.badRequest("Google did not provide a valid email address");
    }
    const email = googleUser.email.toLowerCase();
    let user = await prisma.user.findUnique({
      where: { email },
      include: { oauthAccounts: true }
    });
    if (!user) {
      const cleanName = googleUser.name.replace(/[0-9]/g, "").trim() || "Botanical Customer";
      const randomPassword = await import_bcryptjs2.default.hash(Math.random().toString(36), 12);
      user = await prisma.user.create({
        data: {
          email,
          name: cleanName,
          passwordHash: randomPassword,
          role: "CUSTOMER",
          isActive: true,
          oauthAccounts: {
            create: {
              provider: "google",
              providerUserId: googleUser.sub,
              email
            }
          }
        },
        include: { oauthAccounts: true }
      });
    } else {
      const hasGoogle = user.oauthAccounts.some((acc) => acc.provider === "google");
      if (!hasGoogle) {
        await prisma.oAuthAccount.create({
          data: {
            userId: user.id,
            provider: "google",
            providerUserId: googleUser.sub,
            email
          }
        });
      }
    }
    const { accessToken, refreshToken } = await AuthService.generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    });
    const isProd = process.env.NODE_ENV === "production";
    res.cookie("ktm_access_token", accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1e3,
      path: "/"
    });
    res.cookie("ktm_refresh_token", refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1e3,
      path: "/"
    });
    if (req.method === "GET") {
      const frontendUrl = ENV.FRONTEND_URL || "https://rjflowers.com";
      return res.redirect(`${frontendUrl}/`);
    }
    return res.status(200).json(
      ApiResponse.success(
        {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.name,
            role: user.role
          },
          accessToken,
          refreshToken
        },
        "Google authentication successful"
      )
    );
  });
};

// src/middlewares/validate.middleware.ts
var import_zod = require("zod");
var validateRequest = (schema) => {
  return async (req, res, next) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      });
      if (parsed.body) req.body = parsed.body;
      if (parsed.query) req.query = parsed.query;
      if (parsed.params) req.params = parsed.params;
      next();
    } catch (error) {
      if (error instanceof import_zod.ZodError) {
        const issues = error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message
        }));
        next(ApiError.badRequest("Validation Error", issues));
      } else {
        next(error);
      }
    }
  };
};

// src/validators/auth.validator.ts
var import_zod2 = require("zod");
var nameSchema = import_zod2.z.string().min(2, "Full name must be at least 2 characters").max(70, "Full name must not exceed 70 characters").regex(
  /^[a-zA-Z\s\.\'-]+$/,
  "Full name cannot contain numbers or special characters"
);
var phoneSchema = import_zod2.z.string().regex(/^[9][0-9]{9}$/, "Phone number must be exactly 10 digits and start with 9");
var emailSchema = import_zod2.z.string().email("Please provide a valid email address").transform((val) => val.toLowerCase().trim());
var registerSchema = import_zod2.z.object({
  body: import_zod2.z.object({
    fullName: nameSchema,
    email: emailSchema,
    password: import_zod2.z.string().min(6, "Password must be at least 6 characters"),
    phoneNumber: phoneSchema.optional(),
    address: import_zod2.z.string().optional(),
    city: import_zod2.z.string().optional()
  })
});
var loginSchema = import_zod2.z.object({
  body: import_zod2.z.object({
    email: emailSchema,
    password: import_zod2.z.string().min(1, "Password is required")
  })
});
var sendOtpSchema = import_zod2.z.object({
  body: import_zod2.z.object({
    email: emailSchema,
    type: import_zod2.z.enum(["REGISTER", "LOGIN"]).default("REGISTER"),
    fullName: nameSchema.optional()
  })
});
var verifyOtpRegisterSchema = import_zod2.z.object({
  body: import_zod2.z.object({
    email: emailSchema,
    otp: import_zod2.z.string().min(4).max(8),
    fullName: nameSchema,
    password: import_zod2.z.string().min(6, "Password must be at least 6 characters"),
    phoneNumber: phoneSchema.optional(),
    address: import_zod2.z.string().optional(),
    city: import_zod2.z.string().optional()
  })
});
var verifyOtpLoginSchema = import_zod2.z.object({
  body: import_zod2.z.object({
    email: emailSchema,
    otp: import_zod2.z.string().min(4).max(8)
  })
});
var updateProfileSchema = import_zod2.z.object({
  body: import_zod2.z.object({
    fullName: nameSchema.optional(),
    phoneNumber: phoneSchema.optional(),
    address: import_zod2.z.string().optional(),
    city: import_zod2.z.string().optional()
  })
});

// src/middlewares/auth.middleware.ts
var import_jsonwebtoken2 = __toESM(require("jsonwebtoken"));
var extractCookie = (req, name) => {
  if (req.cookies && req.cookies[name]) {
    return req.cookies[name];
  }
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return void 0;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : void 0;
};
var authenticateJWT = async (req, res, next) => {
  try {
    let token = extractCookie(req, "ktm_access_token");
    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      throw ApiError.unauthorized("Authentication token is required");
    }
    const decoded = import_jsonwebtoken2.default.verify(token, ENV.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true, name: true, isActive: true }
    });
    if (!user || !user.isActive) {
      throw ApiError.unauthorized("User account is inactive or not found");
    }
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    };
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      next(ApiError.unauthorized("Token has expired. Please log in again."));
    } else if (error.name === "JsonWebTokenError") {
      next(ApiError.unauthorized("Invalid authentication token"));
    } else {
      next(error);
    }
  }
};
var optionalAuth = async (req, res, next) => {
  try {
    let token = extractCookie(req, "ktm_access_token");
    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (token) {
      const decoded = import_jsonwebtoken2.default.verify(token, ENV.JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true, role: true, name: true, isActive: true }
      });
      if (user && user.isActive) {
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name
        };
      }
    }
    next();
  } catch {
    next();
  }
};
var requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized("Authentication required"));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden(`Access restricted to roles: ${allowedRoles.join(", ")}`));
    }
    next();
  };
};

// src/modules/auth/auth.routes.ts
var router = (0, import_express.Router)();
router.post("/send-otp", validateRequest(sendOtpSchema), AuthController.sendOtp);
router.post("/verify-otp-register", validateRequest(verifyOtpRegisterSchema), AuthController.verifyOtpRegister);
router.post("/verify-otp-login", validateRequest(verifyOtpLoginSchema), AuthController.verifyOtpLogin);
router.post("/register", validateRequest(registerSchema), AuthController.register);
router.post("/login", validateRequest(loginSchema), AuthController.login);
router.post("/admin-login", AuthController.adminPasswordLogin);
router.post("/logout", optionalAuth, AuthController.logout);
router.get("/me", authenticateJWT, AuthController.getMe);
router.post("/refresh", AuthController.refresh);
router.post("/refresh-token", AuthController.refresh);
router.get("/google/url", OAuthController.getGoogleAuthUrl);
router.get("/google/callback", OAuthController.handleGoogleAuth);
router.post("/google", OAuthController.handleGoogleAuth);
router.post("/google/callback", OAuthController.handleGoogleAuth);
var authRoutes = router;

// src/modules/products/product.routes.ts
var import_express2 = require("express");

// src/services/image-storage.service.ts
var import_fs = __toESM(require("fs"));
var import_path = __toESM(require("path"));
var import_crypto2 = __toESM(require("crypto"));
var UPLOADS_ROOT = import_path.default.resolve(process.cwd(), "uploads");
var ensureDirExists = async (dirPath) => {
  try {
    await import_fs.default.promises.access(dirPath);
  } catch {
    await import_fs.default.promises.mkdir(dirPath, { recursive: true });
  }
};
var ImageStorageService = class {
  /**
   * Save uploaded image to server-side filesystem storage and store metadata in MySQL.
   */
  static async saveImage(buffer, originalName, mimeType, folder = "products") {
    const allowedExtensions = {
      "image/jpeg": ".jpg",
      "image/jpg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp"
    };
    const ext = allowedExtensions[mimeType.toLowerCase()] || import_path.default.extname(originalName).toLowerCase() || ".webp";
    if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
      throw ApiError.badRequest("Unsupported image format. Allowed formats: JPEG, PNG, WebP");
    }
    const uniqueId = import_crypto2.default.randomUUID();
    const cleanBaseName = import_path.default.basename(originalName, import_path.default.extname(originalName)).toLowerCase().replace(/[^a-z0-9_-]/g, "-").substring(0, 30);
    const filename = `${folder}-${cleanBaseName}-${uniqueId}${ext}`;
    const folderDir = import_path.default.join(UPLOADS_ROOT, folder);
    await ensureDirExists(folderDir);
    const filePath = import_path.default.join(folderDir, filename);
    const storagePath = `uploads/${folder}/${filename}`;
    await import_fs.default.promises.writeFile(filePath, buffer);
    const publicUrl = `/${storagePath}`;
    const image = await prisma.imageAsset.create({
      data: {
        id: uniqueId,
        filename,
        storagePath,
        url: publicUrl,
        mimeType,
        fileSize: buffer.length
      }
    });
    return {
      id: image.id,
      filename,
      url: image.url,
      mimeType,
      fileSize: buffer.length,
      storagePath
    };
  }
  /**
   * Save a base64 data URI to physical disk and return the public static URL.
   */
  static async saveBase64Image(dataUri, folder = "products") {
    if (!dataUri || !dataUri.startsWith("data:image/")) {
      return dataUri;
    }
    try {
      const match = dataUri.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      if (!match) return dataUri;
      const mimeType = match[1];
      const base64Data = match[2];
      const buffer = Buffer.from(base64Data, "base64");
      const ext = mimeType.includes("png") ? ".png" : mimeType.includes("webp") ? ".webp" : ".jpg";
      const uniqueId = import_crypto2.default.randomUUID();
      const filename = `${folder}-opt-${uniqueId}${ext}`;
      const folderDir = import_path.default.join(UPLOADS_ROOT, folder);
      await ensureDirExists(folderDir);
      const filePath = import_path.default.join(folderDir, filename);
      const storagePath = `uploads/${folder}/${filename}`;
      await import_fs.default.promises.writeFile(filePath, buffer);
      const publicUrl = `/${storagePath}`;
      try {
        await prisma.imageAsset.create({
          data: {
            id: uniqueId,
            filename,
            storagePath,
            url: publicUrl,
            mimeType,
            fileSize: buffer.length
          }
        });
      } catch (dbErr) {
      }
      return publicUrl;
    } catch (error) {
      console.error("Failed to extract and persist base64 image to disk:", error);
      return dataUri;
    }
  }
  /**
   * Read an image from disk for streaming via API endpoint.
   */
  static async getImage(id) {
    const record = await prisma.imageAsset.findUnique({
      where: { id },
      select: { id: true, filename: true, storagePath: true, mimeType: true, fileSize: true }
    });
    if (!record) return null;
    const fullPath = import_path.default.resolve(process.cwd(), record.storagePath);
    try {
      await import_fs.default.promises.access(fullPath);
      const data = await import_fs.default.promises.readFile(fullPath);
      return {
        data,
        mimeType: record.mimeType,
        filename: record.filename
      };
    } catch {
      return null;
    }
  }
  /**
   * Delete an image from disk and remove its metadata from MySQL.
   */
  static async deleteImage(id) {
    if (!id) return false;
    try {
      const record = await prisma.imageAsset.findUnique({
        where: { id },
        select: { storagePath: true }
      });
      if (record) {
        const fullPath = import_path.default.resolve(process.cwd(), record.storagePath);
        try {
          await import_fs.default.promises.unlink(fullPath);
        } catch {
        }
        await prisma.imageAsset.delete({ where: { id } });
        return true;
      }
      return false;
    } catch (error) {
      if (error?.code === "P2025") return false;
      throw error;
    }
  }
};

// src/modules/products/product.service.ts
var ProductService = class {
  static async getAll(query) {
    const cacheKey = `products:query:${JSON.stringify(query)}`;
    const cached = catalogCache.get(cacheKey);
    if (cached) {
      return cached;
    }
    const page = Math.max(1, parseInt(query.page || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(query.limit || "12", 10)));
    const skip = (page - 1) * limit;
    const where = {
      published: true
    };
    const searchTerm = query.search || query.q;
    if (searchTerm && searchTerm.trim()) {
      const term = searchTerm.trim();
      where.OR = [
        { name: { contains: term } },
        { sku: { contains: term } },
        { shortDescription: { contains: term } },
        { description: { contains: term } },
        { dimensions: { contains: term } },
        { category: { name: { contains: term } } },
        { category: { slug: { contains: term } } },
        { variants: { some: { name: { contains: term } } } },
        { variants: { some: { sku: { contains: term } } } }
      ];
    }
    if (query.category) {
      where.category = {
        OR: [
          { slug: query.category },
          { id: query.category },
          { name: { contains: query.category } }
        ]
      };
    }
    if (query.sunlight) {
      where.sunlightRequirement = query.sunlight;
    }
    if (query.watering) {
      where.wateringRequirement = query.watering;
    }
    if (query.difficulty) {
      where.difficultyLevel = query.difficulty;
    }
    const featuredFlag = query.featured ?? query.isFeatured;
    if (featuredFlag !== void 0) {
      where.featured = featuredFlag === "true";
    }
    const seasonalFlag = query.seasonal ?? query.isSeasonal;
    if (seasonalFlag !== void 0) {
      where.seasonal = seasonalFlag === "true";
    }
    if (query.inStock === "true") {
      where.variants = {
        some: {
          isAvailable: true,
          OR: [
            { stock: { gt: 0 } },
            { inventory: { availableQuantity: { gt: 0 } } }
          ]
        }
      };
    }
    if (query.size) {
      where.OR = [
        ...where.OR || [],
        { dimensions: { contains: query.size } },
        { variants: { some: { isAvailable: true, name: { contains: query.size } } } }
      ];
    }
    if (query.minPrice || query.maxPrice) {
      where.basePrice = {};
      if (query.minPrice) where.basePrice.gte = parseFloat(query.minPrice);
      if (query.maxPrice) where.basePrice.lte = parseFloat(query.maxPrice);
    }
    const sortOption = query.sort || query.sortBy || (searchTerm ? "relevance" : "newest");
    let orderBy = { createdAt: "desc" };
    if (sortOption === "price_asc") orderBy = { basePrice: "asc" };
    else if (sortOption === "price_desc") orderBy = { basePrice: "desc" };
    else if (sortOption === "name_asc") orderBy = { name: "asc" };
    else if (sortOption === "popular") orderBy = [{ featured: "desc" }, { createdAt: "desc" }];
    else if (sortOption === "newest" || sortOption === "relevance") orderBy = { createdAt: "desc" };
    const [productsRaw, total] = await Promise.all([
      prisma.product.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          sku: true,
          shortDescription: true,
          description: true,
          basePrice: true,
          compareAtPrice: true,
          available: true,
          featured: true,
          published: true,
          seasonal: true,
          lowStockThreshold: true,
          careInstructions: true,
          sunlightRequirement: true,
          wateringRequirement: true,
          difficultyLevel: true,
          dimensions: true,
          weight: true,
          createdAt: true,
          updatedAt: true,
          category: { select: { id: true, name: true, slug: true } },
          images: {
            select: { id: true, url: true, altText: true, isPrimary: true, sortOrder: true },
            orderBy: { sortOrder: "asc" }
          },
          attributes: { select: { name: true, value: true } },
          variants: {
            where: { isAvailable: true },
            select: {
              id: true,
              name: true,
              sku: true,
              price: true,
              stock: true,
              weight: true,
              isAvailable: true,
              sortOrder: true,
              inventory: { select: { availableQuantity: true, stockQuantity: true } }
            },
            orderBy: { sortOrder: "asc" }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.product.count({ where })
    ]);
    const products = productsRaw.map((p) => {
      const avgRating = 5;
      const totalStock = p.variants.reduce((acc, v) => acc + (v.inventory?.availableQuantity ?? v.stock), 0);
      return {
        id: p.id,
        name: p.name,
        title: p.name,
        slug: p.slug,
        sku: p.sku,
        shortDescription: p.shortDescription,
        description: p.description,
        fullDescription: p.description,
        pricing: {
          basePrice: Number(p.basePrice),
          compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
          hasDiscount: !!p.compareAtPrice && Number(p.compareAtPrice) > Number(p.basePrice)
        },
        basePrice: p.basePrice,
        discountPrice: p.compareAtPrice ? p.basePrice : null,
        availability: {
          isAvailable: p.available && totalStock > 0,
          totalStock,
          inStock: totalStock > 0
        },
        isAvailable: p.available,
        featured: p.featured,
        isFeatured: p.featured,
        seasonal: p.seasonal,
        isSeasonal: p.seasonal,
        sunlightRequirement: p.sunlightRequirement,
        sunlight: p.sunlightRequirement,
        wateringRequirement: p.wateringRequirement,
        watering: p.wateringRequirement,
        difficultyLevel: p.difficultyLevel,
        difficulty: p.difficultyLevel,
        careInstructions: p.careInstructions,
        dimensions: p.dimensions,
        weight: p.weight,
        category: p.category,
        images: p.images.filter((img) => img.url.trim().length > 0).map((img) => ({
          id: img.id,
          url: img.url,
          altText: img.altText,
          alt: img.altText,
          isPrimary: img.isPrimary,
          sortOrder: img.sortOrder
        })),
        variants: p.variants.map((v) => ({
          id: v.id,
          name: v.name,
          sku: v.sku,
          price: Number(v.price),
          priceAdjustment: Number(v.price) - Number(p.basePrice),
          stockQuantity: v.inventory?.availableQuantity ?? v.stock,
          isAvailable: v.isAvailable,
          isDefault: v.sortOrder === 1 || v.sortOrder === 0,
          sortOrder: v.sortOrder
        })),
        attributes: p.attributes,
        rating: avgRating,
        averageRating: avgRating,
        reviewCount: 0,
        createdAt: p.createdAt
      };
    });
    const result = {
      products,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
    catalogCache.set(cacheKey, result, 120);
    return result;
  }
  static async getBySlug(slug) {
    const product = await prisma.product.findUnique({
      where: { slug, published: true },
      select: {
        id: true,
        name: true,
        slug: true,
        sku: true,
        shortDescription: true,
        description: true,
        basePrice: true,
        compareAtPrice: true,
        available: true,
        featured: true,
        published: true,
        seasonal: true,
        lowStockThreshold: true,
        careInstructions: true,
        sunlightRequirement: true,
        wateringRequirement: true,
        difficultyLevel: true,
        dimensions: true,
        weight: true,
        createdAt: true,
        updatedAt: true,
        category: true,
        images: {
          select: { id: true, url: true, altText: true, isPrimary: true, sortOrder: true },
          orderBy: { sortOrder: "asc" }
        },
        attributes: { select: { name: true, value: true } },
        variants: {
          where: { isAvailable: true },
          select: {
            id: true,
            name: true,
            sku: true,
            price: true,
            stock: true,
            weight: true,
            isAvailable: true,
            sortOrder: true,
            inventory: { select: { availableQuantity: true, stockQuantity: true } }
          },
          orderBy: { sortOrder: "asc" }
        }
      }
    });
    if (!product || !product.published) {
      throw ApiError.notFound("Product not found");
    }
    const avgRating = 5;
    const totalStock = product.variants.reduce((acc, v) => acc + (v.inventory?.availableQuantity ?? v.stock), 0);
    return {
      id: product.id,
      name: product.name,
      title: product.name,
      slug: product.slug,
      sku: product.sku,
      shortDescription: product.shortDescription,
      description: product.description,
      fullDescription: product.description,
      pricing: {
        basePrice: Number(product.basePrice),
        compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
        hasDiscount: !!product.compareAtPrice && Number(product.compareAtPrice) > Number(product.basePrice)
      },
      basePrice: product.basePrice,
      discountPrice: product.compareAtPrice ? product.basePrice : null,
      availability: {
        isAvailable: product.available && totalStock > 0,
        totalStock,
        inStock: totalStock > 0
      },
      isAvailable: product.available,
      featured: product.featured,
      isFeatured: product.featured,
      seasonal: product.seasonal,
      isSeasonal: product.seasonal,
      sunlightRequirement: product.sunlightRequirement,
      sunlight: product.sunlightRequirement,
      wateringRequirement: product.wateringRequirement,
      watering: product.wateringRequirement,
      difficultyLevel: product.difficultyLevel,
      difficulty: product.difficultyLevel,
      careInstructions: product.careInstructions,
      careSummary: product.careInstructions,
      dimensions: product.dimensions,
      weight: product.weight,
      category: product.category,
      images: product.images.filter((img) => img.url.trim().length > 0).map((img) => ({
        id: img.id,
        url: img.url,
        altText: img.altText,
        alt: img.altText,
        isPrimary: img.isPrimary,
        sortOrder: img.sortOrder
      })),
      variants: product.variants.map((v) => ({
        id: v.id,
        name: v.name,
        sku: v.sku,
        price: Number(v.price),
        priceAdjustment: Number(v.price) - Number(product.basePrice),
        stockQuantity: v.inventory?.availableQuantity ?? v.stock,
        isAvailable: v.isAvailable,
        isDefault: v.sortOrder === 1 || v.sortOrder === 0,
        sortOrder: v.sortOrder
      })),
      attributes: product.attributes,
      reviews: [],
      rating: avgRating,
      averageRating: avgRating,
      reviewCount: 0,
      createdAt: product.createdAt
    };
  }
  static async getById(id, includeCostPrice = false) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
        attributes: true,
        variants: {
          include: { inventory: true },
          orderBy: { sortOrder: "asc" }
        }
      }
    });
    if (!product) throw ApiError.notFound("Product not found");
    if (!includeCostPrice) {
      delete product.costPrice;
    }
    return product;
  }
  // Admin Methods
  static async createProduct(data, userId) {
    const name = data.name || data.title || "Botanical Plant";
    const slug = name.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-") + "-" + Date.now().toString().slice(-4);
    let categoryId = data.categoryId;
    if (!categoryId) {
      const existingCategory = await prisma.category.findFirst();
      if (existingCategory) {
        categoryId = existingCategory.id;
      } else {
        const newCat = await prisma.category.create({
          data: {
            name: "Plants & Flora",
            slug: "plants",
            description: "Nursery plants and foliage"
          }
        });
        categoryId = newCat.id;
      }
    }
    const sku = data.sku || "PLT-" + Date.now().toString().slice(-6);
    const rawVariants = data.variants && data.variants.length > 0 ? data.variants : [
      {
        name: "Standard Plant Pot",
        sku,
        price: Number(data.basePrice),
        stock: data.available !== false ? 100 : 0,
        isAvailable: data.available !== false
      }
    ];
    const sanitizedImages = data.images?.length ? await Promise.all(
      data.images.map(async (img, i) => {
        const cleanUrl = img.url?.startsWith("data:image/") ? await ImageStorageService.saveBase64Image(img.url, "products") : img.url;
        return {
          url: cleanUrl,
          altText: img.altText || name,
          isPrimary: img.isPrimary || i === 0,
          sortOrder: img.sortOrder || i + 1
        };
      })
    ) : [];
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        sku,
        shortDescription: data.shortDescription || name,
        description: data.description || data.fullDescription || `${name} - Fresh and healthy nursery plant from RJ Flowers & Nursery Pokhara.`,
        categoryId,
        basePrice: Number(data.basePrice),
        compareAtPrice: data.compareAtPrice ? Number(data.compareAtPrice) : null,
        costPrice: data.costPrice ? Number(data.costPrice) : null,
        available: data.available !== void 0 ? data.available : true,
        featured: data.featured || false,
        published: data.published !== void 0 ? data.published : true,
        seasonal: data.seasonal || false,
        lowStockThreshold: data.lowStockThreshold || 5,
        careInstructions: data.careInstructions,
        sunlightRequirement: data.sunlightRequirement || data.sunlight,
        wateringRequirement: data.wateringRequirement || data.watering,
        difficultyLevel: data.difficultyLevel || data.difficulty,
        dimensions: data.dimensions,
        weight: data.weight,
        images: sanitizedImages.length ? {
          create: sanitizedImages
        } : void 0,
        attributes: data.attributes?.length ? {
          create: data.attributes.map((attr) => ({
            name: attr.name,
            value: attr.value
          }))
        } : void 0,
        variants: {
          create: rawVariants.map((v, i) => ({
            name: v.name || "Standard Pot",
            sku: v.sku || `${sku}-${i + 1}`,
            price: v.price ? Number(v.price) : Number(data.basePrice),
            stock: v.stockStatus === "OUT_OF_STOCK" ? 0 : v.stock !== void 0 ? v.stock : 100,
            weight: v.weight,
            isAvailable: v.stockStatus === "OUT_OF_STOCK" ? false : v.isAvailable !== void 0 ? v.isAvailable : true,
            sortOrder: v.sortOrder || i + 1,
            inventory: {
              create: {
                stockQuantity: v.stockStatus === "OUT_OF_STOCK" ? 0 : v.stock !== void 0 ? v.stock : 100,
                reservedQuantity: 0,
                availableQuantity: v.stockStatus === "OUT_OF_STOCK" ? 0 : v.stock !== void 0 ? v.stock : 100
              }
            }
          }))
        }
      },
      include: {
        images: true,
        variants: { include: { inventory: true } },
        category: true
      }
    });
    await prisma.auditLog.create({
      data: {
        userId,
        action: "PRODUCT_CREATE",
        resource: "Product",
        resourceId: product.id,
        details: { name: product.name, sku: product.sku }
      }
    });
    catalogCache.clear();
    appCache.clearPattern("system:sitemap.xml");
    emitLiveEvent("product:created", { product });
    emitLiveEvent("product:changed", { action: "create", productId: product.id });
    return product;
  }
  static async updateProduct(id, data, userId) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw ApiError.notFound("Product not found");
    const { images, ...productData } = data;
    if (productData.available !== void 0) {
      productData.stockStatus = productData.available ? "IN_STOCK" : "OUT_OF_STOCK";
    }
    let sanitizedImages = images;
    if (images && images.length > 0) {
      sanitizedImages = await Promise.all(
        images.map(async (image, index) => {
          const cleanUrl = image.url?.startsWith("data:image/") ? await ImageStorageService.saveBase64Image(image.url, "products") : image.url;
          return {
            url: cleanUrl,
            altText: image.altText || product.name,
            isPrimary: image.isPrimary ?? index === 0,
            sortOrder: image.sortOrder ?? index + 1
          };
        })
      );
    }
    const updated = await prisma.$transaction(async (tx) => {
      if (images) {
        await tx.productImage.deleteMany({ where: { productId: id } });
      }
      if (productData.basePrice !== void 0) {
        await tx.productVariant.updateMany({
          where: { productId: id },
          data: { price: Number(productData.basePrice) }
        });
      }
      if (productData.available !== void 0) {
        const isAvail = Boolean(productData.available);
        await tx.productVariant.updateMany({
          where: { productId: id },
          data: {
            isAvailable: isAvail,
            stockStatus: isAvail ? "IN_STOCK" : "OUT_OF_STOCK"
          }
        });
      }
      return tx.product.update({
        where: { id },
        data: {
          ...productData,
          ...sanitizedImages && sanitizedImages.length > 0 ? {
            images: {
              create: sanitizedImages.map((image) => ({
                url: image.url,
                altText: image.altText,
                isPrimary: image.isPrimary,
                sortOrder: image.sortOrder
              }))
            }
          } : {}
        },
        include: {
          images: true,
          variants: { include: { inventory: true } },
          category: true
        }
      });
    });
    await prisma.auditLog.create({
      data: {
        userId,
        action: "PRODUCT_UPDATE",
        resource: "Product",
        resourceId: id,
        details: { fields: Object.keys(data) }
      }
    });
    catalogCache.clear();
    appCache.clearPattern("system:sitemap.xml");
    emitLiveEvent("product:updated", { product: updated });
    emitLiveEvent("product:changed", { action: "update", productId: id });
    return updated;
  }
  static async deleteProduct(id, userId) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { orderItems: { take: 1 } }
    });
    if (!product) throw ApiError.notFound("Product not found");
    catalogCache.clear();
    appCache.clearPattern("system:sitemap.xml");
    if (product.orderItems.length > 0) {
      await prisma.product.update({
        where: { id },
        data: {
          published: false,
          available: false
        }
      });
      await prisma.auditLog.create({
        data: {
          userId,
          action: "PRODUCT_SOFT_DELETE",
          resource: "Product",
          resourceId: id,
          details: { note: "Unpublished due to historical order dependencies" }
        }
      });
      emitLiveEvent("product:deleted", { productId: id, soft: true });
      emitLiveEvent("product:changed", { action: "delete", productId: id });
      return { message: "Product unpublished and archived successfully (historical orders preserved)" };
    } else {
      await prisma.product.delete({ where: { id } });
      await prisma.auditLog.create({
        data: {
          userId,
          action: "PRODUCT_DELETE",
          resource: "Product",
          resourceId: id,
          details: { name: product.name }
        }
      });
      emitLiveEvent("product:deleted", { productId: id, soft: false });
      emitLiveEvent("product:changed", { action: "delete", productId: id });
      return { message: "Product permanently deleted" };
    }
  }
  // Variant CRUD
  static async createVariant(productId, data, userId) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw ApiError.notFound("Parent product not found");
    const variant = await prisma.productVariant.create({
      data: {
        productId,
        name: data.name,
        sku: data.sku,
        price: data.price,
        stock: data.stock || 0,
        weight: data.weight,
        isAvailable: data.isAvailable !== void 0 ? data.isAvailable : true,
        sortOrder: data.sortOrder || 0,
        inventory: {
          create: {
            stockQuantity: data.stock || 0,
            reservedQuantity: 0,
            availableQuantity: data.stock || 0
          }
        }
      },
      include: { inventory: true }
    });
    await prisma.auditLog.create({
      data: {
        userId,
        action: "VARIANT_CREATE",
        resource: "ProductVariant",
        resourceId: variant.id,
        details: { product: product.name, variant: variant.name }
      }
    });
    return variant;
  }
  static async updateVariant(id, data, userId) {
    const variant = await prisma.productVariant.findUnique({ where: { id } });
    if (!variant) throw ApiError.notFound("Product variant not found");
    const updated = await prisma.productVariant.update({
      where: { id },
      data,
      include: { inventory: true }
    });
    await prisma.auditLog.create({
      data: {
        userId,
        action: "VARIANT_UPDATE",
        resource: "ProductVariant",
        resourceId: id,
        details: { fields: Object.keys(data) }
      }
    });
    return updated;
  }
  static async deleteVariant(id, userId) {
    const variant = await prisma.productVariant.findUnique({
      where: { id },
      include: { orderItems: { take: 1 } }
    });
    if (!variant) throw ApiError.notFound("Product variant not found");
    if (variant.orderItems.length > 0) {
      await prisma.productVariant.update({
        where: { id },
        data: { isAvailable: false }
      });
      return { message: "Variant marked inactive (historical order dependencies preserved)" };
    } else {
      await prisma.productVariant.delete({ where: { id } });
      return { message: "Variant permanently deleted" };
    }
  }
  // ==========================================
  // Product Image Management
  // ==========================================
  static async addProductImage(productId, imageData, userId) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { images: true }
    });
    if (!product) throw ApiError.notFound("Product not found");
    const isFirstImage = product.images.length === 0;
    const isPrimary = imageData.isPrimary ?? isFirstImage;
    if (isPrimary && product.images.length > 0) {
      await prisma.productImage.updateMany({
        where: { productId },
        data: { isPrimary: false }
      });
    }
    const sortOrder = imageData.sortOrder ?? product.images.length + 1;
    const newImage = await prisma.productImage.create({
      data: {
        productId,
        url: imageData.url,
        altText: imageData.altText || product.name,
        isPrimary,
        sortOrder
      }
    });
    await prisma.auditLog.create({
      data: {
        userId,
        action: "PRODUCT_IMAGE_ADD",
        resource: "ProductImage",
        resourceId: newImage.id,
        details: { productId, url: newImage.url, isPrimary }
      }
    });
    return newImage;
  }
  static async deleteProductImage(productId, imageId, userId) {
    const image = await prisma.productImage.findFirst({
      where: { id: imageId, productId }
    });
    if (!image) throw ApiError.notFound("Image not found for this product");
    await prisma.productImage.delete({ where: { id: imageId } });
    if (image.isPrimary) {
      const remainingFirst = await prisma.productImage.findFirst({
        where: { productId },
        orderBy: { sortOrder: "asc" }
      });
      if (remainingFirst) {
        await prisma.productImage.update({
          where: { id: remainingFirst.id },
          data: { isPrimary: true }
        });
      }
    }
    await prisma.auditLog.create({
      data: {
        userId,
        action: "PRODUCT_IMAGE_DELETE",
        resource: "ProductImage",
        resourceId: imageId,
        details: { productId }
      }
    });
    return { message: "Product image deleted successfully" };
  }
  static async setPrimaryImage(productId, imageId, userId) {
    const image = await prisma.productImage.findFirst({
      where: { id: imageId, productId }
    });
    if (!image) throw ApiError.notFound("Image not found for this product");
    await prisma.productImage.updateMany({
      where: { productId },
      data: { isPrimary: false }
    });
    const updated = await prisma.productImage.update({
      where: { id: imageId },
      data: { isPrimary: true }
    });
    await prisma.auditLog.create({
      data: {
        userId,
        action: "PRODUCT_IMAGE_PRIMARY_SET",
        resource: "ProductImage",
        resourceId: imageId,
        details: { productId }
      }
    });
    return updated;
  }
  static async reorderProductImages(productId, orders, userId) {
    const updates = orders.map(
      (item) => prisma.productImage.updateMany({
        where: { id: item.id, productId },
        data: { sortOrder: item.sortOrder }
      })
    );
    await prisma.$transaction(updates);
    await prisma.auditLog.create({
      data: {
        userId,
        action: "PRODUCT_IMAGE_REORDER",
        resource: "Product",
        resourceId: productId,
        details: { orderCount: orders.length }
      }
    });
    return prisma.productImage.findMany({
      where: { productId },
      orderBy: { sortOrder: "asc" }
    });
  }
};

// src/modules/products/product.controller.ts
var ProductController = class {
  static getAll = asyncHandler(async (req, res) => {
    const result = await ProductService.getAll(req.query);
    res.status(200).json(ApiResponse.success(result.products, "Products retrieved", 200, result.meta));
  });
  static getBySlug = asyncHandler(async (req, res) => {
    const product = await ProductService.getBySlug(req.params.slug);
    res.status(200).json(ApiResponse.success(product, "Product details retrieved"));
  });
  static getById = asyncHandler(async (req, res) => {
    const product = await ProductService.getById(req.params.id);
    res.status(200).json(ApiResponse.success(product, "Product details retrieved"));
  });
  // Admin Endpoints
  static createProduct = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const product = await ProductService.createProduct(req.body, userId);
    res.status(201).json(ApiResponse.created(product, "Product created successfully"));
  });
  static updateProduct = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const product = await ProductService.updateProduct(req.params.id, req.body, userId);
    res.status(200).json(ApiResponse.success(product, "Product updated successfully"));
  });
  static deleteProduct = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const result = await ProductService.deleteProduct(req.params.id, userId);
    res.status(200).json(ApiResponse.success(result, "Product deleted"));
  });
  static createVariant = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const variant = await ProductService.createVariant(req.params.id, req.body, userId);
    res.status(201).json(ApiResponse.created(variant, "Variant added successfully"));
  });
  static updateVariant = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const variant = await ProductService.updateVariant(req.params.id, req.body, userId);
    res.status(200).json(ApiResponse.success(variant, "Variant updated successfully"));
  });
  static deleteVariant = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const result = await ProductService.deleteVariant(req.params.id, userId);
    res.status(200).json(ApiResponse.success(result, "Variant deleted"));
  });
  // Product Image Management
  static addImage = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const image = await ProductService.addProductImage(req.params.id, req.body, userId);
    res.status(201).json(ApiResponse.created(image, "Product image added successfully"));
  });
  static deleteImage = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const result = await ProductService.deleteProductImage(req.params.id, req.params.imageId, userId);
    res.status(200).json(ApiResponse.success(result, "Product image deleted"));
  });
  static setPrimaryImage = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const image = await ProductService.setPrimaryImage(req.params.id, req.params.imageId, userId);
    res.status(200).json(ApiResponse.success(image, "Primary image updated"));
  });
  static reorderImages = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const images = await ProductService.reorderProductImages(req.params.id, req.body.images || req.body, userId);
    res.status(200).json(ApiResponse.success(images, "Product images reordered"));
  });
};

// src/validators/product.validator.ts
var import_zod3 = require("zod");
var productQuerySchema = import_zod3.z.object({
  query: import_zod3.z.object({
    page: import_zod3.z.string().optional(),
    limit: import_zod3.z.string().optional(),
    search: import_zod3.z.string().optional(),
    q: import_zod3.z.string().optional(),
    category: import_zod3.z.string().optional(),
    sort: import_zod3.z.enum(["price_asc", "price_desc", "newest", "rating", "popular", "name_asc", "relevance"]).optional(),
    sortBy: import_zod3.z.enum(["price_asc", "price_desc", "newest", "rating", "popular", "name_asc", "relevance"]).optional(),
    minPrice: import_zod3.z.string().optional(),
    maxPrice: import_zod3.z.string().optional(),
    featured: import_zod3.z.enum(["true", "false"]).optional(),
    isFeatured: import_zod3.z.enum(["true", "false"]).optional(),
    seasonal: import_zod3.z.enum(["true", "false"]).optional(),
    isSeasonal: import_zod3.z.enum(["true", "false"]).optional(),
    inStock: import_zod3.z.enum(["true", "false"]).optional(),
    size: import_zod3.z.string().optional(),
    plantType: import_zod3.z.string().optional(),
    productType: import_zod3.z.string().optional(),
    sunlight: import_zod3.z.enum(["FULL_SUN", "BRIGHT_INDIRECT", "MEDIUM_LIGHT", "LOW_LIGHT"]).optional(),
    watering: import_zod3.z.enum(["DAILY", "WEEKLY_TWICE", "WEEKLY_ONCE", "BIWEEKLY", "WHEN_DRY"]).optional(),
    difficulty: import_zod3.z.enum(["EASY", "MODERATE", "CHALLENGING"]).optional(),
    petFriendly: import_zod3.z.enum(["true", "false"]).optional(),
    airPurifying: import_zod3.z.enum(["true", "false"]).optional()
  })
});
var createProductSchema = import_zod3.z.object({
  body: import_zod3.z.object({
    name: import_zod3.z.string().min(1, "Product name is required"),
    title: import_zod3.z.string().optional(),
    sku: import_zod3.z.string().optional(),
    shortDescription: import_zod3.z.string().optional(),
    description: import_zod3.z.string().optional(),
    categoryId: import_zod3.z.string().optional(),
    basePrice: import_zod3.z.number().positive("Base price must be greater than 0"),
    compareAtPrice: import_zod3.z.number().positive().optional().nullable(),
    costPrice: import_zod3.z.number().positive().optional().nullable(),
    available: import_zod3.z.boolean().default(true),
    featured: import_zod3.z.boolean().default(false),
    published: import_zod3.z.boolean().default(true),
    seasonal: import_zod3.z.boolean().default(false),
    lowStockThreshold: import_zod3.z.number().int().default(5),
    careInstructions: import_zod3.z.string().optional(),
    sunlightRequirement: import_zod3.z.enum(["FULL_SUN", "BRIGHT_INDIRECT", "MEDIUM_LIGHT", "LOW_LIGHT"]).optional(),
    wateringRequirement: import_zod3.z.enum(["DAILY", "WEEKLY_TWICE", "WEEKLY_ONCE", "BIWEEKLY", "WHEN_DRY"]).optional(),
    difficultyLevel: import_zod3.z.enum(["EASY", "MODERATE", "CHALLENGING"]).optional(),
    dimensions: import_zod3.z.string().optional(),
    weight: import_zod3.z.number().optional(),
    images: import_zod3.z.array(
      import_zod3.z.object({
        url: import_zod3.z.string().trim().min(1, "Image URL is required"),
        altText: import_zod3.z.string().optional(),
        isPrimary: import_zod3.z.boolean().default(false),
        sortOrder: import_zod3.z.number().int().default(0)
      })
    ).optional(),
    attributes: import_zod3.z.array(
      import_zod3.z.object({
        name: import_zod3.z.string().min(1),
        value: import_zod3.z.string().min(1)
      })
    ).optional(),
    variants: import_zod3.z.array(
      import_zod3.z.object({
        name: import_zod3.z.string().min(1, "Variant name required (e.g. Small, 6 inch)"),
        sku: import_zod3.z.string().min(1, "Variant SKU required"),
        price: import_zod3.z.number().positive("Price must be positive"),
        stock: import_zod3.z.number().int().nonnegative().default(0),
        weight: import_zod3.z.number().optional(),
        isAvailable: import_zod3.z.boolean().default(true),
        sortOrder: import_zod3.z.number().int().default(0)
      })
    ).optional()
  })
});
var updateProductSchema = import_zod3.z.object({
  params: import_zod3.z.object({
    id: import_zod3.z.string().uuid()
  }),
  body: import_zod3.z.object({
    name: import_zod3.z.string().min(2).optional(),
    sku: import_zod3.z.string().min(2).optional(),
    shortDescription: import_zod3.z.string().optional(),
    description: import_zod3.z.string().optional(),
    categoryId: import_zod3.z.string().uuid().optional(),
    basePrice: import_zod3.z.number().positive().optional(),
    compareAtPrice: import_zod3.z.number().positive().optional().nullable(),
    costPrice: import_zod3.z.number().positive().optional().nullable(),
    available: import_zod3.z.boolean().optional(),
    featured: import_zod3.z.boolean().optional(),
    published: import_zod3.z.boolean().optional(),
    seasonal: import_zod3.z.boolean().optional(),
    lowStockThreshold: import_zod3.z.number().int().optional(),
    careInstructions: import_zod3.z.string().optional(),
    sunlightRequirement: import_zod3.z.enum(["FULL_SUN", "BRIGHT_INDIRECT", "MEDIUM_LIGHT", "LOW_LIGHT"]).optional(),
    wateringRequirement: import_zod3.z.enum(["DAILY", "WEEKLY_TWICE", "WEEKLY_ONCE", "BIWEEKLY", "WHEN_DRY"]).optional(),
    difficultyLevel: import_zod3.z.enum(["EASY", "MODERATE", "CHALLENGING"]).optional(),
    dimensions: import_zod3.z.string().optional(),
    weight: import_zod3.z.number().optional(),
    images: import_zod3.z.array(
      import_zod3.z.object({
        url: import_zod3.z.string().trim().min(1, "Image URL is required"),
        altText: import_zod3.z.string().optional(),
        isPrimary: import_zod3.z.boolean().default(false),
        sortOrder: import_zod3.z.number().int().default(0)
      })
    ).optional()
  })
});
var createVariantSchema = import_zod3.z.object({
  params: import_zod3.z.object({
    id: import_zod3.z.string().uuid()
    // Product ID
  }),
  body: import_zod3.z.object({
    name: import_zod3.z.string().min(1, "Variant name required"),
    sku: import_zod3.z.string().min(1, "SKU required"),
    price: import_zod3.z.number().positive("Price must be positive"),
    stock: import_zod3.z.number().int().nonnegative().default(0),
    weight: import_zod3.z.number().optional(),
    isAvailable: import_zod3.z.boolean().default(true),
    sortOrder: import_zod3.z.number().int().default(0)
  })
});
var updateVariantSchema = import_zod3.z.object({
  params: import_zod3.z.object({
    id: import_zod3.z.string().uuid()
    // Variant ID
  }),
  body: import_zod3.z.object({
    name: import_zod3.z.string().min(1).optional(),
    sku: import_zod3.z.string().min(1).optional(),
    price: import_zod3.z.number().positive().optional(),
    stock: import_zod3.z.number().int().nonnegative().optional(),
    weight: import_zod3.z.number().optional(),
    isAvailable: import_zod3.z.boolean().optional(),
    sortOrder: import_zod3.z.number().int().optional()
  })
});
var createCategorySchema = import_zod3.z.object({
  body: import_zod3.z.object({
    name: import_zod3.z.string().min(2, "Category name is required"),
    description: import_zod3.z.string().optional(),
    imageUrl: import_zod3.z.string().trim().min(1).optional(),
    parentId: import_zod3.z.string().uuid().optional().nullable(),
    displayOrder: import_zod3.z.number().int().default(0),
    isActive: import_zod3.z.boolean().default(true)
  })
});
var updateCategorySchema = import_zod3.z.object({
  params: import_zod3.z.object({
    id: import_zod3.z.string().uuid()
  }),
  body: import_zod3.z.object({
    name: import_zod3.z.string().min(2).optional(),
    description: import_zod3.z.string().optional(),
    imageUrl: import_zod3.z.string().trim().min(1).optional(),
    parentId: import_zod3.z.string().uuid().optional().nullable(),
    displayOrder: import_zod3.z.number().int().optional(),
    isActive: import_zod3.z.boolean().optional()
  })
});

// src/modules/products/product.routes.ts
var router2 = (0, import_express2.Router)();
router2.get("/", validateRequest(productQuerySchema), ProductController.getAll);
router2.get("/slug/:slug", ProductController.getBySlug);
router2.get("/:id", ProductController.getById);
var productRoutes = router2;

// src/modules/categories/category.routes.ts
var import_express3 = require("express");

// src/modules/categories/category.service.ts
var CATEGORIES_ALL_CACHE_KEY = "categories:all";
var CATEGORIES_CACHE_TTL = 600;
var CategoryService = class {
  static async getAll() {
    return appCache.getOrSet(
      CATEGORIES_ALL_CACHE_KEY,
      async () => {
        return prisma.category.findMany({
          where: { isActive: true },
          orderBy: { displayOrder: "asc" },
          include: {
            _count: {
              select: { products: true }
            }
          }
        });
      },
      CATEGORIES_CACHE_TTL
    );
  }
  static async getBySlug(slug) {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        products: {
          where: { published: true, available: true },
          include: {
            variants: true,
            images: true
          }
        }
      }
    });
    if (!category) throw ApiError.notFound("Category not found");
    return category;
  }
  static async create(data) {
    const slug = data.name.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-");
    const created = await prisma.category.create({
      data: {
        ...data,
        slug
      }
    });
    appCache.del(CATEGORIES_ALL_CACHE_KEY);
    appCache.clearPattern("system:sitemap.xml");
    return created;
  }
  static async update(id, data) {
    const updated = await prisma.category.update({
      where: { id },
      data
    });
    appCache.del(CATEGORIES_ALL_CACHE_KEY);
    appCache.clearPattern("system:sitemap.xml");
    return updated;
  }
  static async delete(id) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true, children: true } } }
    });
    if (!category) throw ApiError.notFound("Category not found");
    if (category._count.products > 0) {
      throw ApiError.conflict(
        `Cannot delete "${category.name}" while ${category._count.products} product(s) use it. Move or delete those products first.`
      );
    }
    if (category._count.children > 0) {
      throw ApiError.conflict(
        `Cannot delete "${category.name}" while it has child categories. Move or delete the child categories first.`
      );
    }
    const deleted = await prisma.category.delete({
      where: { id }
    });
    appCache.del(CATEGORIES_ALL_CACHE_KEY);
    appCache.clearPattern("system:sitemap.xml");
    return deleted;
  }
};

// src/modules/categories/category.controller.ts
var CategoryController = class {
  static getAll = asyncHandler(async (req, res) => {
    const categories = await CategoryService.getAll();
    res.status(200).json(ApiResponse.success(categories, "Categories retrieved"));
  });
  static getBySlug = asyncHandler(async (req, res) => {
    const category = await CategoryService.getBySlug(req.params.slug);
    res.status(200).json(ApiResponse.success(category, "Category details"));
  });
  static create = asyncHandler(async (req, res) => {
    const created = await CategoryService.create(req.body);
    res.status(201).json(ApiResponse.created(created, "Category created"));
  });
  static update = asyncHandler(async (req, res) => {
    const updated = await CategoryService.update(req.params.id, req.body);
    res.status(200).json(ApiResponse.success(updated, "Category updated"));
  });
  static delete = asyncHandler(async (req, res) => {
    await CategoryService.delete(req.params.id);
    res.status(200).json(ApiResponse.success(null, "Category deleted"));
  });
};

// src/modules/categories/category.routes.ts
var router3 = (0, import_express3.Router)();
router3.get("/", CategoryController.getAll);
router3.get("/:slug", CategoryController.getBySlug);
var categoryRoutes = router3;

// src/modules/inventory/inventory.routes.ts
var import_express4 = require("express");

// src/modules/inventory/inventory.service.ts
var import_client3 = require("@prisma/client");
var InventoryService = class {
  /**
   * Admin: Get all inventory items with search, low-stock detection, and pagination
   */
  static async getInventoryList(query) {
    const page = Math.max(1, parseInt(query.page || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(query.limit || "20", 10)));
    const skip = (page - 1) * limit;
    const whereVariant = {
      isAvailable: true,
      product: {
        published: true
      }
    };
    if (query.search) {
      whereVariant.OR = [
        { name: { contains: query.search } },
        { sku: { contains: query.search } },
        { product: { name: { contains: query.search } } }
      ];
    }
    if (query.categoryId) {
      whereVariant.product.categoryId = query.categoryId;
    }
    const [variantsRaw, total] = await Promise.all([
      prisma.productVariant.findMany({
        where: whereVariant,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              lowStockThreshold: true,
              category: { select: { id: true, name: true } },
              images: { take: 1, select: { url: true } }
            }
          },
          inventory: true
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit
      }),
      prisma.productVariant.count({ where: whereVariant })
    ]);
    const inventoryItems = variantsRaw.map((v) => {
      const stockQty = v.inventory?.stockQuantity ?? v.stock;
      const reservedQty = v.inventory?.reservedQuantity ?? 0;
      const availableQty = v.inventory?.availableQuantity ?? Math.max(0, stockQty - reservedQty);
      const isLowStock = availableQty <= v.product.lowStockThreshold;
      return {
        variantId: v.id,
        variantName: v.name,
        variantSku: v.sku,
        productId: v.product.id,
        productName: v.product.name,
        productSku: v.product.sku,
        category: v.product.category,
        imageUrl: v.product.images[0]?.url,
        stockQuantity: stockQty,
        reservedQuantity: reservedQty,
        availableQuantity: availableQty,
        lowStockThreshold: v.product.lowStockThreshold,
        isLowStock,
        price: Number(v.price),
        updatedAt: v.inventory?.updatedAt || v.updatedAt
      };
    });
    const filtered = query.lowStockOnly === "true" ? inventoryItems.filter((i) => i.isLowStock) : inventoryItems;
    return {
      items: filtered,
      meta: {
        page,
        limit,
        total: query.lowStockOnly === "true" ? filtered.length : total,
        totalPages: Math.ceil((query.lowStockOnly === "true" ? filtered.length : total) / limit)
      }
    };
  }
  /**
   * Admin: Get all variants and inventory for a specific product
   */
  static async getProductInventory(productId) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        variants: {
          include: {
            inventory: {
              include: {
                transactions: {
                  take: 5,
                  orderBy: { createdAt: "desc" },
                  include: { performedByUser: { select: { name: true, email: true } } }
                }
              }
            }
          },
          orderBy: { sortOrder: "asc" }
        }
      }
    });
    if (!product) throw ApiError.notFound("Product not found");
    return {
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      lowStockThreshold: product.lowStockThreshold,
      category: product.category,
      variants: product.variants.map((v) => {
        const stockQty = v.inventory?.stockQuantity ?? v.stock;
        const reservedQty = v.inventory?.reservedQuantity ?? 0;
        const availableQty = v.inventory?.availableQuantity ?? stockQty - reservedQty;
        return {
          variantId: v.id,
          variantName: v.name,
          sku: v.sku,
          price: Number(v.price),
          stockQuantity: stockQty,
          reservedQuantity: reservedQty,
          availableQuantity: availableQty,
          isLowStock: availableQty <= product.lowStockThreshold,
          recentTransactions: v.inventory?.transactions || []
        };
      })
    };
  }
  /**
   * Admin: Atomic Stock Adjustment (Restock, Damage, Return, Adjustment)
   */
  static async adjustStock(data) {
    return prisma.$transaction(async (tx) => {
      const variant = await tx.productVariant.findUnique({
        where: { id: data.variantId },
        include: { product: true, inventory: true }
      });
      if (!variant) throw ApiError.notFound("Product variant not found");
      let inventory = variant.inventory;
      if (!inventory) {
        inventory = await tx.inventory.create({
          data: {
            variantId: data.variantId,
            stockQuantity: variant.stock,
            reservedQuantity: 0,
            availableQuantity: variant.stock
          }
        });
      }
      const previousStock = inventory.stockQuantity;
      const previousAvailable = inventory.availableQuantity;
      const previousReserved = inventory.reservedQuantity;
      let newStock = previousStock;
      let newReserved = previousReserved;
      let newAvailable = previousAvailable;
      if (data.type === import_client3.InventoryTransactionType.RESERVATION) {
        newReserved += Math.abs(data.changeAmount);
        newAvailable = newStock - newReserved;
      } else if (data.type === import_client3.InventoryTransactionType.RELEASE) {
        newReserved = Math.max(0, newReserved - Math.abs(data.changeAmount));
        newAvailable = newStock - newReserved;
      } else {
        newStock += data.changeAmount;
        newAvailable = newStock - newReserved;
      }
      if (newStock < 0 || newAvailable < 0) {
        throw ApiError.badRequest(
          `Adjustment rejected: Insufficient stock for "${variant.product.name} (${variant.name})". Current available: ${previousAvailable}, Requested change: ${data.changeAmount}`
        );
      }
      const updatedInventory = await tx.inventory.update({
        where: { id: inventory.id },
        data: {
          stockQuantity: newStock,
          reservedQuantity: newReserved,
          availableQuantity: newAvailable
        }
      });
      const isAvailable = newAvailable > 0;
      const stockStatus = isAvailable ? "IN_STOCK" : "OUT_OF_STOCK";
      await tx.productVariant.update({
        where: { id: data.variantId },
        data: {
          stock: newStock,
          stockStatus,
          isAvailable
        }
      });
      await tx.product.update({
        where: { id: variant.productId },
        data: {
          stockStatus,
          available: isAvailable
        }
      });
      const transaction = await tx.inventoryTransaction.create({
        data: {
          inventoryId: inventory.id,
          variantId: data.variantId,
          type: data.type,
          quantity: data.changeAmount,
          previousStock,
          newStock,
          referenceType: data.referenceType || "ManualAdjustment",
          referenceId: data.referenceId,
          note: data.note,
          performedByUserId: data.userId
        }
      });
      await tx.auditLog.create({
        data: {
          userId: data.userId,
          action: `INVENTORY_${data.type}`,
          resource: "Inventory",
          resourceId: inventory.id,
          details: {
            product: variant.product.name,
            variant: variant.name,
            changeAmount: data.changeAmount,
            previousStock,
            newStock,
            note: data.note
          }
        }
      });
      const result = {
        success: true,
        variantId: data.variantId,
        productName: variant.product.name,
        variantName: variant.name,
        stockQuantity: newStock,
        reservedQuantity: newReserved,
        availableQuantity: newAvailable,
        transaction
      };
      catalogCache.clear();
      emitLiveEvent("inventory:updated", {
        variantId: data.variantId,
        productId: variant.productId,
        availableQuantity: newAvailable,
        stockQuantity: newStock
      });
      return result;
    });
  }
  /**
   * Admin: Get audit transaction history
   */
  static async getTransactions(query) {
    const limit = Math.max(1, Math.min(100, parseInt(query.limit || "50", 10)));
    const where = {};
    if (query.variantId) where.variantId = query.variantId;
    if (query.type) where.type = query.type;
    const transactions = await prisma.inventoryTransaction.findMany({
      where,
      include: {
        variant: {
          include: {
            product: { select: { id: true, name: true, sku: true } }
          }
        },
        performedByUser: { select: { id: true, name: true, email: true, role: true } }
      },
      orderBy: { createdAt: "desc" },
      take: limit
    });
    return transactions.map((t) => ({
      id: t.id,
      type: t.type,
      quantity: t.quantity,
      previousStock: t.previousStock,
      newStock: t.newStock,
      referenceType: t.referenceType,
      referenceId: t.referenceId,
      note: t.note,
      productName: t.variant?.product?.name,
      variantName: t.variant?.name,
      sku: t.variant?.sku,
      performedBy: t.performedByUser ? `${t.performedByUser.name} (${t.performedByUser.role})` : "System",
      createdAt: t.createdAt
    }));
  }
};

// src/modules/inventory/inventory.controller.ts
var InventoryController = class {
  static getInventory = asyncHandler(async (req, res) => {
    const result = await InventoryService.getInventoryList(req.query);
    res.status(200).json(ApiResponse.success(result.items, "Inventory list retrieved", 200, result.meta));
  });
  static getProductInventory = asyncHandler(async (req, res) => {
    const result = await InventoryService.getProductInventory(req.params.productId);
    res.status(200).json(ApiResponse.success(result, "Product inventory retrieved"));
  });
  static adjustStock = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const result = await InventoryService.adjustStock({
      ...req.body,
      userId
    });
    res.status(200).json(ApiResponse.success(result, "Stock adjusted successfully"));
  });
  static getTransactions = asyncHandler(async (req, res) => {
    const transactions = await InventoryService.getTransactions(req.query);
    res.status(200).json(ApiResponse.success(transactions, "Inventory transaction history retrieved"));
  });
  // Legacy low-stock endpoint backward compatibility
  static getLowStock = asyncHandler(async (req, res) => {
    const result = await InventoryService.getInventoryList({ lowStockOnly: "true" });
    res.status(200).json(ApiResponse.success(result.items, "Low stock items retrieved", 200, result.meta));
  });
  static getLogs = asyncHandler(async (req, res) => {
    const logs = await InventoryService.getTransactions(req.query);
    res.status(200).json(ApiResponse.success(logs, "Inventory history logs retrieved"));
  });
};

// src/modules/inventory/inventory.routes.ts
var import_client4 = require("@prisma/client");
var router4 = (0, import_express4.Router)();
router4.get("/low-stock", authenticateJWT, requireRole(import_client4.UserRole.ADMIN, import_client4.UserRole.STAFF), InventoryController.getLowStock);
router4.get("/logs", authenticateJWT, requireRole(import_client4.UserRole.ADMIN, import_client4.UserRole.STAFF), InventoryController.getLogs);
router4.post(
  "/variants/:id/adjust",
  authenticateJWT,
  requireRole(import_client4.UserRole.ADMIN, import_client4.UserRole.STAFF),
  InventoryController.adjustStock
);
var inventoryRoutes = router4;

// src/modules/cart/cart.routes.ts
var import_express5 = require("express");

// src/modules/cart/cart.controller.ts
var import_crypto3 = __toESM(require("crypto"));

// src/modules/cart/cart.service.ts
var CartService = class {
  /**
   * Get or create active cart for a user (or session)
   */
  static async getOrCreateCart(userId, sessionId) {
    if (!userId && !sessionId) {
      throw ApiError.badRequest("User ID or Session ID required to access cart");
    }
    let cart = null;
    if (userId) {
      cart = await prisma.cart.findUnique({
        where: { userId }
      });
      if (!cart) {
        cart = await prisma.cart.create({
          data: { userId }
        });
      }
    } else if (sessionId) {
      cart = await prisma.cart.findUnique({
        where: { sessionId }
      });
      if (!cart) {
        cart = await prisma.cart.create({
          data: { sessionId }
        });
      }
    }
    return cart;
  }
  /**
   * Fetch customer cart with dynamic revalidation of availability, price, and live stock
   */
  static async getCart(userId, sessionId) {
    const cart = await this.getOrCreateCart(userId, sessionId);
    const cartItems = await prisma.cartItem.findMany({
      where: { cartId: cart.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            sku: true,
            published: true,
            available: true,
            basePrice: true,
            compareAtPrice: true,
            images: {
              where: { isPrimary: true },
              take: 1,
              select: { url: true, altText: true }
            },
            category: { select: { id: true, name: true, slug: true } }
          }
        },
        variant: {
          include: {
            inventory: {
              select: {
                availableQuantity: true,
                stockQuantity: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    let subtotal = 0;
    let itemCount = 0;
    let hasUnavailableItems = false;
    let hasPriceChanges = false;
    const formattedItems = cartItems.map((item) => {
      const currentPrice = Number(item.variant.price);
      const originalCartPrice = Number(item.unitPrice);
      const isPriceChanged = currentPrice !== originalCartPrice;
      if (isPriceChanged) {
        hasPriceChanges = true;
      }
      const availableStock = item.variant.inventory?.availableQuantity ?? item.variant.stock;
      const isProductAvailable = item.product.published && item.product.available;
      const isVariantAvailable = item.variant.isAvailable;
      const isAvailable = isProductAvailable && isVariantAvailable && availableStock > 0;
      const isSufficientStock = availableStock >= item.quantity;
      if (!isAvailable || !isSufficientStock) {
        hasUnavailableItems = true;
      }
      const lineTotal = currentPrice * item.quantity;
      if (isAvailable) {
        subtotal += lineTotal;
        itemCount += item.quantity;
      }
      return {
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        productName: item.product.name,
        productSlug: item.product.slug,
        variantName: item.variant.name,
        sku: item.variant.sku,
        imageUrl: item.product.images[0]?.url || null,
        category: item.product.category,
        unitPrice: currentPrice,
        previousPrice: isPriceChanged ? originalCartPrice : null,
        quantity: item.quantity,
        totalPrice: lineTotal,
        availableStock,
        isAvailable,
        isSufficientStock,
        validationIssues: {
          productUnavailable: !isProductAvailable,
          variantUnavailable: !isVariantAvailable,
          outOfStock: availableStock <= 0,
          insufficientStock: availableStock > 0 && !isSufficientStock,
          priceChanged: isPriceChanged
        },
        createdAt: item.createdAt
      };
    });
    const deliveryFee = subtotal === 0 ? 0 : subtotal >= 2e3 ? 0 : 100;
    const total = subtotal + deliveryFee;
    return {
      cartId: cart.id,
      items: formattedItems,
      itemCount,
      subtotal,
      deliveryFee,
      freeDeliveryThreshold: 2e3,
      amountNeededForFreeDelivery: Math.max(0, 2e3 - subtotal),
      total,
      hasUnavailableItems,
      hasPriceChanges
    };
  }
  /**
   * Add item to Cart with strict server-side validation of stock and current price
   */
  static async addItem(userId, sessionId, data) {
    const cart = await this.getOrCreateCart(userId, sessionId);
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
      select: { id: true, name: true, published: true, available: true }
    });
    if (!product || !product.published || !product.available) {
      throw ApiError.badRequest("Product is currently unavailable or out of stock");
    }
    const variant = await prisma.productVariant.findUnique({
      where: { id: data.variantId },
      include: { inventory: true }
    });
    if (!variant || variant.productId !== data.productId || !variant.isAvailable) {
      throw ApiError.badRequest("Selected product variant is not available");
    }
    const availableStock = variant.inventory?.availableQuantity ?? variant.stock;
    if (availableStock < data.quantity) {
      throw ApiError.badRequest(
        `Insufficient stock for "${variant.name}". Available: ${availableStock}, Requested: ${data.quantity}`
      );
    }
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_variantId: {
          cartId: cart.id,
          variantId: data.variantId
        }
      }
    });
    if (existingItem) {
      const newQuantity = existingItem.quantity + data.quantity;
      if (newQuantity > availableStock) {
        throw ApiError.badRequest(
          `Cannot add ${data.quantity} more. Only ${availableStock} in stock and you already have ${existingItem.quantity} in cart.`
        );
      }
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: newQuantity,
          unitPrice: variant.price
          // Refresh price
        }
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: data.productId,
          variantId: data.variantId,
          quantity: data.quantity,
          unitPrice: variant.price
        }
      });
    }
    return this.getCart(userId, sessionId);
  }
  /**
   * Update quantity of a cart item
   */
  static async updateItem(userId, sessionId, cartItemId, quantity) {
    const cart = await this.getOrCreateCart(userId, sessionId);
    const item = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: {
        variant: { include: { inventory: true } }
      }
    });
    if (!item || item.cartId !== cart.id) {
      throw ApiError.notFound("Cart item not found");
    }
    const availableStock = item.variant.inventory?.availableQuantity ?? item.variant.stock;
    if (quantity > availableStock) {
      throw ApiError.badRequest(
        `Requested quantity (${quantity}) exceeds available stock (${availableStock})`
      );
    }
    await prisma.cartItem.update({
      where: { id: cartItemId },
      data: {
        quantity,
        unitPrice: item.variant.price
        // Update unit price snapshot
      }
    });
    return this.getCart(userId, sessionId);
  }
  /**
   * Remove item from cart
   */
  static async removeItem(userId, sessionId, cartItemId) {
    const cart = await this.getOrCreateCart(userId, sessionId);
    const item = await prisma.cartItem.findUnique({
      where: { id: cartItemId }
    });
    if (!item || item.cartId !== cart.id) {
      throw ApiError.notFound("Cart item not found");
    }
    await prisma.cartItem.delete({
      where: { id: cartItemId }
    });
    return this.getCart(userId, sessionId);
  }
  /**
   * Clear all items in cart
   */
  static async clearCart(userId, sessionId) {
    const cart = await this.getOrCreateCart(userId, sessionId);
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id }
    });
    return this.getCart(userId, sessionId);
  }
  /**
   * Merge Guest Local/Session Cart into Authenticated Customer Cart on Login
   */
  static async mergeGuestCart(userId, guestItems) {
    const userCart = await this.getOrCreateCart(userId);
    const variantIds = Array.from(new Set(guestItems.map((i) => i.variantId).filter(Boolean)));
    if (variantIds.length === 0) {
      return this.getCart(userId);
    }
    const [variants, existingItems] = await Promise.all([
      prisma.productVariant.findMany({
        where: { id: { in: variantIds } },
        include: { product: true, inventory: true }
      }),
      prisma.cartItem.findMany({
        where: {
          cartId: userCart.id,
          variantId: { in: variantIds }
        }
      })
    ]);
    const variantMap = new Map(variants.map((v) => [v.id, v]));
    const existingItemMap = new Map(existingItems.map((ei) => [ei.variantId, ei]));
    for (const item of guestItems) {
      try {
        if (!item.productId || !item.variantId || item.quantity <= 0) continue;
        const variant = variantMap.get(item.variantId);
        if (!variant || !variant.isAvailable || !variant.product.available || !variant.product.published) {
          continue;
        }
        const availableStock = variant.inventory?.availableQuantity ?? variant.stock;
        if (availableStock <= 0) continue;
        const existingItem = existingItemMap.get(item.variantId);
        if (existingItem) {
          const mergedQty = Math.min(Math.max(existingItem.quantity, item.quantity), availableStock);
          await prisma.cartItem.update({
            where: { id: existingItem.id },
            data: {
              quantity: mergedQty,
              unitPrice: variant.price
            }
          });
        } else {
          const qtyToAdd = Math.min(item.quantity, availableStock);
          const created = await prisma.cartItem.create({
            data: {
              cartId: userCart.id,
              productId: item.productId,
              variantId: item.variantId,
              quantity: qtyToAdd,
              unitPrice: variant.price
            }
          });
          existingItemMap.set(item.variantId, created);
        }
      } catch (err) {
        console.error("Error merging cart item:", err);
      }
    }
    return this.getCart(userId);
  }
};

// src/modules/cart/cart.controller.ts
var getSessionId = (req, res) => {
  if (req.user?.id) return void 0;
  let sessionId = req.headers["x-session-id"] || extractCookie(req, "ktm_session_id");
  if (!sessionId) {
    sessionId = `guest_${import_crypto3.default.randomUUID()}`;
    res.cookie("ktm_session_id", sessionId, {
      httpOnly: false,
      // Accessible to client if needed
      maxAge: 30 * 24 * 60 * 60 * 1e3,
      // 30 days
      path: "/",
      sameSite: "lax"
    });
  }
  return sessionId;
};
var CartController = class {
  static getCart = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const sessionId = getSessionId(req, res);
    const cart = await CartService.getCart(userId, sessionId);
    res.status(200).json(ApiResponse.success(cart, "Cart retrieved successfully"));
  });
  static addItem = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const sessionId = getSessionId(req, res);
    const cart = await CartService.addItem(userId, sessionId, req.body);
    res.status(200).json(ApiResponse.success(cart, "Item added to cart successfully"));
  });
  static updateItem = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const sessionId = getSessionId(req, res);
    const cart = await CartService.updateItem(userId, sessionId, req.params.id, req.body.quantity);
    res.status(200).json(ApiResponse.success(cart, "Cart item updated successfully"));
  });
  static removeItem = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const sessionId = getSessionId(req, res);
    const cart = await CartService.removeItem(userId, sessionId, req.params.id);
    res.status(200).json(ApiResponse.success(cart, "Cart item removed successfully"));
  });
  static clearCart = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const sessionId = getSessionId(req, res);
    const cart = await CartService.clearCart(userId, sessionId);
    res.status(200).json(ApiResponse.success(cart, "Cart cleared successfully"));
  });
  static mergeCart = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
      throw ApiError.unauthorized("Authentication required to merge cart");
    }
    const cart = await CartService.mergeGuestCart(userId, req.body.items || []);
    res.status(200).json(ApiResponse.success(cart, "Guest cart merged successfully"));
  });
};

// src/validators/cart.validator.ts
var import_zod4 = require("zod");
var addToCartSchema = import_zod4.z.object({
  body: import_zod4.z.object({
    productId: import_zod4.z.string().uuid("Valid product ID required"),
    variantId: import_zod4.z.string().uuid("Valid variant ID required"),
    quantity: import_zod4.z.number().int().min(1, "Quantity must be at least 1").default(1)
  })
});
var updateCartItemSchema = import_zod4.z.object({
  params: import_zod4.z.object({
    id: import_zod4.z.string().uuid("Valid cart item ID required")
  }),
  body: import_zod4.z.object({
    quantity: import_zod4.z.number().int().min(1, "Quantity must be at least 1")
  })
});
var deleteCartItemSchema = import_zod4.z.object({
  params: import_zod4.z.object({
    id: import_zod4.z.string().uuid("Valid cart item ID required")
  })
});
var mergeCartSchema = import_zod4.z.object({
  body: import_zod4.z.object({
    items: import_zod4.z.array(
      import_zod4.z.object({
        productId: import_zod4.z.string().uuid("Valid product ID required"),
        variantId: import_zod4.z.string().uuid("Valid variant ID required"),
        quantity: import_zod4.z.number().int().min(1).default(1)
      })
    )
  })
});
var wishlistParamSchema = import_zod4.z.object({
  params: import_zod4.z.object({
    productId: import_zod4.z.string().uuid("Valid product ID required")
  })
});

// src/modules/cart/cart.routes.ts
var router5 = (0, import_express5.Router)();
router5.get("/", optionalAuth, CartController.getCart);
router5.post("/items", optionalAuth, validateRequest(addToCartSchema), CartController.addItem);
router5.patch("/items/:id", optionalAuth, validateRequest(updateCartItemSchema), CartController.updateItem);
router5.delete("/items/:id", optionalAuth, validateRequest(deleteCartItemSchema), CartController.removeItem);
router5.delete("/", optionalAuth, CartController.clearCart);
router5.post("/merge", authenticateJWT, validateRequest(mergeCartSchema), CartController.mergeCart);
var cartRoutes = router5;

// src/modules/orders/order.routes.ts
var import_express6 = require("express");

// src/modules/orders/order.service.ts
var import_client6 = require("@prisma/client");

// src/modules/notifications/notification.service.ts
var import_client5 = require("@prisma/client");
var NotificationService = class {
  // 1. Get paginated notifications for current user with unread counter
  static async getUserNotifications(userId, query) {
    const page = Math.max(1, query?.page || 1);
    const limit = Math.max(1, Math.min(50, query?.limit || 20));
    const skip = (page - 1) * limit;
    const where = { userId };
    if (query?.unreadOnly) {
      where.isRead = false;
    }
    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, isRead: false } })
    ]);
    return {
      notifications,
      unreadCount,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
  // 2. Mark single notification as read
  static async markAsRead(notificationId, userId) {
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId }
    });
    if (!notification) throw ApiError.notFound("Notification not found");
    return prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true }
    });
  }
  // 3. Mark all notifications as read
  static async markAllAsRead(userId) {
    const result = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });
    return { updatedCount: result.count };
  }
  // 4. Delete single notification
  static async deleteNotification(notificationId, userId) {
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId }
    });
    if (!notification) throw ApiError.notFound("Notification not found");
    await prisma.notification.delete({ where: { id: notificationId } });
    return { message: "Notification deleted successfully" };
  }
  // 5. Create In-App Notification (Customer or Admin)
  static async createNotification(params) {
    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        title: params.title,
        message: params.message,
        type: params.type || import_client5.NotificationType.ORDER_STATUS,
        linkUrl: params.linkUrl
      }
    });
    this.dispatchWebPushToUser(params.userId, {
      title: params.title,
      body: params.message,
      url: params.linkUrl || "/"
    }).catch((err) => console.warn("Web push dispatch error:", err.message));
    return notification;
  }
  // 6. Notify All Admins & Staff (Operational events)
  static async notifyAdmins(params) {
    const adminUsers = await prisma.user.findMany({
      where: {
        role: { in: [import_client5.UserRole.ADMIN, import_client5.UserRole.STAFF] },
        isActive: true
      },
      select: { id: true }
    });
    if (adminUsers.length === 0) return [];
    const creations = adminUsers.map(
      (admin) => prisma.notification.create({
        data: {
          userId: admin.id,
          title: params.title,
          message: params.message,
          type: params.type || import_client5.NotificationType.SYSTEM,
          linkUrl: params.linkUrl
        }
      })
    );
    const results = await prisma.$transaction(creations);
    for (const admin of adminUsers) {
      this.dispatchWebPushToUser(admin.id, {
        title: params.title,
        body: params.message,
        url: params.linkUrl || "/admin"
      }).catch((err) => console.warn("Admin web push dispatch error:", err.message));
    }
    return results;
  }
  // ==========================================
  // Web Push Subscriptions
  // ==========================================
  static async subscribePush(userId, data) {
    const existing = await prisma.pushSubscription.findUnique({
      where: { endpoint: data.endpoint }
    });
    if (existing) {
      return prisma.pushSubscription.update({
        where: { endpoint: data.endpoint },
        data: {
          userId,
          p256dh: data.p256dh,
          auth: data.auth,
          userAgent: data.userAgent
        }
      });
    }
    return prisma.pushSubscription.create({
      data: {
        userId,
        endpoint: data.endpoint,
        p256dh: data.p256dh,
        auth: data.auth,
        userAgent: data.userAgent
      }
    });
  }
  static async unsubscribePush(userId, endpoint) {
    const existing = await prisma.pushSubscription.findFirst({
      where: { userId, endpoint }
    });
    if (existing) {
      await prisma.pushSubscription.delete({ where: { id: existing.id } });
    }
    return { message: "Push subscription removed" };
  }
  static async dispatchWebPushToUser(userId, payload) {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId }
    });
    if (subscriptions.length === 0) return;
    console.log(`\u{1F4E1} [WebPush] Sent notification to user ${userId} (${subscriptions.length} active devices):`, payload.title);
  }
  // ==========================================
  // Event Triggers
  // ==========================================
  static async notifyOrderEvent(event, order) {
    const orderNumber = order.orderNumber || order.id?.substring(0, 8);
    const totalAmount = Number(order.totalAmount || 0).toLocaleString();
    let customerTitle = "";
    let customerMessage = "";
    let linkUrl = `/orders/${order.id}`;
    switch (event) {
      case "ORDER_CREATED":
        customerTitle = `\u{1F331} Order Placed: #${orderNumber}`;
        customerMessage = `Your botanical order of \u0930\u0942 ${totalAmount} has been received and is being prepared with care.`;
        break;
      case "ORDER_CONFIRMED":
        customerTitle = `\u{1F33F} Order Confirmed: #${orderNumber}`;
        customerMessage = `Payment and details for order #${orderNumber} verified. Greenhouse intake initiated.`;
        break;
      case "ORDER_PROCESSING":
        customerTitle = `\u{1FAB4} Preparing Your Plants: #${orderNumber}`;
        customerMessage = `Your live plants and pot options are being hand-selected and inspected by our nursery horticulturists.`;
        break;
      case "ORDER_READY":
        customerTitle = `\u{1F4E6} Order Packed & Ready: #${orderNumber}`;
        customerMessage = `Order #${orderNumber} is packed securely with personalized botanical care guides.`;
        break;
      case "ORDER_OUT_FOR_DELIVERY":
        customerTitle = `\u{1F69A} Out For Delivery: #${orderNumber}`;
        customerMessage = `Our Pokhara rider is on the way with your living plants!`;
        break;
      case "ORDER_DELIVERED":
        customerTitle = `\u{1F3E1} Order Delivered: #${orderNumber}`;
        customerMessage = `Your botanical order has arrived. Thank you for bringing greenery into your home!`;
        break;
      case "ORDER_COMPLETED":
        customerTitle = `\u2728 Order Completed: #${orderNumber}`;
        customerMessage = `Order #${orderNumber} is marked completed. Happy planting!`;
        break;
      case "ORDER_CANCELLED":
        customerTitle = `\u{1F6D1} Order Cancelled: #${orderNumber}`;
        customerMessage = `Order #${orderNumber} has been cancelled and plant stock reserved has been restored.`;
        break;
      default:
        customerTitle = `Notification for #${orderNumber}`;
        customerMessage = `Order update: #${orderNumber}`;
    }
    if (order.userId) {
      await this.createNotification({
        userId: order.userId,
        title: customerTitle,
        message: customerMessage,
        type: import_client5.NotificationType.ORDER_STATUS,
        linkUrl
      });
    }
    if (event === "ORDER_CREATED") {
      await this.notifyAdmins({
        title: `\u{1F6CD}\uFE0F New Order #${orderNumber}`,
        message: `Customer ${order.customerName || "Guest"} placed order for \u0930\u0942 ${totalAmount} (${order.deliveryCity || "Pokhara"}).`,
        type: import_client5.NotificationType.ORDER_STATUS,
        linkUrl: `/admin/orders/${order.id}`
      });
    }
  }
  static async notifyPaymentReceived(order, payment) {
    const orderNumber = order.orderNumber || order.id?.substring(0, 8);
    const amount = Number(payment.amount || order.totalAmount || 0).toLocaleString();
    if (order.userId) {
      await this.createNotification({
        userId: order.userId,
        title: `\u{1F4B3} Payment Received: #${orderNumber}`,
        message: `Payment of \u0930\u0942 ${amount} via ${payment.paymentMethod || "online gateway"} has been verified.`,
        type: import_client5.NotificationType.ORDER_STATUS,
        linkUrl: `/orders/${order.id}`
      });
    }
    await this.notifyAdmins({
      title: `\u{1F4B0} Payment Verified #${orderNumber}`,
      message: `Received \u0930\u0942 ${amount} for order #${orderNumber} via ${payment.paymentMethod || "Gateway"}.`,
      type: import_client5.NotificationType.ORDER_STATUS,
      linkUrl: `/admin/orders/${order.id}`
    });
  }
  static async notifyLowStock(variantName, productTitle, currentStock, threshold) {
    await this.notifyAdmins({
      title: `\u26A0\uFE0F Low Stock Warning: ${productTitle}`,
      message: `Variant "${variantName}" has dropped to ${currentStock} units (Threshold: ${threshold}). Restock recommended.`,
      type: import_client5.NotificationType.INVENTORY_ALERT,
      linkUrl: `/admin/inventory`
    });
  }
};

// src/modules/orders/order.service.ts
var idempotencyCache = new MemoryCache(500);
var ALLOWED_STATUS_TRANSITIONS = {
  PENDING: [import_client6.OrderStatus.DELIVERED, import_client6.OrderStatus.CANCELLED],
  // Legacy in-progress rows remain updatable after the workflow is simplified.
  CONFIRMED: [import_client6.OrderStatus.DELIVERED, import_client6.OrderStatus.CANCELLED],
  PROCESSING: [import_client6.OrderStatus.DELIVERED, import_client6.OrderStatus.CANCELLED],
  READY: [import_client6.OrderStatus.DELIVERED, import_client6.OrderStatus.CANCELLED],
  OUT_FOR_DELIVERY: [import_client6.OrderStatus.DELIVERED, import_client6.OrderStatus.CANCELLED],
  DELIVERED: [],
  COMPLETED: [],
  CANCELLED: []
};
var OrderService = class {
  static generateOrderNumber() {
    const random = Math.floor(1e3 + Math.random() * 9e3);
    const date = /* @__PURE__ */ new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `PKR-${year}${month}-${random}`;
  }
  /**
   * Concurrency-Safe Transactional Checkout with Idempotency, Coupon Calculation & Inventory Verification
   */
  static async createOrder(data, userId) {
    const idempotencyKey = data.idempotencyKey;
    if (idempotencyKey) {
      const cached = idempotencyCache.get(idempotencyKey);
      if (cached) {
        return cached;
      }
    }
    const orderResult = await prisma.$transaction(
      async (tx) => {
        let subtotal = 0;
        const orderItemsToCreate = [];
        const inventoryTransactionsToCreate = [];
        const productIds = Array.from(new Set(data.items.map((i) => i.productId)));
        const variantIds = Array.from(new Set(data.items.map((i) => i.variantId)));
        const [products, variants] = await Promise.all([
          tx.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, name: true, sku: true, available: true, published: true, stockStatus: true }
          }),
          tx.productVariant.findMany({
            where: { id: { in: variantIds } },
            include: { inventory: true }
          })
        ]);
        const productMap = new Map(products.map((p) => [p.id, p]));
        const variantMap = new Map(variants.map((v) => [v.id, v]));
        for (const item of data.items) {
          if (item.quantity <= 0) {
            throw ApiError.badRequest("Item quantity must be at least 1");
          }
          const product = productMap.get(item.productId);
          if (!product || !product.available || !product.published) {
            throw ApiError.badRequest(`Product "${product?.name || item.productId}" is currently Out of Stock`);
          }
          const variant = variantMap.get(item.variantId);
          if (!variant || !variant.isAvailable || variant.stockStatus === "OUT_OF_STOCK" || variant.productId !== item.productId) {
            throw ApiError.badRequest(`Selected option for "${product.name}" is currently Out of Stock`);
          }
          let inventory = variant.inventory;
          if (!inventory) {
            inventory = await tx.inventory.create({
              data: {
                variantId: variant.id,
                stockQuantity: variant.stock,
                reservedQuantity: 0,
                availableQuantity: variant.stock
              }
            });
          }
          const currentAvailable = inventory.availableQuantity;
          if (currentAvailable < item.quantity) {
            throw ApiError.badRequest(
              `Insufficient stock for "${product.name} (${variant.name})". Available: ${currentAvailable}, Requested: ${item.quantity}`
            );
          }
          const unitPrice = Number(variant.price);
          const lineTotal = unitPrice * item.quantity;
          subtotal += lineTotal;
          orderItemsToCreate.push({
            productId: product.id,
            variantId: variant.id,
            productName: product.name,
            variantName: variant.name,
            sku: variant.sku,
            unitPrice,
            quantity: item.quantity,
            lineTotal
          });
          const newStock = inventory.stockQuantity - item.quantity;
          const newAvailable = inventory.availableQuantity - item.quantity;
          await tx.inventory.update({
            where: { id: inventory.id },
            data: {
              stockQuantity: newStock,
              availableQuantity: newAvailable
            }
          });
          await tx.productVariant.update({
            where: { id: variant.id },
            data: { stock: newStock }
          });
          inventoryTransactionsToCreate.push({
            inventoryId: inventory.id,
            variantId: variant.id,
            type: import_client6.InventoryTransactionType.SALE,
            quantity: -item.quantity,
            previousStock: inventory.stockQuantity,
            newStock,
            referenceType: "OrderCheckout",
            note: `Order checkout for ${product.name} (${variant.name})`,
            performedByUserId: userId
          });
        }
        let deliveryFee = subtotal >= 2e3 ? 0 : 100;
        let matchedZoneId = data.deliveryZoneId;
        if (!matchedZoneId && data.deliveryZoneCode) {
          const zone = await tx.deliveryZone.findUnique({
            where: { code: data.deliveryZoneCode }
          });
          if (zone && zone.isActive) {
            matchedZoneId = zone.id;
            if (subtotal < 2e3) {
              deliveryFee = Number(zone.baseDeliveryCharge);
            }
          }
        }
        let discountAmount = 0;
        let appliedCouponId = void 0;
        if (data.couponCode) {
          const coupon = await tx.coupon.findUnique({
            where: { code: data.couponCode.trim().toUpperCase() }
          });
          if (!coupon || !coupon.isActive) {
            throw ApiError.badRequest(`Coupon "${data.couponCode}" is invalid or inactive`);
          }
          const now = /* @__PURE__ */ new Date();
          if (now < coupon.startDate || now > coupon.expiryDate) {
            throw ApiError.badRequest(`Coupon "${coupon.code}" has expired`);
          }
          if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            throw ApiError.badRequest(`Coupon "${coupon.code}" usage limit reached`);
          }
          if (coupon.minimumOrderAmount && subtotal < Number(coupon.minimumOrderAmount)) {
            throw ApiError.badRequest(
              `Coupon "${coupon.code}" requires a minimum order of Rs. ${coupon.minimumOrderAmount}`
            );
          }
          if (userId && coupon.perUserLimit) {
            const userUsages = await tx.couponUsage.count({
              where: { couponId: coupon.id, userId }
            });
            if (userUsages >= coupon.perUserLimit) {
              throw ApiError.badRequest(`You have already redeemed coupon "${coupon.code}"`);
            }
          }
          if (coupon.discountType === import_client6.DiscountType.PERCENTAGE) {
            discountAmount = subtotal * Number(coupon.discountValue) / 100;
            if (coupon.maxDiscountAmount && discountAmount > Number(coupon.maxDiscountAmount)) {
              discountAmount = Number(coupon.maxDiscountAmount);
            }
          } else {
            discountAmount = Math.min(Number(coupon.discountValue), subtotal);
          }
          appliedCouponId = coupon.id;
          await tx.coupon.update({
            where: { id: coupon.id },
            data: { usedCount: { increment: 1 } }
          });
        }
        const totalAmount = Math.max(0, subtotal - discountAmount + deliveryFee);
        const orderNumber = this.generateOrderNumber();
        const order = await tx.order.create({
          data: {
            orderNumber,
            userId,
            orderSource: import_client6.OrderSource.CUSTOMER_WEB,
            orderType: import_client6.OrderType.DELIVERY,
            status: import_client6.OrderStatus.PENDING,
            subtotal,
            discountAmount,
            deliveryFee,
            totalAmount,
            couponId: appliedCouponId,
            customerNotes: data.giftMessage ? `[Gift Card Note]: ${data.giftMessage}` : void 0,
            internalNotes: data.deliveryNotes,
            items: {
              create: orderItemsToCreate
            },
            delivery: {
              create: {
                recipientName: data.customerName,
                recipientPhone: data.customerPhone,
                deliveryAddress: data.deliveryAddress,
                city: data.deliveryCity || "Pokhara",
                area: data.deliveryArea,
                postalCode: data.deliveryPostalCode,
                latitude: data.deliveryLatitude != null && !isNaN(Number(data.deliveryLatitude)) ? Number(data.deliveryLatitude) : null,
                longitude: data.deliveryLongitude != null && !isNaN(Number(data.deliveryLongitude)) ? Number(data.deliveryLongitude) : null,
                zoneId: matchedZoneId,
                scheduledDate: data.scheduledDeliveryDate ? new Date(data.scheduledDeliveryDate) : null,
                deliveryCharge: deliveryFee,
                status: import_client6.DeliveryStatus.PENDING
              }
            },
            bill: {
              create: {
                billNumber: `BILL-${orderNumber}`,
                subtotal,
                discountAmount,
                deliveryCharge: deliveryFee,
                grandTotal: totalAmount,
                status: import_client6.BillStatus.UNPAID
              }
            },
            payments: {
              create: [
                {
                  paymentMethod: data.paymentMethod,
                  paymentStatus: import_client6.PaymentStatus.PENDING,
                  amount: totalAmount
                }
              ]
            },
            statusHistory: {
              create: [
                {
                  fromStatus: import_client6.OrderStatus.PENDING,
                  toStatus: import_client6.OrderStatus.PENDING,
                  comment: "Order placed via secure checkout with inventory lock & price calculation",
                  changedByUserId: userId
                }
              ]
            },
            couponUsages: appliedCouponId && userId ? {
              create: [
                {
                  couponId: appliedCouponId,
                  userId,
                  discountApplied: discountAmount
                }
              ]
            } : void 0
          },
          include: {
            items: true,
            delivery: true,
            payments: true,
            bill: true
          }
        });
        for (const invTx of inventoryTransactionsToCreate) {
          await tx.inventoryTransaction.create({
            data: {
              ...invTx,
              referenceId: order.id
            }
          });
        }
        if (userId) {
          const userCart = await tx.cart.findUnique({ where: { userId } });
          if (userCart) {
            await tx.cartItem.deleteMany({ where: { cartId: userCart.id } });
          }
        }
        NotificationService.notifyOrderEvent("ORDER_CREATED", {
          id: order.id,
          orderNumber: order.orderNumber,
          userId: order.userId,
          customerName: data.customerName,
          deliveryCity: data.deliveryCity,
          totalAmount: Number(order.totalAmount)
        }).catch((err) => console.warn("Order created notification failed:", err.message));
        catalogCache.clear();
        emitLiveEvent("order:created", {
          orderId: order.id,
          orderNumber: order.orderNumber,
          customerName: data.customerName,
          totalAmount: Number(order.totalAmount),
          status: order.status
        });
        emitLiveEvent("inventory:updated", { source: "order:created" });
        return {
          id: order.id,
          orderNumber: order.orderNumber,
          userId: order.userId,
          status: order.status,
          subtotal: Number(order.subtotal),
          discountAmount: Number(order.discountAmount),
          deliveryFee: Number(order.deliveryFee),
          totalAmount: Number(order.totalAmount),
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          deliveryAddress: data.deliveryAddress,
          deliveryCity: data.deliveryCity || "Kathmandu",
          scheduledDeliveryDate: order.delivery?.scheduledDate,
          giftMessage: data.giftMessage,
          paymentMethod: data.paymentMethod,
          paymentStatus: import_client6.PaymentStatus.PENDING,
          items: order.items.map((i) => ({
            id: i.id,
            productId: i.productId,
            variantId: i.variantId,
            productName: i.productName,
            variantName: i.variantName,
            sku: i.sku,
            unitPrice: Number(i.unitPrice),
            quantity: i.quantity,
            lineTotal: Number(i.lineTotal)
          })),
          createdAt: order.createdAt
        };
      },
      {
        maxWait: 5e3,
        timeout: 1e4
      }
    );
    if (idempotencyKey) {
      idempotencyCache.set(idempotencyKey, orderResult, 300);
    }
    return orderResult;
  }
  /**
   * Get Orders (Filtered by Role & Ownership)
   */
  static async getOrders(query, userId, isAdminOrStaff = false) {
    const page = Math.max(1, parseInt(query.page || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(query.limit || "10", 10)));
    const skip = (page - 1) * limit;
    const where = {};
    if (!isAdminOrStaff) {
      if (!userId) throw ApiError.unauthorized("Authentication required");
      where.userId = userId;
    }
    if (query.status) {
      where.status = query.status;
    }
    if (query.search) {
      where.OR = [
        { orderNumber: { contains: query.search } },
        { delivery: { recipientName: { contains: query.search } } },
        { delivery: { recipientPhone: { contains: query.search } } }
      ];
    }
    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate) where.createdAt.lte = new Date(query.endDate);
    }
    const [ordersRaw, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: true,
          delivery: true,
          payments: true,
          user: { select: { id: true, name: true, email: true, phoneNumber: true } }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      prisma.order.count({ where })
    ]);
    const orders = ordersRaw.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      userId: o.userId,
      orderStatus: o.status,
      status: o.status,
      subtotal: Number(o.subtotal),
      discountAmount: Number(o.discountAmount),
      deliveryFee: Number(o.deliveryFee),
      totalAmount: Number(o.totalAmount),
      customerName: o.delivery?.recipientName || o.user?.name || "Customer",
      customerEmail: o.user?.email || "",
      customerPhone: o.delivery?.recipientPhone || o.user?.phoneNumber || "",
      deliveryAddress: o.delivery?.deliveryAddress || "",
      deliveryCity: o.delivery?.city || "Pokhara",
      deliveryLatitude: o.delivery?.latitude != null && !isNaN(Number(o.delivery.latitude)) ? Number(o.delivery.latitude) : void 0,
      deliveryLongitude: o.delivery?.longitude != null && !isNaN(Number(o.delivery.longitude)) ? Number(o.delivery.longitude) : void 0,
      scheduledDeliveryDate: o.delivery?.scheduledDate,
      itemCount: o.items.reduce((sum, i) => sum + i.quantity, 0),
      items: o.items.map((i) => ({
        id: i.id,
        productId: i.productId,
        variantId: i.variantId,
        productName: i.productName,
        variantName: i.variantName,
        sku: i.sku,
        unitPrice: Number(i.unitPrice),
        quantity: i.quantity,
        lineTotal: Number(i.lineTotal)
      })),
      paymentMethod: o.payments[0]?.paymentMethod || import_client6.PaymentMethod.CASH,
      paymentStatus: o.payments[0]?.paymentStatus || import_client6.PaymentStatus.PENDING,
      deliveryStatus: o.delivery?.status || import_client6.DeliveryStatus.PENDING,
      createdAt: o.createdAt
    }));
    return {
      orders,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
  }
  /**
   * Get Order by ID with full snapshots & status history
   */
  static async getOrderById(id, userId, isAdminOrStaff = false) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        delivery: { include: { zone: true } },
        payments: true,
        bill: true,
        statusHistory: {
          orderBy: { createdAt: "asc" },
          include: { changedByUser: { select: { name: true, role: true } } }
        },
        user: { select: { id: true, name: true, email: true, phoneNumber: true } }
      }
    });
    if (!order) throw ApiError.notFound("Order not found");
    if (!isAdminOrStaff && userId && order.userId !== userId) {
      throw ApiError.forbidden("Access denied to this order");
    }
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      userId: order.userId,
      orderStatus: order.status,
      status: order.status,
      subtotal: Number(order.subtotal),
      discountAmount: Number(order.discountAmount),
      deliveryFee: Number(order.deliveryFee),
      taxAmount: Number(order.taxAmount),
      totalAmount: Number(order.totalAmount),
      customerNotes: order.customerNotes,
      internalNotes: isAdminOrStaff ? order.internalNotes : void 0,
      customerName: order.delivery?.recipientName || order.user?.name || "Customer",
      customerEmail: order.user?.email || "",
      customerPhone: order.delivery?.recipientPhone || order.user?.phoneNumber || "",
      deliveryAddress: order.delivery?.deliveryAddress || "",
      deliveryCity: order.delivery?.city || "Pokhara",
      deliveryArea: order.delivery?.area,
      deliveryPostalCode: order.delivery?.postalCode,
      deliveryLatitude: order.delivery?.latitude != null && !isNaN(Number(order.delivery.latitude)) ? Number(order.delivery.latitude) : void 0,
      deliveryLongitude: order.delivery?.longitude != null && !isNaN(Number(order.delivery.longitude)) ? Number(order.delivery.longitude) : void 0,
      scheduledDeliveryDate: order.delivery?.scheduledDate,
      deliveryZone: order.delivery?.zone?.name,
      deliveryStatus: order.delivery?.status,
      riderName: order.delivery?.riderName,
      riderPhone: order.delivery?.riderPhone,
      billNumber: order.bill?.billNumber,
      paymentMethod: order.payments[0]?.paymentMethod || import_client6.PaymentMethod.CASH,
      paymentStatus: order.payments[0]?.paymentStatus || import_client6.PaymentStatus.PENDING,
      items: order.items.map((i) => ({
        id: i.id,
        productId: i.productId,
        variantId: i.variantId,
        productName: i.productName,
        variantName: i.variantName,
        sku: i.sku,
        unitPrice: Number(i.unitPrice),
        quantity: i.quantity,
        lineTotal: Number(i.lineTotal)
      })),
      statusHistory: order.statusHistory.map((h) => ({
        id: h.id,
        fromStatus: h.fromStatus,
        toStatus: h.toStatus,
        comment: h.comment,
        changedBy: h.changedByUser ? `${h.changedByUser.name} (${h.changedByUser.role})` : "System",
        createdAt: h.createdAt
      })),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    };
  }
  /**
   * Cancel Order with strict state validation and Inventory Restoration
   */
  static async cancelOrder(id, reason, userId, isAdminOrStaff = false) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: {
          items: true,
          delivery: true,
          payments: true
        }
      });
      if (!order) throw ApiError.notFound("Order not found");
      if (!isAdminOrStaff && userId && order.userId !== userId) {
        throw ApiError.forbidden("Access denied to cancel this order");
      }
      const nonCancellableStates = [
        import_client6.OrderStatus.OUT_FOR_DELIVERY,
        import_client6.OrderStatus.DELIVERED,
        import_client6.OrderStatus.COMPLETED,
        import_client6.OrderStatus.CANCELLED
      ];
      if (nonCancellableStates.includes(order.status)) {
        throw ApiError.badRequest(
          `Cannot cancel order in "${order.status}" status. Orders out for delivery or completed cannot be cancelled.`
        );
      }
      for (const item of order.items) {
        const inventory = await tx.inventory.findUnique({
          where: { variantId: item.variantId }
        });
        if (inventory) {
          const newStock = inventory.stockQuantity + item.quantity;
          const newAvailable = inventory.availableQuantity + item.quantity;
          await tx.inventory.update({
            where: { id: inventory.id },
            data: {
              stockQuantity: newStock,
              availableQuantity: newAvailable
            }
          });
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: newStock }
          });
          await tx.inventoryTransaction.create({
            data: {
              inventoryId: inventory.id,
              variantId: item.variantId,
              type: import_client6.InventoryTransactionType.RETURN,
              quantity: item.quantity,
              previousStock: inventory.stockQuantity,
              newStock,
              referenceType: "OrderCancellation",
              referenceId: order.id,
              note: `Stock released on order cancellation (${order.orderNumber}): ${reason || "Customer cancellation"}`,
              performedByUserId: userId
            }
          });
        }
      }
      const updatedOrder = await tx.order.update({
        where: { id },
        data: {
          status: import_client6.OrderStatus.CANCELLED,
          internalNotes: reason ? `[Cancellation Reason]: ${reason}` : void 0,
          statusHistory: {
            create: [
              {
                fromStatus: order.status,
                toStatus: import_client6.OrderStatus.CANCELLED,
                comment: reason || "Order cancelled by customer/admin. Inventory returned to stock.",
                changedByUserId: userId
              }
            ]
          }
        }
      });
      if (order.delivery) {
        await tx.delivery.update({
          where: { id: order.delivery.id },
          data: { status: import_client6.DeliveryStatus.RETURNED }
        });
      }
      await tx.bill.updateMany({
        where: { orderId: id },
        data: { status: import_client6.BillStatus.CANCELLED }
      });
      NotificationService.notifyOrderEvent("ORDER_CANCELLED", {
        id: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        userId: order.userId,
        totalAmount: Number(order.totalAmount)
      }).catch((err) => console.warn("Order cancel notification error:", err.message));
      return {
        id: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        status: updatedOrder.status,
        message: "Order cancelled successfully and inventory restored"
      };
    });
  }
  /**
   * Admin/Staff Status Transitions with State Validation Machine
   */
  static async updateOrderStatus(id, data, adminUserId) {
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: { delivery: true, payments: true }
      });
      if (!order) throw ApiError.notFound("Order not found");
      if (data.orderStatus && data.orderStatus !== order.status) {
        const allowed = ALLOWED_STATUS_TRANSITIONS[order.status] || [];
        if (!allowed.includes(data.orderStatus)) {
          throw ApiError.badRequest(
            `Invalid status transition from "${order.status}" to "${data.orderStatus}". Allowed: [${allowed.join(", ")}]`
          );
        }
      }
      const updated = await tx.order.update({
        where: { id },
        data: {
          ...data.orderStatus ? { status: data.orderStatus } : {},
          internalNotes: data.deliveryNotes,
          statusHistory: data.orderStatus && data.orderStatus !== order.status ? {
            create: [
              {
                fromStatus: order.status,
                toStatus: data.orderStatus,
                comment: data.comment || `Status transition to ${data.orderStatus}`,
                changedByUserId: adminUserId
              }
            ]
          } : void 0
        }
      });
      if (order.delivery && (data.deliveryStatus || data.riderName || data.riderPhone)) {
        await tx.delivery.update({
          where: { id: order.delivery.id },
          data: {
            ...data.deliveryStatus ? { status: data.deliveryStatus } : {},
            ...data.riderName ? { riderName: data.riderName } : {},
            ...data.riderPhone ? { riderPhone: data.riderPhone } : {},
            ...data.deliveryStatus === import_client6.DeliveryStatus.DELIVERED ? { deliveredAt: /* @__PURE__ */ new Date() } : {}
          }
        });
      }
      if (data.paymentStatus && order.payments.length > 0) {
        await tx.payment.update({
          where: { id: order.payments[0].id },
          data: {
            paymentStatus: data.paymentStatus,
            ...data.paymentStatus === import_client6.PaymentStatus.PAID ? { paidAt: /* @__PURE__ */ new Date() } : {}
          }
        });
      }
      return updated;
    });
    if (data.orderStatus) {
      const eventName = `ORDER_${data.orderStatus}`;
      NotificationService.notifyOrderEvent(eventName, {
        id: result.id,
        orderNumber: result.orderNumber,
        userId: result.userId,
        totalAmount: Number(result.totalAmount)
      }).catch((err) => console.warn("Status change notification error:", err.message));
    }
    catalogCache.clear();
    emitLiveEvent("order:updated", {
      orderId: id,
      orderNumber: result.orderNumber,
      status: result.status
    });
    emitLiveEvent("order:changed", { action: "update", orderId: id });
    return result;
  }
};

// src/modules/orders/order.controller.ts
var import_client7 = require("@prisma/client");
var OrderController = class {
  static createOrder = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
      throw ApiError.unauthorized("Please log in to place an order. Anonymous checkout is not permitted.");
    }
    const idempotencyKey = req.headers["idempotency-key"] || req.body.idempotencyKey;
    const order = await OrderService.createOrder({ ...req.body, idempotencyKey }, userId);
    res.status(201).json(ApiResponse.created(order, "Order created successfully"));
  });
  static getMyOrders = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const result = await OrderService.getOrders(req.query, userId, false);
    res.status(200).json(ApiResponse.success(result.orders, "Customer orders retrieved", 200, result.meta));
  });
  static getOrders = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const isAdminOrStaff = req.user?.role === import_client7.UserRole.ADMIN || req.user?.role === import_client7.UserRole.STAFF;
    const result = await OrderService.getOrders(req.query, userId, isAdminOrStaff);
    res.status(200).json(ApiResponse.success(result.orders, "Orders retrieved", 200, result.meta));
  });
  static getOrderById = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const isAdminOrStaff = req.user?.role === import_client7.UserRole.ADMIN || req.user?.role === import_client7.UserRole.STAFF;
    const order = await OrderService.getOrderById(req.params.id, userId, isAdminOrStaff);
    res.status(200).json(ApiResponse.success(order, "Order details retrieved"));
  });
  static cancelOrder = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const isAdminOrStaff = req.user?.role === import_client7.UserRole.ADMIN || req.user?.role === import_client7.UserRole.STAFF;
    const result = await OrderService.cancelOrder(req.params.id, req.body.reason, userId, isAdminOrStaff);
    res.status(200).json(ApiResponse.success(result, "Order cancelled and inventory restored"));
  });
  static updateOrderStatus = asyncHandler(async (req, res) => {
    const adminUserId = req.user?.id;
    const order = await OrderService.updateOrderStatus(req.params.id, req.body, adminUserId);
    res.status(200).json(ApiResponse.success(order, "Order status updated successfully"));
  });
};

// src/validators/order.validator.ts
var import_zod5 = require("zod");
var createOrderSchema = import_zod5.z.object({
  body: import_zod5.z.object({
    idempotencyKey: import_zod5.z.string().optional(),
    customerName: import_zod5.z.string().min(2, "Customer name must be at least 2 characters").max(70, "Customer name must not exceed 70 characters").regex(/^[a-zA-Z\s\.\'-]+$/, "Customer name cannot contain numbers or special symbols"),
    customerEmail: import_zod5.z.string().email("Please provide a valid email address").transform((val) => val.toLowerCase().trim()),
    customerPhone: import_zod5.z.string().regex(/^[9][0-9]{9}$/, "Phone number must be exactly 10 digits and start with 9"),
    deliveryAddress: import_zod5.z.string().min(5, "Delivery address is required"),
    deliveryProvince: import_zod5.z.string().optional(),
    deliveryDistrict: import_zod5.z.string().optional(),
    deliveryCity: import_zod5.z.string().default("Pokhara"),
    deliveryArea: import_zod5.z.string().optional(),
    deliveryPostalCode: import_zod5.z.string().optional(),
    deliveryLatitude: import_zod5.z.number().optional(),
    deliveryLongitude: import_zod5.z.number().optional(),
    deliveryZoneCode: import_zod5.z.string().optional(),
    deliveryZoneId: import_zod5.z.string().uuid().optional(),
    couponCode: import_zod5.z.string().trim().optional(),
    scheduledDeliveryDate: import_zod5.z.string().optional(),
    giftMessage: import_zod5.z.string().optional(),
    deliveryNotes: import_zod5.z.string().optional(),
    paymentMethod: import_zod5.z.enum(["CASH", "FONEPAY_QR", "KHALTI", "CARD"]).default("CASH"),
    items: import_zod5.z.array(
      import_zod5.z.object({
        productId: import_zod5.z.string().uuid("Valid product ID required"),
        variantId: import_zod5.z.string().uuid("Valid variant ID required"),
        quantity: import_zod5.z.number().int().positive("Quantity must be at least 1")
      })
    ).min(1, "Order must contain at least one item")
  })
});
var cancelOrderSchema = import_zod5.z.object({
  params: import_zod5.z.object({
    id: import_zod5.z.string().uuid("Valid order ID required")
  }),
  body: import_zod5.z.object({
    reason: import_zod5.z.string().min(3, "Cancellation reason required").optional()
  })
});
var updateOrderStatusSchema = import_zod5.z.object({
  params: import_zod5.z.object({
    id: import_zod5.z.string().uuid("Valid order ID required")
  }),
  body: import_zod5.z.object({
    orderStatus: import_zod5.z.enum([
      "PENDING",
      "DELIVERED",
      "CANCELLED"
    ]).optional(),
    paymentStatus: import_zod5.z.enum(["PENDING", "PAID", "FAILED", "REFUNDED", "PARTIALLY_REFUNDED"]).optional(),
    deliveryStatus: import_zod5.z.enum(["PENDING", "ASSIGNED", "PICKED_UP", "OUT_FOR_DELIVERY", "DELIVERED", "FAILED", "RETURNED"]).optional(),
    riderName: import_zod5.z.string().optional(),
    riderPhone: import_zod5.z.string().optional(),
    comment: import_zod5.z.string().optional(),
    deliveryNotes: import_zod5.z.string().optional()
  })
});
var orderQuerySchema = import_zod5.z.object({
  query: import_zod5.z.object({
    page: import_zod5.z.string().optional(),
    limit: import_zod5.z.string().optional(),
    status: import_zod5.z.enum([
      "PENDING",
      "DELIVERED",
      "CANCELLED"
    ]).optional(),
    search: import_zod5.z.string().optional(),
    startDate: import_zod5.z.string().optional(),
    endDate: import_zod5.z.string().optional()
  })
});

// src/modules/orders/order.routes.ts
var import_client8 = require("@prisma/client");
var router6 = (0, import_express6.Router)();
router6.post("/", authenticateJWT, validateRequest(createOrderSchema), OrderController.createOrder);
router6.get("/", optionalAuth, validateRequest(orderQuerySchema), OrderController.getOrders);
router6.get("/my-orders", authenticateJWT, validateRequest(orderQuerySchema), OrderController.getMyOrders);
router6.get("/:id", optionalAuth, OrderController.getOrderById);
router6.post("/:id/cancel", optionalAuth, validateRequest(cancelOrderSchema), OrderController.cancelOrder);
router6.patch(
  "/:id/status",
  authenticateJWT,
  requireRole(import_client8.UserRole.ADMIN, import_client8.UserRole.STAFF),
  validateRequest(updateOrderStatusSchema),
  OrderController.updateOrderStatus
);
var orderRoutes = router6;

// src/modules/delivery/delivery.routes.ts
var import_express7 = require("express");

// src/modules/delivery/delivery.service.ts
var import_client9 = require("@prisma/client");
var ZONES_CACHE_KEY_ACTIVE = "delivery_zones:active";
var ZONES_CACHE_KEY_ALL = "delivery_zones:all";
var DeliveryService = class {
  /**
   * Get all active delivery zones (with in-memory cache)
   */
  static async getZones(onlyActive = true) {
    const cacheKey = onlyActive ? ZONES_CACHE_KEY_ACTIVE : ZONES_CACHE_KEY_ALL;
    const cached = appCache.get(cacheKey);
    if (cached) return cached;
    const where = onlyActive ? { isActive: true } : {};
    const zones = await prisma.deliveryZone.findMany({
      where,
      orderBy: { baseDeliveryCharge: "asc" }
    });
    const result = zones.map((z8) => ({
      id: z8.id,
      name: z8.name,
      code: z8.code,
      description: z8.description,
      deliveryCharge: Number(z8.baseDeliveryCharge),
      baseDeliveryCharge: Number(z8.baseDeliveryCharge),
      minimumOrder: Number(z8.minimumOrder || 0),
      estimatedHours: z8.estimatedHours,
      estimatedDeliveryTime: z8.estimatedDeliveryTime || `${z8.estimatedHours} Hours`,
      isActive: z8.isActive,
      active: z8.isActive
    }));
    appCache.set(cacheKey, result, 600);
    return result;
  }
  /**
   * Get single delivery zone by ID
   */
  static async getZoneById(id) {
    const zone = await prisma.deliveryZone.findUnique({
      where: { id }
    });
    if (!zone) throw ApiError.notFound("Delivery zone not found");
    return {
      id: zone.id,
      name: zone.name,
      code: zone.code,
      description: zone.description,
      deliveryCharge: Number(zone.baseDeliveryCharge),
      baseDeliveryCharge: Number(zone.baseDeliveryCharge),
      minimumOrder: Number(zone.minimumOrder || 0),
      estimatedHours: zone.estimatedHours,
      estimatedDeliveryTime: zone.estimatedDeliveryTime,
      isActive: zone.isActive,
      active: zone.isActive
    };
  }
  /**
   * Determine Applicable Delivery Zone & Calculate Shipping Charge Server-Side
   */
  static async determineZone(data) {
    const combined = `${data.city} ${data.area || ""} ${data.streetAddress || ""}`.toLowerCase();
    let zone = null;
    if (combined.includes("bhaktapur") || combined.includes("thimi") || combined.includes("suryabinayak")) {
      zone = await prisma.deliveryZone.findFirst({ where: { code: "BKT", isActive: true } });
    } else if (combined.includes("lalitpur") || combined.includes("patan") || combined.includes("jawalakhel") || combined.includes("jhamsikhel") || combined.includes("kupondole") || combined.includes("lagankhel") || combined.includes("sanepa")) {
      zone = await prisma.deliveryZone.findFirst({ where: { code: "LLP_CORE", isActive: true } });
    } else if (combined.includes("pokhara") || combined.includes("chitwan") || combined.includes("butwal") || combined.includes("biratnagar") || combined.includes("dharan")) {
      zone = await prisma.deliveryZone.findFirst({ where: { code: "OUTSIDE_VALLEY", isActive: true } });
    }
    if (!zone) {
      zone = await prisma.deliveryZone.findFirst({
        where: {
          OR: [{ code: "POKHARA_CORE" }, { name: { contains: "Pokhara" } }],
          isActive: true
        }
      });
    }
    const zoneName = zone?.name || "Pokhara Delivery Area";
    const zoneCode = zone?.code || "POKHARA_CORE";
    const baseCharge = zone ? Number(zone.baseDeliveryCharge) : 100;
    const minOrder = zone ? Number(zone.minimumOrder || 0) : 0;
    const estTime = zone?.estimatedDeliveryTime || "Within 24 Hours";
    const isFreeDeliveryEligible = data.subtotal >= 2e3 && zoneCode !== "OUTSIDE_VALLEY";
    const calculatedDeliveryCharge = isFreeDeliveryEligible ? 0 : baseCharge;
    return {
      zoneId: zone?.id,
      zoneName,
      zoneCode,
      baseDeliveryCharge: baseCharge,
      deliveryCharge: calculatedDeliveryCharge,
      minimumOrder: minOrder,
      estimatedDeliveryTime: estTime,
      isFreeDelivery: isFreeDeliveryEligible,
      freeDeliveryThreshold: 2e3,
      amountNeededForFreeDelivery: Math.max(0, 2e3 - data.subtotal)
    };
  }
  /**
   * Admin: Create Delivery Zone
   */
  static async createZone(data) {
    const charge = data.deliveryCharge !== void 0 ? data.deliveryCharge : data.baseDeliveryCharge || 0;
    const zone = await prisma.deliveryZone.create({
      data: {
        name: data.name,
        code: data.code.toUpperCase(),
        description: data.description,
        baseDeliveryCharge: charge,
        minimumOrder: data.minimumOrder || 0,
        estimatedHours: data.estimatedHours || 24,
        estimatedDeliveryTime: data.estimatedDeliveryTime || "Within 24 Hours",
        isActive: data.isActive !== void 0 ? data.isActive : true
      }
    });
    appCache.clearPattern("delivery_zones:*");
    return zone;
  }
  /**
   * Admin: Update Delivery Zone
   */
  static async updateZone(id, data) {
    const zone = await prisma.deliveryZone.findUnique({ where: { id } });
    if (!zone) throw ApiError.notFound("Delivery zone not found");
    const updatePayload = { ...data };
    if (data.deliveryCharge !== void 0) {
      updatePayload.baseDeliveryCharge = data.deliveryCharge;
      delete updatePayload.deliveryCharge;
    }
    if (data.code) {
      updatePayload.code = data.code.toUpperCase();
    }
    const updated = await prisma.deliveryZone.update({
      where: { id },
      data: updatePayload
    });
    appCache.clearPattern("delivery_zones:*");
    return updated;
  }
  /**
   * Admin/Staff: Assign Delivery Rider
   */
  static async assignRider(deliveryId, riderName, riderPhone, staffUserId) {
    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: { order: true }
    });
    if (!delivery) throw ApiError.notFound("Delivery record not found");
    return prisma.$transaction(async (tx) => {
      const updated = await tx.delivery.update({
        where: { id: deliveryId },
        data: {
          riderName,
          riderPhone,
          status: import_client9.DeliveryStatus.ASSIGNED
        }
      });
      if (delivery.order.status === import_client9.OrderStatus.CONFIRMED) {
        await tx.order.update({
          where: { id: delivery.orderId },
          data: { status: import_client9.OrderStatus.PROCESSING }
        });
      }
      await tx.orderStatusHistory.create({
        data: {
          orderId: delivery.orderId,
          fromStatus: delivery.order.status,
          toStatus: import_client9.OrderStatus.PROCESSING,
          comment: `Rider assigned: ${riderName} (${riderPhone})`,
          changedByUserId: staffUserId
        }
      });
      return updated;
    });
  }
  /**
   * Admin/Staff: Update Delivery Status & Trigger Alerts
   */
  static async updateDeliveryStatus(deliveryId, status, trackingNotes, staffUserId) {
    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: { order: true }
    });
    if (!delivery) throw ApiError.notFound("Delivery record not found");
    return prisma.$transaction(async (tx) => {
      const isDelivered = status === import_client9.DeliveryStatus.DELIVERED;
      const updatedDelivery = await tx.delivery.update({
        where: { id: deliveryId },
        data: {
          status,
          trackingNotes,
          deliveredAt: isDelivered ? /* @__PURE__ */ new Date() : void 0
        }
      });
      let targetOrderStatus = delivery.order.status;
      if (status === import_client9.DeliveryStatus.OUT_FOR_DELIVERY) {
        targetOrderStatus = import_client9.OrderStatus.OUT_FOR_DELIVERY;
      } else if (status === import_client9.DeliveryStatus.DELIVERED) {
        targetOrderStatus = import_client9.OrderStatus.DELIVERED;
      } else if (status === import_client9.DeliveryStatus.FAILED || status === import_client9.DeliveryStatus.RETURNED) {
        targetOrderStatus = import_client9.OrderStatus.CANCELLED;
      }
      if (targetOrderStatus !== delivery.order.status) {
        await tx.order.update({
          where: { id: delivery.orderId },
          data: { status: targetOrderStatus }
        });
        await tx.orderStatusHistory.create({
          data: {
            orderId: delivery.orderId,
            fromStatus: delivery.order.status,
            toStatus: targetOrderStatus,
            comment: trackingNotes || `Delivery status changed to ${status}`,
            changedByUserId: staffUserId
          }
        });
        if (delivery.order.userId) {
          await tx.notification.create({
            data: {
              userId: delivery.order.userId,
              title: `Delivery Update: ${status}`,
              message: `Your order ${delivery.order.orderNumber} is now ${status.toLowerCase().replace(/_/g, " ")}.`,
              type: import_client9.NotificationType.ORDER_STATUS,
              linkUrl: `/order-success/${delivery.orderId}`
            }
          });
        }
      }
      return updatedDelivery;
    });
  }
};

// src/modules/delivery/delivery.controller.ts
var DeliveryController = class {
  static getZones = asyncHandler(async (req, res) => {
    const onlyActive = req.query.all !== "true";
    const zones = await DeliveryService.getZones(onlyActive);
    res.status(200).json(ApiResponse.success(zones, "Delivery zones retrieved successfully"));
  });
  static getZoneById = asyncHandler(async (req, res) => {
    const zone = await DeliveryService.getZoneById(req.params.id);
    res.status(200).json(ApiResponse.success(zone, "Delivery zone details retrieved"));
  });
  static calculateZone = asyncHandler(async (req, res) => {
    const result = await DeliveryService.determineZone(req.body);
    res.status(200).json(ApiResponse.success(result, "Delivery calculation determined"));
  });
  static createZone = asyncHandler(async (req, res) => {
    const zone = await DeliveryService.createZone(req.body);
    res.status(201).json(ApiResponse.created(zone, "Delivery zone created successfully"));
  });
  static updateZone = asyncHandler(async (req, res) => {
    const zone = await DeliveryService.updateZone(req.params.id, req.body);
    res.status(200).json(ApiResponse.success(zone, "Delivery zone updated successfully"));
  });
  static assignRider = asyncHandler(async (req, res) => {
    const staffUserId = req.user?.id;
    const delivery = await DeliveryService.assignRider(
      req.params.id,
      req.body.riderName,
      req.body.riderPhone,
      staffUserId
    );
    res.status(200).json(ApiResponse.success(delivery, "Delivery rider assigned successfully"));
  });
  static updateDeliveryStatus = asyncHandler(async (req, res) => {
    const staffUserId = req.user?.id;
    const delivery = await DeliveryService.updateDeliveryStatus(
      req.params.id,
      req.body.status,
      req.body.trackingNotes,
      staffUserId
    );
    res.status(200).json(ApiResponse.success(delivery, "Delivery status updated successfully"));
  });
};

// src/validators/delivery.validator.ts
var import_zod6 = require("zod");
var createZoneSchema = import_zod6.z.object({
  body: import_zod6.z.object({
    name: import_zod6.z.string().min(2, "Zone name is required"),
    code: import_zod6.z.string().min(2, "Zone code is required").toUpperCase(),
    description: import_zod6.z.string().optional(),
    deliveryCharge: import_zod6.z.number().min(0, "Delivery charge must be non-negative").default(0),
    baseDeliveryCharge: import_zod6.z.number().min(0).optional(),
    minimumOrder: import_zod6.z.number().min(0).default(0),
    estimatedHours: import_zod6.z.number().int().min(1).default(24),
    estimatedDeliveryTime: import_zod6.z.string().default("Within 24 Hours"),
    isActive: import_zod6.z.boolean().default(true)
  })
});
var updateZoneSchema = import_zod6.z.object({
  params: import_zod6.z.object({
    id: import_zod6.z.string().uuid("Valid zone ID required")
  }),
  body: import_zod6.z.object({
    name: import_zod6.z.string().min(2).optional(),
    code: import_zod6.z.string().min(2).toUpperCase().optional(),
    description: import_zod6.z.string().optional(),
    deliveryCharge: import_zod6.z.number().min(0).optional(),
    baseDeliveryCharge: import_zod6.z.number().min(0).optional(),
    minimumOrder: import_zod6.z.number().min(0).optional(),
    estimatedHours: import_zod6.z.number().int().min(1).optional(),
    estimatedDeliveryTime: import_zod6.z.string().optional(),
    isActive: import_zod6.z.boolean().optional()
  })
});
var calculateZoneSchema = import_zod6.z.object({
  body: import_zod6.z.object({
    city: import_zod6.z.string().default("Pokhara"),
    area: import_zod6.z.string().optional(),
    streetAddress: import_zod6.z.string().optional(),
    subtotal: import_zod6.z.number().min(0).default(0)
  })
});
var assignRiderSchema = import_zod6.z.object({
  params: import_zod6.z.object({
    id: import_zod6.z.string().uuid("Valid delivery ID required")
  }),
  body: import_zod6.z.object({
    riderName: import_zod6.z.string().min(2, "Rider name is required"),
    riderPhone: import_zod6.z.string().min(7, "Rider phone is required")
  })
});
var updateDeliveryStatusSchema = import_zod6.z.object({
  params: import_zod6.z.object({
    id: import_zod6.z.string().uuid("Valid delivery ID required")
  }),
  body: import_zod6.z.object({
    status: import_zod6.z.enum([
      "PENDING",
      "ASSIGNED",
      "PICKED_UP",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "FAILED",
      "RETURNED"
    ]),
    trackingNotes: import_zod6.z.string().optional()
  })
});

// src/modules/delivery/delivery.routes.ts
var import_client10 = require("@prisma/client");
var router7 = (0, import_express7.Router)();
router7.get("/", DeliveryController.getZones);
router7.post("/calculate", validateRequest(calculateZoneSchema), DeliveryController.calculateZone);
router7.get("/:id", DeliveryController.getZoneById);
router7.post(
  "/",
  authenticateJWT,
  requireRole(import_client10.UserRole.ADMIN, import_client10.UserRole.STAFF),
  validateRequest(createZoneSchema),
  DeliveryController.createZone
);
router7.patch(
  "/:id",
  authenticateJWT,
  requireRole(import_client10.UserRole.ADMIN, import_client10.UserRole.STAFF),
  validateRequest(updateZoneSchema),
  DeliveryController.updateZone
);
router7.patch(
  "/deliveries/:id/assign",
  authenticateJWT,
  requireRole(import_client10.UserRole.ADMIN, import_client10.UserRole.STAFF),
  validateRequest(assignRiderSchema),
  DeliveryController.assignRider
);
router7.patch(
  "/deliveries/:id/status",
  authenticateJWT,
  requireRole(import_client10.UserRole.ADMIN, import_client10.UserRole.STAFF),
  validateRequest(updateDeliveryStatusSchema),
  DeliveryController.updateDeliveryStatus
);
var deliveryRoutes = router7;

// src/modules/admin/admin.routes.ts
var import_express8 = require("express");

// src/modules/admin/admin.service.ts
var import_client11 = require("@prisma/client");
var AdminService = class {
  /**
   * Complete Dashboard Overview
   */
  static async getDashboard() {
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    const [
      todayOrdersAgg,
      totalOrdersCount,
      pendingOrdersCount,
      completedOrdersCount,
      totalRevenueAgg,
      lowStockVariants,
      totalCustomersCount,
      recentOrdersRaw,
      topOrderItems,
      recentAuditLogs
    ] = await Promise.all([
      // 1. Today's sales & count
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        _count: { id: true },
        where: {
          createdAt: { gte: today },
          status: { not: import_client11.OrderStatus.CANCELLED }
        }
      }),
      // 2. Total orders
      prisma.order.count(),
      // 3. Pending orders
      prisma.order.count({
        where: { status: { in: [import_client11.OrderStatus.PENDING, import_client11.OrderStatus.CONFIRMED, import_client11.OrderStatus.PROCESSING] } }
      }),
      // 4. Completed orders
      prisma.order.count({
        where: { status: { in: [import_client11.OrderStatus.DELIVERED, import_client11.OrderStatus.COMPLETED] } }
      }),
      // 5. Total revenue
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: { not: import_client11.OrderStatus.CANCELLED } }
      }),
      // 6. Low stock variants
      prisma.productVariant.findMany({
        where: {
          isAvailable: true,
          OR: [
            { stock: { lte: 5 } },
            { inventory: { availableQuantity: { lte: 5 } } }
          ]
        },
        include: {
          product: { select: { id: true, name: true, sku: true, lowStockThreshold: true } },
          inventory: true
        },
        take: 10
      }),
      // 7. Customers count
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      // 8. Recent orders
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          items: true,
          delivery: true,
          payments: true,
          user: { select: { name: true, email: true } }
        }
      }),
      // 9. Top products
      prisma.orderItem.groupBy({
        by: ["productId", "productName"],
        _sum: { quantity: true, lineTotal: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5
      }),
      // 10. Recent audit logs
      prisma.auditLog.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true, role: true } } }
      })
    ]);
    const lowStockItems = lowStockVariants.map((v) => ({
      variantId: v.id,
      productId: v.product.id,
      productName: v.product.name,
      variantName: v.name,
      sku: v.sku,
      availableStock: v.inventory?.availableQuantity ?? v.stock,
      threshold: v.product.lowStockThreshold
    }));
    const topProducts = topOrderItems.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      unitsSold: item._sum.quantity || 0,
      revenue: Number(item._sum.lineTotal || 0)
    }));
    const recentOrders = recentOrdersRaw.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.delivery?.recipientName || o.user?.name || "Customer",
      customerPhone: o.delivery?.recipientPhone || "",
      orderStatus: o.status,
      status: o.status,
      totalAmount: Number(o.totalAmount),
      itemCount: o.items.reduce((acc, i) => acc + i.quantity, 0),
      paymentMethod: o.payments[0]?.paymentMethod || "CASH",
      paymentStatus: o.payments[0]?.paymentStatus || "PENDING",
      createdAt: o.createdAt
    }));
    return {
      todaySales: Number(todayOrdersAgg._sum.totalAmount || 0),
      todayOrders: todayOrdersAgg._count.id || 0,
      totalOrders: totalOrdersCount,
      pendingOrders: pendingOrdersCount,
      completedOrders: completedOrdersCount,
      totalRevenue: Number(totalRevenueAgg._sum.totalAmount || 0),
      totalCustomers: totalCustomersCount,
      lowStockCount: lowStockItems.length,
      lowStockProducts: lowStockItems,
      topProducts,
      recentOrders,
      recentAuditLogs
    };
  }
  /**
   * Customers Management
   */
  static async getCustomers(query) {
    const page = Math.max(1, parseInt(query.page || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(query.limit || "20", 10)));
    const skip = (page - 1) * limit;
    const where = {
      role: "CUSTOMER"
    };
    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { email: { contains: query.search } },
        { phoneNumber: { contains: query.search } }
      ];
    }
    const [usersRaw, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true,
          role: true,
          isActive: true,
          createdAt: true,
          orders: {
            where: { status: { not: import_client11.OrderStatus.CANCELLED } },
            select: { totalAmount: true }
          },
          addresses: {
            take: 1,
            select: { city: true, area: true, streetAddress: true }
          }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      prisma.user.count({ where })
    ]);
    const customers = usersRaw.map((u) => {
      const totalSpent = u.orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
      return {
        id: u.id,
        name: u.name,
        fullName: u.name,
        email: u.email,
        phoneNumber: u.phoneNumber,
        role: u.role || "CUSTOMER",
        isActive: u.isActive,
        totalOrders: u.orders.length,
        orderCount: u.orders.length,
        totalSpent,
        primaryAddress: u.addresses[0] ? `${u.addresses[0].streetAddress}, ${u.addresses[0].city}` : null,
        joinedDate: u.createdAt,
        createdAt: u.createdAt
      };
    });
    return {
      customers,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
  }
  /**
   * Payments Listing
   */
  static async getPayments(query) {
    const page = Math.max(1, parseInt(query.page || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(query.limit || "20", 10)));
    const skip = (page - 1) * limit;
    const where = {};
    if (query.status) where.paymentStatus = query.status;
    if (query.method) where.paymentMethod = query.method;
    if (query.search) {
      where.OR = [
        { transactionReference: { contains: query.search } },
        { order: { orderNumber: { contains: query.search } } }
      ];
    }
    const [paymentsRaw, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              status: true,
              user: { select: { name: true, email: true } },
              delivery: { select: { recipientName: true } }
            }
          },
          bill: { select: { id: true, billNumber: true, grandTotal: true, status: true } }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      prisma.payment.count({ where })
    ]);
    const payments = paymentsRaw.map((p) => ({
      id: p.id,
      orderId: p.orderId,
      orderNumber: p.order.orderNumber,
      customerName: p.order.delivery?.recipientName || p.order.user?.name || "Customer",
      billNumber: p.bill?.billNumber,
      paymentMethod: p.paymentMethod,
      paymentStatus: p.paymentStatus,
      amount: Number(p.amount),
      transactionReference: p.transactionReference,
      paidAt: p.paidAt,
      createdAt: p.createdAt
    }));
    return {
      payments,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
  }
  /**
   * Coupons Management
   */
  static async getCoupons() {
    return prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { usages: true, orders: true } } }
    });
  }
  static async createCoupon(data, adminUserId) {
    const coupon = await prisma.coupon.create({
      data: {
        code: data.code.toUpperCase(),
        description: data.description,
        discountType: data.discountType,
        discountValue: data.discountValue,
        minimumOrderAmount: data.minimumOrderAmount,
        maxDiscountAmount: data.maxDiscountAmount,
        startDate: data.startDate ? new Date(data.startDate) : /* @__PURE__ */ new Date(),
        expiryDate: new Date(data.expiryDate),
        usageLimit: data.usageLimit,
        perUserLimit: data.perUserLimit || 1,
        isActive: data.isActive !== void 0 ? data.isActive : true
      }
    });
    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: "COUPON_CREATE",
        resource: "Coupon",
        resourceId: coupon.id,
        details: { code: coupon.code, discountValue: data.discountValue }
      }
    });
    return coupon;
  }
  static async updateCoupon(id, data, adminUserId) {
    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw ApiError.notFound("Coupon not found");
    const updatePayload = { ...data };
    if (data.code) updatePayload.code = data.code.toUpperCase();
    if (data.startDate) updatePayload.startDate = new Date(data.startDate);
    if (data.expiryDate) updatePayload.expiryDate = new Date(data.expiryDate);
    const updated = await prisma.coupon.update({
      where: { id },
      data: updatePayload
    });
    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: "COUPON_UPDATE",
        resource: "Coupon",
        resourceId: id,
        details: { fields: Object.keys(data) }
      }
    });
    return updated;
  }
  static async deleteCoupon(id, adminUserId) {
    const coupon = await prisma.coupon.findUnique({
      where: { id },
      include: { _count: { select: { usages: true } } }
    });
    if (!coupon) throw ApiError.notFound("Coupon not found");
    if (coupon._count.usages > 0) {
      await prisma.coupon.update({
        where: { id },
        data: { isActive: false }
      });
      await prisma.auditLog.create({
        data: {
          userId: adminUserId,
          action: "COUPON_DEACTIVATE",
          resource: "Coupon",
          resourceId: id,
          details: { note: "Deactivated due to historical coupon usage records" }
        }
      });
      return { message: "Coupon deactivated successfully (historical usage preserved)" };
    } else {
      await prisma.coupon.delete({ where: { id } });
      await prisma.auditLog.create({
        data: {
          userId: adminUserId,
          action: "COUPON_DELETE",
          resource: "Coupon",
          resourceId: id,
          details: { code: coupon.code }
        }
      });
      return { message: "Coupon permanently deleted" };
    }
  }
  /**
   * Reviews Moderation
   */
  /**
   * Broadcast Notifications
   */
  static async broadcastNotification(data, adminUserId) {
    let targetUserIds = data.userIds || [];
    if (targetUserIds.length === 0) {
      const customers = await prisma.user.findMany({
        where: { isActive: true, role: "CUSTOMER" },
        select: { id: true }
      });
      targetUserIds = customers.map((c) => c.id);
    } else {
      const customers = await prisma.user.findMany({
        where: {
          id: { in: targetUserIds },
          isActive: true,
          role: "CUSTOMER"
        },
        select: { id: true }
      });
      targetUserIds = customers.map((customer) => customer.id);
    }
    const notificationsToCreate = targetUserIds.map((userId) => ({
      userId,
      title: data.title,
      message: data.message,
      type: data.type || import_client11.NotificationType.PROMOTION,
      linkUrl: data.linkUrl
    }));
    await prisma.notification.createMany({
      data: notificationsToCreate
    });
    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: "NOTIFICATION_BROADCAST",
        resource: "Notification",
        details: {
          title: data.title,
          recipientsCount: targetUserIds.length,
          type: data.type
        }
      }
    });
    return {
      sentCount: targetUserIds.length,
      message: `Notification broadcasted to ${targetUserIds.length} users`
    };
  }
  /**
   * Audit Logs
   */
  static async getAuditLogs(query) {
    const limit = Math.max(1, Math.min(100, parseInt(query.limit || "50", 10)));
    const where = {};
    if (query.action) where.action = { contains: query.action };
    if (query.userId) where.userId = query.userId;
    return prisma.auditLog.findMany({
      where,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } }
      }
    });
  }
};

// src/modules/admin/admin.controller.ts
var AdminController = class {
  static getDashboard = asyncHandler(async (req, res) => {
    const dashboard = await AdminService.getDashboard();
    res.status(200).json(ApiResponse.success(dashboard, "Admin dashboard overview"));
  });
  static getMetrics = asyncHandler(async (req, res) => {
    const metrics = await AdminService.getDashboard();
    res.status(200).json(ApiResponse.success(metrics, "Admin metrics overview"));
  });
  static getCustomers = asyncHandler(async (req, res) => {
    const result = await AdminService.getCustomers(req.query);
    res.status(200).json(ApiResponse.success(result.customers, "Customers retrieved", 200, result.meta));
  });
  static getPayments = asyncHandler(async (req, res) => {
    const result = await AdminService.getPayments(req.query);
    res.status(200).json(ApiResponse.success(result.payments, "Payments list retrieved", 200, result.meta));
  });
  // Coupons
  static getCoupons = asyncHandler(async (req, res) => {
    const coupons = await AdminService.getCoupons();
    res.status(200).json(ApiResponse.success(coupons, "Coupons list"));
  });
  static createCoupon = asyncHandler(async (req, res) => {
    const coupon = await AdminService.createCoupon(req.body, req.user?.id);
    res.status(201).json(ApiResponse.created(coupon, "Coupon created successfully"));
  });
  static updateCoupon = asyncHandler(async (req, res) => {
    const coupon = await AdminService.updateCoupon(req.params.id, req.body, req.user?.id);
    res.status(200).json(ApiResponse.success(coupon, "Coupon updated successfully"));
  });
  static deleteCoupon = asyncHandler(async (req, res) => {
    const result = await AdminService.deleteCoupon(req.params.id, req.user?.id);
    res.status(200).json(ApiResponse.success(result, "Coupon deleted"));
  });
  // Notifications
  static broadcastNotification = asyncHandler(async (req, res) => {
    const result = await AdminService.broadcastNotification(req.body, req.user?.id);
    res.status(200).json(ApiResponse.success(result, result.message));
  });
  // Audit Logs
  static getAuditLogs = asyncHandler(async (req, res) => {
    const logs = await AdminService.getAuditLogs(req.query);
    res.status(200).json(ApiResponse.success(logs, "Audit logs retrieved"));
  });
};

// src/validators/inventory.validator.ts
var import_zod7 = require("zod");
var adjustStockSchema = import_zod7.z.object({
  body: import_zod7.z.object({
    variantId: import_zod7.z.string().uuid("Valid variant ID required"),
    changeAmount: import_zod7.z.number().int("Change amount must be an integer"),
    type: import_zod7.z.enum([
      "PURCHASE",
      "SALE",
      "RESERVATION",
      "RELEASE",
      "ADJUSTMENT",
      "RETURN",
      "DAMAGE",
      "RESTOCK"
    ]),
    note: import_zod7.z.string().optional(),
    referenceType: import_zod7.z.string().optional(),
    referenceId: import_zod7.z.string().optional()
  })
});
var inventoryQuerySchema = import_zod7.z.object({
  query: import_zod7.z.object({
    page: import_zod7.z.string().optional(),
    limit: import_zod7.z.string().optional(),
    search: import_zod7.z.string().optional(),
    lowStockOnly: import_zod7.z.enum(["true", "false"]).optional(),
    categoryId: import_zod7.z.string().optional()
  })
});

// src/validators/admin.validator.ts
var import_zod8 = require("zod");
var createCouponSchema = import_zod8.z.object({
  body: import_zod8.z.object({
    code: import_zod8.z.string().min(3, "Coupon code must be at least 3 characters").toUpperCase(),
    description: import_zod8.z.string().optional(),
    discountType: import_zod8.z.enum(["PERCENTAGE", "FIXED"]).default("PERCENTAGE"),
    discountValue: import_zod8.z.number().positive("Discount value must be positive"),
    minimumOrderAmount: import_zod8.z.number().min(0).optional(),
    maxDiscountAmount: import_zod8.z.number().min(0).optional(),
    startDate: import_zod8.z.string().optional(),
    expiryDate: import_zod8.z.string().min(1, "Expiry date is required"),
    usageLimit: import_zod8.z.number().int().positive().optional(),
    perUserLimit: import_zod8.z.number().int().positive().default(1),
    isActive: import_zod8.z.boolean().default(true)
  })
});
var updateCouponSchema = import_zod8.z.object({
  params: import_zod8.z.object({
    id: import_zod8.z.string().uuid("Valid coupon ID required")
  }),
  body: import_zod8.z.object({
    code: import_zod8.z.string().min(3).toUpperCase().optional(),
    description: import_zod8.z.string().optional(),
    discountType: import_zod8.z.enum(["PERCENTAGE", "FIXED"]).optional(),
    discountValue: import_zod8.z.number().positive().optional(),
    minimumOrderAmount: import_zod8.z.number().min(0).optional(),
    maxDiscountAmount: import_zod8.z.number().min(0).optional(),
    startDate: import_zod8.z.string().optional(),
    expiryDate: import_zod8.z.string().optional(),
    usageLimit: import_zod8.z.number().int().positive().optional(),
    perUserLimit: import_zod8.z.number().int().positive().optional(),
    isActive: import_zod8.z.boolean().optional()
  })
});
var broadcastNotificationSchema = import_zod8.z.object({
  body: import_zod8.z.object({
    title: import_zod8.z.string().min(2, "Title is required"),
    message: import_zod8.z.string().min(5, "Message is required"),
    type: import_zod8.z.enum(["ORDER_STATUS", "CARE_REMINDER", "INVENTORY_ALERT", "PROMOTION", "SYSTEM"]).default("PROMOTION"),
    linkUrl: import_zod8.z.string().optional(),
    userIds: import_zod8.z.array(import_zod8.z.string().uuid()).optional()
    // Empty means broadcast to all
  })
});

// src/modules/admin/admin.routes.ts
var import_client12 = require("@prisma/client");
var router8 = (0, import_express8.Router)();
router8.get("/dashboard", authenticateJWT, requireRole(import_client12.UserRole.ADMIN, import_client12.UserRole.STAFF), AdminController.getDashboard);
router8.get("/metrics", authenticateJWT, requireRole(import_client12.UserRole.ADMIN, import_client12.UserRole.STAFF), AdminController.getMetrics);
router8.get("/orders", authenticateJWT, requireRole(import_client12.UserRole.ADMIN, import_client12.UserRole.STAFF), validateRequest(orderQuerySchema), OrderController.getOrders);
router8.get("/orders/:id", authenticateJWT, requireRole(import_client12.UserRole.ADMIN, import_client12.UserRole.STAFF), OrderController.getOrderById);
router8.patch(
  "/orders/:id/status",
  authenticateJWT,
  requireRole(import_client12.UserRole.ADMIN, import_client12.UserRole.STAFF),
  validateRequest(updateOrderStatusSchema),
  OrderController.updateOrderStatus
);
router8.get(
  "/inventory",
  authenticateJWT,
  requireRole(import_client12.UserRole.ADMIN, import_client12.UserRole.STAFF),
  validateRequest(inventoryQuerySchema),
  InventoryController.getInventory
);
router8.get(
  "/inventory/transactions",
  authenticateJWT,
  requireRole(import_client12.UserRole.ADMIN, import_client12.UserRole.STAFF),
  InventoryController.getTransactions
);
router8.get(
  "/inventory/:productId",
  authenticateJWT,
  requireRole(import_client12.UserRole.ADMIN, import_client12.UserRole.STAFF),
  InventoryController.getProductInventory
);
router8.post(
  "/inventory/adjust",
  authenticateJWT,
  requireRole(import_client12.UserRole.ADMIN, import_client12.UserRole.STAFF),
  validateRequest(adjustStockSchema),
  InventoryController.adjustStock
);
router8.get("/customers", authenticateJWT, requireRole(import_client12.UserRole.ADMIN, import_client12.UserRole.STAFF), AdminController.getCustomers);
router8.get("/payments", authenticateJWT, requireRole(import_client12.UserRole.ADMIN, import_client12.UserRole.STAFF), AdminController.getPayments);
router8.get("/coupons", authenticateJWT, requireRole(import_client12.UserRole.ADMIN, import_client12.UserRole.STAFF), AdminController.getCoupons);
router8.post(
  "/coupons",
  authenticateJWT,
  requireRole(import_client12.UserRole.ADMIN),
  validateRequest(createCouponSchema),
  AdminController.createCoupon
);
router8.patch(
  "/coupons/:id",
  authenticateJWT,
  requireRole(import_client12.UserRole.ADMIN),
  validateRequest(updateCouponSchema),
  AdminController.updateCoupon
);
router8.delete("/coupons/:id", authenticateJWT, requireRole(import_client12.UserRole.ADMIN), AdminController.deleteCoupon);
router8.post(
  "/notifications/broadcast",
  authenticateJWT,
  requireRole(import_client12.UserRole.ADMIN),
  validateRequest(broadcastNotificationSchema),
  AdminController.broadcastNotification
);
router8.get("/audit-logs", authenticateJWT, requireRole(import_client12.UserRole.ADMIN), AdminController.getAuditLogs);
router8.post(
  "/categories",
  authenticateJWT,
  requireRole(import_client12.UserRole.ADMIN, import_client12.UserRole.STAFF),
  validateRequest(createCategorySchema),
  CategoryController.create
);
router8.patch(
  "/categories/:id",
  authenticateJWT,
  requireRole(import_client12.UserRole.ADMIN, import_client12.UserRole.STAFF),
  validateRequest(updateCategorySchema),
  CategoryController.update
);
router8.delete("/categories/:id", authenticateJWT, requireRole(import_client12.UserRole.ADMIN), CategoryController.delete);
router8.post(
  "/products",
  authenticateJWT,
  requireRole(import_client12.UserRole.ADMIN, import_client12.UserRole.STAFF),
  validateRequest(createProductSchema),
  ProductController.createProduct
);
router8.patch(
  "/products/:id",
  authenticateJWT,
  requireRole(import_client12.UserRole.ADMIN, import_client12.UserRole.STAFF),
  validateRequest(updateProductSchema),
  ProductController.updateProduct
);
router8.delete("/products/:id", authenticateJWT, requireRole(import_client12.UserRole.ADMIN), ProductController.deleteProduct);
router8.post(
  "/products/:id/variants",
  authenticateJWT,
  requireRole(import_client12.UserRole.ADMIN, import_client12.UserRole.STAFF),
  validateRequest(createVariantSchema),
  ProductController.createVariant
);
router8.patch(
  "/variants/:id",
  authenticateJWT,
  requireRole(import_client12.UserRole.ADMIN, import_client12.UserRole.STAFF),
  validateRequest(updateVariantSchema),
  ProductController.updateVariant
);
router8.delete("/variants/:id", authenticateJWT, requireRole(import_client12.UserRole.ADMIN), ProductController.deleteVariant);
router8.post(
  "/products/:id/images",
  authenticateJWT,
  requireRole(import_client12.UserRole.ADMIN, import_client12.UserRole.STAFF),
  ProductController.addImage
);
router8.delete(
  "/products/:id/images/:imageId",
  authenticateJWT,
  requireRole(import_client12.UserRole.ADMIN),
  ProductController.deleteImage
);
router8.patch(
  "/products/:id/images/:imageId/primary",
  authenticateJWT,
  requireRole(import_client12.UserRole.ADMIN, import_client12.UserRole.STAFF),
  ProductController.setPrimaryImage
);
router8.put(
  "/products/:id/images/reorder",
  authenticateJWT,
  requireRole(import_client12.UserRole.ADMIN, import_client12.UserRole.STAFF),
  ProductController.reorderImages
);
var adminRoutes = router8;

// src/modules/upload/upload.routes.ts
var import_express9 = require("express");

// src/modules/upload/upload.controller.ts
var import_multer = __toESM(require("multer"));
var ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp"
];
var upload = (0, import_multer.default)({
  storage: import_multer.default.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
    // 10MB max file size
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid image type (${file.mimetype}). Allowed formats: JPEG, PNG, WebP.`));
    }
  }
});
var uploadMiddleware = upload.single("file");
var uploadMultipleMiddleware = upload.array("files", 10);
var UploadController = class {
  // 1. Direct server-side upload to MySQL image storage
  static uploadImage = asyncHandler(async (req, res) => {
    const file = req.file;
    const folder = req.body.folder || "products";
    if (!file) {
      throw ApiError.badRequest("No image file provided for upload");
    }
    const savedImage = await ImageStorageService.saveImage(
      file.buffer,
      file.originalname,
      file.mimetype,
      folder
    );
    return res.status(201).json(
      ApiResponse.created(
        {
          id: savedImage.id,
          filename: savedImage.filename,
          url: savedImage.url,
          mimeType: savedImage.mimeType,
          fileSize: savedImage.fileSize
        },
        "Image saved to MySQL successfully"
      )
    );
  });
  static getImage = asyncHandler(async (req, res) => {
    const image = await ImageStorageService.getImage(req.params.id);
    if (!image) {
      throw ApiError.notFound("Image not found");
    }
    res.setHeader("Content-Type", image.mimeType);
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    return res.send(image.data);
  });
  // 3. Delete image from MySQL storage
  static deleteImage = asyncHandler(async (req, res) => {
    const imageId = req.params.id || req.body.id;
    if (!imageId) {
      throw ApiError.badRequest("image id is required for image deletion");
    }
    const deleted = await ImageStorageService.deleteImage(imageId);
    return res.status(200).json(
      ApiResponse.success({ deleted }, deleted ? "Image deleted from MySQL" : "Image not found")
    );
  });
};

// src/modules/upload/upload.routes.ts
var import_client13 = require("@prisma/client");
var router9 = (0, import_express9.Router)();
router9.post(
  "/image",
  authenticateJWT,
  requireRole(import_client13.UserRole.ADMIN, import_client13.UserRole.STAFF),
  uploadMiddleware,
  UploadController.uploadImage
);
router9.get("/image/:id", UploadController.getImage);
router9.post(
  "/delete",
  authenticateJWT,
  requireRole(import_client13.UserRole.ADMIN, import_client13.UserRole.STAFF),
  UploadController.deleteImage
);
router9.delete(
  "/:id",
  authenticateJWT,
  requireRole(import_client13.UserRole.ADMIN, import_client13.UserRole.STAFF),
  UploadController.deleteImage
);
var uploadRoutes = router9;

// src/modules/notifications/notification.routes.ts
var import_express10 = require("express");

// src/modules/notifications/notification.controller.ts
var NotificationController = class {
  // 1. Get logged in user's notifications
  static getMyNotifications = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) throw ApiError.unauthorized("User not authenticated");
    const result = await NotificationService.getUserNotifications(userId, {
      page: req.query.page ? parseInt(req.query.page, 10) : void 0,
      limit: req.query.limit ? parseInt(req.query.limit, 10) : void 0,
      unreadOnly: req.query.unreadOnly === "true"
    });
    res.status(200).json(
      ApiResponse.success(
        result.notifications,
        "Notifications retrieved",
        200,
        { ...result.meta, unreadCount: result.unreadCount }
      )
    );
  });
  // 2. Mark single notification as read
  static markAsRead = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) throw ApiError.unauthorized("User not authenticated");
    const notification = await NotificationService.markAsRead(req.params.id, userId);
    res.status(200).json(ApiResponse.success(notification, "Notification marked as read"));
  });
  // 3. Mark all notifications as read
  static markAllAsRead = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) throw ApiError.unauthorized("User not authenticated");
    const result = await NotificationService.markAllAsRead(userId);
    res.status(200).json(ApiResponse.success(result, "All notifications marked as read"));
  });
  // 4. Delete single notification
  static deleteNotification = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) throw ApiError.unauthorized("User not authenticated");
    const result = await NotificationService.deleteNotification(req.params.id, userId);
    res.status(200).json(ApiResponse.success(result, "Notification deleted"));
  });
  // 5. Subscribe to Web Push
  static subscribePush = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) throw ApiError.unauthorized("User not authenticated");
    const { endpoint, keys, userAgent } = req.body;
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      throw ApiError.badRequest("Invalid push subscription payload");
    }
    const subscription = await NotificationService.subscribePush(userId, {
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
      userAgent: userAgent || req.headers["user-agent"]
    });
    res.status(201).json(ApiResponse.created(subscription, "Web push subscribed successfully"));
  });
  // 6. Unsubscribe from Web Push
  static unsubscribePush = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) throw ApiError.unauthorized("User not authenticated");
    const { endpoint } = req.body;
    if (!endpoint) throw ApiError.badRequest("Endpoint required to unsubscribe");
    const result = await NotificationService.unsubscribePush(userId, endpoint);
    res.status(200).json(ApiResponse.success(result, "Web push unsubscribed"));
  });
  // 7. Get VAPID Public Key for client subscription
  static getVapidPublicKey = asyncHandler(async (req, res) => {
    const publicKey = ENV.VAPID_PUBLIC_KEY;
    if (!publicKey) {
      throw ApiError.badRequest("Browser push notifications are not configured on this server");
    }
    res.status(200).json(ApiResponse.success({ publicKey }, "VAPID public key retrieved"));
  });
};

// src/modules/notifications/notification.routes.ts
var router10 = (0, import_express10.Router)();
router10.get("/", authenticateJWT, NotificationController.getMyNotifications);
router10.patch("/read-all", authenticateJWT, NotificationController.markAllAsRead);
router10.patch("/:id/read", authenticateJWT, NotificationController.markAsRead);
router10.delete("/:id", authenticateJWT, NotificationController.deleteNotification);
router10.get("/push/vapid-key", NotificationController.getVapidPublicKey);
router10.post("/push/subscribe", authenticateJWT, NotificationController.subscribePush);
router10.post("/push/unsubscribe", authenticateJWT, NotificationController.unsubscribePush);
var notificationRoutes = router10;

// src/modules/site-settings/site-settings.routes.ts
var import_express11 = require("express");

// src/modules/site-settings/site-settings.controller.ts
var SETTINGS_CACHE_KEY = "site_settings:global";
var SETTINGS_CACHE_TTL = 600;
var SiteSettingsController = class {
  // 1. Get current site settings (with in-memory cache)
  static getSettings = asyncHandler(async (_req, res) => {
    const cached = siteSettingsCache.get(SETTINGS_CACHE_KEY);
    if (cached) {
      return res.status(200).json(ApiResponse.success(cached, "Site settings retrieved successfully (cached)"));
    }
    let settings = await prisma.siteSettings.findFirst();
    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          id: "default",
          businessName: "RJ Flowers",
          phone: "9815155580",
          whatsappPhone: "9815155580",
          email: "contact@rjflowers.com",
          address: "Pokhara-26, Arghau Chowk, Pokhara",
          province: "Gandaki",
          district: "Kaski",
          city: "Pokhara",
          area: "Arghau Chowk",
          latitude: 28.2365,
          longitude: 84.0036,
          openingHours: "Every day: 7:00 AM - 7:00 PM (Closed on festivals)",
          defaultDeliveryMessage: "Delivery across Pokhara. Rs. 100 delivery charge below Rs. 2,000; free delivery at Rs. 2,000 and above.",
          setupCompleted: false
        }
      });
    }
    siteSettingsCache.set(SETTINGS_CACHE_KEY, settings, SETTINGS_CACHE_TTL);
    return res.status(200).json(ApiResponse.success(settings, "Site settings retrieved successfully"));
  });
  // 2. Update site settings (Admin only)
  static updateSettings = asyncHandler(async (req, res) => {
    const {
      businessName,
      logo,
      favicon,
      phone,
      whatsappPhone,
      email,
      address,
      province,
      district,
      city,
      area,
      latitude,
      longitude,
      openingHours,
      socialLinks,
      freeShippingThreshold,
      deliveryNotice,
      defaultDeliveryMessage,
      setupCompleted
    } = req.body;
    if (phone && !/^[9][0-9]{9}$/.test(phone)) {
      throw ApiError.badRequest("Phone number must be exactly 10 digits and start with 9");
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw ApiError.badRequest("Invalid email address format");
    }
    const settings = await prisma.siteSettings.upsert({
      where: { id: "default" },
      update: {
        ...businessName && { businessName },
        ...logo !== void 0 && { logo },
        ...favicon !== void 0 && { favicon },
        ...phone && { phone },
        ...whatsappPhone !== void 0 && { whatsappPhone },
        ...email && { email: email.toLowerCase() },
        ...address && { address },
        ...province !== void 0 && { province },
        ...district !== void 0 && { district },
        ...city && { city },
        ...area !== void 0 && { area },
        ...latitude !== void 0 && { latitude },
        ...longitude !== void 0 && { longitude },
        ...openingHours !== void 0 && { openingHours },
        ...socialLinks !== void 0 && { socialLinks },
        ...freeShippingThreshold !== void 0 && { freeShippingThreshold },
        ...deliveryNotice !== void 0 && { deliveryNotice },
        ...defaultDeliveryMessage !== void 0 && { defaultDeliveryMessage },
        ...setupCompleted !== void 0 && { setupCompleted }
      },
      create: {
        id: "default",
        businessName: businessName || "RJ Flowers",
        logo,
        favicon,
        phone: phone || "9815155580",
        whatsappPhone: whatsappPhone || "9815155580",
        email: (email || "contact@rjflowers.com").toLowerCase(),
        address: address || "Pokhara-26, Arghau Chowk, Pokhara",
        province: province || "Gandaki",
        district: district || "Kaski",
        city: city || "Pokhara",
        area: area || "Arghau Chowk",
        latitude: latitude || 28.2365,
        longitude: longitude || 84.0036,
        openingHours: openingHours || "Every day: 7:00 AM - 7:00 PM (Closed on festivals)",
        socialLinks,
        freeShippingThreshold: freeShippingThreshold || 2e3,
        deliveryNotice: deliveryNotice || "Delivery across Pokhara. Rs. 100 below Rs. 2,000; free delivery from Rs. 2,000.",
        defaultDeliveryMessage: defaultDeliveryMessage || "Delivery across Pokhara. Rs. 100 delivery charge below Rs. 2,000; free delivery at Rs. 2,000 and above.",
        setupCompleted: setupCompleted || false
      }
    });
    siteSettingsCache.del(SETTINGS_CACHE_KEY);
    emitLiveEvent("settings:updated", { settings });
    return res.status(200).json(ApiResponse.success(settings, "Site settings updated successfully"));
  });
  // 3. Complete Admin Setup Wizard
  static completeSetupWizard = asyncHandler(async (req, res) => {
    const {
      businessName,
      logo,
      phone,
      email,
      address,
      province,
      district,
      city,
      area,
      latitude,
      longitude,
      openingHours
    } = req.body;
    if (!businessName || !phone || !email || !address) {
      throw ApiError.badRequest("Business name, phone, email, and address are required to complete setup");
    }
    if (!/^[9][0-9]{9}$/.test(phone)) {
      throw ApiError.badRequest("Phone number must be exactly 10 digits and start with 9");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw ApiError.badRequest("Invalid email format");
    }
    const updated = await prisma.siteSettings.upsert({
      where: { id: "default" },
      update: {
        businessName,
        logo: logo || null,
        phone,
        email: email.toLowerCase(),
        address,
        province: province || "Bagmati",
        district: district || "Kaski",
        city: city || "Pokhara",
        area: area || "",
        latitude: latitude || 28.2096,
        longitude: longitude || 83.9595,
        openingHours: openingHours || "Sun - Sat: 8:00 AM - 7:00 PM",
        setupCompleted: true
      },
      create: {
        id: "default",
        businessName,
        logo: logo || null,
        phone,
        email: email.toLowerCase(),
        address,
        province: province || "Bagmati",
        district: district || "Kaski",
        city: city || "Pokhara",
        area: area || "",
        latitude: latitude || 28.2096,
        longitude: longitude || 83.9595,
        openingHours: openingHours || "Sun - Sat: 8:00 AM - 7:00 PM",
        setupCompleted: true
      }
    });
    siteSettingsCache.del(SETTINGS_CACHE_KEY);
    emitLiveEvent("settings:updated", { settings: updated });
    return res.status(200).json(ApiResponse.success(updated, "Admin onboarding setup completed successfully!"));
  });
};

// src/modules/site-settings/site-settings.routes.ts
var import_client14 = require("@prisma/client");
var router11 = (0, import_express11.Router)();
router11.get("/", SiteSettingsController.getSettings);
router11.put(
  "/",
  authenticateJWT,
  requireRole(import_client14.UserRole.ADMIN),
  SiteSettingsController.updateSettings
);
router11.post(
  "/setup",
  authenticateJWT,
  requireRole(import_client14.UserRole.ADMIN),
  SiteSettingsController.completeSetupWizard
);
var siteSettingsRoutes = router11;

// src/server.ts
process.env.UV_THREADPOOL_SIZE = "4";
var app = (0, import_express12.default)();
app.set("trust proxy", 1);
app.use((0, import_compression.default)({ threshold: 1024 }));
app.use(
  "/uploads",
  import_express12.default.static(import_path2.default.resolve(process.cwd(), "uploads"), {
    maxAge: "365d",
    immutable: true,
    setHeaders: (res) => {
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    }
  })
);
app.use("/api", (_req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});
app.use(
  (0, import_helmet.default)({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "blob:", "https://images.unsplash.com", "https://*.tile.openstreetmap.org", "https://unpkg.com"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://unpkg.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        connectSrc: ["'self'", ENV.FRONTEND_URL || "http://localhost:5173", "https://*.tile.openstreetmap.org"]
      }
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    frameguard: { action: "deny" },
    // Anti-clickjacking
    referrerPolicy: { policy: "strict-origin-when-cross-origin" }
  })
);
var corsOptions = {
  origin: true,
  // Echo origin to allow localhost, staging, and production domains with cookies
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "x-session-id",
    "x-refresh-token",
    "Accept",
    "Origin",
    "X-Requested-With",
    "Cache-Control",
    "cache-control",
    "Pragma",
    "pragma",
    "Expires",
    "expires",
    "If-Modified-Since"
  ],
  exposedHeaders: ["set-cookie"]
};
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }
  const requestHeaders = req.headers["access-control-request-headers"];
  if (requestHeaders) {
    res.setHeader("Access-Control-Allow-Headers", requestHeaders);
  } else {
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, x-session-id, x-refresh-token, Accept, Origin, X-Requested-With, Cache-Control, Pragma, Expires, If-Modified-Since"
    );
  }
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD");
    res.setHeader("Access-Control-Max-Age", "86400");
    return res.sendStatus(204);
  }
  next();
});
app.use((0, import_cors.default)(corsOptions));
app.options("*", (0, import_cors.default)(corsOptions));
app.use((0, import_morgan.default)(ENV.NODE_ENV === "development" ? "dev" : "combined"));
app.use(import_express12.default.json({ limit: "10mb" }));
app.use(import_express12.default.urlencoded({ extended: true, limit: "10mb" }));
var globalLimiter = (0, import_express_rate_limit.default)({
  windowMs: 15 * 60 * 1e3,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes.",
    errors: []
  }
});
app.use("/api", globalLimiter);
var authLimiter = (0, import_express_rate_limit.default)({
  windowMs: 15 * 60 * 1e3,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts, please try again after 15 minutes.",
    errors: []
  }
});
app.use(["/api/auth/login", "/api/auth/register", "/api/admin/login", "/api/v1/auth/login"], authLimiter);
var checkoutLimiter = (0, import_express_rate_limit.default)({
  windowMs: 15 * 60 * 1e3,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many checkout requests, please wait a moment.",
    errors: []
  }
});
app.use(["/api/orders", "/api/v1/orders"], checkoutLimiter);
app.get("/", (_req, res) => {
  res.status(200).json({
    status: "ok",
    success: true,
    message: "\u{1F33F} RJ Flowers API is flourishing",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      catalog: "/api/products",
      sitemap: "/sitemap.xml"
    }
  });
});
app.get(["/health", "/api/health"], (req, res) => {
  const memoryUsage = process.memoryUsage();
  res.status(200).json({
    status: "ok",
    success: true,
    message: "Nursery API is running",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    process: {
      uptime: process.uptime(),
      pid: process.pid,
      memory: {
        rssMb: Math.round(memoryUsage.rss / 1024 / 1024),
        heapUsedMb: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        heapTotalMb: Math.round(memoryUsage.heapTotal / 1024 / 1024)
      }
    },
    cache: appCache.getStats()
  });
});
app.get(["/robots.txt", "/api/robots.txt"], async (_req, res) => {
  const robots = await appCache.getOrSet(
    "system:robots.txt",
    async () => `# RJ Flowers Robots.txt
User-agent: *
Allow: /
Allow: /product/
Allow: /products/
Allow: /category/
Allow: /categories/
Allow: /catalog
Allow: /search
Disallow: /admin/
Disallow: /checkout
Disallow: /cart
Disallow: /orders/
Disallow: /wishlist
Disallow: /profile
Disallow: /api/

Sitemap: https://rjflowers.com/sitemap.xml
`,
    3600
    // Cache for 1 hour
  );
  res.header("Content-Type", "text/plain");
  res.send(robots);
});
app.get(["/sitemap.xml", "/api/sitemap.xml"], async (_req, res) => {
  try {
    const xml = await appCache.getOrSet(
      "system:sitemap.xml",
      async () => {
        const [products, categories] = await Promise.all([
          prisma.product.findMany({
            where: { published: true, available: true },
            select: { slug: true, updatedAt: true }
          }),
          prisma.category.findMany({
            where: { isActive: true },
            select: { slug: true, updatedAt: true }
          })
        ]);
        const baseUrl = process.env.FRONTEND_URL || "https://rjflowers.com";
        let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
`;
        xmlContent += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;
        const staticPages = [
          { loc: `${baseUrl}/`, priority: "1.0", changefreq: "daily" },
          { loc: `${baseUrl}/catalog`, priority: "0.9", changefreq: "daily" },
          { loc: `${baseUrl}/categories`, priority: "0.8", changefreq: "weekly" },
          { loc: `${baseUrl}/search`, priority: "0.7", changefreq: "weekly" },
          { loc: `${baseUrl}/contact`, priority: "0.5", changefreq: "monthly" },
          { loc: `${baseUrl}/privacy`, priority: "0.3", changefreq: "yearly" },
          { loc: `${baseUrl}/terms`, priority: "0.3", changefreq: "yearly" }
        ];
        staticPages.forEach((p) => {
          xmlContent += `  <url>
    <loc>${p.loc}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>
`;
        });
        categories.forEach((c) => {
          xmlContent += `  <url>
    <loc>${baseUrl}/category/${c.slug}</loc>
    <lastmod>${c.updatedAt.toISOString().split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>
`;
        });
        products.forEach((p) => {
          xmlContent += `  <url>
    <loc>${baseUrl}/product/${p.slug}</loc>
    <lastmod>${p.updatedAt.toISOString().split("T")[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`;
        });
        xmlContent += `</urlset>`;
        return xmlContent;
      },
      1800
      // Cache for 30 minutes
    );
    res.header("Content-Type", "application/xml");
    res.send(xml);
  } catch (err) {
    res.status(500).send("Error generating sitemap");
  }
});
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/delivery-zones", deliveryRoutes);
app.use("/api/admin/delivery-zones", deliveryRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/site-settings", siteSettingsRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/delivery-zones", deliveryRoutes);
app.use("/api/v1/admin/delivery-zones", deliveryRoutes);
app.use("/api/v1/inventory", inventoryRoutes);
app.use("/api/v1/upload", uploadRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/site-settings", siteSettingsRoutes);
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
    errors: []
  });
});
app.use(errorHandler);
var server;
var httpServer;
function getListenTarget() {
  const envPort = process.env.PORT;
  if (!envPort) {
    if (typeof global.PhusionPassenger !== "undefined") {
      return "passenger";
    }
    return 5e3;
  }
  if (!isNaN(Number(envPort))) {
    return Number(envPort);
  }
  return envPort;
}
async function startServer() {
  const target = getListenTarget();
  httpServer = import_http.default.createServer(app);
  initSocketIO(httpServer);
  server = httpServer.listen(target, () => {
    console.log(`\u{1F33F} RJ Flowers API is flourishing on`, target);
  });
  if (server) {
    server.keepAliveTimeout = 15e3;
    server.headersTimeout = 16e3;
  }
  connectDB().catch((err) => {
    console.error("\u26A0\uFE0F [DB] Connection warning on startup:", err?.message || err);
  });
}
var handleGracefulShutdown = async (signal) => {
  console.log(`
\u{1F6D1} Received ${signal}. Starting graceful shutdown...`);
  const activeServer = server || httpServer;
  if (activeServer) {
    if (typeof activeServer.closeIdleConnections === "function") {
      activeServer.closeIdleConnections();
    }
    activeServer.close(async () => {
      console.log("\u{1F512} Closed HTTP server connections.");
      try {
        await prisma.$disconnect();
        console.log("\u{1F4E6} Disconnected Prisma / MySQL connection.");
      } catch (err) {
        console.error("Error disconnecting database:", err);
      }
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};
process.on("SIGTERM", () => handleGracefulShutdown("SIGTERM"));
process.on("SIGINT", () => handleGracefulShutdown("SIGINT"));
startServer();
var server_default = app;
