// Issue controller
const issueService = require('../services/issueService');
const uploadService = require('../services/uploadService');
const { successResponse, errorResponse, paginationResponse } = require('../utils/response');
const { HTTP_STATUS, PAGINATION } = require('../utils/constants');

/**
 * Create a new issue
 * @route POST /api/issues
 * @access Private
 */
const createIssue = async (req, res) => {
  try {
    const userId = req.userId;
    const issueData = { ...req.body, userId };

    // If there are uploaded files, add the image URLs
    if (req.files && req.files.length > 0) {
      issueData.images = req.files.map(file => file.path);
    } else if (req.file && req.file.path) {
      // Fallback for single image upload
      issueData.imageUrl = req.file.path;
    }

    // Call issue service to create issue
    const result = await issueService.createIssue(issueData);

    return successResponse(res, result.issue, result.message, HTTP_STATUS.CREATED);

  } catch (error) {
    console.error('Create issue controller error:', error);
    
    // If there were uploaded files and creation failed, clean them up
    if (req.files && req.files.length > 0) {
      try {
        for (const file of req.files) {
          await uploadService.deleteIssueImage(file.path);
        }
      } catch (cleanupError) {
        console.error('Failed to cleanup uploaded files:', cleanupError);
      }
    } else if (req.file && req.file.path) {
      try {
        await uploadService.deleteIssueImage(req.file.path);
      } catch (cleanupError) {
        console.error('Failed to cleanup uploaded file:', cleanupError);
      }
    }
    
    if (error.message.includes('not found')) {
      return errorResponse(res, error.message, HTTP_STATUS.NOT_FOUND);
    }
    
    return errorResponse(res, error.message, HTTP_STATUS.BAD_REQUEST);
  }
};

/**
 * Get issue by ID
 * @route GET /api/issues/:id
 * @access Public
 */
const getIssueById = async (req, res) => {
  try {
    const { id } = req.params;
    const requestingUserId = req.userId || null;

    // Call issue service to get issue
    const result = await issueService.getIssueById(id, requestingUserId);

    return successResponse(res, result.issue, result.message);

  } catch (error) {
    console.error('Get issue by ID controller error:', error);
    
    if (error.message.includes('not found')) {
      return errorResponse(res, error.message, HTTP_STATUS.NOT_FOUND);
    }
    
    return errorResponse(res, error.message, HTTP_STATUS.BAD_REQUEST);
  }
};

/**
 * Get all issues with filtering and pagination
 * @route GET /api/issues
 * @access Public
 */
const getAllIssues = async (req, res) => {
  try {
    const {
      status,
      priority,
      category,
      userId,
      latitude,
      longitude,
      radius,
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
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
      radius: radius ? parseFloat(radius) : undefined,
      search,
    };

    // Remove undefined values
    Object.keys(filter).forEach(key => {
      if (filter[key] === undefined) {
        delete filter[key];
      }
    });

    // Call issue service to get issues
    const result = await issueService.getIssues(
      filter,
      { page: pageNum, limit: limitNum }
    );

    return paginationResponse(res, result.issues, result.pagination, result.message);

  } catch (error) {
    console.error('Get all issues controller error:', error);
    return errorResponse(res, error.message, HTTP_STATUS.BAD_REQUEST);
  }
};

/**
 * Update issue
 * @route PUT /api/issues/:id
 * @access Private
 */
const updateIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const requestingUserId = req.userId;
    const userRole = req.userRole;

    // If there are uploaded files, add the image URLs
    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map(file => file.path);
    } else if (req.file && req.file.path) {
      // Fallback for single image upload
      updateData.imageUrl = req.file.path;
    }

    // Call issue service to update issue
    const result = await issueService.updateIssue(id, updateData, requestingUserId, userRole);

    return successResponse(res, result.issue, result.message);

  } catch (error) {
    console.error('Update issue controller error:', error);
    
    // If there were uploaded files and update failed, clean them up
    if (req.files && req.files.length > 0) {
      try {
        for (const file of req.files) {
          await uploadService.deleteIssueImage(file.path);
        }
      } catch (cleanupError) {
        console.error('Failed to cleanup uploaded files:', cleanupError);
      }
    } else if (req.file && req.file.path) {
      try {
        await uploadService.deleteIssueImage(req.file.path);
      } catch (cleanupError) {
        console.error('Failed to cleanup uploaded file:', cleanupError);
      }
    }
    
    if (error.message.includes('not found')) {
      return errorResponse(res, error.message, HTTP_STATUS.NOT_FOUND);
    }
    
    if (error.message.includes('only update your own') || error.message.includes('only modify')) {
      return errorResponse(res, error.message, HTTP_STATUS.FORBIDDEN);
    }
    
    return errorResponse(res, error.message, HTTP_STATUS.BAD_REQUEST);
  }
};

