import express from 'express';
import User from '../models/User.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { validateSignup, validateLogin, validateRefresh, handleValidationErrors } from '../middleware/validation.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /auth/signup
 * Create a new user account
 */
router.post('/signup', validateSignup, handleValidationErrors, async (req, res) => {
  try {
    const { email, password, firstName, lastName, licenseNumber, specialization } = req.body;

    // Check if user already exists
    const existingUser = await User.emailExists(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered',
        code: 'EMAIL_EXISTS',
      });
    }

    // Create user
    const user = await User.createUser({
      email,
      password,
      firstName,
      lastName,
      licenseNumber,
      specialization,
    });

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id);

    // Store refresh token in database
    await User.updateRefreshToken(user.id, refreshToken);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create account',
      code: 'SIGNUP_ERROR',
    });
  }
});

/**
 * POST /auth/login
 * Authenticate user and return tokens
 */
router.post('/login', validateLogin, handleValidationErrors, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS',
      });
    }

    // Verify password
    const passwordValid = await User.verifyPassword(password, user.password_hash);
    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS',
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id);

    // Store refresh token in database
    await User.updateRefreshToken(user.id, refreshToken);

    res.json({
      success: true,
      message: 'Logged in successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        licenseNumber: user.license_number,
        specialization: user.specialization,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      code: 'LOGIN_ERROR',
    });
  }
});

/**
 * POST /auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', validateRefresh, handleValidationErrors, async (req, res) => {
  try {
    const { refreshToken } = req.body;

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    
    // Get user
    const user = await User.findUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user.id, user.email);

    res.json({
      success: true,
      message: 'Token refreshed',
      tokens: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(401).json({
      success: false,
      message: 'Failed to refresh token',
      code: 'REFRESH_FAILED',
    });
  }
});

/**
 * GET /auth/me
 * Get current user info (protected)
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findUserById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        licenseNumber: user.license_number,
        specialization: user.specialization,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      code: 'FETCH_USER_ERROR',
    });
  }
});

/**
 * POST /auth/logout
 * Logout user (clear refresh token)
 */
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // Clear refresh token from database
    await User.updateRefreshToken(req.user.userId, null);

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to logout',
      code: 'LOGOUT_ERROR',
    });
  }
});

export default router;
