// Application constants

/**
 * HTTP Status Codes
 */
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

/**
 * User Roles
 */
const USER_ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
};

/**
 * Issue Status
 */
const ISSUE_STATUS = {
  NEW: 'NEW',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  REJECTED: 'REJECTED',
};

/**
 * Issue Priority Levels
 */
const PRIORITY_LEVELS = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
};

/**
 * Issue Categories
 */
const ISSUE_CATEGORIES = {
  INFRASTRUCTURE: 'INFRASTRUCTURE',
  HEALTH: 'HEALTH',
  EDUCATION: 'EDUCATION',
  ENVIRONMENT: 'ENVIRONMENT',
  SAFETY: 'SAFETY',
  TRANSPORTATION: 'TRANSPORTATION',
  UTILITIES: 'UTILITIES',
  GOVERNANCE: 'GOVERNANCE',
  OTHER: 'OTHER',
};

/**
 * File Upload Constants
 */
const FILE_UPLOAD = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_FILES: 3,
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  CLOUDINARY_FOLDER: 'lok-awaaz/issues',
};

/**
 * Pagination Constants
 */
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1,
};

/**
 * JWT Constants
 */
const JWT = {
  DEFAULT_EXPIRES_IN: '7d',
  REFRESH_EXPIRES_IN: '30d',
  ALGORITHM: 'HS256',
};

/**
 * Rate Limiting Constants
 */
const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100, // per window
  AUTH_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  AUTH_MAX_REQUESTS: 5, // login attempts per window
  UPLOAD_WINDOW_MS: 60 * 1000, // 1 minute
  UPLOAD_MAX_REQUESTS: 10, // upload attempts per window
};

/**
 * Validation Constants
 */
const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  TITLE_MIN_LENGTH: 5,
  TITLE_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
  CATEGORY_MIN_LENGTH: 2,
  CATEGORY_MAX_LENGTH: 50,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  NAME_REGEX: /^[a-zA-Z\s]+$/,
};

/**
 * Geolocation Constants
 */
const GEOLOCATION = {
  MIN_LATITUDE: -90,
  MAX_LATITUDE: 90,
  MIN_LONGITUDE: -180,
  MAX_LONGITUDE: 180,
  DEFAULT_RADIUS: 5, // km
  MAX_RADIUS: 50, // km
  MIN_RADIUS: 0.1, // km
};

/**
 * Database Constants
 */
const DATABASE = {
  CONNECTION_TIMEOUT: 10000, // 10 seconds
  QUERY_TIMEOUT: 30000, // 30 seconds
  MAX_CONNECTIONS: 10,
  IDLE_TIMEOUT: 300000, // 5 minutes
};

/**
 * Error Messages
 */
const ERROR_MESSAGES = {
  // Authentication
  INVALID_CREDENTIALS: 'Invalid email or password',
  TOKEN_EXPIRED: 'Token expired. Please login again',
  TOKEN_INVALID: 'Invalid token',
  TOKEN_REQUIRED: 'Access token required',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  
  // Validation
  VALIDATION_FAILED: 'Validation failed',
  INVALID_EMAIL: 'Please provide a valid email address',
  WEAK_PASSWORD: 'Password does not meet security requirements',
  REQUIRED_FIELD: 'This field is required',
  INVALID_ID: 'Invalid ID format',
  
  // Resource
  USER_NOT_FOUND: 'User not found',
  ISSUE_NOT_FOUND: 'Issue not found',
  RESOURCE_NOT_FOUND: 'Resource not found',
  DUPLICATE_EMAIL: 'Email address already exists',
  
  // File Upload
  FILE_TOO_LARGE: 'File size too large',
  INVALID_FILE_TYPE: 'Invalid file type',
  UPLOAD_FAILED: 'File upload failed',
  TOO_MANY_FILES: 'Too many files uploaded',
  
  // Database
  DATABASE_ERROR: 'Database operation failed',
  CONNECTION_FAILED: 'Database connection failed',
  
  // Server
  INTERNAL_ERROR: 'Internal server error',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later',
};

/**
 * Success Messages
 */
const SUCCESS_MESSAGES = {
  // Authentication
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  REGISTER_SUCCESS: 'Registration successful',
  TOKEN_REFRESHED: 'Token refreshed successfully',
  
  // User
  PROFILE_UPDATED: 'Profile updated successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
  ACCOUNT_DELETED: 'Account deleted successfully',
  
  // Issue
  ISSUE_CREATED: 'Issue reported successfully',
  ISSUE_UPDATED: 'Issue updated successfully',
  ISSUE_DELETED: 'Issue deleted successfully',
  STATUS_UPDATED: 'Issue status updated successfully',
  
  // File Upload
  FILE_UPLOADED: 'File uploaded successfully',
  FILE_DELETED: 'File deleted successfully',
  
  // General
  OPERATION_SUCCESS: 'Operation completed successfully',
  DATA_RETRIEVED: 'Data retrieved successfully',
};

/**
 * API Response Formats
 */
const RESPONSE_FORMATS = {
  SUCCESS: {
    success: true,
    message: '',
    data: null,
    timestamp: '',
  },
  ERROR: {
    success: false,
    message: '',
    errors: null,
    timestamp: '',
  },
  PAGINATION: {
    success: true,
    message: '',
    data: [],
    pagination: {
      currentPage: 0,
      totalPages: 0,
      totalItems: 0,
      itemsPerPage: 0,
      hasNextPage: false,
      hasPrevPage: false,
    },
    timestamp: '',
  },
};

/**
 * Environment Constants
 */
const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TEST: 'test',
};

/**
 * Default Configuration Values
 */
const DEFAULTS = {
  PORT: 5000,
  NODE_ENV: 'development',
  CORS_ORIGIN: 'http://localhost:3000',
  JWT_EXPIRES_IN: '7d',
  PAGINATION_LIMIT: 10,
  UPLOAD_MAX_SIZE: 5242880, // 5MB
};

/**
 * Regular Expressions
 */
const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  NAME: /^[a-zA-Z\s]+$/,
  PHONE: /^\+?[\d\s\-\(\)]+$/,
  URL: /^https?:\/\/.+$/,
  COORDINATE: /^-?\d+\.?\d*$/,
};

/**
 * Time Constants (in milliseconds)
 */
const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000,
};

module.exports = {
  HTTP_STATUS,
  USER_ROLES,
  ISSUE_STATUS,
  PRIORITY_LEVELS,
  ISSUE_CATEGORIES,
  FILE_UPLOAD,
  PAGINATION,
  JWT,
  RATE_LIMIT,
  VALIDATION,
  GEOLOCATION,
  DATABASE,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  RESPONSE_FORMATS,
  ENVIRONMENTS,
  DEFAULTS,
  REGEX_PATTERNS,
  TIME,
};
