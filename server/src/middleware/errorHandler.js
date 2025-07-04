// Global error handler middleware
const { errorResponse } = require('../utils/response');

/**
 * Global error handler middleware
 * Handles all errors thrown in the application
 */
const errorHandler = (error, req, res, next) => {
  console.error('Error details:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
  });

  // Default error
  let message = 'Internal Server Error';
  let statusCode = 500;
  let errors = null;

  // Handle different error types
  if (error.name === 'ValidationError') {
    message = 'Validation Error';
    statusCode = 400;
    errors = Object.values(error.errors).map(err => err.message);
  } else if (error.name === 'CastError') {
    message = 'Invalid ID format';
    statusCode = 400;
  } else if (error.name === 'JsonWebTokenError') {
    message = 'Invalid token';
    statusCode = 401;
  } else if (error.name === 'TokenExpiredError') {
    message = 'Token expired';
    statusCode = 401;
  } else if (error.name === 'MulterError') {
    message = 'File upload error';
    statusCode = 400;
    if (error.code === 'LIMIT_FILE_SIZE') {
      message = 'File too large';
    } else if (error.code === 'LIMIT_FILE_COUNT') {
      message = 'Too many files';
    }
  } else if (error.code === 'P2002') {
    // Prisma unique constraint error
    message = 'Duplicate entry. Resource already exists';
    statusCode = 409;
  } else if (error.code === 'P2025') {
    // Prisma record not found
    message = 'Resource not found';
    statusCode = 404;
  } else if (error.code === 'P2003') {
    // Prisma foreign key constraint error
    message = 'Invalid reference. Related resource not found';
    statusCode = 400;
  } else if (error.code === 'P2014') {
    // Prisma invalid ID error
    message = 'Invalid ID provided';
    statusCode = 400;
  } else if (error.code === 'ECONNREFUSED') {
    message = 'Database connection failed';
    statusCode = 503;
  } else if (error.type === 'entity.parse.failed') {
    message = 'Invalid JSON format';
    statusCode = 400;
  } else if (error.type === 'entity.too.large') {
    message = 'Request payload too large';
    statusCode = 413;
  } else if (error.message) {
    message = error.message;
    statusCode = error.statusCode || 500;
  }

  // Send error response
  return errorResponse(res, message, statusCode, errors);
};

/**
 * Handle 404 errors for unknown routes
 */
const notFoundHandler = (req, res) => {
  return errorResponse(res, `Route ${req.originalUrl} not found`, 404);
};

/**
 * Async error wrapper
 * Catches async errors and passes them to error handler
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Development error handler
 * Provides detailed error information in development mode
 */
const developmentErrorHandler = (error, req, res, next) => {
  console.error('Development Error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
    headers: req.headers,
    timestamp: new Date().toISOString(),
  });

  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal Server Error',
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
    },
    request: {
      url: req.url,
      method: req.method,
      body: req.body,
      params: req.params,
      query: req.query,
    },
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  developmentErrorHandler,
};