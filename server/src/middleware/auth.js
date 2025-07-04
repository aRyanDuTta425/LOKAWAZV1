// Authentication middleware
const { verifyToken, extractToken } = require('../utils/jwt');
const { unauthorizedResponse } = require('../utils/response');
const { prisma } = require('../config/database');

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request object
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractToken(authHeader);

    if (!token) {
      return unauthorizedResponse(res, 'Access token required');
    }

    // Verify token
    const decoded = verifyToken(token);
    
    // Check if user exists in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      }
    });

    if (!user) {
      return unauthorizedResponse(res, 'User not found');
    }

    // Attach user to request object
    req.user = user;
    req.userId = user.id;
    req.userRole = user.role;

    next();
  } catch (error) {
    if (error.message === 'Token expired') {
      return unauthorizedResponse(res, 'Token expired. Please login again');
    } else if (error.message === 'Invalid token') {
      return unauthorizedResponse(res, 'Invalid token');
    } else {
      console.error('Authentication error:', error);
      return unauthorizedResponse(res, 'Authentication failed');
    }
  }
};

/**
 * Optional authentication middleware
 * Attempts to authenticate but doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractToken(authHeader);

    if (!token) {
      req.user = null;
      req.userId = null;
      req.userRole = null;
      return next();
    }

    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      }
    });

    if (user) {
      req.user = user;
      req.userId = user.id;
      req.userRole = user.role;
    } else {
      req.user = null;
      req.userId = null;
      req.userRole = null;
    }

    next();
  } catch (error) {
    // If token is invalid, continue without authentication
    req.user = null;
    req.userId = null;
    req.userRole = null;
    next();
  }
};

module.exports = {
  authenticate,
  optionalAuth,
};