// Validation utilities
const { VALIDATION, REGEX_PATTERNS } = require('./constants');

/**
 * Validate email address
 * @param {String} email - Email to validate
 * @returns {Object} Validation result
 */
const validateEmail = (email) => {
  const errors = [];
  
  if (!email) {
    errors.push('Email is required');
  } else if (typeof email !== 'string') {
    errors.push('Email must be a string');
  } else if (!REGEX_PATTERNS.EMAIL.test(email.trim())) {
    errors.push('Please provide a valid email address');
  } else if (email.length > 255) {
    errors.push('Email address is too long');
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized: email ? email.trim().toLowerCase() : '',
  };
};

/**
 * Validate password strength
 * @param {String} password - Password to validate
 * @returns {Object} Validation result
 */
const validatePassword = (password) => {
  const errors = [];
  
  if (!password) {
    errors.push('Password is required');
    return {
      isValid: false,
      errors,
      strength: 'None',
    };
  }

  if (typeof password !== 'string') {
    errors.push('Password must be a string');
  } else {
    if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
      errors.push(`Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters long`);
    }

    if (password.length > 128) {
      errors.push('Password is too long (maximum 128 characters)');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[@$!%*?&]/.test(password)) {
      errors.push('Password must contain at least one special character (@$!%*?&)');
    }

    // Check for common weak patterns
    if (/(.)\1{2,}/.test(password)) {
      errors.push('Password should not contain repeated characters');
    }

    if (/123|abc|qwe|password|admin/i.test(password)) {
      errors.push('Password should not contain common patterns');
    }
  }

  // Calculate strength
  let strength = 'Weak';
  if (errors.length === 0) {
    strength = 'Strong';
  } else if (errors.length <= 2) {
    strength = 'Medium';
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
  };
};

/**
 * Validate user name
 * @param {String} name - Name to validate
 * @returns {Object} Validation result
 */
