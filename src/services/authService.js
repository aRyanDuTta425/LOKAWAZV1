// src/services/authService.js
import api from '../utils/api';

class AuthService {
  // Register new user
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      
      if (response.success && response.data.token) {
        // Store token and user data
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Login existing user
  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials);
      
      if (response.success && response.data.token) {
        // Store token and user data
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get current user
  async getCurrentUser() {
    try {
      const response = await api.get('/auth/verify');
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Logout user
  logout(redirect = true) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    if (redirect) {
      window.location.href = '/login';
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('token');
    return !!token;
  }

  // Get stored user data
  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // Get stored token
  getToken() {
    return localStorage.getItem('token');
  }

  // Update stored user data
  updateUser(userData) {
    localStorage.setItem('user', JSON.stringify(userData));
  }
}

export default new AuthService();