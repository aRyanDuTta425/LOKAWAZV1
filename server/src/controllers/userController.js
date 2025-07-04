// User controller
const userService = require('../services/userService');
const { successResponse, errorResponse, paginationResponse } = require('../utils/response');
const { HTTP_STATUS, PAGINATION } = require('../utils/constants');

/**
 * Get current user profile
 * @route GET /api/users/profile
 * @access Private
 */
const getCurrentUser = async (req, res) => {
  try {
    // User data is already available from auth middleware
    const user = req.user;

    return successResponse(res, user, 'Current user profile retrieved successfully');

  } catch (error) {
    console.error('Get current user controller error:', error);
    return errorResponse(res, error.message, HTTP_STATUS.BAD_REQUEST);
  }
};

/**
 * Get user by ID
 * @route GET /api/users/:id
 * @access Private
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Call user service to get user by ID
    const result = await userService.getUserById(id);

    return successResponse(res, result.user, result.message);

  } catch (error) {
    console.error('Get user by ID controller error:', error);
    
    if (error.message.includes('not found')) {
      return errorResponse(res, error.message, HTTP_STATUS.NOT_FOUND);
    }
    
    return errorResponse(res, error.message, HTTP_STATUS.BAD_REQUEST);
  }
};

/**
 * Update user profile
 * @route PUT /api/users/profile
 * @access Private
 */
const updateUser = async (req, res) => {
  try {
    const userId = req.userId;
    const updateData = req.body;

    // Call user service to update user
    const result = await userService.updateUser(userId, updateData);

    return successResponse(res, result.user, result.message);

  } catch (error) {
    console.error('Update user controller error:', error);
    
    if (error.message.includes('already exists') || error.message.includes('Duplicate')) {
      return errorResponse(res, error.message, HTTP_STATUS.CONFLICT);
    }
    
    if (error.message.includes('not found')) {
      return errorResponse(res, error.message, HTTP_STATUS.NOT_FOUND);
    }
    
    return errorResponse(res, error.message, HTTP_STATUS.BAD_REQUEST);
  }
};

/**
 * Update specific user by ID (Admin or own profile)
 * @route PUT /api/users/:id
 * @access Private
 */
const updateUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const requestingUserId = req.userId;
    const userRole = req.userRole;

    // Check if user is updating their own profile or is an admin
    if (id !== requestingUserId && userRole !== 'ADMIN') {
      return errorResponse(res, 'You can only update your own profile', HTTP_STATUS.FORBIDDEN);
    }

    // Call user service to update user
    const result = await userService.updateUser(id, updateData);

    return successResponse(res, result.user, result.message);

  } catch (error) {
    console.error('Update user by ID controller error:', error);
    
    if (error.message.includes('already exists') || error.message.includes('Duplicate')) {
      return errorResponse(res, error.message, HTTP_STATUS.CONFLICT);
    }
    
    if (error.message.includes('not found')) {
      return errorResponse(res, error.message, HTTP_STATUS.NOT_FOUND);
    }
    
    return errorResponse(res, error.message, HTTP_STATUS.BAD_REQUEST);
  }
};

/**
 * Delete user account
 * @route DELETE /api/users/profile
 * @access Private
 */
const deleteUser = async (req, res) => {
  try {
    const userId = req.userId;

    // Call user service to delete user
    const result = await userService.deleteUser(userId);

    return successResponse(res, null, result.message);

  } catch (error) {
    console.error('Delete user controller error:', error);
    
    if (error.message.includes('not found')) {
      return errorResponse(res, error.message, HTTP_STATUS.NOT_FOUND);
    }
    
    return errorResponse(res, error.message, HTTP_STATUS.BAD_REQUEST);
  }
};

/**
 * Delete user by ID (Admin or own account)
 * @route DELETE /api/users/:id
 * @access Private
 */
const deleteUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const requestingUserId = req.userId;
    const userRole = req.userRole;

    // Check if user is deleting their own account or is an admin
    if (id !== requestingUserId && userRole !== 'ADMIN') {
      return errorResponse(res, 'You can only delete your own account', HTTP_STATUS.FORBIDDEN);
    }

    // Call user service to delete user
    const result = await userService.deleteUser(id);

    return successResponse(res, null, result.message);

  } catch (error) {
    console.error('Delete user by ID controller error:', error);
    
    if (error.message.includes('not found')) {
      return errorResponse(res, error.message, HTTP_STATUS.NOT_FOUND);
    }
    
    return errorResponse(res, error.message, HTTP_STATUS.BAD_REQUEST);
  }
};

/**
 * Get all users with filtering and pagination
 * @route GET /api/users
 * @access Private (Admin only)
 */
const getAllUsers = async (req, res) => {
  try {
    const {
      role,
      search,
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
    } = req.query;

    // Parse pagination parameters
    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), PAGINATION.MAX_LIMIT);

    // Call user service to get all users
    const result = await userService.getAllUsers(
      { role, search },
      { page: pageNum, limit: limitNum }
    );

    return paginationResponse(res, result.users, result.pagination, result.message);

  } catch (error) {
    console.error('Get all users controller error:', error);
    return errorResponse(res, error.message, HTTP_STATUS.BAD_REQUEST);
  }
};

/**
 * Get user statistics
 * @route GET /api/users/:id/stats
 * @access Private
 */
const getUserStats = async (req, res) => {
  try {
    const { id } = req.params;
    const requestingUserId = req.userId;
    const userRole = req.userRole;

    // Check if user is requesting their own stats or is an admin
    if (id !== requestingUserId && userRole !== 'ADMIN') {
      return errorResponse(res, 'You can only view your own statistics', HTTP_STATUS.FORBIDDEN);
    }

    // Call user service to get user stats
    const result = await userService.getUserStats(id);

    return successResponse(res, result.user, result.message);

  } catch (error) {
    console.error('Get user stats controller error:', error);
    
    if (error.message.includes('not found')) {
      return errorResponse(res, error.message, HTTP_STATUS.NOT_FOUND);
    }
    
    return errorResponse(res, error.message, HTTP_STATUS.BAD_REQUEST);
  }
};

/**
 * Get users by role
 * @route GET /api/users/role/:role
 * @access Private (Admin only)
 */
const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const {
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
    } = req.query;

    // Parse pagination parameters
    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), PAGINATION.MAX_LIMIT);

    // Call user service to get users by role
    const result = await userService.getUsersByRole(
      role,
      { page: pageNum, limit: limitNum }
    );

    return paginationResponse(res, result.users, result.pagination, result.message);

  } catch (error) {
    console.error('Get users by role controller error:', error);
    
    if (error.message.includes('Invalid role')) {
      return errorResponse(res, error.message, HTTP_STATUS.BAD_REQUEST);
    }
    
    return errorResponse(res, error.message, HTTP_STATUS.BAD_REQUEST);
  }
};

/**
 * Update user role (Admin only)
 * @route PUT /api/users/:id/role
 * @access Private (Admin only)
 */
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Call user service to update user role
    const result = await userService.updateUserRole(id, role);

    return successResponse(res, result.user, result.message);

  } catch (error) {
    console.error('Update user role controller error:', error);
    
    if (error.message.includes('Invalid role')) {
      return errorResponse(res, error.message, HTTP_STATUS.BAD_REQUEST);
    }
    
    if (error.message.includes('not found')) {
      return errorResponse(res, error.message, HTTP_STATUS.NOT_FOUND);
    }
    
    return errorResponse(res, error.message, HTTP_STATUS.BAD_REQUEST);
  }
};

module.exports = {
  getCurrentUser,
  getUserById,
  updateUser,
  updateUserById,
  deleteUser,
  deleteUserById,
  getAllUsers,
  getUserStats,
  getUsersByRole,
  updateUserRole,
};
