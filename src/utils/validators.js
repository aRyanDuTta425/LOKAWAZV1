// src/utils/validators.js

// Email validation
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation
export const isValidPassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Phone number validation (basic)
export const isValidPhone = (phone) => {
  const phoneRegex = /^\+?[\d\s-()]{10,}$/;
  return phoneRegex.test(phone);
};

// Name validation
export const isValidName = (name) => {
  return name && name.trim().length >= 2;
};

// Validation functions for forms
export const validateLoginForm = (email, password) => {
  const errors = {};

  if (!email) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
};

export const validateRegistrationForm = (name, email, password, confirmPassword, phone) => {
  const errors = {};

  if (!name) {
    errors.name = 'Name is required';
  } else if (!isValidName(name)) {
    errors.name = 'Name must be at least 2 characters';
  }

  if (!email) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (!isValidPassword(password)) {
    errors.password = 'Password must be at least 8 characters with uppercase, lowercase, and number';
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  if (phone && !isValidPhone(phone)) {
    errors.phone = 'Please enter a valid phone number';
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
};

export const validateIssueForm = (title, description, category, location) => {
  const errors = {};

  if (!title) {
    errors.title = 'Title is required';
  } else if (title.length < 5) {
    errors.title = 'Title must be at least 5 characters';
  } else if (title.length > 100) {
    errors.title = 'Title must not exceed 100 characters';
  }

  if (!description) {
    errors.description = 'Description is required';
  } else if (description.length < 10) {
    errors.description = 'Description must be at least 10 characters';
  } else if (description.length > 1000) {
    errors.description = 'Description must not exceed 1000 characters';
  }

  if (!category) {
    errors.category = 'Category is required';
  }

  if (!location || !location.latitude || !location.longitude) {
    errors.location = 'Location is required';
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
};

// Helper function to format validation errors for display
export const formatValidationErrors = (errors) => {
  return Object.values(errors).join(', ');
};

// Sanitize input (basic)
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000); // Limit length
};

// Validate file upload
export const validateFileUpload = (file, maxSize = 5 * 1024 * 1024) => { // 5MB default
  const errors = {};

  if (!file) {
    errors.file = 'File is required';
    return { errors, isValid: false };
  }

  // Check file size
  if (file.size > maxSize) {
    errors.file = `File size must be less than ${maxSize / (1024 * 1024)}MB`;
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    errors.file = 'Only JPEG, PNG, GIF, and WebP images are allowed';
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
};