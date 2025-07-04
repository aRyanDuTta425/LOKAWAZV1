// Cloudinary configuration
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Force HTTPS URLs
});

/**
 * Upload image to Cloudinary
 * @param {String} filePath - Path to the file
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result
 */
const uploadImage = async (filePath, options = {}) => {
  try {
    const defaultOptions = {
      folder: 'lok-awaaz/issues',
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

    const result = await cloudinary.uploader.upload(filePath, defaultOptions);
    return {
      public_id: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Image upload failed');
  }
};

/**
 * Delete image from Cloudinary
 * @param {String} publicId - Public ID of the image
 * @returns {Promise<Object>} Deletion result
 */
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Image deletion failed');
  }
};

/**
 * Get optimized image URL
 * @param {String} publicId - Public ID of the image
 * @param {Object} transformations - Image transformations
 * @returns {String} Optimized image URL
 */
const getOptimizedUrl = (publicId, transformations = {}) => {
  try {
    const defaultTransformations = {
      quality: 'auto:good',
      fetch_format: 'auto',
      ...transformations,
    };

    return cloudinary.url(publicId, defaultTransformations);
  } catch (error) {
    console.error('Cloudinary URL generation error:', error);
    return null;
  }
};

/**
 * Generate image thumbnails
 * @param {String} publicId - Public ID of the image
 * @returns {Object} Different sized URLs
 */
const generateThumbnails = (publicId) => {
  try {
    return {
      thumbnail: cloudinary.url(publicId, {
        width: 150,
        height: 150,
        crop: 'fill',
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
    };
  } catch (error) {
    console.error('Thumbnail generation error:', error);
    return null;
  }
};

/**
 * Extract public ID from Cloudinary URL
 * @param {String} url - Cloudinary URL
 * @returns {String|null} Public ID
 */
const extractPublicId = (url) => {
  try {
    if (!url || !url.includes('cloudinary.com')) {
      return null;
    }

    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    const publicId = filename.split('.')[0];
    
    // Include folder path if present
    const folderIndex = parts.indexOf('lok-awaaz');
    if (folderIndex !== -1) {
      const folderPath = parts.slice(folderIndex, -1).join('/');
      return `${folderPath}/${publicId}`;
    }
    
    return publicId;
  } catch (error) {
    console.error('Public ID extraction error:', error);
    return null;
  }
};

/**
 * Validate Cloudinary configuration
 * @returns {Boolean} Configuration status
 */
const validateConfig = () => {
  const { cloud_name, api_key, api_secret } = cloudinary.config();
  
  if (!cloud_name || !api_key || !api_secret) {
    console.error('Cloudinary configuration is incomplete. Please check environment variables.');
    return false;
  }
  
  console.log('✅ Cloudinary configuration is valid');
  return true;
};

module.exports = {
  cloudinary,
  uploadImage,
  deleteImage,
  getOptimizedUrl,
  generateThumbnails,
  extractPublicId,
  validateConfig,
};
