// Role-based authentication middleware
const { forbiddenResponse } = require('../utils/response');

/**
 * Role-based authorization middleware
 * @param {Array} allowedRoles - Array of allowed roles
 * @returns {Function} Middleware function
 */
const authorizeRoles = (allowedRoles) => {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user || !req.userRole) {
      return forbiddenResponse(res, 'Access denied. Authentication required');
    }

    // Check if user role is allowed
    if (!allowedRoles.includes(req.userRole)) {
      return forbiddenResponse(res, 'Access denied. Insufficient permissions');
    }

    next();
  };
};

/**
 * Admin only middleware
 */
const adminOnly = (req, res, next) => {
  if (!req.user || req.userRole !== 'ADMIN') {
    return forbiddenResponse(res, 'Access denied. Admin privileges required');
  }
  next();
};

/**
 * User only middleware
 */
const userOnly = (req, res, next) => {
  if (!req.user || req.userRole !== 'USER') {
    return forbiddenResponse(res, 'Access denied. User privileges required');
  }
  next();
};

/**
 * Resource ownership middleware
 * Checks if user owns the resource or is an admin
 */
const checkResourceOwnership = (req, res, next) => {
  const resourceUserId = req.params.userId || req.body.userId;
  
  // Admin can access any resource
  if (req.userRole === 'ADMIN') {
    return next();
  }

  // User can only access their own resources
  if (req.userId !== resourceUserId) {
    return forbiddenResponse(res, 'Access denied. You can only access your own resources');
  }

  next();
};

/**
 * Issue ownership middleware
 * Checks if user owns the issue or is an admin
 */
const checkIssueOwnership = async (req, res, next) => {
  try {
    const { prisma } = require('../config/database');
    const issueId = req.params.id || req.params.issueId;

    if (!issueId) {
      return forbiddenResponse(res, 'Issue ID required');
    }

    // Admin can access any issue
    if (req.userRole === 'ADMIN') {
      return next();
    }

    // Check if user owns the issue
    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
      select: { userId: true }
    });

    if (!issue) {
      return forbiddenResponse(res, 'Issue not found');
    }

    if (issue.userId !== req.userId) {
      return forbiddenResponse(res, 'Access denied. You can only access your own issues');
    }

    next();
  } catch (error) {
    console.error('Issue ownership check error:', error);
    return forbiddenResponse(res, 'Access verification failed');
  }
};

module.exports = {
  authorizeRoles,
  adminOnly,
  userOnly,
  checkResourceOwnership,
  checkIssueOwnership,
};