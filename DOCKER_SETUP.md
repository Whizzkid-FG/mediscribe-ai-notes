# Docker Development Setup - MedScribe

## Complete Stack (Backend + Frontend + Database)

All services containerized and ready to ship!

## Quick Start

### 1. Build and Run Everything

```bash
# From root project directory
docker-compose up --build
```

This will:
- ✅ Build React frontend with Vite
- ✅ Build Express backend
- ✅ Start PostgreSQL container
- ✅ Initialize database schema automatically
- ✅ Wait for database health check before starting backend
- ✅ Wait for backend before starting frontend

### 2. Access the Application

**Frontend:**
```
http://localhost:5173
```

**Backend API:**
```
http://localhost:5000/api
```

**Backend Health Check:**
```bash
curl http://localhost:5000/health
```

**PostgreSQL:**
```
localhost:5432 (accessible from host or other containers)
```

### 3. View Logs

```bash
# All services
docker-compose logs -f

# Just frontend
docker-compose logs -f frontend

# Just backend
docker-compose logs -f backend

# Just database
docker-compose logs -f postgres
```

## Environment Variables

For production deployments, set these environment variables:

```bash
# JWT tokens (change these!)
export JWT_SECRET="your_long_random_key_at_least_32_chars"
export JWT_REFRESH_SECRET="another_long_random_key_32_chars"

# Frontend API URL (optional, defaults to http://localhost:5000/api)
export VITE_API_URL="http://backend-domain:5000/api"

# Then start
docker-compose up --build
```

Or create a `.env` file in root:
```
JWT_SECRET=your_production_key
JWT_REFRESH_SECRET=your_refresh_key
VITE_API_URL=http://localhost:5000/api
```

## Common Commands

```bash
# Start all containers
docker-compose up

# Start in background (detached mode)
docker-compose up -d

# Stop all containers
docker-compose down

# Stop and remove volumes (deletes database data)
docker-compose down -v

# Rebuild all images
docker-compose up --build

# Rebuild only frontend
docker-compose up --build frontend

# Rebuild only backend
docker-compose up --build backend

# Restart services
docker-compose restart

# SSH into frontend container
docker exec -it medscribe-frontend sh

# SSH into backend container
docker exec -it medscribe-backend sh

# SSH into database container
docker exec -it medscribe-db psql -U postgres -d medscribe

# View resource usage
docker stats

# Clean up everything
docker system prune -a --volumes
```

## Database Access

From outside Docker:
```bash
psql -h localhost -U postgres -d medscribe
# Password: medscribe_secure_password_123
```

From inside backend container:
```bash
docker exec -it medscribe-backend sh
# Then run queries using node
```

## File Structure

```
docker-compose.yml          # Docker Compose - orchestrates all services
Dockerfile                  # Frontend image definition (multi-stage build)
.dockerignore              # Files to exclude from Docker build

backend/
  ├── Dockerfile            # Backend image definition
  ├── .dockerignore         # Backend Docker ignore file
  ├── src/
  │   ├── index.js          # Express server
  │   ├── config/
  │   ├── models/
  │   ├── routes/
  │   └── migrations/
  │       └── init.sql      # Database schema (auto-runs)
  └── package.json

frontend/
  ├── src/                  # React components
  ├── vite.config.js        # Vite build config
  └── package.json
```

## Production Deployment

For production, you would:

1. Push image to registry (Docker Hub, ECR, etc.)
```bash
docker build -t myregistry/medscribe-backend:1.0.0 ./backend
docker push myregistry/medscribe-backend:1.0.0
```

2. Use in Docker Compose or Kubernetes
```yaml
services:
  backend:
    image: myregistry/medscribe-backend:1.0.0
```

3. Use secrets management for JWT keys
```bash
docker secret create jwt_secret -
docker secret create jwt_refresh_secret -
```

## Troubleshooting

**Frontend won't load: "Cannot connect to API"**
→ Ensure backend is healthy: `docker-compose logs backend`
→ Check CORS_ORIGIN in docker-compose.yml matches frontend URL

**Backend won't start: "connection refused"**
→ Wait for database to be healthy. Check: `docker-compose logs postgres`
→ Ensure health check passes: `docker-compose ps` should show "healthy"

**Frontend shows blank page**
→ Check Vite build succeeded: `docker-compose logs frontend`
→ Verify http-server is running: `docker exec medscribe-frontend ps aux`
→ Try clearing browser cache (Ctrl+Shift+Delete)

**Port already in use**
→ Change ports in `docker-compose.yml` or kill existing process:
```bash
# Free port 5173 (frontend)
lsof -ti:5173 | xargs kill -9

# Free port 5000 (backend)
lsof -ti:5000 | xargs kill -9

# Free port 5432 (database)
lsof -ti:5432 | xargs kill -9
```

**Database not initializing**
→ Check if `init.sql` exists at `backend/src/migrations/init.sql`
→ Recreate: `docker-compose down -v && docker-compose up --build`

**Can't connect to database from backend**
→ Ensure `depends_on` condition uses health check
→ Check backend logs: `docker-compose logs backend`
→ Database hostname must be `postgres` (service name in docker-compose.yml)

**Images not updating after code changes**
→ Rebuild: `docker-compose up --build`
→ Or rebuild specific service: `docker-compose up --build frontend`

**Out of disk space**
→ Clean Docker images/volumes: `docker system prune -a --volumes`
→ Remove specific image: `docker rmi image_name`

## Complete Stack - For Your Testing Team

Everything is containerized. Share these instructions with testers:

### 📦 One Command to Deploy

```bash
# Clone repository
git clone <repo-url>
cd mediscribe-ai-notes

# Start everything
docker-compose up --build

# Done! Access at:
# - Frontend: http://localhost:5173
# - Backend: http://localhost:5000/api
# - Database: localhost:5432 (if needed)
```

### 🧪 What Gets Deployed

- **Frontend** (React + Vite) on port 5173
- **Backend** (Express + Node) on port 5000  
- **Database** (PostgreSQL) on port 5432
- **Auto-initialized** schema and indexes
- **Health checks** on all services

### 🚀 No Setup Needed

- ✅ No Node.js installation required
- ✅ No PostgreSQL installation required
- ✅ No environment files to configure
- ✅ No manual database setup
- ✅ Just Docker

### 📊 Monitor Services

```bash
# Watch logs (shows all 3 services)
docker-compose logs -f

# Check status
docker-compose ps
```

### 🛑 When Done

```bash
# Stop everything
docker-compose down

# Remove database too (clean slate)
docker-compose down -v
```
