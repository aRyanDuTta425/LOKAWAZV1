// File upload middleware
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary } = require('../config/cloudinary');
const { errorResponse } = require('../utils/response');

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'lok-awaaz/issues',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      {
        width: 1200,
        height: 1200,
        crop: 'limit',
        quality: 'auto:good',
        fetch_format: 'auto',
      }
    ],
    public_id: (req, file) => {
      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      return `issue_${timestamp}_${randomString}`;
    },
  },
});

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 3, // Maximum 3 files
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'), false);
    }

    // Check file size
    if (file.size > 5 * 1024 * 1024) {
      return cb(new Error('File size too large. Maximum 5MB allowed'), false);
    }

    cb(null, true);
  },
});

/**
 * Single image upload middleware
 */
const uploadSingle = upload.single('image');

/**
 * Multiple images upload middleware
 */
const uploadMultiple = upload.array('images', 3);

/**
 * Handle multer errors
 */
const handleUploadErrors = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return errorResponse(res, 'File too large. Maximum 5MB allowed', 400);
    } else if (error.code === 'LIMIT_FILE_COUNT') {
      return errorResponse(res, 'Too many files. Maximum 3 files allowed', 400);
    } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return errorResponse(res, 'Unexpected file field', 400);
    }
  } else if (error) {
    return errorResponse(res, error.message || 'File upload failed', 400);
  }
  next();
};

/**
 * Validate uploaded file
 */
const validateUpload = (req, res, next) => {
  if (!req.file && !req.files) {
    return next(); // No file uploaded, continue
  }

  const files = req.files || [req.file];
  
  for (const file of files) {
    // Additional validation
    if (!file.mimetype.startsWith('image/')) {
      return errorResponse(res, 'Only image files are allowed', 400);
    }

    // Check if file was uploaded successfully to Cloudinary
    if (!file.path) {
      return errorResponse(res, 'File upload failed. Please try again', 500);
    }
  }

  next();
};

/**
 * Delete uploaded file from Cloudinary
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    console.log(`File deleted from Cloudinary: ${publicId}`);
  } catch (error) {
    console.error('Error deleting file from Cloudinary:', error);
  }
};

/**
 * Extract public ID from Cloudinary URL
 */
const extractPublicId = (url) => {
  try {
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    return filename.split('.')[0];
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return null;
  }
};

/**
 * Cleanup failed uploads
 */
const cleanupUploads = async (req, res, next) => {
  // This middleware should be called when an error occurs after file upload
  if (req.file && req.file.path) {
    const publicId = extractPublicId(req.file.path);
    if (publicId) {
      await deleteFromCloudinary(publicId);
    }
  }

  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      if (file.path) {
        const publicId = extractPublicId(file.path);
        if (publicId) {
          await deleteFromCloudinary(publicId);
        }
      }
    }
  }

  next();
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  handleUploadErrors,
  validateUpload,
  deleteFromCloudinary,
  extractPublicId,
  cleanupUploads,
};