import nodemailer, { type Transporter } from 'nodemailer';
import { ENV } from '../config/env.js';

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (transporter) return transporter;

  if (!ENV.SMTP_PASS) {
    console.warn('⚠️ [EMAIL] SMTP_PASS not set in environment. Email delivery will be simulated in console.');
    return null;
  }

  try {
    transporter = nodemailer.createTransport({
      host: ENV.SMTP_HOST,
      port: ENV.SMTP_PORT,
      secure: ENV.SMTP_SECURE, // true for 465, false for 587
      auth: {
        user: ENV.SMTP_USER,
        pass: ENV.SMTP_PASS,
      },
      tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false,
      },
    });

    return transporter;
  } catch (error) {
    console.error('❌ [EMAIL] Failed to create SMTP transporter:', error);
    return null;
  }
}

export interface SendOtpEmailParams {
  to: string;
  otp: string;
  type: 'REGISTER' | 'LOGIN';
  userName?: string;
}

export async function sendOtpEmail({ to, otp, type, userName }: SendOtpEmailParams): Promise<{ success: boolean; simulated?: boolean; error?: string }> {
  const mailClient = getTransporter();

  const title = type === 'REGISTER' ? 'Verify Your Email to Complete Registration' : 'Your Login Verification Code';
  const subtitle = type === 'REGISTER' 
    ? 'Thank you for joining RJ Flowers & Nursery! Use the OTP below to verify your account.'
    : 'Use the OTP below to securely log in to your RJ Flowers account.';

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
          <h1>🌸 RJ Flowers & Nursery</h1>
          <p>Fresh Blooms & Botanical Care</p>
        </div>
        <div class="content">
          <div class="greeting">Hello ${userName ? userName : 'there'},</div>
          <div class="desc">${subtitle}</div>
          
          <div class="otp-card">
            <div class="otp-code">${otp}</div>
            <div class="otp-expiry">⏱️ This code is valid for 10 minutes.</div>
          </div>

          <div class="desc" style="font-size: 13px; color: #6b7280; margin-bottom: 0;">
            If you did not request this verification code, please ignore this email or contact our support team. Never share this code with anyone.
          </div>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} RJ Flowers & Nursery. All rights reserved.</p>
          <p>Pokhara / Kathmandu, Nepal</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
RJ Flowers & Nursery
-------------------------------------
${title}

Hello ${userName || 'there'},

${subtitle}

YOUR ONE-TIME PASSWORD (OTP):
${otp}

(This code is valid for 10 minutes. Do not share it with anyone.)

If you did not request this, please ignore this email.
  `.trim();

  // Log in server console for easy dev/debug
  console.log(`\n========================================`);
  console.log(`📨 [OTP EMAIL - ${type}] to: ${to}`);
  console.log(`🔑 OTP CODE: [ ${otp} ]`);
  console.log(`========================================\n`);

  if (!mailClient) {
    return { success: true, simulated: true };
  }

  try {
    await mailClient.sendMail({
      from: ENV.SMTP_FROM,
      to,
      subject: type === 'REGISTER' 
        ? `${otp} is your RJ Flowers registration code` 
        : `${otp} is your RJ Flowers login code`,
      text: textContent,
      html: htmlContent,
    });

    console.log(`✅ [EMAIL] Successfully sent OTP email to ${to}`);
    return { success: true, simulated: false };
  } catch (error: any) {
    console.error(`❌ [EMAIL] Error sending email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
}
