import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler';
import * as authService from '../services/auth.service';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// ─── Register ─────────────────────────────────────────────────────────────────
export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.registerUser({ ...req.body, institutionId: req.institutionId });

  res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);

  res.status(201).json({
    status: 'success',
    message: 'Account created! Please check your email to verify your address.',
    data: {
      user: result.user,
      accessToken: result.accessToken,
    },
  });
});

// ─── Login ────────────────────────────────────────────────────────────────────
export const login = asyncHandler(async (req: Request, res: Response) => {
  const userAgent = req.headers['user-agent'];
  const ipAddress = req.ip || req.socket.remoteAddress;

  const result = await authService.loginUser(req.body, req.institutionId!, userAgent, ipAddress);

  res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);

  res.status(200).json({
    status: 'success',
    data: {
      user: result.user,
      accessToken: result.accessToken,
    },
  });
});

// ─── Logout ───────────────────────────────────────────────────────────────────
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;
  if (refreshToken) {
    await authService.logoutUser(refreshToken);
  }

  res.clearCookie('refreshToken', COOKIE_OPTIONS);
  res.status(200).json({ status: 'success', message: 'Logged out successfully' });
});

// ─── Refresh Token ────────────────────────────────────────────────────────────
export const refreshTokenHandler = asyncHandler(async (req: Request, res: Response) => {
  const oldRefreshToken = req.cookies?.refreshToken;
  if (!oldRefreshToken) {
    return res.status(401).json({ status: 'fail', message: 'No refresh token provided' });
  }

  const result = await authService.refreshSession(oldRefreshToken);

  res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);

  res.status(200).json({
    status: 'success',
    data: { accessToken: result.accessToken },
  });
});

// ─── Get Me ───────────────────────────────────────────────────────────────────
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getCurrentUser((req as any).user.id);
  res.status(200).json({ status: 'success', data: { user } });
});

// ─── Update Profile ───────────────────────────────────────────────────────────
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.updateProfile((req as any).user.id, req.institutionId!, req.body);
  res.status(200).json({ status: 'success', data: { user } });
});

// ─── Verify Email ─────────────────────────────────────────────────────────────
export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ status: 'fail', message: 'Verification token is required' });
  }

  const result = await authService.verifyEmail(token);

  res.status(200).json({
    status: 'success',
    message: 'Email verified successfully! You can now log in.',
    data: result,
  });
});

// ─── Resend Verification ──────────────────────────────────────────────────────
export const resendVerification = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  await authService.resendVerification(email, req.institutionId!);

  // Always return success to prevent email enumeration
  res.status(200).json({
    status: 'success',
    message: 'If your email exists in our system and is unverified, a verification link has been sent.',
  });
});

// ─── Forgot Password ──────────────────────────────────────────────────────────
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  await authService.forgotPassword(email, req.institutionId!);

  // Always return success to prevent email enumeration
  res.status(200).json({
    status: 'success',
    message: 'If an account with that email exists, a password reset link has been sent.',
  });
});

// ─── Reset Password ───────────────────────────────────────────────────────────
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body;

  await authService.resetPassword(token, password);

  // Clear any existing refresh token cookie
  res.clearCookie('refreshToken', COOKIE_OPTIONS);

  res.status(200).json({
    status: 'success',
    message: 'Password reset successfully. Please log in with your new password.',
  });
});

// ─── Change Password ──────────────────────────────────────────────────────────
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  await authService.changePassword((req as any).user.id, currentPassword, newPassword);

  res.clearCookie('refreshToken', COOKIE_OPTIONS);
  res.status(200).json({
    status: 'success',
    message: 'Password changed successfully. Please log in again.',
  });
});
