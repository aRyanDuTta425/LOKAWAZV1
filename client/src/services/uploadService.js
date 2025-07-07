import api from '../utils/api';

class UploadService {
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
          url: e.target.result,
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
}

export default new UploadService();