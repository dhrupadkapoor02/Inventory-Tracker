const bcrypt = require('bcrypt');
const prisma = require('../config/db');
const { AppError } = require('../middlewares/errorHandler');
const { createAndSendOtp, verifyOtpCode } = require('./otp.service');
const { issueTokenPair, revokeAllUserTokens } = require('./token.service');

const SALT_ROUNDS = 10;

async function registerUser({ name, email, password }) {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError('An account with this email already exists.', 409);
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
  });

  await createAndSendOtp(user, 'EMAIL_VERIFICATION');

  return { id: user.id, name: user.name, email: user.email };
}

async function verifyEmailOtp({ email, code }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError('User not found.', 404);
  }
  if (user.isVerified) {
    throw new AppError('Email is already verified.', 400);
  }

  await verifyOtpCode(user.id, code, 'EMAIL_VERIFICATION');

  await prisma.user.update({
    where: { id: user.id },
    data: { isVerified: true },
  });

  return true;
}

async function resendOtp({ email, purpose }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError('User not found.', 404);
  }
  if (purpose === 'EMAIL_VERIFICATION' && user.isVerified) {
    throw new AppError('Email is already verified.', 400);
  }

  await createAndSendOtp(user, purpose);
  return true;
}

async function loginUser({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError('Invalid email or password.', 401);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError('Invalid email or password.', 401);
  }

  if (!user.isVerified) {
    throw new AppError('Please verify your email before logging in.', 403);
  }

  const tokens = await issueTokenPair(user);

  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    tokens,
  };
}

async function forgotPassword({ email }) {
  const user = await prisma.user.findUnique({ where: { email } });
  // Do not reveal whether the email exists
  if (!user) return true;

  await createAndSendOtp(user, 'PASSWORD_RESET');
  return true;
}

async function resetPassword({ email, code, newPassword }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError('Invalid request.', 400);
  }

  await verifyOtpCode(user.id, code, 'PASSWORD_RESET');

  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  // Invalidate existing sessions after a password reset
  await revokeAllUserTokens(user.id);

  return true;
}

module.exports = {
  registerUser,
  verifyEmailOtp,
  resendOtp,
  loginUser,
  forgotPassword,
  resetPassword,
};
