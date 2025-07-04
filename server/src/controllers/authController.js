// Authentication controller
const authService = require('../services/authService');
const { successResponse, errorResponse, validationErrorResponse } = require('../utils/response');
const { HTTP_STATUS } = require('../utils/constants');

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Call auth service to register user
    const result = await authService.registerUser({ name, email, password, role });

    return successResponse(
      res,
      {
        user: result.user,
        token: result.token,
      },
      result.message,
      HTTP_STATUS.CREATED
    );

  } catch (error) {
    console.error('Register controller error:', error);
    
    // Handle specific errors
    if (error.message.includes('already exists') || error.message.includes('Duplicate')) {
      return errorResponse(res, error.message, HTTP_STATUS.CONFLICT);
    }
    
    return errorResponse(res, error.message, HTTP_STATUS.BAD_REQUEST);
  }
};

/**
 * Login user
 * @route POST /api/auth/login
 * @access Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Call auth service to login user
    const result = await authService.loginUser(email, password);

    return successResponse(
      res,
      {
        user: result.user,
        token: result.token,
      },
      result.message,
      HTTP_STATUS.OK
    );

  } catch (error) {
    console.error('Login controller error:', error);
    
    // Handle authentication errors
    if (error.message.includes('Invalid') || error.message.includes('credentials')) {
      return errorResponse(res, error.message, HTTP_STATUS.UNAUTHORIZED);
    }
    
    return errorResponse(res, error.message, HTTP_STATUS.BAD_REQUEST);
  }
};

/**
 * Get current user profile
 * @route GET /api/auth/profile
 * @access Private
 */
const getProfile = async (req, res) => {
  try {
    const userId = req.userId;

    // Get user profile from auth service
    const result = await authService.getUserProfile(userId);

    return successResponse(res, result.user, result.message);

  } catch (error) {
    console.error('Get profile controller error:', error);
    
    if (error.message.includes('not found')) {
      return errorResponse(res, error.message, HTTP_STATUS.NOT_FOUND);
    }
    
    return errorResponse(res, error.message, HTTP_STATUS.BAD_REQUEST);
  }
};

/**
 * Change user password
 * @route PUT /api/auth/change-password
 * @access Private
 */
const changePassword = async (req, res) => {
  try {
    const userId = req.userId;
    const { currentPassword, newPassword } = req.body;

    // Call auth service to change password
    const result = await authService.changePassword(userId, currentPassword, newPassword);

    return successResponse(res, null, result.message);

  } catch (error) {
    console.error('Change password controller error:', error);
    
    if (error.message.includes('Current password') || error.message.includes('incorrect')) {
      return errorResponse(res, error.message, HTTP_STATUS.UNAUTHORIZED);
    }
    
    if (error.message.includes('not found')) {
      return errorResponse(res, error.message, HTTP_STATUS.NOT_FOUND);
    }
    
    return errorResponse(res, error.message, HTTP_STATUS.BAD_REQUEST);
  }
};

/**
 * Refresh JWT token
 * @route POST /api/auth/refresh
 * @access Private
 */
const refreshToken = async (req, res) => {
  try {
    const userId = req.userId;

    // Call auth service to refresh token
    const result = await authService.refreshToken(userId);

    return successResponse(res, { token: result.token }, result.message);

  } catch (error) {
    console.error('Refresh token controller error:', error);
    
    if (error.message.includes('not found')) {
      return errorResponse(res, error.message, HTTP_STATUS.NOT_FOUND);
    }
    
    return errorResponse(res, error.message, HTTP_STATUS.BAD_REQUEST);
  }
};

/**
 * Verify user token
 * @route GET /api/auth/verify
 * @access Private
 */
const verifyToken = async (req, res) => {
  try {
    const userId = req.userId;

    // Call auth service to verify user
    const result = await authService.verifyUser(userId);

    return successResponse(res, result.user, result.message);

  } catch (error) {
    console.error('Verify token controller error:', error);
    
    if (error.message.includes('not found')) {
      return errorResponse(res, error.message, HTTP_STATUS.NOT_FOUND);
    }
    
    return errorResponse(res, error.message, HTTP_STATUS.UNAUTHORIZED);
  }
};

/**
 * Delete user account
 * @route DELETE /api/auth/account
 * @access Private
 */
const deleteAccount = async (req, res) => {
  try {
    const userId = req.userId;
    const { password } = req.body;

    // Call auth service to delete account
    const result = await authService.deleteAccount(userId, password);

    return successResponse(res, null, result.message);

  } catch (error) {
    console.error('Delete account controller error:', error);
    
    if (error.message.includes('Password') || error.message.includes('incorrect')) {
      return errorResponse(res, error.message, HTTP_STATUS.UNAUTHORIZED);
    }
    
    if (error.message.includes('not found')) {
      return errorResponse(res, error.message, HTTP_STATUS.NOT_FOUND);
    }
    
    return errorResponse(res, error.message, HTTP_STATUS.BAD_REQUEST);
  }
};

/**
 * Logout user (client-side token removal)
 * @route POST /api/auth/logout
 * @access Private
 */
const logout = async (req, res) => {
  try {
    // Since we're using stateless JWT, logout is handled client-side
    // Server just acknowledges the logout request
    
    return successResponse(res, null, 'Logout successful');

  } catch (error) {
    console.error('Logout controller error:', error);
    return errorResponse(res, error.message, HTTP_STATUS.BAD_REQUEST);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  changePassword,
  refreshToken,
  verifyToken,
  deleteAccount,
  logout,
};
