import { prisma } from '../config/prisma';
import bcrypt from 'bcrypt';
import { AppError } from '../utils/appError';
import { generateTokens, verifyRefreshToken } from '../utils/jwt';
import { generateSecureToken, hashToken, tokenExpiry } from '../utils/token';
import { sendEmail, verificationEmailHTML, resetPasswordEmailHTML } from '../utils/email';
import { logActivity } from './logging.service';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// ─── Register ────────────────────────────────────────────────────────────────

export const registerUser = async (data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  institutionId?: string;
  dateOfBirth?: string;
  phone?: string;
  previousEducation?: string;
}) => {
  const { email, password, firstName, lastName, institutionId, dateOfBirth, phone, previousEducation } = data;

  const existingUser = await prisma.user.findFirst({
    where: { email, institutionId },
  });
  if (existingUser) {
    throw new AppError('Email already in use at this institution', 400);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const { rawToken, hashedToken } = generateSecureToken();

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: 'STUDENT',
      institutionId,
      isVerified: false,
      verificationToken: hashedToken,
      verificationTokenExpiry: tokenExpiry(24 * 60), // 24 hours
      studentProfile: {
        create: {
          firstName,
          lastName,
          phone,
          previousEducation,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        },
      },
    },
    include: { studentProfile: true },
  });

  // Send verification email (non-blocking)
  const verifyUrl = `${FRONTEND_URL}/verify-email?token=${rawToken}`;
  sendEmail({
    to: email,
    subject: 'Verify your email – AAU Student Registration',
    html: verificationEmailHTML(firstName, verifyUrl),
  }).catch(err => console.error('Verification email failed:', err));

  // Write audit log
  await logActivity({
    userId: user.id,
    institutionId,
    action: 'USER_REGISTERED',
    entity: 'User',
    entityId: user.id,
    details: { email, role: 'STUDENT' },
  });

  const { accessToken, refreshToken } = generateTokens(user.id, user.role);

  return { user, accessToken, refreshToken };
};

// ─── Login ───────────────────────────────────────────────────────────────────

export const loginUser = async (
  data: any,
  institutionId: string,
  userAgent?: string,
  ipAddress?: string
) => {
  const { email, password } = data;

  const user = await prisma.user.findFirst({
    where: { 
      email, 
      OR: [
        { institutionId },
        { institutionId: null, role: 'SUPER_ADMIN' }
      ]
    },
    include: { studentProfile: true },
  });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new AppError('Invalid email or password', 401);
  }

  // ── Enterprise: enforce email verification for students ──
  if (!user.isVerified && user.role === 'STUDENT') {
    throw new AppError('Please verify your email before logging in. Check your inbox for a verification link.', 403);
  }

  const { accessToken, refreshToken } = generateTokens(user.id, user.role);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.$transaction(async (tx) => {
    // Store new session
    await tx.session.create({
      data: { userId: user.id, refreshToken, userAgent, ipAddress, expiresAt },
    });
    // Update lastLoginAt
    await tx.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });
    // Audit log
    await logActivity({
      userId: user.id,
      institutionId,
      action: 'USER_LOGIN',
      entity: 'User',
      entityId: user.id,
      ipAddress,
      details: { userAgent },
    }, tx);
  });

  return { user, accessToken, refreshToken };
};

// ─── Logout ──────────────────────────────────────────────────────────────────

export const logoutUser = async (refreshToken: string) => {
  await prisma.session.deleteMany({ where: { refreshToken } });
};

// ─── Refresh Session ─────────────────────────────────────────────────────────

export const refreshSession = async (oldRefreshToken: string) => {
  const decoded = verifyRefreshToken(oldRefreshToken);

  const session = await prisma.session.findUnique({
    where: { refreshToken: oldRefreshToken },
  });

  if (!session || session.expiresAt < new Date()) {
    throw new AppError('Invalid or expired session. Please log in again.', 401);
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.id } });
  if (!user) throw new AppError('User not found', 404);

  const { accessToken, refreshToken } = generateTokens(user.id, user.role);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  // Rotate refresh token
  await prisma.session.update({
    where: { id: session.id },
    data: { refreshToken, expiresAt },
  });

  return { accessToken, refreshToken };
};

// ─── Get Current User ────────────────────────────────────────────────────────

export const getCurrentUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      isVerified: true,
      lastLoginAt: true,
      createdAt: true,
      studentProfile: true,
      institutionId: true,
    },
  });
  if (!user) throw new AppError('User not found', 404);
  return user;
};

// ─── Update Profile ──────────────────────────────────────────────────────────