const validateName = (name) => {
  const errors = [];
  
  if (!name) {
    errors.push('Name is required');
  } else if (typeof name !== 'string') {
    errors.push('Name must be a string');
  } else {
    const trimmed = name.trim();
    
    if (trimmed.length < VALIDATION.NAME_MIN_LENGTH) {
      errors.push(`Name must be at least ${VALIDATION.NAME_MIN_LENGTH} characters long`);
    }

    if (trimmed.length > VALIDATION.NAME_MAX_LENGTH) {
      errors.push(`Name must not exceed ${VALIDATION.NAME_MAX_LENGTH} characters`);
    }

    if (!REGEX_PATTERNS.NAME.test(trimmed)) {
      errors.push('Name must contain only letters and spaces');
    }

    if (/^\s|\s$/.test(name)) {
      errors.push('Name should not start or end with spaces');
    }

    if (/\s{2,}/.test(trimmed)) {
      errors.push('Name should not contain multiple consecutive spaces');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized: name ? name.trim().replace(/\s+/g, ' ') : '',
  };
};

/**
 * Validate coordinates (latitude and longitude)
 * @param {Number} latitude - Latitude coordinate
 * @param {Number} longitude - Longitude coordinate
 * @returns {Object} Validation result
 */
const validateCoordinates = (latitude, longitude) => {
  const errors = [];
  
  // Validate latitude
  if (latitude === undefined || latitude === null) {
    errors.push('Latitude is required');
  } else {
    const lat = parseFloat(latitude);
    if (isNaN(lat)) {
      errors.push('Latitude must be a valid number');
    } else if (lat < -90 || lat > 90) {
      errors.push('Latitude must be between -90 and 90 degrees');
    }
  }

  // Validate longitude
  if (longitude === undefined || longitude === null) {
    errors.push('Longitude is required');
  } else {
    const lng = parseFloat(longitude);
    if (isNaN(lng)) {
      errors.push('Longitude must be a valid number');
    } else if (lng < -180 || lng > 180) {
      errors.push('Longitude must be between -180 and 180 degrees');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized: {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    },
  };
};

/**
 * Validate issue title
 * @param {String} title - Title to validate
 * @returns {Object} Validation result
 */
const validateIssueTitle = (title) => {
  const errors = [];
  
  if (!title) {
    errors.push('Title is required');
  } else if (typeof title !== 'string') {
    errors.push('Title must be a string');
  } else {
    const trimmed = title.trim();
    
    if (trimmed.length < VALIDATION.TITLE_MIN_LENGTH) {
      errors.push(`Title must be at least ${VALIDATION.TITLE_MIN_LENGTH} characters long`);
    }

    if (trimmed.length > VALIDATION.TITLE_MAX_LENGTH) {
      errors.push(`Title must not exceed ${VALIDATION.TITLE_MAX_LENGTH} characters`);
    }

    if (/^\s|\s$/.test(title)) {
      errors.push('Title should not start or end with spaces');
    }

    // Check for inappropriate content (basic)
    if (/\b(spam|test|fake)\b/i.test(trimmed)) {
      errors.push('Title appears to contain inappropriate content');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized: title ? title.trim().replace(/\s+/g, ' ') : '',
  };
};

/**
 * Validate issue description
 * @param {String} description - Description to validate
 * @returns {Object} Validation result
 */
const validateDescription = (description) => {
  const errors = [];
  
  if (description !== undefined && description !== null) {
    if (typeof description !== 'string') {
      errors.push('Description must be a string');
    } else {
      const trimmed = description.trim();
      
      if (trimmed.length > VALIDATION.DESCRIPTION_MAX_LENGTH) {
        errors.push(`Description must not exceed ${VALIDATION.DESCRIPTION_MAX_LENGTH} characters`);
      }

      if (trimmed.length > 0 && trimmed.length < 10) {
        errors.push('Description should be at least 10 characters if provided');
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized: description ? description.trim().replace(/\s+/g, ' ') : '',
  };
};

/**
 * Validate pagination parameters
 * @param {Number} page - Page number
 * @param {Number} limit - Items per page
 * @returns {Object} Validation result
 */
const validatePagination = (page, limit) => {
  const errors = [];
  let sanitizedPage = 1;
  let sanitizedLimit = 10;

  // Validate page
  if (page !== undefined && page !== null) {
    const pageNum = parseInt(page);
    if (isNaN(pageNum) || pageNum < 1) {
      errors.push('Page must be a positive integer');
    } else if (pageNum > 1000) {
      errors.push('Page number is too large (maximum 1000)');
    } else {
      sanitizedPage = pageNum;
    }
  }

  // Validate limit
  if (limit !== undefined && limit !== null) {
    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1) {
      errors.push('Limit must be a positive integer');
    } else if (limitNum > 100) {
      errors.push('Limit is too large (maximum 100)');
    } else {
      sanitizedLimit = limitNum;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized: {
      page: sanitizedPage,
      limit: sanitizedLimit,
    },
  };
};

/**
 * Validate enum value
 * @param {String} value - Value to validate
 * @param {Array} allowedValues - Array of allowed values
 * @param {String} fieldName - Name of the field being validated
 * @returns {Object} Validation result
 */
const validateEnum = (value, allowedValues, fieldName = 'Value') => {
  const errors = [];
  
  if (value !== undefined && value !== null) {
    if (!allowedValues.includes(value)) {
      errors.push(`${fieldName} must be one of: ${allowedValues.join(', ')}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized: value,
  };
};

/**
 * Validate URL
 * @param {String} url - URL to validate
 * @param {Boolean} required - Whether URL is required
 * @returns {Object} Validation result
 */
const validateUrl = (url, required = false) => {
  const errors = [];
  
  if (!url) {
    if (required) {
      errors.push('URL is required');
    }
  } else if (typeof url !== 'string') {
    errors.push('URL must be a string');
  } else {
    try {
      new URL(url);
      
      if (!REGEX_PATTERNS.URL.test(url)) {
        errors.push('URL must start with http:// or https://');
      }

      if (url.length > 2048) {
        errors.push('URL is too long');
      }
    } catch {
      errors.push('Please provide a valid URL');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized: url ? url.trim() : '',
  };
};

/**
 * Validate ID format (for database IDs)
 * @param {String} id - ID to validate
 * @returns {Object} Validation result
 */
const validateId = (id) => {
  const errors = [];
  
  if (!id) {
    errors.push('ID is required');
  } else if (typeof id !== 'string') {
    errors.push('ID must be a string');
  } else {
    const trimmed = id.trim();
    
    if (trimmed.length === 0) {
      errors.push('ID cannot be empty');
    } else if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      errors.push('ID contains invalid characters');
    } else if (trimmed.length < 10 || trimmed.length > 30) {
      errors.push('ID length is invalid');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized: id ? id.trim() : '',
  };
};

/**
 * Sanitize search query
 * @param {String} query - Search query to sanitize
 * @returns {String} Sanitized query
 */
const sanitizeSearchQuery = (query) => {
  if (!query || typeof query !== 'string') {
    return '';
  }

  return query
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML
    .replace(/['"]/g, '') // Remove quotes
    .replace(/\s+/g, ' ') // Normalize spaces
    .substring(0, 100); // Limit length
};

/**
 * Validate and sanitize multiple fields
 * @param {Object} data - Data object to validate
 * @param {Object} rules - Validation rules
 * @returns {Object} Validation result
 */
const validateFields = (data, rules) => {
  const errors = {};
  const sanitized = {};
  let isValid = true;

  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field];
    let result;

    switch (rule.type) {
      case 'email':
        result = validateEmail(value);
        break;
      case 'password':
        result = validatePassword(value);
        break;
      case 'name':
        result = validateName(value);
        break;
      case 'title':
        result = validateIssueTitle(value);
        break;
      case 'description':
        result = validateDescription(value);
        break;
      case 'url':
        result = validateUrl(value, rule.required);
        break;
      case 'enum':
        result = validateEnum(value, rule.values, field);
        break;
      case 'id':
        result = validateId(value);
        break;
      default:
        result = { isValid: true, errors: [], sanitized: value };
    }

    if (!result.isValid) {
      errors[field] = result.errors;
      isValid = false;
    }

    if (result.sanitized !== undefined) {
      sanitized[field] = result.sanitized;
    }
  }

  return {
    isValid,
    errors,
    sanitized,
  };
};

module.exports = {
  validateEmail,
  validatePassword,
  validateName,
  validateCoordinates,
  validateIssueTitle,
  validateDescription,
  validatePagination,
  validateEnum,
  validateUrl,
  validateId,
  sanitizeSearchQuery,
  validateFields,
};
