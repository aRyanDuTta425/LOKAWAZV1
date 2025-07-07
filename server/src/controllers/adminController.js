// Admin controller
const userService = require('../services/userService');
const issueService = require('../services/issueService');
const uploadService = require('../services/uploadService');
const { successResponse, errorResponse, paginationResponse } = require('../utils/response');
const { HTTP_STATUS, PAGINATION } = require('../utils/constants');

/**
 * Get all users (Admin only)
 * @route GET /api/admin/users
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
    console.error('Admin get all users controller error:', error);
    return errorResponse(res, error.message, HTTP_STATUS.BAD_REQUEST);
  }
};

/**
 * Get all issues (Admin only)
 * @route GET /api/admin/issues
 * @access Private (Admin only)
 */
const getAllIssues = async (req, res) => {
  try {
    const {
      status,
      priority,
      category,
      userId,
      search,
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
    } = req.query;

    // Parse pagination parameters
    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), PAGINATION.MAX_LIMIT);

    // Build filter object
    const filter = {
      status,
      priority,
      category,
      userId,
      search,
    };

    // Remove undefined values
    Object.keys(filter).forEach(key => {
      if (filter[key] === undefined) {
        delete filter[key];
      }
    });

    // Call issue service to get all issues
    const result = await issueService.getIssues(
      filter,
      { page: pageNum, limit: limitNum }
    );

    return paginationResponse(res, result.issues, result.pagination, result.message);

  } catch (error) {
    console.error('Admin get all issues controller error:', error);
    return errorResponse(res, error.message, HTTP_STATUS.BAD_REQUEST);
  }
};

/**
 * Delete any user (Admin only)
 * @route DELETE /api/admin/users/:id
 * @access Private (Admin only)
 */
const deleteAnyUser = async (req, res) => {
  try {
    const { id } = req.params;
    const adminUserId = req.userId;

    // Prevent admin from deleting themselves
    if (id === adminUserId) {
      return errorResponse(res, 'You cannot delete your own account through admin panel', HTTP_STATUS.BAD_REQUEST);
    }

    // Call user service to delete user
    const result = await userService.deleteUser(id);

    return successResponse(res, null, result.message);

  } catch (error) {
    console.error('Admin delete user controller error:', error);
    
    if (error.message.includes('not found')) {
      return errorResponse(res, error.message, HTTP_STATUS.NOT_FOUND);
    }
    
    return errorResponse(res, error.message, HTTP_STATUS.BAD_REQUEST);
  }
};

/**
 * Delete any issue (Admin only)
 * @route DELETE /api/admin/issues/:id
 * @access Private (Admin only)
 */
const deleteAnyIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const adminUserId = req.userId;
    const userRole = req.userRole;

    // Call issue service to delete issue (admin can delete any issue)
    const result = await issueService.deleteIssue(id, adminUserId, userRole);

    // If there was an image, try to delete it from Cloudinary
    if (result.imageUrl) {
      try {
        await uploadService.deleteIssueImage(result.imageUrl);
      } catch (cleanupError) {
        console.error('Failed to cleanup issue image:', cleanupError);
        // Don't fail the request if image cleanup fails
      }
    }

    return successResponse(res, { deletedIssueId: result.deletedIssueId }, result.message);

  } catch (error) {
    console.error('Admin delete issue controller error:', error);
    
    if (error.message.includes('not found')) {
      return errorResponse(res, error.message, HTTP_STATUS.NOT_FOUND);
    }
    
    return errorResponse(res, error.message, HTTP_STATUS.BAD_REQUEST);
  }
};

/**
 * Update user role (Admin only)
 * @route PUT /api/admin/users/:id/role
 * @access Private (Admin only)
 */
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const adminUserId = req.userId;

    // Prevent admin from changing their own role
    if (id === adminUserId) {
      return errorResponse(res, 'You cannot change your own role', HTTP_STATUS.BAD_REQUEST);
    }

    // Call user service to update user role
    const result = await userService.updateUserRole(id, role);

    return successResponse(res, result.user, result.message);

  } catch (error) {
    console.error('Admin update user role controller error:', error);
    
    if (error.message.includes('Invalid role')) {
      return errorResponse(res, error.message, HTTP_STATUS.BAD_REQUEST);
    }
    
    if (error.message.includes('not found')) {
      return errorResponse(res, error.message, HTTP_STATUS.NOT_FOUND);
    }
    
    return errorResponse(res, error.message, HTTP_STATUS.BAD_REQUEST);
  }
};

/**
 * Update issue status (Admin only)
 * @route PATCH /api/admin/issues/:id/status
 * @access Private (Admin only)
 */
const updateIssueStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Call issue service to update status
    const result = await issueService.updateIssueStatus(id, status);

    return successResponse(res, result.issue, result.message);

  } catch (error) {
    console.error('Admin update issue status controller error:', error);
    
    if (error.message.includes('Invalid status')) {
      return errorResponse(res, error.message, HTTP_STATUS.BAD_REQUEST);
    }
    
    if (error.message.includes('not found')) {
      return errorResponse(res, error.message, HTTP_STATUS.NOT_FOUND);
    }
    
    return errorResponse(res, error.message, HTTP_STATUS.BAD_REQUEST);
  }
};

/**
 * Get system statistics (Admin only)
 * @route GET /api/admin/stats
 * @access Private (Admin only)
 */
