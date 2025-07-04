// Upload service
const { uploadImage, deleteImage, getOptimizedUrl, generateThumbnails, extractPublicId } = require('../config/cloudinary');
const { ERROR_MESSAGES, SUCCESS_MESSAGES, FILE_UPLOAD } = require('../utils/constants');
const path = require('path');

/**
 * Upload issue image to Cloudinary
 * @param {String} filePath - Path to the file to upload
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result with URLs
 */
const uploadIssueImage = async (filePath, options = {}) => {
  try {
    if (!filePath) {
      throw new Error('File path is required');
    }

    // Set default options for issue images
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

    // Upload to Cloudinary
    const result = await uploadImage(filePath, uploadOptions);

    // Generate different sized URLs
    const thumbnails = generateThumbnails(result.public_id);

    return {
      upload: {
        publicId: result.public_id,
        url: result.url,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
        thumbnails,
      },
      message: SUCCESS_MESSAGES.FILE_UPLOADED,
    };

  } catch (error) {
    console.error('Upload issue image error:', error);
    throw new Error(error.message || ERROR_MESSAGES.UPLOAD_FAILED);
  }
};

/**
 * Upload multiple issue images
 * @param {Array} filePaths - Array of file paths
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload results
 */
const uploadMultipleIssueImages = async (filePaths, options = {}) => {
  try {
    if (!filePaths || !Array.isArray(filePaths) || filePaths.length === 0) {
      throw new Error('File paths array is required');
    }

    if (filePaths.length > FILE_UPLOAD.MAX_FILES) {
      throw new Error(`Maximum ${FILE_UPLOAD.MAX_FILES} files allowed`);
    }

    // Upload all files
    const uploadPromises = filePaths.map(filePath => uploadIssueImage(filePath, options));
    const results = await Promise.all(uploadPromises);

    return {
      uploads: results.map(result => result.upload),
      count: results.length,
      message: `${results.length} files uploaded successfully`,
    };

  } catch (error) {
    console.error('Upload multiple images error:', error);
    throw new Error(error.message || ERROR_MESSAGES.UPLOAD_FAILED);
  }
};

/**
 * Delete image from Cloudinary
 * @param {String} imageUrl - Image URL or public ID
 * @returns {Promise<Object>} Deletion result
 */
const deleteIssueImage = async (imageUrl) => {
  try {
    if (!imageUrl) {
      throw new Error('Image URL or public ID is required');
    }

    // Extract public ID from URL if needed
    let publicId = imageUrl;
    if (imageUrl.includes('cloudinary.com')) {
      publicId = extractPublicId(imageUrl);
    }

    if (!publicId) {
      throw new Error('Invalid image URL or public ID');
    }

    // Delete from Cloudinary
    const result = await deleteImage(publicId);

    return {
      deletion: {
        publicId,
        result: result.result,
      },
      message: SUCCESS_MESSAGES.FILE_DELETED,
    };

  } catch (error) {
    console.error('Delete issue image error:', error);
    throw new Error(error.message || 'Image deletion failed');
  }
};

/**
 * Delete multiple images from Cloudinary
 * @param {Array} imageUrls - Array of image URLs or public IDs
 * @returns {Promise<Object>} Deletion results
 */
const deleteMultipleIssueImages = async (imageUrls) => {
  try {
    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      throw new Error('Image URLs array is required');
    }

    // Delete all images
    const deletePromises = imageUrls.map(url => deleteIssueImage(url));
    const results = await Promise.allSettled(deletePromises);

    // Separate successful and failed deletions
    const successful = results.filter(result => result.status === 'fulfilled');
    const failed = results.filter(result => result.status === 'rejected');

    return {
      deletions: {
        successful: successful.map(result => result.value.deletion),
        failed: failed.map(result => ({ error: result.reason.message })),
      },
      summary: {
        total: imageUrls.length,
        successful: successful.length,
        failed: failed.length,
      },
      message: `${successful.length}/${imageUrls.length} images deleted successfully`,
    };

  } catch (error) {
    console.error('Delete multiple images error:', error);
    throw new Error(error.message || 'Multiple image deletion failed');
  }
};

/**
 * Get optimized image URL with transformations
 * @param {String} imageUrl - Original image URL
 * @param {Object} transformations - Image transformations
 * @returns {Promise<Object>} Optimized URL
 */
