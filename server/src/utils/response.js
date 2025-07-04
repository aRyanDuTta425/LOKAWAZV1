// Response utilities
/**
 * Success response
 * @param {Object} res - Express response object
 * @param {Object} data - Response data
 * @param {String} message - Success message
 * @param {Number} statusCode - HTTP status code
 */
const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Error response
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 * @param {Number} statusCode - HTTP status code
 * @param {Array} errors - Detailed error array
 */
const errorResponse = (res, message = 'Internal Server Error', statusCode = 500, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Validation error response
 * @param {Object} res - Express response object
 * @param {Array} errors - Validation errors
 * @param {String} message - Error message
 */
const validationErrorResponse = (res, errors, message = 'Validation failed') => {
  return res.status(400).json({
    success: false,
    message,
    errors: errors.map(error => ({
      field: error.path || error.param,
      message: error.msg || error.message,
      value: error.value,
    })),
    timestamp: new Date().toISOString(),
  });
};

/**
 * Pagination response
 * @param {Object} res - Express response object
 * @param {Array} data - Response data
 * @param {Object} pagination - Pagination info
 * @param {String} message - Success message
 */
const paginationResponse = (res, data, pagination, message = 'Success') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      currentPage: pagination.page,
      totalPages: Math.ceil(pagination.total / pagination.limit),
      totalItems: pagination.total,
      itemsPerPage: pagination.limit,
      hasNextPage: pagination.page < Math.ceil(pagination.total / pagination.limit),
      hasPrevPage: pagination.page > 1,
    },
    timestamp: new Date().toISOString(),
  });
};

/**
 * Unauthorized response
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 */
const unauthorizedResponse = (res, message = 'Unauthorized access') => {
  return errorResponse(res, message, 401);
};

/**
 * Forbidden response
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 */
const forbiddenResponse = (res, message = 'Access forbidden') => {
  return errorResponse(res, message, 403);
};

/**
 * Not found response
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 */
const notFoundResponse = (res, message = 'Resource not found') => {
  return errorResponse(res, message, 404);
};

module.exports = {
  successResponse,
  errorResponse,
  validationErrorResponse,
  paginationResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
};