import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  registerUser,
  verifyEmail,
  loginUser,
  requestPasswordReset,
  resetPassword,
} from '../controllers/auth.controller';
import validate from '../middlewares/validate.middleware';
import {
  registerSchema,
  verifyEmailSchema,
  loginSchema,
  requestResetPasswordSchema,
  resetPasswordSchema,
} from '../validations/auth.validation';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { createSchedule, checkAvailableSchedule, updateSlotStatus } from '../controllers/schedule.controller';
import { Role } from '../interfaces/user.interface';


const router = Router();

// Rate Limiters
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per `window` (here, per 15 minutes)
  message: { success: false, message: 'Too many login attempts, please try again after 15 minutes' },
});

const forgotPasswordRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP to 3 forgot password requests per `window`
  message: { success: false, message: 'Too many password reset attempts, please try again after 15 minutes' },
});

// Auth Routes
router.post('/auth/register', validate(registerSchema), registerUser);
router.post('/auth/verify-email', validate(verifyEmailSchema), verifyEmail);
router.post('/auth/login', loginRateLimiter, validate(loginSchema), loginUser);
router.post('/auth/forgot-password', forgotPasswordRateLimiter, validate(requestResetPasswordSchema), requestPasswordReset);
router.post('/auth/reset-password', validate(resetPasswordSchema), resetPassword);

// Schedule Routes
router.post('/schedules', authenticate, requireRole([Role.Admin]), createSchedule);
router.get('/schedules/available', checkAvailableSchedule);
router.patch('/schedules/slots/:slot_id/status', authenticate, requireRole([Role.Admin]), updateSlotStatus);

export default router;
