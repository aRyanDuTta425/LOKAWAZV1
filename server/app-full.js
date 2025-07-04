// Main Express application configuration
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

// Import routes
const apiRoutes = require('./src/routes');

// Import middleware
const { requestLogger } = require('./src/middleware/logger');

// Create Express app
const app = express();

// Trust proxy for rate limiting and security
app.set('trust proxy', 1);

// Security middleware - Helmet for basic security headers
app.use(helmet({
  crossOriginEmbedderPolicy: false, // Allow embedding for development
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
    },
  },
}));

// Compression middleware
app.use(compression());

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
      process.env.FRONTEND_URL,
      process.env.CLIENT_URL,
    ].filter(Boolean); // Remove undefined values

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma',
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400, // 24 hours
};

app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Limit each IP
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: 15 * 60, // 15 minutes in seconds
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
  // Skip rate limiting for certain routes
  skip: (req) => {
    const skipPaths = ['/api/health', '/api/'];
    return skipPaths.includes(req.path);
  },
});

app.use('/api/', limiter);

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Custom request logger
app.use(requestLogger);

// Body parsing middleware
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({
        success: false,
        error: 'Invalid JSON in request body',
      });
      throw new Error('Invalid JSON');
    }
  }
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));

// Static file serving (if needed)
app.use('/uploads', express.static('uploads'));

// Health check endpoint (before rate limiting)
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Lok Awaaz API is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
  });
});

// API routes
app.use('/api', apiRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Lok Awaaz API',
    description: 'Civic Issue Tracker Backend API',
    version: '1.0.0',
    documentation: {
      health: '/health',
      api: '/api',
      endpoints: {
        auth: '/api/auth',
        users: '/api/users',
        issues: '/api/issues',
        admin: '/api/admin',
      },
    },
    timestamp: new Date().toISOString(),
  });
});

// 404 handler for unknown routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString(),
  });
});

// Global error handler (must be last)
app.use((error, req, res, next) => {
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

  // Handle different error types
  if (error.name === 'ValidationError') {
    message = 'Validation Error';
    statusCode = 400;
  } else if (error.name === 'JsonWebTokenError') {
    message = 'Invalid token';
    statusCode = 401;
  } else if (error.name === 'TokenExpiredError') {
    message = 'Token expired';
    statusCode = 401;
  } else if (error.code === 'P2002') {
    message = 'Duplicate entry. Resource already exists';
    statusCode = 409;
  } else if (error.code === 'P2025') {
    message = 'Resource not found';
    statusCode = 404;
  } else if (error.message) {
    message = error.message;
    statusCode = error.statusCode || 500;
  }

  res.status(statusCode).json({
    success: false,
    message,
    timestamp: new Date().toISOString(),
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = app;
