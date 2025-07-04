// Cloudinary utilities
const { cloudinary } = require('../config/cloudinary');
const { FILE_UPLOAD } = require('./constants');

/**
 * Upload image to Cloudinary
 * @param {String|Buffer} file - File path or buffer
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result
 */
const uploadToCloudinary = async (file, options = {}) => {
  try {
    const uploadOptions = {
      folder: FILE_UPLOAD.CLOUDINARY_FOLDER,
      resource_type: 'image',
      transformation: [
        {
          width: 1200,
          height: 1200,
          crop: 'limit',
          quality: 'auto:good',
          fetch_format: 'auto',
        }
      ],
      ...options,
    };

    const result = await cloudinary.uploader.upload(file, uploadOptions);
    
    return {
      success: true,
      data: {
        public_id: result.public_id,
        url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
        created_at: result.created_at,
      }
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message || 'Upload failed',
    };
  }
};

/**
 * Delete image from Cloudinary
 * @param {String} publicId - Public ID of the image
 * @returns {Promise<Object>} Deletion result
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) {
      return {
        success: false,
        error: 'Public ID is required',
      };
    }

    const result = await cloudinary.uploader.destroy(publicId);
    
    return {
      success: result.result === 'ok',
      data: {
        public_id: publicId,
        result: result.result,
      }
    };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return {
      success: false,
      error: error.message || 'Deletion failed',
    };
  }
};

/**
 * Generate optimized image URL
 * @param {String} publicId - Public ID of the image
 * @param {Object} transformations - Image transformations
 * @returns {String} Optimized image URL
 */
const generateOptimizedUrl = (publicId, transformations = {}) => {
  try {
    if (!publicId) {
      return null;
    }

    const defaultTransformations = {
      quality: 'auto:good',
      fetch_format: 'auto',
      ...transformations,
    };

    return cloudinary.url(publicId, defaultTransformations);
  } catch (error) {
    console.error('URL generation error:', error);
    return null;
  }
};

/**
 * Generate multiple sized image URLs
 * @param {String} publicId - Public ID of the image
 * @returns {Object} Different sized URLs
 */
const generateImageSizes = (publicId) => {
  try {
    if (!publicId) {
      return null;
    }

    return {
      thumbnail: cloudinary.url(publicId, {
        width: 150,
        height: 150,
        crop: 'fill',
        gravity: 'center',
        quality: 'auto:good',
        fetch_format: 'auto',
      }),
      small: cloudinary.url(publicId, {
        width: 300,
        height: 300,
        crop: 'limit',
        quality: 'auto:good',
        fetch_format: 'auto',
      }),
      medium: cloudinary.url(publicId, {
        width: 600,
        height: 600,
        crop: 'limit',
        quality: 'auto:good',
        fetch_format: 'auto',
      }),
      large: cloudinary.url(publicId, {
        width: 1200,
        height: 1200,
        crop: 'limit',
        quality: 'auto:good',
        fetch_format: 'auto',
      }),
      original: cloudinary.url(publicId, {
        quality: 'auto:good',
        fetch_format: 'auto',
      }),
    };
  } catch (error) {
    console.error('Image sizes generation error:', error);
    return null;
  }
};

/**
 * Extract public ID from Cloudinary URL
 * @param {String} url - Cloudinary URL
 * @returns {String|null} Public ID
 */
const extractPublicIdFromUrl = (url) => {
  try {
    if (!url || typeof url !== 'string') {
      return null;
    }

    // Check if it's a Cloudinary URL
    if (!url.includes('cloudinary.com')) {
      return null;
    }

    // Extract public ID from URL
    const urlParts = url.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    
    if (uploadIndex === -1) {
      return null;
    }

    // Get everything after version (if present) or after upload/transformations
    const relevantParts = urlParts.slice(uploadIndex + 1);
    
    // Remove version if present (starts with 'v' followed by numbers)
    const versionIndex = relevantParts.findIndex(part => /^v\d+$/.test(part));
    const pathParts = versionIndex !== -1 ? relevantParts.slice(versionIndex + 1) : relevantParts;
    
    // Join the path and remove file extension
    const fullPath = pathParts.join('/');
    const lastDotIndex = fullPath.lastIndexOf('.');
    
    return lastDotIndex !== -1 ? fullPath.substring(0, lastDotIndex) : fullPath;
  } catch (error) {
    console.error('Public ID extraction error:', error);
    return null;
  }
};

/**
 * Validate image file
 * @param {Object} file - File object
 * @returns {Object} Validation result
 */
