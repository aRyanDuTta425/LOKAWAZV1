// User service
const { prisma } = require('../config/database');
const { hashPassword } = require('../utils/bcrypt');
const { ERROR_MESSAGES, SUCCESS_MESSAGES, PAGINATION, USER_ROLES } = require('../utils/constants');

/**
 * Get user by ID
 * @param {String} userId - User ID
 * @returns {Promise<Object>} User data
 */
const getUserById = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            issues: true,
          }
        }
      }
    });

    if (!user) {
      throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    return {
      user: {
        ...user,
        issuesCount: user._count.issues,
      },
      message: SUCCESS_MESSAGES.DATA_RETRIEVED,
    };

  } catch (error) {
    console.error('Get user by ID error:', error);
    throw error;
  }
};

/**
 * Update user profile
 * @param {String} userId - User ID
 * @param {Object} updateData - Data to update
 * @param {String} updateData.name - User's name
 * @param {String} updateData.email - User's email
 * @returns {Promise<Object>} Updated user data
 */
const updateUser = async (userId, updateData) => {
  try {
    const { name, email } = updateData;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    // If email is being updated, check if it's already taken by another user
    if (email && email.toLowerCase() !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (emailExists) {
        throw new Error(ERROR_MESSAGES.DUPLICATE_EMAIL);
      }
    }

    // Prepare update data
    const dataToUpdate = {};
    if (name) dataToUpdate.name = name.trim();
    if (email) dataToUpdate.email = email.toLowerCase();

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return {
      user: updatedUser,
      message: SUCCESS_MESSAGES.PROFILE_UPDATED,
    };

  } catch (error) {
    console.error('Update user error:', error);
    
    // Handle Prisma specific errors
    if (error.code === 'P2002') {
      throw new Error(ERROR_MESSAGES.DUPLICATE_EMAIL);
    }
    
    throw error;
  }
};

/**
 * Delete user account
 * @param {String} userId - User ID
 * @returns {Promise<Object>} Success message
 */
const deleteUser = async (userId) => {
  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    // Delete user (cascade delete issues)
    await prisma.user.delete({
      where: { id: userId }
    });

    return {
      message: SUCCESS_MESSAGES.ACCOUNT_DELETED,
    };

  } catch (error) {
    console.error('Delete user error:', error);
    throw error;
  }
};

/**
 * Get all users with filtering and pagination
 * @param {Object} filter - Filter options
 * @param {String} filter.role - Filter by user role
 * @param {String} filter.search - Search in name or email
 * @param {Object} pagination - Pagination options
 * @param {Number} pagination.page - Page number
 * @param {Number} pagination.limit - Items per page
 * @returns {Promise<Object>} Users list with pagination
 */
const getAllUsers = async (filter = {}, pagination = {}) => {
  try {
    const {
      role,
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

    // Role filter
    if (role && Object.values(USER_ROLES).includes(role)) {
      where.role = role;
    }

    // Search filter
    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          }
        },
        {
          email: {
            contains: search,
            mode: 'insensitive',
          }
        }
      ];
    }

    // Get users with pagination
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              issues: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: offset,
        take: limit,
      }),
      prisma.user.count({ where })
    ]);

    // Format users data
    const formattedUsers = users.map(user => ({
      ...user,
      issuesCount: user._count.issues,
    }));

    return {
      users: formattedUsers,
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
    console.error('Get all users error:', error);
    throw error;
  }
};

/**
 * Get user statistics
 * @param {String} userId - User ID
 * @returns {Promise<Object>} User statistics
 */
const getUserStats = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            issues: true,
          }
        }
      }
    });

    if (!user) {
      throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    // Get issue statistics
    const issueStats = await prisma.issue.groupBy({
      by: ['status'],
      where: {
        userId: userId,
      },
      _count: {
        status: true,
      }
    });

    // Format issue stats
    const issueStatistics = issueStats.reduce((acc, stat) => {
      acc[stat.status.toLowerCase()] = stat._count.status;
      return acc;
    }, {
      new: 0,
      in_progress: 0,
      resolved: 0,
      rejected: 0,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        memberSince: user.createdAt,
        totalIssues: user._count.issues,
        issueStatistics,
      },
      message: SUCCESS_MESSAGES.DATA_RETRIEVED,
    };

  } catch (error) {
    console.error('Get user stats error:', error);
    throw error;
  }
};

/**
 * Update user role (Admin only)
 * @param {String} userId - User ID to update
 * @param {String} newRole - New role to assign
 * @returns {Promise<Object>} Updated user data
 */
const updateUserRole = async (userId, newRole) => {
  try {
    // Validate role
    if (!Object.values(USER_ROLES).includes(newRole)) {
      throw new Error('Invalid role provided');
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true,
      }
    });

    return {
      user: updatedUser,
      message: `User role updated to ${newRole} successfully`,
    };

  } catch (error) {
    console.error('Update user role error:', error);
    throw error;
  }
};

/**
 * Get users by role
 * @param {String} role - User role
 * @param {Object} pagination - Pagination options
 * @returns {Promise<Object>} Users list
 */
const getUsersByRole = async (role, pagination = {}) => {
  try {
    const {
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
    } = pagination;

    const offset = (page - 1) * limit;

    // Validate role
    if (!Object.values(USER_ROLES).includes(role)) {
      throw new Error('Invalid role provided');
    }

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: { role },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          _count: {
            select: {
              issues: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: offset,
        take: limit,
      }),
      prisma.user.count({ where: { role } })
    ]);

    const formattedUsers = users.map(user => ({
      ...user,
      issuesCount: user._count.issues,
    }));

    return {
      users: formattedUsers,
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
    console.error('Get users by role error:', error);
    throw error;
  }
};

/**
 * Get user activity trends for analytics
 * @param {Date} startDate - Start date for filtering
 * @returns {Promise<Array>} User activity trends data
 */
const getUserActivityTrends = async (startDate) => {
  try {
    const now = new Date();
    const months = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Generate month array
    for (let i = 0; i < 6; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.unshift({
        month: monthNames[date.getMonth()],
        year: date.getFullYear(),
        start: new Date(date.getFullYear(), date.getMonth(), 1),
        end: new Date(date.getFullYear(), date.getMonth() + 1, 0)
      });
    }

    const trendsData = await Promise.all(
      months.map(async (monthData) => {
        const [newUsers, activeUsers] = await Promise.all([
          prisma.user.count({
            where: {
              createdAt: {
                gte: monthData.start,
                lte: monthData.end
              }
            }
          }),
          prisma.user.count({
            where: {
              OR: [
                {
                  issues: {
                    some: {
                      createdAt: {
                        gte: monthData.start,
                        lte: monthData.end
                      }
                    }
                  }
                },
                {
                  createdAt: {
                    gte: monthData.start,
                    lte: monthData.end
                  }
                }
              ]
            }
          })
        ]);

        return {
          month: monthData.month,
          newUsers,
          activeUsers
        };
      })
    );

    return trendsData;

  } catch (error) {
    console.error('Get user activity trends error:', error);
    throw error;
  }
};

module.exports = {
  getUserById,
  updateUser,
  deleteUser,
  getAllUsers,
  getUserStats,
  updateUserRole,
  getUsersByRole,
  getUserActivityTrends,
};
