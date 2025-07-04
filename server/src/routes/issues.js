// Issue routes
const express = require('express');
const router = express.Router();

// Import controllers
const issueController = require('../controllers/issueController');

// Import middleware
const { authenticate, optionalAuth } = require('../middleware/auth');
const { adminOnly, checkIssueOwnership } = require('../middleware/roleAuth');
const {
  validateIssueCreation,
  validateIssueUpdate,
  validateId,
  validatePagination,
  validateIssueFilters,
  validateCoordinates,
  handleValidationErrors,
} = require('../middleware/validation');
const { uploadSingle, handleUploadErrors, validateUpload } = require('../middleware/upload');
const { body } = require('express-validator');

/**
 * @route   POST /api/issues
 * @desc    Create a new issue
 * @access  Private
 */
router.post(
  '/',
  authenticate,
  uploadSingle,
  handleUploadErrors,
  validateUpload,
  validateIssueCreation,
  issueController.createIssue
);

/**
 * @route   GET /api/issues
 * @desc    Get all issues with filtering and pagination
 * @access  Public
 */
router.get(
  '/',
  optionalAuth,
  validatePagination,
  validateIssueFilters,
  issueController.getAllIssues
);

/**
 * @route   GET /api/issues/my
 * @desc    Get current user's issues
 * @access  Private
 */
router.get(
  '/my',
  authenticate,
  validatePagination,
  validateIssueFilters,
  issueController.getMyIssues
);

/**
 * @route   GET /api/issues/stats
 * @desc    Get issue statistics
 * @access  Private
 */
router.get(
  '/stats',
  authenticate,
  issueController.getIssueStats
);

/**
 * @route   GET /api/issues/nearby
 * @desc    Get nearby issues based on coordinates
 * @access  Public
 */
router.get(
  '/nearby',
  optionalAuth,
  validateCoordinates,
  validatePagination,
  issueController.getNearbyIssues
);

/**
 * @route   GET /api/issues/:id
 * @desc    Get issue by ID
 * @access  Public
 */
router.get(
  '/:id',
  optionalAuth,
  validateId,
  issueController.getIssueById
);

/**
 * @route   PUT /api/issues/:id
 * @desc    Update issue (Owner or Admin)
 * @access  Private
 */
router.put(
  '/:id',
  authenticate,
  validateId,
  uploadSingle,
  handleUploadErrors,
  validateUpload,
  validateIssueUpdate,
  issueController.updateIssue
);

/**
 * @route   DELETE /api/issues/:id
 * @desc    Delete issue (Owner or Admin)
 * @access  Private
 */
router.delete(
  '/:id',
  authenticate,
  validateId,
  issueController.deleteIssue
);

/**
 * @route   PATCH /api/issues/:id/status
 * @desc    Update issue status (Admin only)
 * @access  Private (Admin only)
 */
router.patch(
  '/:id/status',
  authenticate,
  adminOnly,
  validateId,
  [
    body('status')
      .isIn(['NEW', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'])
      .withMessage('Status must be NEW, IN_PROGRESS, RESOLVED, or REJECTED'),

    handleValidationErrors,
  ],
  issueController.updateIssueStatus
);

module.exports = router;
