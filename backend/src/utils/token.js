const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const ms = require('ms');
const env = require('../config/env');

function signAccessToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiresIn,
  });
}

function signRefreshToken(user) {
  return jwt.sign({ sub: user.id }, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn,
  });
}

function verifyAccessToken(token) {
  return jwt.verify(token, env.jwt.accessSecret);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwt.refreshSecret);
}

// Refresh tokens are stored hashed in the DB so a leaked DB doesn't expose usable tokens
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Converts JWT expiresIn (e.g. "7d") duration into a JS Date for DB storage
function getRefreshTokenExpiryDate() {
  return new Date(Date.now() + ms(env.jwt.refreshExpiresIn));
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
  getRefreshTokenExpiryDate,
};
