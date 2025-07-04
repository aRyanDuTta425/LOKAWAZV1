// Admin routes
const express = require('express');
const router = express.Router();

// Import controllers
const adminController = require('../controllers/adminController');

// Import middleware
const { authenticate } = require('../middleware/auth');
const { adminOnly } = require('../middleware/roleAuth');
const {
  validateId,
  validatePagination,
  validateIssueFilters,
  handleValidationErrors,
} = require('../middleware/validation');
const { body } = require('express-validator');

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(adminOnly);

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with filtering and pagination (Admin only)
 * @access  Private (Admin only)
 */
router.get(
  '/users',
  validatePagination,
  adminController.getAllUsers
);

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get user details with statistics (Admin only)
 * @access  Private (Admin only)
 */
router.get(
  '/users/:id',
  validateId,
  adminController.getUserDetails
);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete any user (Admin only)
 * @access  Private (Admin only)
 */
router.delete(
  '/users/:id',
  validateId,
  adminController.deleteAnyUser
);

/**
 * @route   PUT /api/admin/users/:id/role
 * @desc    Update user role (Admin only)
 * @access  Private (Admin only)
 */
router.put(
  '/users/:id/role',
  validateId,
  [
    body('role')
      .isIn(['USER', 'ADMIN'])
      .withMessage('Role must be either USER or ADMIN'),

    handleValidationErrors,
  ],
  adminController.updateUserRole
);

/**
 * @route   GET /api/admin/issues
 * @desc    Get all issues with filtering and pagination (Admin only)
 * @access  Private (Admin only)
 */
router.get(
  '/issues',
  validatePagination,
  validateIssueFilters,
  adminController.getAllIssues
);

/**
 * @route   GET /api/admin/issues/:id
 * @desc    Get issue details (Admin only)
 * @access  Private (Admin only)
 */
router.get(
  '/issues/:id',
  validateId,
  adminController.getIssueDetails
);

/**
 * @route   DELETE /api/admin/issues/:id
 * @desc    Delete any issue (Admin only)
 * @access  Private (Admin only)
 */
router.delete(
  '/issues/:id',
  validateId,
  adminController.deleteAnyIssue
);

/**
 * @route   PATCH /api/admin/issues/:id/status
 * @desc    Update issue status (Admin only)
 * @access  Private (Admin only)
 */
router.patch(
  '/issues/:id/status',
  validateId,
  [
    body('status')
      .isIn(['NEW', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'])
      .withMessage('Status must be NEW, IN_PROGRESS, RESOLVED, or REJECTED'),

    handleValidationErrors,
  ],
  adminController.updateIssueStatus
);

/**
 * @route   PATCH /api/admin/issues/bulk-status
 * @desc    Bulk update issue status (Admin only)
 * @access  Private (Admin only)
 */
router.patch(
  '/issues/bulk-status',
  [
    body('issueIds')
      .isArray({ min: 1 })
      .withMessage('Issue IDs array is required and must not be empty'),

    body('issueIds.*')
      .isLength({ min: 1 })
      .withMessage('Each issue ID must be a valid string'),

    body('status')
      .isIn(['NEW', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'])
      .withMessage('Status must be NEW, IN_PROGRESS, RESOLVED, or REJECTED'),

    handleValidationErrors,
  ],
  adminController.bulkUpdateIssueStatus
);

/**
 * @route   GET /api/admin/stats
 * @desc    Get system statistics (Admin only)
 * @access  Private (Admin only)
 */
router.get(
  '/stats',
  adminController.getSystemStats
);

module.exports = router;
