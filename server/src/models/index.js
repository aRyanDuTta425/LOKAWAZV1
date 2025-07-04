// Models index - Export all model utilities and functions
const { UserModel, UserQueries } = require('./User');
const { IssueModel, IssueQueries } = require('./Issue');
const { prisma } = require('../config/database');

/**
 * Model utilities and common database operations
 */
const Models = {
  User: UserModel,
  Issue: IssueModel,
};

/**
 * Example queries and complex database operations
 */
const Queries = {
  User: UserQueries,
  Issue: IssueQueries,
};

/**
 * Database utility functions
 */
const DatabaseUtils = {
  /**
   * Check database connection
   * @returns {Promise<Boolean>} Connection status
   */
  async checkConnection() {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('Database connection check failed:', error);
      return false;
    }
  },

  /**
   * Disconnect from database
   * @returns {Promise<void>}
   */
  async disconnect() {
    try {
      await prisma.$disconnect();
      console.log('Database disconnected successfully');
    } catch (error) {
      console.error('Database disconnect error:', error);
      throw error;
    }
  },

  /**
   * Execute raw SQL query
   * @param {String} query - SQL query string
   * @param {Array} params - Query parameters
   * @returns {Promise<Array>} Query results
   */
  async rawQuery(query, params = []) {
    try {
      return await prisma.$queryRawUnsafe(query, ...params);
    } catch (error) {
      console.error('Raw query error:', error);
      throw error;
    }
  },

  /**
   * Execute transaction
   * @param {Function} fn - Transaction function
   * @returns {Promise<any>} Transaction result
   */
  async transaction(fn) {
    try {
      return await prisma.$transaction(fn);
    } catch (error) {
      console.error('Transaction error:', error);
      throw error;
    }
  },

  /**
   * Get database metrics
   * @returns {Promise<Object>} Database metrics
   */
  async getMetrics() {
    try {
      const [userCount, issueCount, recentIssues, usersByRole, issuesByStatus] = await Promise.all([
        prisma.user.count(),
        prisma.issue.count(),
        prisma.issue.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
            },
          },
        }),
        prisma.user.groupBy({
          by: ['role'],
          _count: {
            role: true,
          },
        }),
        prisma.issue.groupBy({
          by: ['status'],
          _count: {
            status: true,
          },
        }),
      ]);

      return {
        users: {
          total: userCount,
          byRole: usersByRole.reduce((acc, item) => {
            acc[item.role.toLowerCase()] = item._count.role;
            return acc;
          }, {}),
        },
        issues: {
          total: issueCount,
          recentCount: recentIssues,
          byStatus: issuesByStatus.reduce((acc, item) => {
            acc[item.status.toLowerCase()] = item._count.status;
            return acc;
          }, {}),
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Get metrics error:', error);
      throw error;
    }
  },
};

/**
 * Advanced query builders
 */
const QueryBuilders = {
  /**
   * Build user search query
   * @param {Object} filters - Search filters
   * @returns {Object} Prisma where clause
   */
  buildUserSearchQuery(filters = {}) {
    const { search, role, startDate, endDate } = filters;
    const where = {};

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          email: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    return where;
  },

  /**
   * Build issue search query
   * @param {Object} filters - Search filters
   * @returns {Object} Prisma where clause
   */
  buildIssueSearchQuery(filters = {}) {
    const {
      search,
      status,
      priority,
      category,
      userId,
      startDate,
      endDate,
      hasImage,
      latitude,
      longitude,
      radius,
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
    if (status) {
      if (Array.isArray(status)) {
        where.status = { in: status };
      } else {
        where.status = status;
      }
    }

    // Priority filter
    if (priority) {
      if (Array.isArray(priority)) {
        where.priority = { in: priority };
      } else {
        where.priority = priority;
      }
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

    // Location filter (simple bounding box)
    if (latitude && longitude && radius) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      const radiusInDegrees = parseFloat(radius) / 111; // Rough conversion

      where.latitude = {
        gte: lat - radiusInDegrees,
        lte: lat + radiusInDegrees,
      };
      where.longitude = {
        gte: lng - radiusInDegrees,
        lte: lng + radiusInDegrees,
      };
    }

    return where;
  },

  /**
   * Build pagination options
   * @param {Number} page - Page number
   * @param {Number} limit - Items per page
   * @returns {Object} Pagination options
   */
  buildPaginationOptions(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const take = Math.min(limit, 100); // Max 100 items per page

    return { skip, take };
  },

  /**
   * Build sort options
   * @param {String} sortBy - Field to sort by
   * @param {String} order - Sort order (asc/desc)
   * @returns {Object} Sort options
   */
  buildSortOptions(sortBy = 'createdAt', order = 'desc') {
    const allowedSortFields = ['createdAt', 'updatedAt', 'name', 'email', 'title', 'status', 'priority'];
    const allowedOrders = ['asc', 'desc'];

    const field = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const direction = allowedOrders.includes(order) ? order : 'desc';

    return { [field]: direction };
  },
};

/**
 * Seed data functions for development/testing
 */
const SeedData = {
  /**
   * Create admin user
   * @param {Object} userData - Admin user data
   * @returns {Promise<Object>} Created admin user
   */
  async createAdminUser(userData = {}) {
    const defaultAdmin = {
      name: 'System Admin',
      email: 'admin@lokawaaz.com',
      password: 'hashed_password_here', // Should be properly hashed
      role: 'ADMIN',
      ...userData,
    };

    try {
      return await Models.User.create(defaultAdmin);
    } catch (error) {
      if (error.code === 'P2002') {
        console.log('Admin user already exists');
        return await Models.User.findByEmail(defaultAdmin.email);
      }
      throw error;
    }
  },

  /**
   * Create sample issues for testing
   * @param {String} userId - User ID to create issues for
   * @returns {Promise<Array>} Created issues
   */
  async createSampleIssues(userId) {
    const sampleIssues = [
      {
        title: 'Broken Street Light',
        description: 'Street light on Main Street is not working',
        latitude: 28.6139,
        longitude: 77.2090,
        status: 'NEW',
        priority: 'MEDIUM',
        category: 'Infrastructure',
        userId,
      },
      {
        title: 'Pothole on Highway',
        description: 'Large pothole causing traffic issues',
        latitude: 28.6129,
        longitude: 77.2085,
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        category: 'Roads',
        userId,
      },
    ];

    try {
      const createdIssues = [];
      for (const issue of sampleIssues) {
        const created = await Models.Issue.create(issue);
        createdIssues.push(created);
      }
      return createdIssues;
    } catch (error) {
      console.error('Error creating sample issues:', error);
      throw error;
    }
  },
};

// Export everything
module.exports = {
  // Model classes
  Models,
  UserModel,
  IssueModel,

  // Query examples
  Queries,
  UserQueries,
  IssueQueries,

  // Utilities
  DatabaseUtils,
  QueryBuilders,
  SeedData,

  // Prisma instance
  prisma,
};
