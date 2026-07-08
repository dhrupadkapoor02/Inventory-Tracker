const { AppError } = require('./errorHandler');
const { verifyAccessToken } = require('../utils/token');

// Protects routes by verifying the access token cookie
function authenticate(req, res, next) {
  const { accessToken } = req.cookies;

  if (!accessToken) {
    return next(new AppError('Authentication required.', 401));
  }

  try {
    const payload = verifyAccessToken(accessToken);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch (err) {
    next(new AppError('Invalid or expired access token.', 401));
  }
}

// Restricts a route to specific roles, e.g. authorize('ADMIN')
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }
    next();
  };
}

module.exports = { authenticate, authorize };
