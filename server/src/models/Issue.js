// Issue model and Prisma schema utilities
const { prisma } = require('../config/database');

/**
 * Prisma Issue Schema Definition (for reference)
 * 
 * model Issue {
 *   id          String     @id @default(cuid())
 *   title       String
 *   description String?
 *   imageUrl    String?
 *   publicId    String?
 *   latitude    Float
 *   longitude   Float
 *   status      IssueStatus @default(NEW)
 *   priority    Priority    @default(MEDIUM)
 *   category    String?
 *   userId      String
 *   user        User       @relation(fields: [userId], references: [id], onDelete: Cascade)
 *   createdAt   DateTime   @default(now())
 *   updatedAt   DateTime   @updatedAt
 * 
 *   @@map("issues")
 * }
 * 
 * enum IssueStatus {
 *   NEW
 *   IN_PROGRESS
 *   RESOLVED
 *   REJECTED
 * }
 * 
 * enum Priority {
 *   LOW
 *   MEDIUM
 *   HIGH
 *   URGENT
 * }
 */

/**
 * Issue model utilities and common queries
 */
class IssueModel {
  /**
   * Find issue by ID
   * @param {String} id - Issue ID
   * @returns {Promise<Object|null>} Issue data or null
   */
  static async findById(id) {
    try {
      return await prisma.issue.findUnique({
        where: { id },
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
    } catch (error) {
      console.error('Issue findById error:', error);
      throw error;
    }
  }

  /**
   * Create new issue
   * @param {Object} issueData - Issue data
   * @returns {Promise<Object>} Created issue
   */
  static async create(issueData) {
    try {
      return await prisma.issue.create({
        data: {
          title: issueData.title,
          description: issueData.description,
          imageUrl: issueData.imageUrl,
          publicId: issueData.publicId,
          latitude: parseFloat(issueData.latitude),
          longitude: parseFloat(issueData.longitude),
          status: issueData.status || 'NEW',
          priority: issueData.priority || 'MEDIUM',
          category: issueData.category,
          userId: issueData.userId,
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
    } catch (error) {
      console.error('Issue create error:', error);
      throw error;
    }
  }

  /**
   * Update issue by ID
   * @param {String} id - Issue ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated issue
   */
  static async updateById(id, updateData) {
    try {
      return await prisma.issue.update({
        where: { id },
        data: updateData,
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
    } catch (error) {
      console.error('Issue updateById error:', error);
      throw error;
    }
  }

  /**
   * Delete issue by ID
   * @param {String} id - Issue ID
   * @returns {Promise<Object>} Deleted issue
   */
  static async deleteById(id) {
    try {
      return await prisma.issue.delete({
        where: { id },
        select: {
          id: true,
          title: true,
          imageUrl: true,
          publicId: true,
        }
      });
    } catch (error) {
      console.error('Issue deleteById error:', error);
      throw error;
    }
  }

  /**
   * Find issues with pagination and filtering
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Issues list with pagination
   */
  static async findMany(options = {}) {
    try {
      const {
        where = {},
        orderBy = { createdAt: 'desc' },
        skip = 0,
        take = 10,
        include = {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        },
      } = options;

      const [issues, totalCount] = await Promise.all([
        prisma.issue.findMany({
          where,
          orderBy,
          skip,
          take,
          include,
        }),
        prisma.issue.count({ where })
      ]);

      return {
        issues,
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
      console.error('Issue findMany error:', error);
      throw error;
    }
  }

  /**
   * Find issues by user ID
   * @param {String} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} User's issues
   */
  static async findByUserId(userId, options = {}) {
    try {
      const {
        skip = 0,
        take = 10,
        orderBy = { createdAt: 'desc' },
        status,
        priority,
      } = options;

      const where = { userId };
      if (status) where.status = status;
      if (priority) where.priority = priority;

      return await this.findMany({
        where,
        skip,
        take,
        orderBy,
      });
    } catch (error) {
      console.error('Issue findByUserId error:', error);
      throw error;
    }
  }

  /**
   * Find issues by status
   * @param {String} status - Issue status
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Issues list
   */
  static async findByStatus(status, options = {}) {
    try {
      return await this.findMany({
        where: { status },
        ...options,
      });
    } catch (error) {
      console.error('Issue findByStatus error:', error);
      throw error;
    }
  }

  /**
   * Find nearby issues using simple bounding box
   * @param {Number} latitude - Center latitude
   * @param {Number} longitude - Center longitude
   * @param {Number} radiusKm - Radius in kilometers
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Nearby issues
   */
  static async findNearby(latitude, longitude, radiusKm = 5, options = {}) {
    try {
      // Simple bounding box calculation (approximate)
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      const radiusInDegrees = radiusKm / 111; // Rough conversion from km to degrees

      const where = {
        latitude: {
          gte: lat - radiusInDegrees,
          lte: lat + radiusInDegrees,
        },
        longitude: {
          gte: lng - radiusInDegrees,
          lte: lng + radiusInDegrees,
        },
        ...options.where,
      };

      return await this.findMany({
        where,
        orderBy: options.orderBy || { createdAt: 'desc' },
        skip: options.skip || 0,
        take: options.take || 10,
      });
    } catch (error) {
      console.error('Issue findNearby error:', error);
      throw error;
    }
  }

  /**
   * Get issue statistics
   * @param {Object} filters - Optional filters
   * @returns {Promise<Object>} Issue statistics
   */
  static async getStats(filters = {}) {
    try {
      const where = {};
      if (filters.userId) where.userId = filters.userId;
      if (filters.status) where.status = filters.status;
      if (filters.priority) where.priority = filters.priority;

      const [statusStats, priorityStats, totalCount] = await Promise.all([
        prisma.issue.groupBy({
          by: ['status'],
          where,
          _count: {
            status: true,
          },
        }),
        prisma.issue.groupBy({
          by: ['priority'],
          where,
          _count: {
            priority: true,
          },
        }),
        prisma.issue.count({ where }),
      ]);

      return {
        total: totalCount,
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
    } catch (error) {
      console.error('Issue getStats error:', error);
      throw error;
    }
  }

  /**
   * Search issues by title and description
   * @param {String} searchTerm - Search term
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Search results
   */
  static async search(searchTerm, options = {}) {
    try {
      const where = {
        OR: [
          {
            title: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        ],
        ...options.where,
      };

      return await this.findMany({
        where,
        orderBy: options.orderBy || { createdAt: 'desc' },
        skip: options.skip || 0,
        take: options.take || 10,
      });
    } catch (error) {
      console.error('Issue search error:', error);
      throw error;
    }
  }

  /**
   * Update issue status
   * @param {String} id - Issue ID
   * @param {String} status - New status
   * @returns {Promise<Object>} Updated issue
   */
  static async updateStatus(id, status) {
    try {
      return await this.updateById(id, { status });
    } catch (error) {
      console.error('Issue updateStatus error:', error);
      throw error;
    }
  }
}

/**
 * Example Prisma queries for Issue model
 */
const IssueQueries = {
  /**
   * Example: Find issues with status filter and location radius
   */
  findIssuesWithFilters: async (filters = {}) => {
    const {
      status,
      priority,
      category,
      latitude,
      longitude,
      radius = 5,
      userId,
      skip = 0,
      take = 10,
    } = filters;

    const where = {};

    // Status filter
    if (status) where.status = status;

    // Priority filter
    if (priority) where.priority = priority;

    // Category filter
    if (category) {
      where.category = {
        contains: category,
        mode: 'insensitive',
      };
    }

    // User filter
    if (userId) where.userId = userId;

    // Location filter (simple bounding box)
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      const radiusInDegrees = parseFloat(radius) / 111;

      where.latitude = {
        gte: lat - radiusInDegrees,
        lte: lat + radiusInDegrees,
      };
      where.longitude = {
        gte: lng - radiusInDegrees,
        lte: lng + radiusInDegrees,
      };
    }

    return await prisma.issue.findMany({
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
      skip,
      take,
    });
  },

  /**
   * Example: Get recent issues with user info
   */
  findRecentIssues: async (days = 7, limit = 10) => {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    return await prisma.issue.findMany({
      where: {
        createdAt: {
          gte: dateThreshold,
        },
      },
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
      take: limit,
    });
  },

  /**
   * Example: Find issues by priority with pagination
   */
  findIssuesByPriority: async (priority, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;

    return await prisma.issue.findMany({
      where: { priority },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
      skip,
      take: limit,
    });
  },

  /**
   * Example: Get issues count by category
   */
  getIssueCountByCategory: async () => {
    return await prisma.issue.groupBy({
      by: ['category'],
      _count: {
        category: true,
      },
      orderBy: {
        _count: {
          category: 'desc',
        },
      },
    });
  },

  /**
   * Example: Find issues with images
   */
  findIssuesWithImages: async (options = {}) => {
    const { skip = 0, take = 10 } = options;

    return await prisma.issue.findMany({
      where: {
        imageUrl: {
          not: null,
        },
      },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        publicId: true,
        status: true,
        createdAt: true,
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
      skip,
      take,
    });
  },

  /**
   * Example: Advanced search with multiple filters
   */
  advancedSearch: async (filters = {}) => {
    const {
      search,
      status,
      priority,
      category,
      startDate,
      endDate,
      hasImage,
      skip = 0,
      take = 10,
    } = filters;

    const where = {};

    // Text search
    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    // Status filter
    if (status) where.status = status;

    // Priority filter
    if (priority) where.priority = priority;

    // Category filter
    if (category) {
      where.category = {
        contains: category,
        mode: 'insensitive',
      };
    }

    // Date range filter
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    // Image filter
    if (hasImage !== undefined) {
      where.imageUrl = hasImage ? { not: null } : null;
    }

    return await prisma.issue.findMany({
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
      skip,
      take,
    });
  },
};

module.exports = {
  IssueModel,
  IssueQueries,
};
