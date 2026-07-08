const prisma = require('../config/db');
const { AppError } = require('../middlewares/errorHandler');
const { generateOtpCode, getOtpExpiry } = require('../utils/otp');
const { sendOtpEmail } = require('./email.service');

// Creates a fresh OTP for a user + purpose and emails it
async function createAndSendOtp(user, purpose) {
  const code = generateOtpCode();

  await prisma.otp.create({
    data: {
      userId: user.id,
      code,
      purpose,
      expiresAt: getOtpExpiry(),
    },
  });

  await sendOtpEmail(user.email, code, purpose);
}

// Validates an OTP code against the most recent matching, unconsumed record
async function verifyOtpCode(userId, code, purpose) {
  const otp = await prisma.otp.findFirst({
    where: { userId, purpose, consumed: false },
    orderBy: { createdAt: 'desc' },
  });

  if (!otp) {
    throw new AppError('No active OTP found. Please request a new one.', 400);
  }

  if (otp.expiresAt < new Date()) {
    throw new AppError('OTP has expired. Please request a new one.', 400);
  }

  if (otp.code !== code) {
    throw new AppError('Invalid OTP code.', 400);
  }

  await prisma.otp.update({
    where: { id: otp.id },
    data: { consumed: true },
  });

  return true;
}

module.exports = { createAndSendOtp, verifyOtpCode };
