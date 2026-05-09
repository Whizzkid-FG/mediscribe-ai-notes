import bcrypt from 'bcryptjs';
import { query } from '../config/database.js';

/**
 * User Model - Database operations for users
 */

/**
 * Create a new user in the database
 * @param {object} userData - { email, password, firstName, lastName, licenseNumber, specialization }
 * @returns {Promise} User object without password
 */
export const createUser = async (userData) => {
  const { email, password, firstName, lastName, licenseNumber, specialization } = userData;
  
  // Hash password with bcrypt
  const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS || 10));
  
  const result = await query(
    `INSERT INTO users (email, password_hash, first_name, last_name, license_number, specialization, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW())
     RETURNING id, email, first_name, last_name, license_number, specialization, created_at`,
    [email, hashedPassword, firstName, lastName, licenseNumber, specialization]
  );
  
  return result.rows[0];
};

/**
 * Find user by email
 * @param {string} email - User email
 * @returns {Promise} User object (including password hash for verification)
 */
export const findUserByEmail = async (email) => {
  const result = await query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  
  return result.rows[0] || null;
};

/**
 * Find user by ID
 * @param {number} userId - User ID
 * @returns {Promise} User object without password
 */
export const findUserById = async (userId) => {
  const result = await query(
    `SELECT id, email, first_name, last_name, license_number, specialization, created_at, updated_at
     FROM users WHERE id = $1`,
    [userId]
  );
  
  return result.rows[0] || null;
};

/**
 * Update user refresh token
 * @param {number} userId - User ID
 * @param {string} refreshToken - JWT refresh token
 * @returns {Promise} Success boolean
 */
export const updateRefreshToken = async (userId, refreshToken) => {
  const result = await query(
    `UPDATE users SET refresh_token = $1, updated_at = NOW()
     WHERE id = $2`,
    [refreshToken, userId]
  );
  
  return result.rowCount > 0;
};

/**
 * Verify password
 * @param {string} password - Plain password
 * @param {string} hashedPassword - Hashed password from DB
 * @returns {Promise} Boolean
 */
export const verifyPassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

/**
 * Check if email exists
 * @param {string} email - User email
 * @returns {Promise} Boolean
 */
export const emailExists = async (email) => {
  const result = await query(
    'SELECT id FROM users WHERE LOWER(email) = LOWER($1)',
    [email]
  );
  
  return result.rows.length > 0;
};

export default {
  createUser,
  findUserByEmail,
  findUserById,
  updateRefreshToken,
  verifyPassword,
  emailExists,
};
