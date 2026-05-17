import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema } from '../validators/auth.validator';
import { protect } from '../middlewares/auth.middleware';
import rateLimit from 'express-rate-limit';

const router = Router();

// Strict rate limiter for sensitive auth actions
const sensitiveActionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { status: 'fail', message: 'Too many attempts. Please try again in an hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Public Routes ────────────────────────────────────────────────────────────
router.post('/register',          validate(registerSchema),       authController.register);
router.post('/login',             validate(loginSchema),          authController.login);
router.post('/logout',                                            authController.logout);
router.post('/refresh-token',                                     authController.refreshTokenHandler);
router.post('/verify-email',                                      authController.verifyEmail);
router.post('/resend-verification', sensitiveActionLimiter,       authController.resendVerification);
router.post('/forgot-password',   sensitiveActionLimiter,         authController.forgotPassword);
router.post('/reset-password',    validate(resetPasswordSchema),  authController.resetPassword);

// ─── Protected Routes ─────────────────────────────────────────────────────────
router.get('/me',                  protect,                                                    authController.getMe);
router.patch('/profile',           protect,                                                    authController.updateProfile);
router.patch('/change-password',   protect, validate(changePasswordSchema),                    authController.changePassword);

export default router;
