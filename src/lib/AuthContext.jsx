import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth } from '@/api/apiClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Initialize auth on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  /**
   * Check authentication status on app load
   */
  const checkAuthStatus = async () => {
    try {
      setIsLoadingAuth(true);
      setAuthError(null);

      const accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) {
        setIsAuthenticated(false);
        setIsLoadingAuth(false);
        return;
      }

      // Try to get user info with existing token
      const userData = await auth.me();
      setUser(userData);
      setIsAuthenticated(true);
      setIsLoadingAuth(false);
    } catch (error) {
      console.error('Auth check failed:', error);
      
      // Clear invalid tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      setIsAuthenticated(false);
      setUser(null);
      setIsLoadingAuth(false);
      
      // Only set error if it's not a 401 (which is expected if not logged in)
      if (error.response?.status !== 401) {
        setAuthError({
          type: 'auth_error',
          message: error.message || 'Failed to verify authentication',
        });
      }
    }
  };

  /**
   * Sign up new user
   */
  const signup = async (userData) => {
    try {
      setAuthError(null);
      const response = await auth.signup(userData);
      
      // Store tokens
      localStorage.setItem('accessToken', response.tokens.accessToken);
      localStorage.setItem('refreshToken', response.tokens.refreshToken);
      
      // Set user
      setUser(response.user);
      setIsAuthenticated(true);
      
      return response;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Signup failed';
      const code = error.response?.data?.code || 'SIGNUP_ERROR';
      
      setAuthError({
        type: code,
        message,
      });
      
      throw error;
    }
  };

  /**
   * Login user
   */
  const login = async (email, password) => {
    try {
      setAuthError(null);
      const response = await auth.login(email, password);
      
      // Store tokens
      localStorage.setItem('accessToken', response.tokens.accessToken);
      localStorage.setItem('refreshToken', response.tokens.refreshToken);
      
      // Set user
      setUser(response.user);
      setIsAuthenticated(true);
      
      return response;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      const code = error.response?.data?.code || 'LOGIN_ERROR';
      
      setAuthError({
        type: code,
        message,
      });
      
      throw error;
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      // Call logout endpoint
      await auth.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear tokens and user
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setIsAuthenticated(false);
      setAuthError(null);
    }
  };

  /**
   * Navigate to login (for compatibility)
   */
  const navigateToLogin = () => {
    logout();
    window.location.href = '/login';
  };

  const value = {
    user,
    isAuthenticated,
    isLoadingAuth,
    isLoadingPublicSettings: false, // No longer needed
    authError,
    appPublicSettings: null, // No longer needed
    signup,
    login,
    logout,
    navigateToLogin,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
