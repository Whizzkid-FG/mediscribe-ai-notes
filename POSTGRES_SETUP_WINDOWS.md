# MedScribe Backend - PostgreSQL Setup Guide for Windows

## Step 1: Install PostgreSQL (if not installed)

### Option A: Using Windows Installer
1. Download from: https://www.postgresql.org/download/windows/
2. Run installer and follow prompts
3. **Important**: Remember the password you set for the `postgres` user
4. Choose default settings (Port 5432 is standard)

### Option B: Using Windows Package Manager (Recommended)
```powershell
# Install via Chocolatey (if you have it)
choco install postgresql

# Or with Winget
winget install PostgreSQL.PostgreSQL
```

### Option C: Using Docker
```powershell
docker run --name medscribe-db `
  -e POSTGRES_PASSWORD=your_password `
  -e POSTGRES_DB=medscribe `
  -p 5432:5432 `
  -d postgres:15
```

## Step 2: Add PostgreSQL to PATH (if not already added)

1. Open **Environment Variables**:
   - Press `Win + X` → Choose **System** (or **Settings**)
   - Click **Advanced system settings**
   - Click **Environment Variables**

2. Under **System variables**, find **Path** and click **Edit**

3. Add PostgreSQL bin directory:
   ```
   C:\Program Files\PostgreSQL\16\bin
   ```
   (Adjust version number if needed)

4. Click **OK** → Close all windows and **restart PowerShell/Terminal**

## Step 3: Verify PostgreSQL Installation

```powershell
# Check if psql command works
psql --version

# Expected output: psql (PostgreSQL) 15.x or higher
```

## Step 4: Create Database and User

```powershell
# Login to PostgreSQL (as postgres user)
psql -U postgres

# You'll be prompted for the password (enter password from installation)
# Once logged in, run these commands:
```

Inside `psql` prompt:
```sql
-- Create database
CREATE DATABASE medscribe;

-- Create user (optional - postgres user is fine too)
CREATE USER medscribe_user WITH PASSWORD 'your_secure_password';

-- Grant permissions
ALTER ROLE medscribe_user CREATEDB;

-- List databases (verify creation)
\l

-- Exit
\q
```

## Step 5: Update Backend Configuration

Edit `.env.local` in the `backend/` folder:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=medscribe
DB_USER=postgres              # or medscribe_user if you created one
DB_PASSWORD=your_password     # The password you set above

# JWT Secrets (generate secure values)
JWT_SECRET=use_a_long_random_string_here_minimum_32_chars_1234567890
JWT_REFRESH_SECRET=another_long_random_string_minimum_32_chars_0987654321
JWT_EXPIRY=1h
JWT_REFRESH_EXPIRY=7d

# Server
PORT=5000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:5173

# Security
BCRYPT_ROUNDS=10
```

## Step 6: Initialize Database Schema

```powershell
# From backend directory
cd "c:\My Work Station\mediscribe-ai-notes\backend"

npm run migrate
```

Expected output:
```
📊 Initializing database...
✅ Database initialized successfully
```

## Step 7: Start Backend Server

```powershell
npm run dev
```

Expected output:
```
🏥 MedScribe API Server
📍 Running on http://localhost:5000
🔐 CORS Origin: http://localhost:5173
🌍 Environment: development
```

## Step 8: Test Backend is Running

Open new PowerShell window:
```powershell
# Test health endpoint
Invoke-WebRequest http://localhost:5000/health

# Should return status 200 with {"status":"ok","timestamp":"..."}
```

## Troubleshooting

### Error: "psql: command not found"
→ PostgreSQL not in PATH. Follow Step 2 above and restart terminal.

### Error: "password authentication failed"
→ Wrong password. Use `psql -U postgres` and re-enter password from installation.

### Error: "database \"medscribe\" already exists"
→ Database already created. You can delete and recreate:
```sql
DROP DATABASE medscribe;
CREATE DATABASE medscribe;
```

### Error: "connect ECONNREFUSED 127.0.0.1:5432"
→ PostgreSQL not running:
```powershell
# Start PostgreSQL service
net start postgresql-x64-15  # Replace 15 with your version
```

### Error: "Cannot find module 'pg'"
→ Dependencies not installed. Run: `npm install`

## Quick Reference Commands

```powershell
# Start PostgreSQL
net start postgresql-x64-15

# Stop PostgreSQL
net stop postgresql-x64-15

# Check if running
tasklist | findstr postgres

# Connect to database
psql -U postgres -d medscribe

# List databases
psql -U postgres -l

# Delete database
psql -U postgres -c "DROP DATABASE medscribe;"
```

## Next Steps

1. ✅ Install PostgreSQL
2. ✅ Create `medscribe` database
3. ✅ Update `.env.local` with credentials
4. ✅ Run `npm run migrate`
5. ✅ Run `npm run dev`
6. Now start frontend: `npm run dev` (from parent directory)
7. Visit http://localhost:5173/signup to test