const getSystemStats = async (req, res) => {
  try {
    // Get overall issue statistics
    const issueStatsResult = await issueService.getIssueStats();
    
    // Get user count by role
    const [adminUsers, regularUsers] = await Promise.all([
      userService.getUsersByRole('ADMIN', { page: 1, limit: 1 }),
      userService.getUsersByRole('USER', { page: 1, limit: 1 })
    ]);

    const systemStats = {
      issues: issueStatsResult.statistics,
      users: {
        total: adminUsers.pagination.totalItems + regularUsers.pagination.totalItems,
        admins: adminUsers.pagination.totalItems,
        regularUsers: regularUsers.pagination.totalItems,
      },
      summary: {
        totalIssues: issueStatsResult.statistics.total,
        totalUsers: adminUsers.pagination.totalItems + regularUsers.pagination.totalItems,
        pendingIssues: issueStatsResult.statistics.byStatus.new + issueStatsResult.statistics.byStatus.in_progress,
        resolvedIssues: issueStatsResult.statistics.byStatus.resolved,
      }
    };

    return successResponse(res, systemStats, 'System statistics retrieved successfully');

  } catch (error) {
    console.error('Admin get system stats controller error:', error);
    return errorResponse(res, error.message, HTTP_STATUS.BAD_REQUEST);
  }
};

/**
 * Get user details with statistics (Admin only)
 * @route GET /api/admin/users/:id
 * @access Private (Admin only)
 */
const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // Get user stats
    const result = await userService.getUserStats(id);

    return successResponse(res, result.user, result.message);

  } catch (error) {
    console.error('Admin get user details controller error:', error);
    
    if (error.message.includes('not found')) {
      return errorResponse(res, error.message, HTTP_STATUS.NOT_FOUND);
    }
    
    return errorResponse(res, error.message, HTTP_STATUS.BAD_REQUEST);
  }
};

/**
 * Get issue details (Admin only)
 * @route GET /api/admin/issues/:id
 * @access Private (Admin only)
 */
const getIssueDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // Call issue service to get issue details
    const result = await issueService.getIssueById(id);

    return successResponse(res, result.issue, result.message);

  } catch (error) {
    console.error('Admin get issue details controller error:', error);
    
    if (error.message.includes('not found')) {
      return errorResponse(res, error.message, HTTP_STATUS.NOT_FOUND);
    }
    
    return errorResponse(res, error.message, HTTP_STATUS.BAD_REQUEST);
  }
};

/**
 * Bulk update issue status (Admin only)
 * @route PATCH /api/admin/issues/bulk-status
 * @access Private (Admin only)
 */
const bulkUpdateIssueStatus = async (req, res) => {
  try {
    const { issueIds, status } = req.body;

    if (!issueIds || !Array.isArray(issueIds) || issueIds.length === 0) {
      return errorResponse(res, 'Issue IDs array is required', HTTP_STATUS.BAD_REQUEST);
    }

    if (!status) {
      return errorResponse(res, 'Status is required', HTTP_STATUS.BAD_REQUEST);
    }

    // Update each issue status
    const updatePromises = issueIds.map(id => issueService.updateIssueStatus(id, status));
    const results = await Promise.allSettled(updatePromises);

    // Separate successful and failed updates
    const successful = results.filter(result => result.status === 'fulfilled');
    const failed = results.filter(result => result.status === 'rejected');

    return successResponse(res, {
      summary: {
        total: issueIds.length,
        successful: successful.length,
        failed: failed.length,
      },
      successful: successful.map((result, index) => ({
        issueId: issueIds[index],
        issue: result.value.issue,
      })),
      failed: failed.map((result, index) => ({
        issueId: issueIds[index],
        error: result.reason.message,
      })),
    }, `${successful.length}/${issueIds.length} issues updated successfully`);

  } catch (error) {
    console.error('Admin bulk update issue status controller error:', error);
    return errorResponse(res, error.message, HTTP_STATUS.BAD_REQUEST);
  }
};

/**
 * Get analytics data (Admin only)
 * @route GET /api/admin/analytics
 * @access Private (Admin only)
 */
const getAnalytics = async (req, res) => {
  try {
    const { timeRange = '6months' } = req.query;

    // Calculate date range based on timeRange parameter
    const now = new Date();
    let startDate;
    
    switch (timeRange) {
      case '3months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case '12months':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
        break;
      case '6months':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        break;
    }

    // Call services to get analytics data
    const [
      statusDistribution,
      categoryDistribution,
      monthlyTrends,
      priorityDistribution,
      userActivityTrends
    ] = await Promise.all([
      issueService.getStatusDistribution(startDate),
      issueService.getCategoryDistribution(startDate),
      issueService.getMonthlyTrends(startDate),
      issueService.getPriorityDistribution(startDate),
      userService.getUserActivityTrends(startDate)
    ]);

    return successResponse(res, {
      statusDistribution,
      categoryDistribution,
      monthlyTrends,
      priorityDistribution,
      userActivityTrends
    }, 'Analytics data retrieved successfully');

  } catch (error) {
    console.error('Admin get analytics controller error:', error);
    return errorResponse(res, error.message, HTTP_STATUS.BAD_REQUEST);
  }
};

module.exports = {
  getAllUsers,
  getAllIssues,
  deleteAnyUser,
  deleteAnyIssue,
  updateUserRole,
  updateIssueStatus,
  getSystemStats,
  getUserDetails,
  getIssueDetails,
  bulkUpdateIssueStatus,
  getAnalytics,
};
