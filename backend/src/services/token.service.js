const prisma = require('../config/db');
const { AppError } = require('../middlewares/errorHandler');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
  getRefreshTokenExpiryDate,
} = require('../utils/token');

// Issues a new access + refresh token pair, persisting the hashed refresh token
async function issueTokenPair(user) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  await prisma.refreshToken.create({
    data: {
      token: hashToken(refreshToken),
      userId: user.id,
      expiresAt: getRefreshTokenExpiryDate(),
    },
  });

  return { accessToken, refreshToken };
}

// Verifies an incoming refresh token, rotates it, and returns a new pair
async function rotateRefreshToken(refreshToken) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (err) {
    throw new AppError('Invalid or expired refresh token.', 401);
  }

  const tokenHash = hashToken(refreshToken);
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: tokenHash },
  });

  if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
    throw new AppError('Refresh token is no longer valid. Please log in again.', 401);
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) {
    throw new AppError('User not found.', 401);
  }

  // Revoke the used token (rotation) and issue a new pair
  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { revoked: true },
  });

  return issueTokenPair(user);
}

// Revokes a single refresh token (logout)
async function revokeRefreshToken(refreshToken) {
  const tokenHash = hashToken(refreshToken);
  await prisma.refreshToken.updateMany({
    where: { token: tokenHash },
    data: { revoked: true },
  });
}

// Revokes all refresh tokens for a user (e.g. after password reset)
async function revokeAllUserTokens(userId) {
  await prisma.refreshToken.updateMany({
    where: { userId, revoked: false },
    data: { revoked: true },
  });
}

module.exports = {
  issueTokenPair,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
};
