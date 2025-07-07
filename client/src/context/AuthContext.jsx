// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const token = authService.getToken();
      const storedUser = authService.getUser();
      
      console.log('Initializing auth...', { hasToken: !!token, hasStoredUser: !!storedUser });
      
      if (token && storedUser) {
        // Set stored user immediately for better UX
        setUser(storedUser);
        setIsAuthenticated(true);
        
        // Verify token with backend in background
        try {
          const response = await authService.getCurrentUser();
          console.log('Token verification response:', response);
          
          if (response.success && response.data) {
            const userData = response.data.user || response.data;
            setUser(userData);
            setIsAuthenticated(true);
            
            // Update stored user data if it differs
            if (JSON.stringify(storedUser) !== JSON.stringify(userData)) {
              authService.updateUser(userData);
            }
          } else {
            console.log('Token verification failed:', response);
            // Token is invalid, clear storage without redirect
            authService.logout(false);
            setUser(null);
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.log('Token verification error:', error);
          // If it's a network error, keep the user logged in
          if (error.status >= 500 || !error.status) {
            console.log('Network error during verification, keeping user logged in');
            // Keep existing state, don't logout on network errors
          } else {
            // Token is invalid, clear storage without redirect
            authService.logout(false);
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      } else {
        // No token or user data found
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      if (response.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        return response;
      }
      throw new Error(response.message || 'Login failed');
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      if (response.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        return response;
      }
      throw new Error(response.message || 'Registration failed');
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout(false); // Don't auto-redirect, let the component handle navigation
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (userData) => {
    setUser(userData);
    authService.updateUser(userData);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };