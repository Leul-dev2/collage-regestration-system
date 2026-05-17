import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = process.env.SMTP_FROM || '"AAU Registration" <noreply@aau.edu.et>';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  // In development without SMTP, log the email instead of sending
  if (!process.env.SMTP_USER) {
    console.log(`📧 [DEV EMAIL] To: ${options.to} | Subject: ${options.subject}`);
    console.log(`   Link/Token embedded in HTML (check logs)`);
    // Extract any URLs from the HTML for easy dev access
    const urlMatch = options.html.match(/href="([^"]+)"/);
    if (urlMatch) {
      console.log(`   🔗 ${urlMatch[1]}`);
    }
    return true;
  }

  try {
    await transporter.sendMail({
      from: FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    return true;
  } catch (error) {
    console.error('Email send failed:', error);
    return false;
  }
};

// ─── Email Templates ─────────────────────────────────────────────────────────

export const verificationEmailHTML = (name: string, verifyUrl: string) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <div style="background:linear-gradient(135deg,#1e40af,#3b82f6);padding:32px 40px;">
      <h1 style="margin:0;color:#fff;font-size:22px;">Verify Your Email</h1>
    </div>
    <div style="padding:32px 40px;">
      <p style="color:#334155;font-size:15px;line-height:1.6;">Hello <strong>${name}</strong>,</p>
      <p style="color:#475569;font-size:14px;line-height:1.6;">Thank you for registering. Please verify your email address by clicking the button below. This link expires in <strong>24 hours</strong>.</p>
      <div style="text-align:center;margin:28px 0;">
        <a href="${verifyUrl}" style="display:inline-block;background:#1e40af;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">Verify Email Address</a>
      </div>
      <p style="color:#94a3b8;font-size:12px;line-height:1.5;">If you didn't create an account, please ignore this email.</p>
    </div>
    <div style="background:#f8fafc;padding:16px 40px;border-top:1px solid #e2e8f0;">
      <p style="margin:0;color:#94a3b8;font-size:11px;">AAU Student Registration System</p>
    </div>
  </div>
</body>
</html>`;

export const resetPasswordEmailHTML = (name: string, resetUrl: string) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <div style="background:linear-gradient(135deg,#dc2626,#ef4444);padding:32px 40px;">
      <h1 style="margin:0;color:#fff;font-size:22px;">Reset Your Password</h1>
    </div>
    <div style="padding:32px 40px;">
      <p style="color:#334155;font-size:15px;line-height:1.6;">Hello <strong>${name}</strong>,</p>
      <p style="color:#475569;font-size:14px;line-height:1.6;">We received a request to reset your password. Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
      <div style="text-align:center;margin:28px 0;">
        <a href="${resetUrl}" style="display:inline-block;background:#dc2626;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">Reset Password</a>
      </div>
      <p style="color:#94a3b8;font-size:12px;line-height:1.5;">If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
    </div>
    <div style="background:#f8fafc;padding:16px 40px;border-top:1px solid #e2e8f0;">
      <p style="margin:0;color:#94a3b8;font-size:11px;">AAU Student Registration System</p>
    </div>
  </div>
</body>
</html>`;
