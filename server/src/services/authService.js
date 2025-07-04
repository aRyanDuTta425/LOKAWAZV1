// Authentication service
const { prisma } = require('../config/database');
const { hashPassword, comparePassword } = require('../utils/bcrypt');
const { generateToken } = require('../utils/jwt');
const { ERROR_MESSAGES, SUCCESS_MESSAGES } = require('../utils/constants');

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @param {String} userData.name - User's full name
 * @param {String} userData.email - User's email address
 * @param {String} userData.password - User's password
 * @param {String} userData.role - User's role (optional, defaults to USER)
 * @returns {Promise<Object>} Created user and token
 */
const registerUser = async (userData) => {
  try {
    const { name, email, password, role = 'USER' } = userData;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      throw new Error(ERROR_MESSAGES.DUPLICATE_EMAIL);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase(),
        password: hashedPassword,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      }
    });

    // Generate JWT token
    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    return {
      user: newUser,
      token,
      message: SUCCESS_MESSAGES.REGISTER_SUCCESS,
    };

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle Prisma specific errors
    if (error.code === 'P2002') {
      throw new Error(ERROR_MESSAGES.DUPLICATE_EMAIL);
    }
    
    throw error;
  }
};

/**
 * Login user
 * @param {String} email - User's email address
 * @param {String} password - User's password
 * @returns {Promise<Object>} User data and token
 */
const loginUser = async (email, password) => {
  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        createdAt: true,
      }
    });

    if (!user) {
      throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: userWithoutPassword,
      token,
      message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
    };

  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Verify user token and get user data
 * @param {String} userId - User ID from token
 * @returns {Promise<Object>} User data
 */
const verifyUser = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      }
    });

    if (!user) {
      throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    return {
      user,
      message: 'User verified successfully',
    };

  } catch (error) {
    console.error('User verification error:', error);
    throw error;
  }
};

/**
 * Change user password
 * @param {String} userId - User ID
 * @param {String} currentPassword - Current password
 * @param {String} newPassword - New password
 * @returns {Promise<Object>} Success message
 */
const changePassword = async (userId, currentPassword, newPassword) => {
  try {
    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        password: true,
      }
    });

    if (!user) {
      throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });

    return {
      message: SUCCESS_MESSAGES.PASSWORD_CHANGED,
    };

  } catch (error) {
    console.error('Password change error:', error);
    throw error;
  }
};

/**
 * Get user profile data
 * @param {String} userId - User ID
 * @returns {Promise<Object>} User profile data
 */
const getUserProfile = async (userId) => {
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
    console.error('Get user profile error:', error);
    throw error;
  }
};

/**
 * Refresh JWT token
 * @param {String} userId - User ID
 * @returns {Promise<Object>} New token
 */
const refreshToken = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
      }
    });

    if (!user) {
      throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    // Generate new JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      message: SUCCESS_MESSAGES.TOKEN_REFRESHED,
    };

  } catch (error) {
    console.error('Token refresh error:', error);
    throw error;
  }
};

/**
 * Delete user account
 * @param {String} userId - User ID
 * @param {String} password - User's password for confirmation
 * @returns {Promise<Object>} Success message
 */
const deleteAccount = async (userId, password) => {
  try {
    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        password: true,
      }
    });

    if (!user) {
      throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Password is incorrect');
    }

    // Delete user (this will cascade delete all issues due to Prisma schema)
    await prisma.user.delete({
      where: { id: userId }
    });

    return {
      message: SUCCESS_MESSAGES.ACCOUNT_DELETED,
    };

  } catch (error) {
    console.error('Delete account error:', error);
    throw error;
  }
};

module.exports = {
  registerUser,
  loginUser,
  verifyUser,
  changePassword,
  getUserProfile,
  refreshToken,
  deleteAccount,
};
