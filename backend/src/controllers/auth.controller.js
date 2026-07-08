const asyncHandler = require('../utils/asyncHandler');
const { setAuthCookies, clearAuthCookies } = require('../utils/cookies');
const { AppError } = require('../middlewares/errorHandler');
const { rotateRefreshToken, revokeRefreshToken } = require('../services/token.service');
const authService = require('../services/auth.service');
const prisma = require('../config/db');

const register = asyncHandler(async (req, res) => {
  const user = await authService.registerUser(req.body);
  res.status(201).json({
    success: true,
    message: 'Registration successful. Please check your email for the verification code.',
    data: user,
  });
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { email, code, purpose } = req.body;

  if (purpose === 'EMAIL_VERIFICATION') {
    await authService.verifyEmailOtp({ email, code });
    return res.status(200).json({ success: true, message: 'Email verified successfully.' });
  }

  // PASSWORD_RESET purpose is validated as part of resetPassword, not standalone
  throw new AppError('Unsupported OTP purpose for this endpoint.', 400);
});

const resendOtp = asyncHandler(async (req, res) => {
  await authService.resendOtp(req.body);
  res.status(200).json({ success: true, message: 'A new OTP has been sent to your email.' });
});

const login = asyncHandler(async (req, res) => {
  const { user, tokens } = await authService.loginUser(req.body);
  setAuthCookies(res, tokens);
  res.status(200).json({ success: true, message: 'Login successful.', data: user });
});

const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    throw new AppError('No refresh token provided.', 401);
  }

  const tokens = await rotateRefreshToken(refreshToken);
  setAuthCookies(res, tokens);
  res.status(200).json({ success: true, message: 'Token refreshed.' });
});

const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;
  if (refreshToken) {
    await revokeRefreshToken(refreshToken);
  }
  clearAuthCookies(res);
  res.status(200).json({ success: true, message: 'Logged out successfully.' });
});

const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body);
  res.status(200).json({
    success: true,
    message: 'If an account exists for this email, a reset code has been sent.',
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body);
  res.status(200).json({ success: true, message: 'Password reset successfully. Please log in.' });
});

const getMe = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, name: true, email: true, role: true, isVerified: true },
  });

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  res.status(200).json({ success: true, data: user });
});

module.exports = {
  register,
  verifyOtp,
  resendOtp,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
};
