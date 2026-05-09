# MedScribe AI Notes

A healthcare-focused voice transcription and SOAP note generation platform with real-time medical documentation capabilities.

## Overview

MedScribe is a full-stack medical application that enables healthcare providers to:
- Record and transcribe patient consultations in real-time
- Generate structured SOAP (Subjective, Objective, Assessment, Plan) notes
- Manage patient sessions and templates
- Maintain secure, HIPAA-compliant medical records

## Technology Stack

**Frontend:**
- React 18.2.0 + Vite 6.1.0
- React Router 6.26.0 (protected routes)
- React Query 5.84.1 (async state management)
- Tailwind CSS 3.4.17 + Radix UI (accessible components)
- Axios 1.7.0 (HTTP client with JWT interceptors)

**Backend:**
- Node.js + Express.js 4.18.2
- PostgreSQL 15
- JWT authentication (1h access, 7d refresh tokens)
- bcryptjs password hashing
- Helmet security headers + CORS + rate limiting

**DevOps:**
- Docker & Docker Compose
- Multi-stage builds for optimized images
- PostgreSQL persistence with volumes
- Service orchestration with health checks

## Quick Start

### Prerequisites
- Docker & Docker Compose installed
- Git

### Installation & Running

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd mediscribe-ai-notes
   ```

2. **Start the application with Docker:**
   ```bash
   docker-compose up -d --build
   ```

3. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api
   - Database: postgres://postgres:medscribe_secure_password_123@localhost:5432/medscribe

4. **Test login:**
   - Email: `copilot.ok.20260509131222@medscribe.io`
   - Password: `Test@Password123`

## Project Structure

```
mediscribe-ai-notes/
├── src/                          # React frontend
│   ├── pages/                    # Page components (Login, Dashboard, Settings, etc.)
│   ├── components/               # Reusable UI components
│   ├── lib/                      # Contexts, utilities, configs
│   ├── api/                      # API client with Axios
│   └── hooks/                    # Custom React hooks
├── backend/                      # Express.js server
│   ├── src/
│   │   ├── index.js             # Main server entry point
│   │   ├── routes/              # API endpoints
│   │   ├── models/              # Database models
│   │   ├── middleware/          # Auth, validation, rate limiting
│   │   ├── utils/               # JWT utilities
│   │   ├── config/              # Database configuration
│   │   └── migrations/          # SQL migrations
│   └── Dockerfile
├── docker-compose.yml           # Service orchestration
└── Dockerfile                   # Frontend multi-stage build
```

## Authentication

The application uses JWT-based authentication:

**Sign Up Flow:**
- User registers with email, password, professional credentials (license, specialization)
- Password validated: 8+ chars, uppercase, lowercase, number
- Password hashed with bcryptjs (10 salt rounds)
- Access token (1h) + refresh token (7d) generated
- Tokens stored in localStorage

**Login Flow:**
- User enters email/password
- Backend verifies with bcrypt.compare()
- Returns access token + refresh token
- Tokens automatically refreshed on 401 response via Axios interceptor

**Protected Routes:**
- Frontend routes wrapped with ProtectedRoute component
- Backend routes require "Bearer {accessToken}" header
- Token expiry handled transparently with refresh mechanism

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user (protected)
- `POST /api/auth/logout` - Logout user (protected)

### Coming Soon
- Sessions CRUD endpoints
- Transcription service
- SOAP note generation
- File upload/storage
- Password reset

## Configuration

### Environment Variables

**Backend (.env):**
```
DATABASE_URL=postgresql://postgres:medscribe_secure_password_123@medscribe-db:5432/medscribe
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

**Frontend (Dockerfile):**
```
VITE_API_URL=http://localhost:5000/api
```

## Security Features

✅ **Authentication:**
- JWT tokens with expiry
- Refresh token rotation
- Secure password hashing with bcrypt

