const { errorResponse } = require('../utils/apiResponse');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error('[Error Handler]', err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    return errorResponse(res, 404, message);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    return errorResponse(res, 400, message);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message).join(', ');
    return errorResponse(res, 400, message);
  }

  // Multer file size limit exceeded
  if (err.code === 'LIMIT_FILE_SIZE') {
    return errorResponse(res, 400, 'File too large. Maximum allowed file size is 10MB.');
  }

  // Malformed JSON payload syntax error
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return errorResponse(res, 400, 'Invalid JSON payload format.');
  }

  return errorResponse(res, error.statusCode || 500, error.message || 'Server Error');
};

module.exports = errorHandler;
