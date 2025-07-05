import axios from 'axios';

// Cloudinary configuration
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`;
const UPLOAD_PRESET = 'lokawaz_uploads'; // You'll need to create this preset in Cloudinary

class UploadService {
  // Upload single image to Cloudinary
  async uploadImage(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('folder', 'lokawaz/issues');

      const response = await axios.post(CLOUDINARY_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        url: response.data.secure_url,
        publicId: response.data.public_id,
        width: response.data.width,
        height: response.data.height,
        format: response.data.format,
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  }

  // Upload multiple images
  async uploadMultipleImages(files) {
    try {
      const uploadPromises = files.map(file => this.uploadImage(file));
      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      console.error('Error uploading multiple images:', error);
      throw new Error('Failed to upload images');
    }
  }

  // Delete image from Cloudinary
  async deleteImage(publicId) {
    try {
      // This would typically be done on the backend for security
      // For now, we'll just return success
      // In production, call your backend API to delete the image
      const response = await axios.delete(`/api/upload/delete/${publicId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting image:', error);
      throw new Error('Failed to delete image');
    }
  }

  // Validate file before upload
  validateFile(file) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
    }

    if (file.size > maxSize) {
      throw new Error('File size too large. Maximum size is 5MB.');
    }

    return true;
  }

  // Validate multiple files
  validateFiles(files) {
    if (files.length > 5) {
      throw new Error('Maximum 5 images allowed per issue.');
    }

    files.forEach(file => this.validateFile(file));
    return true;
  }

  // Compress image before upload (optional)
  async compressImage(file, quality = 0.8) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        const maxWidth = 1200;
        const maxHeight = 800;
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };

      img.src = URL.createObjectURL(file);
    });
  }

  // Create image preview
  createImagePreview(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        resolve({
          file,
          preview: e.target.result,
          name: file.name,
          size: file.size,
          type: file.type,
        });
      };
      
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Create multiple image previews
  async createImagePreviews(files) {
    try {
      const previewPromises = Array.from(files).map(file => this.createImagePreview(file));
      const previews = await Promise.all(previewPromises);
      return previews;
    } catch (error) {
      console.error('Error creating image previews:', error);
      throw new Error('Failed to create image previews');
    }
  }

  // Get optimized image URL (Cloudinary transformations)
  getOptimizedImageUrl(url, options = {}) {
    const {
      width = 400,
      height = 300,
      quality = 'auto',
      format = 'auto',
      crop = 'fill',
    } = options;

    // Extract public ID from Cloudinary URL
    const publicIdMatch = url.match(/\/v\d+\/(.+)\./);
    if (!publicIdMatch) return url;

    const publicId = publicIdMatch[1];
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

    return `https://res.cloudinary.com/${cloudName}/image/upload/c_${crop},h_${height},w_${width},q_${quality},f_${format}/${publicId}`;
  }

  // Upload with progress tracking
  async uploadWithProgress(file, onProgress) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('folder', 'lokawaz/issues');

      const response = await axios.post(CLOUDINARY_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          if (onProgress) {
            onProgress(percentCompleted);
          }
        },
      });

      return {
        url: response.data.secure_url,
        publicId: response.data.public_id,
        width: response.data.width,
        height: response.data.height,
        format: response.data.format,
      };
    } catch (error) {
      console.error('Error uploading image with progress:', error);
      throw new Error('Failed to upload image');
    }
  }
}

export default new UploadService();