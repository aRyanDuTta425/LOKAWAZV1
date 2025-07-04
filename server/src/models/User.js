// User model and Prisma schema utilities
const { prisma } = require('../config/database');

/**
 * Prisma User Schema Definition (for reference)
 * 
 * model User {
 *   id        String   @id @default(cuid())
 *   name      String
 *   email     String   @unique
 *   password  String
 *   role      Role     @default(USER)
 *   issues    Issue[]
 *   createdAt DateTime @default(now())
 *   updatedAt DateTime @updatedAt
 * 
 *   @@map("users")
 * }
 * 
 * enum Role {
 *   ADMIN
 *   USER
 * }
 */

/**
 * User model utilities and common queries
 */
class UserModel {
  /**
   * Find user by ID
   * @param {String} id - User ID
   * @returns {Promise<Object|null>} User data or null
   */
  static async findById(id) {
    try {
      return await prisma.user.findUnique({
        where: { id },
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
    } catch (error) {
      console.error('User findById error:', error);
      throw error;
    }
  }

  /**
   * Find user by email
   * @param {String} email - User email
   * @returns {Promise<Object|null>} User data or null
   */
  static async findByEmail(email) {
    try {
      return await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        select: {
          id: true,
          name: true,
          email: true,
          password: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        }
      });
    } catch (error) {
      console.error('User findByEmail error:', error);
      throw error;
    }
  }

  /**
   * Create new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user
   */
  static async create(userData) {
    try {
      return await prisma.user.create({
        data: {
          name: userData.name,
          email: userData.email.toLowerCase(),
          password: userData.password,
          role: userData.role || 'USER',
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        }
      });
    } catch (error) {
      console.error('User create error:', error);
      throw error;
    }
  }

  /**
   * Update user by ID
   * @param {String} id - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated user
   */
  static async updateById(id, updateData) {
    try {
      return await prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        }
      });
    } catch (error) {
      console.error('User updateById error:', error);
      throw error;
    }
  }

  /**
   * Delete user by ID
   * @param {String} id - User ID
   * @returns {Promise<Object>} Deleted user
   */
  static async deleteById(id) {
    try {
      return await prisma.user.delete({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
        }
      });
    } catch (error) {
      console.error('User deleteById error:', error);
      throw error;
    }
  }

  /**
   * Find users with pagination and filtering
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Users list with pagination
   */
  static async findMany(options = {}) {
    try {
      const {
        where = {},
        orderBy = { createdAt: 'desc' },
        skip = 0,
        take = 10,
        include = {},
      } = options;

      const [users, totalCount] = await Promise.all([
        prisma.user.findMany({
          where,
          orderBy,
          skip,
          take,
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
            },
            ...include,
          }
        }),
        prisma.user.count({ where })
      ]);

      return {
        users,
        totalCount,
        pagination: {
          page: Math.floor(skip / take) + 1,
          limit: take,
          totalPages: Math.ceil(totalCount / take),
          hasNext: skip + take < totalCount,
          hasPrev: skip > 0,
        }
      };
    } catch (error) {
      console.error('User findMany error:', error);
      throw error;
    }
  }

  /**
   * Get user statistics
   * @param {String} userId - User ID
   * @returns {Promise<Object>} User statistics
   */
  static async getStats(userId) {
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
        throw new Error('User not found');
      }

      // Get issue statistics by status
      const issueStats = await prisma.issue.groupBy({
        by: ['status'],
        where: { userId },
        _count: {
          status: true,
        }
      });

      // Format issue statistics
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
        ...user,
        issuesCount: user._count.issues,
        issueStatistics,
      };
    } catch (error) {
      console.error('User getStats error:', error);
      throw error;
    }
  }

  /**
   * Check if user exists by email
   * @param {String} email - User email
   * @returns {Promise<Boolean>} True if exists
   */
  static async existsByEmail(email) {
    try {
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        select: { id: true }
      });
      return !!user;
    } catch (error) {
      console.error('User existsByEmail error:', error);
      throw error;
    }
  }

  /**
   * Get users by role
   * @param {String} role - User role (ADMIN, USER)
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Users list
   */
  static async findByRole(role, options = {}) {
    try {
      const {
        skip = 0,
        take = 10,
        orderBy = { createdAt: 'desc' },
      } = options;

      return await this.findMany({
        where: { role },
        skip,
        take,
        orderBy,
      });
    } catch (error) {
      console.error('User findByRole error:', error);
      throw error;
    }
  }
}

/**
 * Example Prisma queries for User model
 */
const UserQueries = {
  /**
   * Example: Find user by ID with all relations
   */
  findUserWithIssues: async (id) => {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        issues: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
  },

  /**
   * Example: Search users by name or email
   */
  searchUsers: async (searchTerm, options = {}) => {
    const { skip = 0, take = 10 } = options;
    
    return await prisma.user.findMany({
      where: {
        OR: [
          {
            name: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
          {
            email: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take,
    });
  },

  /**
   * Example: Get user count by role
   */
  getUserCountByRole: async () => {
    return await prisma.user.groupBy({
      by: ['role'],
      _count: {
        role: true,
      },
    });
  },

  /**
   * Example: Find users created in last N days
   */
  findRecentUsers: async (days = 7) => {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    return await prisma.user.findMany({
      where: {
        createdAt: {
          gte: dateThreshold,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },
};

module.exports = {
  UserModel,
  UserQueries,
};