/**
 * Delete issue
 * @route DELETE /api/issues/:id
 * @access Private
 */
const deleteIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const requestingUserId = req.userId;
    const userRole = req.userRole;

    // Call issue service to delete issue
    const result = await issueService.deleteIssue(id, requestingUserId, userRole);

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
    console.error('Delete issue controller error:', error);
    
    if (error.message.includes('not found')) {
      return errorResponse(res, error.message, HTTP_STATUS.NOT_FOUND);
    }
    
    if (error.message.includes('only delete your own') || error.message.includes('only remove')) {
      return errorResponse(res, error.message, HTTP_STATUS.FORBIDDEN);
    }
    
    return errorResponse(res, error.message, HTTP_STATUS.BAD_REQUEST);
  }
};

/**
 * Update issue status (Admin only)
 * @route PATCH /api/issues/:id/status
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
    console.error('Update issue status controller error:', error);
    
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
 * Get issue statistics
 * @route GET /api/issues/stats
 * @access Private
 */
const getIssueStats = async (req, res) => {
  try {
    const { userId } = req.query;
    const requestingUserId = req.userId;
    const userRole = req.userRole;

    // If specific user stats requested, check permissions
    if (userId && userId !== requestingUserId && userRole !== 'ADMIN') {
      return errorResponse(res, 'You can only view your own statistics', HTTP_STATUS.FORBIDDEN);
    }

    // Build filter
    const filter = {};
    if (userId) {
      filter.userId = userId;
    }

    // Call issue service to get stats
    const result = await issueService.getIssueStats(filter);

    return successResponse(res, result.statistics, result.message);

  } catch (error) {
    console.error('Get issue stats controller error:', error);
    return errorResponse(res, error.message, HTTP_STATUS.BAD_REQUEST);
  }
};

/**
 * Get nearby issues
 * @route GET /api/issues/nearby
 * @access Public
 */
const getNearbyIssues = async (req, res) => {
  try {
    const {
      latitude,
      longitude,
      radius = 5,
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
    } = req.query;

    // Validate required parameters
    if (!latitude || !longitude) {
      return errorResponse(res, 'Latitude and longitude are required', HTTP_STATUS.BAD_REQUEST);
    }

    // Parse parameters
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const radiusKm = parseFloat(radius);
    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), PAGINATION.MAX_LIMIT);

    // Validate coordinates
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return errorResponse(res, 'Invalid coordinates provided', HTTP_STATUS.BAD_REQUEST);
    }

    // Call issue service to get nearby issues
    const result = await issueService.getNearbyIssues(
      lat,
      lng,
      radiusKm,
      { page: pageNum, limit: limitNum }
    );

    return paginationResponse(res, result.issues, result.pagination, result.message);

  } catch (error) {
    console.error('Get nearby issues controller error:', error);
    return errorResponse(res, error.message, HTTP_STATUS.BAD_REQUEST);
  }
};

/**
 * Get user's issues
 * @route GET /api/issues/my
 * @access Private
 */
const getMyIssues = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      status,
      priority,
      category,
      search,
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
    } = req.query;

    // Parse pagination parameters
    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), PAGINATION.MAX_LIMIT);

    // Build filter object
    const filter = {
      userId,
      status,
      priority,
      category,
      search,
    };

    // Remove undefined values
    Object.keys(filter).forEach(key => {
      if (filter[key] === undefined) {
        delete filter[key];
      }
    });

    // Call issue service to get issues
    const result = await issueService.getIssues(
      filter,
      { page: pageNum, limit: limitNum }
    );

    return paginationResponse(res, result.issues, result.pagination, result.message);

  } catch (error) {
    console.error('Get my issues controller error:', error);
    return errorResponse(res, error.message, HTTP_STATUS.BAD_REQUEST);
  }
};

module.exports = {
  createIssue,
  getIssueById,
  getAllIssues,
  updateIssue,
  deleteIssue,
  updateIssueStatus,
  getIssueStats,
  getNearbyIssues,
  getMyIssues,
};