export const updateProfile = async (userId: string, institutionId: string, data: any) => {
  const user = await prisma.user.findFirst({ 
    where: { 
      id: userId,
      OR: [
        { institutionId },
        { institutionId: null, role: 'SUPER_ADMIN' }
      ]
    } 
  });
  if (!user) throw new AppError('User not found in this institution', 404);

  const {
    firstName, lastName, phone, dateOfBirth,
    gender, region, city, address,
    previousEducation, highSchoolName, highSchoolGrade,
  } = data;

  return prisma.user.update({
    where: { id: userId },
    data: {
      studentProfile: {
        update: {
          firstName,
          lastName,
          phone,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
          gender,
          region,
          city,
          address,
          previousEducation,
          highSchoolName,
          highSchoolGrade: highSchoolGrade ? parseFloat(highSchoolGrade) : undefined,
        },
      },
    },
    include: { studentProfile: true },
  });
};

// ─── Verify Email ────────────────────────────────────────────────────────────

export const verifyEmail = async (rawToken: string) => {
  const hashedToken = hashToken(rawToken);

  const user = await prisma.user.findUnique({
    where: { verificationToken: hashedToken },
  });

  if (!user) {
    throw new AppError('Invalid or expired verification link. Please request a new one.', 400);
  }

  if (user.verificationTokenExpiry && user.verificationTokenExpiry < new Date()) {
    throw new AppError('Verification link has expired. Please request a new one.', 400);
  }

  if (user.isVerified) {
    throw new AppError('Email is already verified.', 400);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isVerified: true,
      verificationToken: null,
      verificationTokenExpiry: null,
    },
  });

  await logActivity({
    userId: user.id,
    institutionId: user.institutionId ?? undefined,
    action: 'EMAIL_VERIFIED',
    entity: 'User',
    entityId: user.id,
  });

  return { email: user.email };
};

// ─── Resend Verification ─────────────────────────────────────────────────────

export const resendVerification = async (email: string, institutionId: string) => {
  const user = await prisma.user.findFirst({
    where: { 
      email,
      OR: [
        { institutionId },
        { institutionId: null, role: 'SUPER_ADMIN' }
      ]
    },
    include: { studentProfile: true },
  });

  // Silent success to prevent email enumeration
  if (!user || user.isVerified) return;

  const { rawToken, hashedToken } = generateSecureToken();

  await prisma.user.update({
    where: { id: user.id },
    data: {
      verificationToken: hashedToken,
      verificationTokenExpiry: tokenExpiry(24 * 60),
    },
  });

  const firstName = user.studentProfile?.firstName || 'Student';
  const verifyUrl = `${FRONTEND_URL}/verify-email?token=${rawToken}`;

  sendEmail({
    to: email,
    subject: 'Verify your email – AAU Student Registration',
    html: verificationEmailHTML(firstName, verifyUrl),
  }).catch(err => console.error('Resend verification email failed:', err));
};

// ─── Forgot Password ─────────────────────────────────────────────────────────

export const forgotPassword = async (email: string, institutionId: string) => {
  const user = await prisma.user.findFirst({
    where: { 
      email,
      OR: [
        { institutionId },
        { institutionId: null, role: 'SUPER_ADMIN' }
      ]
    },
    include: { studentProfile: true },
  });

  // Silent success to prevent email enumeration
  if (!user) return;

  const { rawToken, hashedToken } = generateSecureToken();

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken: hashedToken,
      resetTokenExpiry: tokenExpiry(60), // 1 hour
    },
  });

  const firstName = user.studentProfile?.firstName || user.email;
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${rawToken}`;

  sendEmail({
    to: email,
    subject: 'Reset your password – AAU Student Registration',
    html: resetPasswordEmailHTML(firstName, resetUrl),
  }).catch(err => console.error('Reset password email failed:', err));

  await logActivity({
    userId: user.id,
    institutionId: user.institutionId ?? undefined,
    action: 'PASSWORD_RESET_REQUESTED',
    entity: 'User',
    entityId: user.id,
  });
};

// ─── Reset Password ──────────────────────────────────────────────────────────

export const resetPassword = async (rawToken: string, newPassword: string) => {
  const hashedToken = hashToken(rawToken);

  const user = await prisma.user.findUnique({
    where: { resetToken: hashedToken },
  });

  if (!user) {
    throw new AppError('Invalid or expired password reset link.', 400);
  }

  if (user.resetTokenExpiry && user.resetTokenExpiry < new Date()) {
    throw new AppError('Password reset link has expired. Please request a new one.', 400);
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });
    // Invalidate all existing sessions on password reset
    await tx.session.deleteMany({ where: { userId: user.id } });
    await logActivity({
      userId: user.id,
      institutionId: user.institutionId ?? undefined,
      action: 'PASSWORD_RESET_COMPLETED',
      entity: 'User',
      entityId: user.id,
    }, tx);
  });
};

// ─── Change Password ─────────────────────────────────────────────────────────

export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('User not found', 404);

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) throw new AppError('Current password is incorrect', 400);

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: userId }, data: { passwordHash } });
    await tx.session.deleteMany({ where: { userId } });
    await logActivity({
      userId,
      institutionId: user.institutionId ?? undefined,
      action: 'PASSWORD_CHANGED',
      entity: 'User',
      entityId: userId,
    }, tx);
  });
};
