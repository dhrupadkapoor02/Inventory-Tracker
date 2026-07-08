const { AppError } = require('./errorHandler');

// Validates req.body against a zod schema, replaces body with parsed/coerced data
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const message = result.error.issues.map((issue) => issue.message).join(', ');
    return next(new AppError(message, 400));
  }

  req.body = result.data;
  next();
};

module.exports = validate;
