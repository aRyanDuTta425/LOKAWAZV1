// User routes
const express = require('express');
const router = express.Router();

// Import controllers
const userController = require('../controllers/userController');

// Import middleware
const { authenticate } = require('../middleware/auth');
const { authorizeRoles, adminOnly, checkResourceOwnership } = require('../middleware/roleAuth');
const {
  validateId,
  validatePagination,
  handleValidationErrors,
} = require('../middleware/validation');
const { body } = require('express-validator');

/**
 * @route   GET /api/users/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get(
  '/profile',
  authenticate,
  userController.getCurrentUser
);

/**
 * @route   PUT /api/users/profile
 * @desc    Update current user profile
 * @access  Private
 */
router.put(
  '/profile',
  authenticate,
  [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters')
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage('Name must contain only letters and spaces'),

    body('email')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),

    handleValidationErrors,
  ],
  userController.updateUser
);

/**
 * @route   DELETE /api/users/profile
 * @desc    Delete current user account
 * @access  Private
 */
router.delete(
  '/profile',
  authenticate,
  userController.deleteUser
);

/**
 * @route   GET /api/users/:id/stats
 * @desc    Get user statistics
 * @access  Private (Own stats or Admin)
 */
router.get(
  '/:id/stats',
  authenticate,
  validateId,
  userController.getUserStats
);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private
 */
router.get(
  '/:id',
  authenticate,
  validateId,
  userController.getUserById
);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user by ID (Admin or own profile)
 * @access  Private
 */
router.put(
  '/:id',
  authenticate,
  validateId,
  [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters')
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage('Name must contain only letters and spaces'),

    body('email')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),

    handleValidationErrors,
  ],
  userController.updateUserById
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user by ID (Admin or own account)
 * @access  Private
 */
router.delete(
  '/:id',
  authenticate,
  validateId,
  userController.deleteUserById
);

/**
 * @route   PUT /api/users/:id/role
 * @desc    Update user role (Admin only)
 * @access  Private (Admin only)
 */
router.put(
  '/:id/role',
  authenticate,
  adminOnly,
  validateId,
  [
    body('role')
      .isIn(['USER', 'ADMIN'])
      .withMessage('Role must be either USER or ADMIN'),

    handleValidationErrors,
  ],
  userController.updateUserRole
);

/**
 * @route   GET /api/users
 * @desc    Get all users with filtering and pagination (Admin only)
 * @access  Private (Admin only)
 */
router.get(
  '/',
  authenticate,
  adminOnly,
  validatePagination,
  userController.getAllUsers
);

/**
 * @route   GET /api/users/role/:role
 * @desc    Get users by role (Admin only)
 * @access  Private (Admin only)
 */
router.get(
  '/role/:role',
  authenticate,
  adminOnly,
  [
    body('role')
      .isIn(['USER', 'ADMIN'])
      .withMessage('Role must be either USER or ADMIN'),

    handleValidationErrors,
  ],
  validatePagination,
  userController.getUsersByRole
);

module.exports = router;
