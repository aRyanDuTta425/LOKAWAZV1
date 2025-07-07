import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, MapPin, X, Upload, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import LeafletMap from '../components/LeafletMap';
import AddressSearch from '../components/AddressSearch';
import uploadService from '../services/uploadService';
import issueService from '../services/issueService';

const NewIssue = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'MEDIUM',
    location: '',
    latitude: null,
    longitude: null,
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});
  const [errors, setErrors] = useState({});

  const categories = [
    'Road and Transportation',
    'Water and Sanitation',
    'Electricity and Power',
    'Waste Management',
    'Public Safety',
    'Healthcare',
    'Education',
    'Parks and Recreation',
    'Housing and Construction',
    'Other'
  ];

  const priorities = [
    { value: 'LOW', label: 'Low Priority', color: 'text-green-600' },
    { value: 'MEDIUM', label: 'Medium Priority', color: 'text-orange-600' },
    { value: 'HIGH', label: 'High Priority', color: 'text-red-600' }
  ];

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Handle location selection from address search
  const handleAddressSelect = (locationData) => {
    setSelectedLocation({ lat: locationData.lat, lng: locationData.lng });
    setFormData(prev => ({
      ...prev,
      latitude: locationData.lat,
      longitude: locationData.lng,
      location: locationData.address
    }));
    
    // Clear location error
    if (errors.location) {
      setErrors(prev => ({
        ...prev,
        location: null
      }));
    }
  };

  // Handle location selection from map
  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setFormData(prev => ({
      ...prev,
      latitude: location.lat,
      longitude: location.lng
    }));
    
    // Reverse geocoding to get address (optional)
    reverseGeocode(location.lat, location.lng);
  };

  // Reverse geocoding
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      
      if (data.display_name) {
        setFormData(prev => ({
          ...prev,
          location: data.display_name
        }));
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    }
  };

  // Handle image selection
  const handleImageSelect = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;

    try {
      // Validate files
      uploadService.validateFiles([...selectedImages, ...files]);
      
      // Create previews
      const previews = await uploadService.createImagePreviews(files);
      
      setSelectedImages(prev => [...prev, ...files]);
      setImagePreviews(prev => [...prev, ...previews]);
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        images: error.message
      }));
    }
  };

  // Remove image
  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.latitude || !formData.longitude) {
      newErrors.location = 'Please select a location on the map';
    }

    if (selectedImages.length === 0) {
      newErrors.images = 'At least one image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // Create FormData to send files with issue data
      const submitData = new FormData();
      
      // Add all form fields
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('category', formData.category);
      submitData.append('priority', formData.priority);
      submitData.append('latitude', formData.latitude);
      submitData.append('longitude', formData.longitude);
      
      // Add location/address if provided
      if (formData.location) {
        submitData.append('location', formData.location);
      }
      
      // Add multiple images if selected
      selectedImages.forEach((image, index) => {
        submitData.append('images', image); // Backend expects 'images' field for multiple files
      });

      // Create issue using the form data
      const response = await issueService.createIssue(submitData);
      
      // Show success message
      alert('Issue reported successfully!');
      
      // Navigate to issue details or dashboard
      if (response.data && response.data.id) {
        navigate(`/issue/${response.data.id}`);
      } else {
        navigate('/dashboard');
      }
      
    } catch (error) {
      console.error('Error creating issue:', error);
      alert(error.message || 'Failed to create issue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors duration-200">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Report New Issue</h1>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Issue Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200 ${
                  errors.title ? 'border-red-500 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Brief description of the issue"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.title}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                rows="5"
                value={formData.description}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200 ${
                  errors.description ? 'border-red-500 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Detailed description of the issue, including when it occurred and any relevant details..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.description}
                </p>
              )}
            </div>

            {/* Category and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200 ${
                    errors.category ? 'border-red-500 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.category}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                >
                  {priorities.map(priority => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location *
              </label>
              <div className="space-y-4">
                {/* Address Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Search Address
                  </label>
                  <AddressSearch
                    value={formData.location}
                    onChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
                    onLocationSelect={handleAddressSelect}
                    placeholder="Type to search for an address..."
                    className="w-full"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Start typing an address to see suggestions, or click on the map below
                  </p>
                </div>
                
                {/* Manual Address Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                    Or enter address manually
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter the address manually"
                  />
                </div>
                
                {/* Map for location selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                    Select on Map
                  </label>
                  <div className="h-96 rounded-lg overflow-hidden border border-gray-300">
                    <LeafletMap
                      onLocationSelect={handleLocationSelect}
                      selectedLocation={selectedLocation}
                      clickable={true}
                      className="w-full h-full"
                    />
                  </div>
                </div>
                
                {/* Location Summary */}
                {selectedLocation && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-800">Location Selected</p>
                        {formData.location && (
                          <p className="text-sm text-green-700 mt-1">{formData.location}</p>
                        )}
                        <p className="text-xs text-green-600 mt-1 font-mono">
                          {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {errors.location && (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.location}
                  </p>
                )}
              </div>
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Images * (Max 5 images, 5MB each)
              </label>
              
              <div className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-3 text-gray-400 dark:text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF up to 5MB</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      multiple
                      accept="image/*"
                      onChange={handleImageSelect}
                    />
                  </label>
                </div>

                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview.url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        
                        {/* File Info */}
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 rounded-b-lg">
                          <div className="truncate">{preview.name}</div>
                          <div>{(preview.size / 1024 / 1024).toFixed(1)} MB</div>
                        </div>
                        
                        {/* Upload Progress */}
                        {uploadProgress[index] !== undefined && uploadProgress[index] < 100 && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                            <div className="text-white text-sm">
                              {uploadProgress[index]}%
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {errors.images && (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.images}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.submit}
                </p>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors duration-200"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4 mr-2" />
                    Submit Issue
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewIssue;