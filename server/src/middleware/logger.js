// Request logging middleware
const fs = require('fs');
const path = require('path');

/**
 * Custom request logger middleware
 * Logs incoming requests with details
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Log request start
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔄 ${req.method} ${req.url} - ${req.ip}`);
  }

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Log request completion
    if (process.env.NODE_ENV === 'development') {
      const statusColor = res.statusCode < 400 ? '\x1b[32m' : '\x1b[31m';
      console.log(`${statusColor}✅ ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms\x1b[0m`);
    }

    // Call original end
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

/**
 * API request logger for production
 * Logs to file in production environment
 */
const apiLogger = (req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    const logData = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.userId || null,
    };

    // Create logs directory if it doesn't exist
    const logsDir = path.join(__dirname, '../../logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    // Append to log file
    const logFile = path.join(logsDir, `api-${new Date().toISOString().split('T')[0]}.log`);
    fs.appendFileSync(logFile, JSON.stringify(logData) + '\n');
  }

  next();
};

/**
 * Error logger middleware
 * Logs errors to file
 */
const errorLogger = (error, req, res, next) => {
  const logData = {
    timestamp: new Date().toISOString(),
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
    },
    request: {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.userId || null,
    },
  };

  // Always log errors to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('🚨 Error occurred:', logData);
  }

  // Log to file in production
  if (process.env.NODE_ENV === 'production') {
    const logsDir = path.join(__dirname, '../../logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    const errorLogFile = path.join(logsDir, `error-${new Date().toISOString().split('T')[0]}.log`);
    fs.appendFileSync(errorLogFile, JSON.stringify(logData) + '\n');
  }

  next(error);
};

/**
 * Performance monitoring middleware
 * Tracks slow requests
 */
const performanceLogger = (req, res, next) => {
  const startTime = process.hrtime();

  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(startTime);
    const duration = seconds * 1000 + nanoseconds / 1000000; // Convert to milliseconds

    // Log slow requests (> 1 second)
    if (duration > 1000) {
      console.warn(`⚠️  Slow request: ${req.method} ${req.url} took ${duration.toFixed(2)}ms`);
    }
  });

  next();
};

module.exports = {
  requestLogger,
  apiLogger,
  errorLogger,
  performanceLogger,
};
