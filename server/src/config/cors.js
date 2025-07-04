// CORS configuration
const cors = require('cors');

/**
 * CORS configuration options
 */
const corsOptions = {
  // Allow requests from frontend origin
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Allowed origins
    const allowedOrigins = [
      process.env.CORS_ORIGIN || 'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173', // Vite dev server
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
    ];

    // In production, add your deployed frontend URLs
    if (process.env.NODE_ENV === 'production') {
      allowedOrigins.push(
        'https://your-frontend-domain.com',
        'https://www.your-frontend-domain.com'
      );
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS policy'));
    }
  },

  // Allowed HTTP methods
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],

  // Allowed headers
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-Access-Token',
  ],

  // Allow credentials (cookies, authorization headers)
  credentials: true,

  // Preflight cache duration (24 hours)
  maxAge: 86400,

  // Handle preflight requests
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

/**
 * Development CORS configuration (more permissive)
 */
const devCorsOptions = {
  origin: true, // Allow all origins in development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: '*',
  credentials: true,
  maxAge: 86400,
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

/**
 * Production CORS configuration (restrictive)
 */
const prodCorsOptions = {
  origin: [
    process.env.CORS_ORIGIN,
    'https://your-frontend-domain.com',
    'https://www.your-frontend-domain.com',
  ].filter(Boolean), // Remove undefined values
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
  ],
  credentials: true,
  maxAge: 86400,
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

/**
 * Get CORS configuration based on environment
 * @returns {Object} CORS configuration
 */
const getCorsConfig = () => {
  switch (process.env.NODE_ENV) {
    case 'production':
      return prodCorsOptions;
    case 'development':
      return devCorsOptions;
    default:
      return corsOptions;
  }
};

/**
 * CORS middleware with dynamic configuration
 */
const corsMiddleware = cors(getCorsConfig());

/**
 * Custom CORS handler for specific routes
 * @param {Array} allowedOrigins - Specific origins for this route
 * @returns {Function} CORS middleware
 */
const customCors = (allowedOrigins = []) => {
  return cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS policy'));
      }
    },
    credentials: true,
  });
};

/**
 * CORS configuration for file uploads
 */
const uploadCorsOptions = {
  ...corsOptions,
  // Increase maxAge for file upload routes
  maxAge: 3600, // 1 hour
};

/**
 * Validate CORS configuration
 */
const validateCorsConfig = () => {
  const config = getCorsConfig();
  
  if (process.env.NODE_ENV === 'production' && !process.env.CORS_ORIGIN) {
    console.warn('⚠️  CORS_ORIGIN not set in production environment');
    return false;
  }
  
  console.log('✅ CORS configuration is valid');
  console.log('Allowed origins:', 
    typeof config.origin === 'function' ? 'Dynamic (function)' : config.origin
  );
  
  return true;
};

module.exports = {
  corsOptions,
  devCorsOptions,
  prodCorsOptions,
  corsMiddleware,
  customCors,
  uploadCorsOptions,
  getCorsConfig,
  validateCorsConfig,
};
