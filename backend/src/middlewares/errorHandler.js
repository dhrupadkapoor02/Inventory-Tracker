/* eslint-disable no-unused-vars */

class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// 404 handler - place after all routes
function notFoundHandler(req, res, next) {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
}

// Centralized error handler - must be last middleware
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal server error';

  if (process.env.NODE_ENV === 'development' && !err.isOperational) {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && !err.isOperational
      ? { stack: err.stack }
      : {}),
  });
}

module.exports = { AppError, notFoundHandler, errorHandler };
