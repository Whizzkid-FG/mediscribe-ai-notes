-- Initialize PostgreSQL database for MedScribe
-- Run automatically by Docker on container startup

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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_license ON users(license_number);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

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

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_created_date ON sessions(created_date);

-- Log successful initialization
SELECT NOW(), 'MedScribe database initialized successfully' as status;
