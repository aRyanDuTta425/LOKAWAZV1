// Routes index - Main router configuration
const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const userRoutes = require('./users');
const issueRoutes = require('./issues');
const adminRoutes = require('./admin');

/**
 * API Health Check
 * @route   GET /api/health
 * @desc    Check API health status
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Lok Awaaz API is running successfully',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
});

/**
 * API Documentation Info
 * @route   GET /api
 * @desc    Get API information
 * @access  Public
 */
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Lok Awaaz API',
    description: 'Civic Issue Tracker Backend API',
    version: '1.0.0',
    documentation: '/api/health',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      issues: '/api/issues',
      admin: '/api/admin',
    },
    timestamp: new Date().toISOString(),
  });
});

// Mount route modules
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/issues', issueRoutes);
router.use('/admin', adminRoutes);

// Handle 404 for unknown API routes
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
