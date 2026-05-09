# MedScribe Backend

A production-ready Node.js/Express authentication API for the MedScribe medical transcription platform.

## Features

✅ **Secure Authentication**
- JWT-based token system (access + refresh tokens)
- Password hashing with bcryptjs
- Secure token storage in PostgreSQL

✅ **Standards-Compliant**
- Input validation with express-validator
- CORS security headers
- Rate limiting (prevents brute force attacks)
- Helmet.js for HTTP security headers

✅ **Healthcare-Ready**
- HIPAA-friendly error handling (no sensitive data leaks)
- User license verification
- Professional information tracking
- Audit-ready structure

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:
```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=medscribe
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_super_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_here
CORS_ORIGIN=http://localhost:5173
```

### 3. Setup PostgreSQL Database

Create the database:
```bash
createdb medscribe
```

Initialize schema:
```bash
npm run migrate
```

### 4. Start Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Server runs on `http://localhost:5000`

## API Endpoints

### Authentication

**POST `/api/auth/signup`**
- Create new account
- Body: `{ email, password, firstName, lastName, licenseNumber, specialization }`
- Returns: `{ user, tokens: { accessToken, refreshToken } }`

**POST `/api/auth/login`**
- Login user
- Body: `{ email, password }`
- Returns: `{ user, tokens: { accessToken, refreshToken } }`

**POST `/api/auth/refresh`**
- Refresh access token
- Body: `{ refreshToken }`
- Returns: `{ tokens: { accessToken } }`

**GET `/api/auth/me`**
- Get current user (requires access token)
- Headers: `Authorization: Bearer {accessToken}`
- Returns: `{ user }`

**POST `/api/auth/logout`**
- Logout user (requires access token)
- Headers: `Authorization: Bearer {accessToken}`
- Returns: `{ success: true }`

## Security Best Practices

1. **Passwords**: Minimum 8 characters, requires uppercase + lowercase + number
2. **Tokens**: 
   - Access token: 1 hour expiry (short-lived)
   - Refresh token: 7 days expiry (long-lived)
3. **Rate Limiting**: 100 req/min general, 5 req/min for auth
4. **CORS**: Restricted to frontend origin only
5. **Helmet**: HTTP security headers enabled

## Database Schema

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  license_number VARCHAR(255) UNIQUE,
  specialization VARCHAR(255),
  refresh_token TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## Architecture

```
Backend/
├── src/
│   ├── config/        # Database config
│   ├── middleware/    # Auth, validation
│   ├── models/        # User model
│   ├── routes/        # API routes
│   ├── utils/         # JWT helpers
│   └── index.js       # Main server
├── migrations/        # Database init
├── package.json
├── .env.example
└── .env.local        # Your config (don't commit)
```

## Next Steps

- [ ] Connect frontend to this API
- [ ] Add session refresh logic in frontend
- [ ] Implement password reset endpoint
- [ ] Add email verification
- [ ] Add 2FA support
