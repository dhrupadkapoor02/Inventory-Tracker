const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters').max(72),
});

const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

const verifyOtpSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  code: z.string().length(6, 'OTP must be 6 digits'),
  purpose: z.enum(['EMAIL_VERIFICATION', 'PASSWORD_RESET']),
});

const forgotPasswordSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
});

const resetPasswordSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  code: z.string().length(6, 'OTP must be 6 digits'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters').max(72),
});

const resendOtpSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  purpose: z.enum(['EMAIL_VERIFICATION', 'PASSWORD_RESET']),
});

module.exports = {
  registerSchema,
  loginSchema,
  verifyOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resendOtpSchema,
};