const getOptimizedImageUrl = async (imageUrl, transformations = {}) => {
  try {
    if (!imageUrl) {
      throw new Error('Image URL is required');
    }

    // Extract public ID from URL
    const publicId = extractPublicId(imageUrl);
    if (!publicId) {
      throw new Error('Invalid image URL');
    }

    // Default transformations
    const defaultTransformations = {
      quality: 'auto:good',
      fetch_format: 'auto',
      ...transformations,
    };

    // Get optimized URL
    const optimizedUrl = getOptimizedUrl(publicId, defaultTransformations);

    if (!optimizedUrl) {
      throw new Error('Failed to generate optimized URL');
    }

    return {
      optimized: {
        originalUrl: imageUrl,
        optimizedUrl,
        transformations: defaultTransformations,
      },
      message: 'Optimized URL generated successfully',
    };

  } catch (error) {
    console.error('Get optimized URL error:', error);
    throw new Error(error.message || 'URL optimization failed');
  }
};

/**
 * Validate file before upload
 * @param {Object} file - File object from multer
 * @returns {Promise<Object>} Validation result
 */
const validateFile = async (file) => {
  try {
    if (!file) {
      throw new Error('File is required');
    }

    const errors = [];

    // Check file size
    if (file.size > FILE_UPLOAD.MAX_FILE_SIZE) {
      errors.push(`File size exceeds limit of ${FILE_UPLOAD.MAX_FILE_SIZE / (1024 * 1024)}MB`);
    }

    // Check file type
    if (!FILE_UPLOAD.ALLOWED_TYPES.includes(file.mimetype)) {
      errors.push(`File type ${file.mimetype} not allowed. Allowed types: ${FILE_UPLOAD.ALLOWED_TYPES.join(', ')}`);
    }

    // Check file extension
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    if (!allowedExtensions.includes(fileExtension)) {
      errors.push(`File extension ${fileExtension} not allowed`);
    }

    const isValid = errors.length === 0;

    return {
      validation: {
        isValid,
        errors,
        file: {
          name: file.originalname,
          size: file.size,
          type: file.mimetype,
          extension: fileExtension,
        },
      },
      message: isValid ? 'File validation passed' : 'File validation failed',
    };

  } catch (error) {
    console.error('File validation error:', error);
    throw new Error(error.message || 'File validation failed');
  }
};

/**
 * Validate multiple files before upload
 * @param {Array} files - Array of file objects from multer
 * @returns {Promise<Object>} Validation result
 */
const validateMultipleFiles = async (files) => {
  try {
    if (!files || !Array.isArray(files)) {
      throw new Error('Files array is required');
    }

    if (files.length === 0) {
      throw new Error('At least one file is required');
    }

    if (files.length > FILE_UPLOAD.MAX_FILES) {
      throw new Error(`Maximum ${FILE_UPLOAD.MAX_FILES} files allowed`);
    }

    // Validate each file
    const validationPromises = files.map(file => validateFile(file));
    const results = await Promise.all(validationPromises);

    // Check if all files are valid
    const invalidFiles = results.filter(result => !result.validation.isValid);
    const isValid = invalidFiles.length === 0;

    return {
      validation: {
        isValid,
        files: results.map(result => result.validation),
        summary: {
          total: files.length,
          valid: results.length - invalidFiles.length,
          invalid: invalidFiles.length,
        },
      },
      message: isValid ? 'All files validation passed' : `${invalidFiles.length} files failed validation`,
    };

  } catch (error) {
    console.error('Multiple files validation error:', error);
    throw new Error(error.message || 'Files validation failed');
  }
};

/**
 * Process uploaded file from multer middleware
 * @param {Object} file - File object from multer with Cloudinary integration
 * @returns {Promise<Object>} Processed file information
 */
const processUploadedFile = async (file) => {
  try {
    if (!file) {
      throw new Error('File is required');
    }

    // File should already be uploaded to Cloudinary by multer middleware
    if (!file.path) {
      throw new Error('File upload failed - no Cloudinary URL');
    }

    // Extract public ID
    const publicId = extractPublicId(file.path);

    // Generate thumbnails
    const thumbnails = generateThumbnails(publicId);

    return {
      file: {
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        url: file.path,
        publicId,
        thumbnails,
      },
      message: SUCCESS_MESSAGES.FILE_UPLOADED,
    };

  } catch (error) {
    console.error('Process uploaded file error:', error);
    throw new Error(error.message || 'File processing failed');
  }
};

module.exports = {
  uploadIssueImage,
  uploadMultipleIssueImages,
  deleteIssueImage,
  deleteMultipleIssueImages,
  getOptimizedImageUrl,
  validateFile,
  validateMultipleFiles,
  processUploadedFile,
};