✅ **Network Security:**
- Helmet.js HTTP security headers
- CORS restricted to whitelisted origins
- Rate limiting (100 general, 30 auth per 15min)

✅ **Data Security:**
- Parameterized SQL queries (SQL injection prevention)
- Prepared statements via pg library
- Password fields excluded from API responses

## Development

### Local Development (without Docker)

1. **Backend:**
   ```bash
   cd backend
   npm install
   npm run dev  # Uses nodemon for auto-reload
   ```

2. **Frontend:**
   ```bash
   npm install
   npm run dev  # Vite dev server on port 5173
   ```

3. **Database:**
   Install PostgreSQL locally and create database:
   ```sql
   CREATE DATABASE medscribe;
   ```

### Docker Development

Rebuild after code changes:
```bash
docker-compose down
docker-compose up -d --build
```

View logs:
```bash
docker logs medscribe-frontend
docker logs medscribe-backend
docker logs medscribe-db
```

## Free Deployment (No Cost)

Use this path when you want a non-technical tester to open one link in a browser.

### Hosting Stack
- Frontend: Netlify (free)
- Backend API: Render Web Service (free)
- PostgreSQL: Neon (free)

### 1) Create Neon Database
1. Create a Neon project and database named `medscribe`.
2. Open SQL Editor and run the schema from `backend/src/migrations/init.sql`.
3. Save these values from Neon connection details:
   - `DB_HOST`
   - `DB_PORT`
   - `DB_NAME`
   - `DB_USER`
   - `DB_PASSWORD`

### 2) Deploy Backend to Render
1. Push this repository to GitHub.
2. In Render, create a new Web Service from the repo.
3. Render settings:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Set environment variables in Render:
   - `NODE_ENV=production`
   - `PORT=5000`
   - `DB_SSL=true`
   - `DB_HOST` from Neon
   - `DB_PORT` from Neon
   - `DB_NAME` from Neon
   - `DB_USER` from Neon
   - `DB_PASSWORD` from Neon
   - `JWT_SECRET` any long random string
   - `JWT_REFRESH_SECRET` any long random string
   - `CORS_ORIGIN` temporary value: `http://localhost:5173` (update in step 4)
5. Deploy and verify `https://<your-render-service>/health` returns status ok.

Note: `render.yaml` is included to prefill most backend settings.

### 3) Deploy Frontend to Netlify
1. In Netlify, import this GitHub repository.
2. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Add Netlify environment variable:
   - `VITE_API_URL=https://<your-render-service>/api`
4. Deploy and copy your Netlify site URL.

Notes:
- `netlify.toml` is included with build defaults.
- `public/_redirects` is included for SPA route handling.

### 4) Final CORS Update
1. Return to Render backend environment variables.
2. Set `CORS_ORIGIN` to your Netlify URL.
3. Redeploy backend.

### 5) Share With Tester
1. Open your Netlify app URL.
2. Create a fresh test user from signup.
3. Send tester:
   - App URL
   - Test email
   - Test password

### Safety
- Use only fake/test data.
- Do not use real patient data in free/public environments.

## Testing Credentials

**Test Account:**
- Email: `copilot.ok.20260509131222@medscribe.io`
- Password: `Test@Password123`

**Database Access:**
```bash
docker exec -it medscribe-db psql -U postgres -d medscribe
```

## Features & Status

✅ **Implemented:**
- User authentication (signup/login/logout)
- Protected routes
- JWT token refresh
- Settings page with user preferences
- HIPAA-compliant design patterns
- Rate limiting
- Security headers

🔄 **In Development:**
- Password reset flow
- Session management
- Audio transcription
- SOAP note generation
- File upload/storage

📋 **Planned:**
- Multi-user session sharing
- Appointment scheduling
- Template management
- Audit logging
- Integration with EHR systems

## Support & Documentation

For issues, questions, or contributions, please contact the development team.

**Deployment:** Docker images ready for production. See `docker-compose.yml` for configuration.
