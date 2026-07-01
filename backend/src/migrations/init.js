import path from 'path';
import { fileURLToPath } from 'url';
import { query } from '../config/database.js';

/**
 * Database initialization
 * Creates tables if they don't exist
 */

async function initializeDatabase() {
  try {
    console.log('📊 Initializing database...');

    // Create users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        license_number VARCHAR(255) UNIQUE NOT NULL,
        specialization VARCHAR(255),
        refresh_token TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT email_lowercase CHECK (email = LOWER(email))
      );
    `);

    // Create indexes for performance
    await query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_license ON users(license_number);
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255),
        patient_name VARCHAR(255),
        visit_type VARCHAR(100) DEFAULT 'routine',
        transcript TEXT NOT NULL DEFAULT '',
        soap_note TEXT,
        duration INTEGER DEFAULT 0,
        status VARCHAR(50) NOT NULL DEFAULT 'draft',
        uploaded_files JSONB NOT NULL DEFAULT '[]'::jsonb,
        created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
      CREATE INDEX IF NOT EXISTS idx_sessions_created_date ON sessions(created_date);
    `);

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

export default initializeDatabase;

const isDirectRun = process.argv[1]
  && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  initializeDatabase();
}
