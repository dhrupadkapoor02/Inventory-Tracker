const ms = require('ms');
const env = require('../config/env');

function baseCookieOptions() {
  return {
    httpOnly: true,
    secure: env.cookie.secure,
    sameSite: env.cookie.secure ? 'none' : 'lax',
    path: '/',
  };
}

function setAuthCookies(res, { accessToken, refreshToken }) {
  res.cookie('accessToken', accessToken, {
    ...baseCookieOptions(),
    maxAge: ms(env.jwt.accessExpiresIn),
  });
  res.cookie('refreshToken', refreshToken, {
    ...baseCookieOptions(),
    maxAge: ms(env.jwt.refreshExpiresIn),
  });
}

function clearAuthCookies(res) {
  res.clearCookie('accessToken', baseCookieOptions());
  res.clearCookie('refreshToken', baseCookieOptions());
}

module.exports = { setAuthCookies, clearAuthCookies };