const validateImageFile = (file) => {
  const errors = [];

  if (!file) {
    errors.push('File is required');
    return {
      isValid: false,
      errors,
    };
  }

  // Check file size
  if (file.size > FILE_UPLOAD.MAX_FILE_SIZE) {
    errors.push(`File size exceeds limit of ${FILE_UPLOAD.MAX_FILE_SIZE / (1024 * 1024)}MB`);
  }

  // Check file type
  if (!FILE_UPLOAD.ALLOWED_TYPES.includes(file.mimetype)) {
    errors.push(`File type ${file.mimetype} not allowed. Allowed types: ${FILE_UPLOAD.ALLOWED_TYPES.join(', ')}`);
  }

  // Check file name
  if (!file.originalname || file.originalname.trim() === '') {
    errors.push('File must have a valid name');
  }

  return {
    isValid: errors.length === 0,
    errors,
    fileInfo: {
      name: file.originalname,
      size: file.size,
      type: file.mimetype,
    },
  };
};

/**
 * Validate multiple image files
 * @param {Array} files - Array of file objects
 * @returns {Object} Validation result
 */
const validateMultipleImageFiles = (files) => {
  if (!files || !Array.isArray(files)) {
    return {
      isValid: false,
      errors: ['Files must be provided as an array'],
    };
  }

  if (files.length === 0) {
    return {
      isValid: false,
      errors: ['At least one file is required'],
    };
  }

  if (files.length > FILE_UPLOAD.MAX_FILES) {
    return {
      isValid: false,
      errors: [`Maximum ${FILE_UPLOAD.MAX_FILES} files allowed`],
    };
  }

  const results = files.map((file, index) => ({
    index,
    ...validateImageFile(file),
  }));

  const invalidFiles = results.filter(result => !result.isValid);
  const allErrors = invalidFiles.reduce((acc, result) => {
    const fileErrors = result.errors.map(error => `File ${result.index + 1}: ${error}`);
    return acc.concat(fileErrors);
  }, []);

  return {
    isValid: invalidFiles.length === 0,
    errors: allErrors,
    results,
    summary: {
      total: files.length,
      valid: results.length - invalidFiles.length,
      invalid: invalidFiles.length,
    },
  };
};

/**
 * Generate unique filename
 * @param {String} originalName - Original filename
 * @param {String} prefix - Optional prefix
 * @returns {String} Unique filename
 */
const generateUniqueFilename = (originalName = '', prefix = 'img') => {
  try {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = originalName.split('.').pop() || 'jpg';
    
    return `${prefix}_${timestamp}_${randomString}.${extension}`;
  } catch (error) {
    console.error('Filename generation error:', error);
    return `${prefix}_${Date.now()}.jpg`;
  }
};

/**
 * Get image metadata from Cloudinary
 * @param {String} publicId - Public ID of the image
 * @returns {Promise<Object>} Image metadata
 */
const getImageMetadata = async (publicId) => {
  try {
    if (!publicId) {
      return {
        success: false,
        error: 'Public ID is required',
      };
    }

    const result = await cloudinary.api.resource(publicId, {
      image_metadata: true,
    });

    return {
      success: true,
      data: {
        public_id: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        url: result.secure_url,
        created_at: result.created_at,
        uploaded_at: result.uploaded_at,
      },
    };
  } catch (error) {
    console.error('Get image metadata error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get image metadata',
    };
  }
};

/**
 * Bulk delete images from Cloudinary
 * @param {Array} publicIds - Array of public IDs
 * @returns {Promise<Object>} Bulk deletion result
 */
const bulkDeleteFromCloudinary = async (publicIds) => {
  try {
    if (!publicIds || !Array.isArray(publicIds) || publicIds.length === 0) {
      return {
        success: false,
        error: 'Public IDs array is required',
      };
    }

    const result = await cloudinary.api.delete_resources(publicIds);

    return {
      success: true,
      data: {
        deleted: result.deleted,
        deleted_counts: result.deleted_counts,
        partial: result.partial,
        rate_limit_allowed: result.rate_limit_allowed,
        rate_limit_remaining: result.rate_limit_remaining,
      },
    };
  } catch (error) {
    console.error('Bulk delete error:', error);
    return {
      success: false,
      error: error.message || 'Bulk deletion failed',
    };
  }
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
  generateOptimizedUrl,
  generateImageSizes,
  extractPublicIdFromUrl,
  validateImageFile,
  validateMultipleImageFiles,
  generateUniqueFilename,
  getImageMetadata,
  bulkDeleteFromCloudinary,
};
