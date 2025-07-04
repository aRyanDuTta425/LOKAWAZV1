// Issue service
const { prisma } = require('../config/database');
const { ERROR_MESSAGES, SUCCESS_MESSAGES, PAGINATION, ISSUE_STATUS, PRIORITY_LEVELS } = require('../utils/constants');

/**
 * Create a new issue
 * @param {Object} issueData - Issue data
 * @param {String} issueData.title - Issue title
 * @param {String} issueData.description - Issue description
 * @param {Number} issueData.latitude - Latitude coordinate
 * @param {Number} issueData.longitude - Longitude coordinate
 * @param {String} issueData.category - Issue category
 * @param {String} issueData.priority - Issue priority
 * @param {String} issueData.imageUrl - Image URL
 * @param {String} issueData.userId - User ID who created the issue
 * @returns {Promise<Object>} Created issue data
 */
const createIssue = async (issueData) => {
  try {
    const {
      title,
      description,
      latitude,
      longitude,
      category,
      priority = PRIORITY_LEVELS.MEDIUM,
      imageUrl,
      userId
    } = issueData;

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true }
    });

    if (!user) {
      throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    // Create issue
    const newIssue = await prisma.issue.create({
      data: {
        title: title.trim(),
        description: description?.trim(),
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        category: category?.trim(),
        priority,
        imageUrl,
        userId,
        status: ISSUE_STATUS.NEW,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    return {
      issue: newIssue,
      message: SUCCESS_MESSAGES.ISSUE_CREATED,
    };

  } catch (error) {
    console.error('Create issue error:', error);
    throw error;
  }
};

/**
 * Get issue by ID
 * @param {String} issueId - Issue ID
 * @param {String} requestingUserId - ID of user requesting the issue (for access control)
 * @returns {Promise<Object>} Issue data
 */
const getIssueById = async (issueId, requestingUserId = null) => {
  try {
    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    if (!issue) {
      throw new Error(ERROR_MESSAGES.ISSUE_NOT_FOUND);
    }

    return {
      issue,
      message: SUCCESS_MESSAGES.DATA_RETRIEVED,
    };

  } catch (error) {
    console.error('Get issue by ID error:', error);
    throw error;
  }
};

/**
 * Get issues with filtering and pagination
 * @param {Object} filter - Filter options
 * @param {String} filter.status - Filter by status
 * @param {String} filter.priority - Filter by priority
 * @param {String} filter.category - Filter by category
 * @param {String} filter.userId - Filter by user ID
 * @param {Number} filter.latitude - Center latitude for location filter
 * @param {Number} filter.longitude - Center longitude for location filter
 * @param {Number} filter.radius - Radius in km for location filter
 * @param {String} filter.search - Search in title and description
 * @param {Object} pagination - Pagination options
 * @param {Number} pagination.page - Page number
 * @param {Number} pagination.limit - Items per page
 * @returns {Promise<Object>} Issues list with pagination
 */
const getIssues = async (filter = {}, pagination = {}) => {
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
    } = filter;

    const {
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
    } = pagination;

    // Calculate offset
    const offset = (page - 1) * limit;

    // Build where clause
    const where = {};

    // Status filter
    if (status && Object.values(ISSUE_STATUS).includes(status)) {
      where.status = status;
    }

    // Priority filter
    if (priority && Object.values(PRIORITY_LEVELS).includes(priority)) {
      where.priority = priority;
    }

    // Category filter
    if (category) {
      where.category = {
        contains: category,
        mode: 'insensitive',
      };
    }

    // User filter
    if (userId) {
      where.userId = userId;
    }

    // Search filter
    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive',
          }
        },
        {
          description: {
            contains: search,
            mode: 'insensitive',
          }
        }
      ];
    }

    // Location filter (basic implementation - for more complex geo queries, consider PostGIS)
    if (latitude && longitude && radius) {
      // Simple bounding box calculation
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      const radiusInDegrees = parseFloat(radius) / 111; // Rough conversion from km to degrees

      where.latitude = {
        gte: lat - radiusInDegrees,
        lte: lat + radiusInDegrees,
      };
      where.longitude = {
        gte: lng - radiusInDegrees,
        lte: lng + radiusInDegrees,
      };
    }

    // Get issues with pagination
    const [issues, totalCount] = await Promise.all([
      prisma.issue.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: offset,
        take: limit,
      }),
      prisma.issue.count({ where })
    ]);

    return {
      issues,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: limit,
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPrevPage: page > 1,
      },
      message: SUCCESS_MESSAGES.DATA_RETRIEVED,
    };

  } catch (error) {
    console.error('Get issues error:', error);
    throw error;
  }
};

/**
 * Update issue
 * @param {String} issueId - Issue ID
 * @param {Object} updateData - Data to update
 * @param {String} requestingUserId - ID of user requesting the update
 * @param {String} userRole - Role of the requesting user
 * @returns {Promise<Object>} Updated issue data
 */
const updateIssue = async (issueId, updateData, requestingUserId, userRole) => {
  try {
    // Check if issue exists
    const existingIssue = await prisma.issue.findUnique({
      where: { id: issueId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    if (!existingIssue) {
      throw new Error(ERROR_MESSAGES.ISSUE_NOT_FOUND);
    }

    // Check permissions
    const canUpdate = userRole === 'ADMIN' || existingIssue.userId === requestingUserId;
    if (!canUpdate) {
      throw new Error('You can only update your own issues');
    }

    // Prepare update data
    const dataToUpdate = {};
    
    if (updateData.title) dataToUpdate.title = updateData.title.trim();
    if (updateData.description !== undefined) dataToUpdate.description = updateData.description?.trim();
    if (updateData.category) dataToUpdate.category = updateData.category.trim();
    if (updateData.imageUrl !== undefined) dataToUpdate.imageUrl = updateData.imageUrl;
    
    // Only allow certain fields to be updated by non-admins
    if (userRole === 'ADMIN') {
      if (updateData.status && Object.values(ISSUE_STATUS).includes(updateData.status)) {
        dataToUpdate.status = updateData.status;
      }
      if (updateData.priority && Object.values(PRIORITY_LEVELS).includes(updateData.priority)) {
        dataToUpdate.priority = updateData.priority;
      }
    } else {
      // Regular users can only update priority and basic info, not status
      if (updateData.priority && Object.values(PRIORITY_LEVELS).includes(updateData.priority)) {
        dataToUpdate.priority = updateData.priority;
      }
    }

    // Update issue
    const updatedIssue = await prisma.issue.update({
      where: { id: issueId },
      data: dataToUpdate,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    return {
      issue: updatedIssue,
      message: SUCCESS_MESSAGES.ISSUE_UPDATED,
    };

  } catch (error) {
    console.error('Update issue error:', error);
    throw error;
  }
};

/**
 * Delete issue
 * @param {String} issueId - Issue ID
 * @param {String} requestingUserId - ID of user requesting the deletion
 * @param {String} userRole - Role of the requesting user
 * @returns {Promise<Object>} Success message
 */
const deleteIssue = async (issueId, requestingUserId, userRole) => {
  try {
    // Check if issue exists
    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
      select: {
        id: true,
        userId: true,
        imageUrl: true,
      }
    });

    if (!issue) {
      throw new Error(ERROR_MESSAGES.ISSUE_NOT_FOUND);
    }

    // Check permissions
    const canDelete = userRole === 'ADMIN' || issue.userId === requestingUserId;
    if (!canDelete) {
      throw new Error('You can only delete your own issues');
    }

    // Delete issue
    await prisma.issue.delete({
      where: { id: issueId }
    });

    return {
      deletedIssueId: issueId,
      imageUrl: issue.imageUrl, // Return image URL for cleanup
      message: SUCCESS_MESSAGES.ISSUE_DELETED,
    };

  } catch (error) {
    console.error('Delete issue error:', error);
    throw error;
  }
};

/**
 * Update issue status (Admin only)
 * @param {String} issueId - Issue ID
 * @param {String} status - New status
 * @returns {Promise<Object>} Updated issue data
 */
const updateIssueStatus = async (issueId, status) => {
  try {
    // Validate status
    if (!Object.values(ISSUE_STATUS).includes(status)) {
      throw new Error('Invalid status provided');
    }

    // Check if issue exists
    const issue = await prisma.issue.findUnique({
      where: { id: issueId }
    });

    if (!issue) {
      throw new Error(ERROR_MESSAGES.ISSUE_NOT_FOUND);
    }

    // Update status
    const updatedIssue = await prisma.issue.update({
      where: { id: issueId },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    return {
      issue: updatedIssue,
      message: SUCCESS_MESSAGES.STATUS_UPDATED,
    };

  } catch (error) {
    console.error('Update issue status error:', error);
    throw error;
  }
};

/**
 * Get issue statistics
 * @param {Object} filter - Optional filter (e.g., by user)
 * @returns {Promise<Object>} Issue statistics
 */
const getIssueStats = async (filter = {}) => {
  try {
    const where = {};
    
    if (filter.userId) {
      where.userId = filter.userId;
    }

    // Get status statistics
    const statusStats = await prisma.issue.groupBy({
      by: ['status'],
      where,
      _count: {
        status: true,
      }
    });

    // Get priority statistics
    const priorityStats = await prisma.issue.groupBy({
      by: ['priority'],
      where,
      _count: {
        priority: true,
      }
    });

    // Get total count
    const totalIssues = await prisma.issue.count({ where });

    // Format statistics
    const statistics = {
      total: totalIssues,
      byStatus: statusStats.reduce((acc, stat) => {
        acc[stat.status.toLowerCase()] = stat._count.status;
        return acc;
      }, {
        new: 0,
        in_progress: 0,
        resolved: 0,
        rejected: 0,
      }),
      byPriority: priorityStats.reduce((acc, stat) => {
        acc[stat.priority.toLowerCase()] = stat._count.priority;
        return acc;
      }, {
        low: 0,
        medium: 0,
        high: 0,
        urgent: 0,
      }),
    };

    return {
      statistics,
      message: SUCCESS_MESSAGES.DATA_RETRIEVED,
    };

  } catch (error) {
    console.error('Get issue stats error:', error);
    throw error;
  }
};

/**
 * Get nearby issues
 * @param {Number} latitude - Center latitude
 * @param {Number} longitude - Center longitude
 * @param {Number} radius - Radius in km
 * @param {Object} pagination - Pagination options
 * @returns {Promise<Object>} Nearby issues
 */
const getNearbyIssues = async (latitude, longitude, radius = 5, pagination = {}) => {
  try {
    const {
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
    } = pagination;

    const offset = (page - 1) * limit;

    // Simple bounding box calculation
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const radiusInDegrees = parseFloat(radius) / 111; // Rough conversion

    const where = {
      latitude: {
        gte: lat - radiusInDegrees,
        lte: lat + radiusInDegrees,
      },
      longitude: {
        gte: lng - radiusInDegrees,
        lte: lng + radiusInDegrees,
      },
    };

    const [issues, totalCount] = await Promise.all([
      prisma.issue.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: offset,
        take: limit,
      }),
      prisma.issue.count({ where })
    ]);

    return {
      issues,
      center: { latitude: lat, longitude: lng },
      radius,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: limit,
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPrevPage: page > 1,
      },
      message: SUCCESS_MESSAGES.DATA_RETRIEVED,
    };

  } catch (error) {
    console.error('Get nearby issues error:', error);
    throw error;
  }
};

module.exports = {
  createIssue,
  getIssueById,
  getIssues,
  updateIssue,
  deleteIssue,
  updateIssueStatus,
  getIssueStats,
  getNearbyIssues,
};
