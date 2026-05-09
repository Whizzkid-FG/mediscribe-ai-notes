# MedScribe Test Credentials

## Account 1 (Created Successfully)

**Email:** jane@medscribe.io  
**Password:** Test@Password123  
**First Name:** Jane  
**Last Name:** Doe  
**License Number:** MD456789  
**Specialization:** General Practice  

**Status:** ✅ Account verified - can log in successfully

---

## How to Add More Test Accounts

1. Navigate to http://localhost:5173/signup
2. Fill in the registration form with:
   - Any valid email
   - Password (must have: 8+ chars, uppercase, lowercase, number)
   - Medical credentials (license number, specialization)
3. Submit the form
4. You'll be automatically logged in and redirected to dashboard

---

## Backend API Endpoints

- **Health Check:** http://localhost:5000/health
- **Signup:** POST http://localhost:5000/api/auth/signup
- **Login:** POST http://localhost:5000/api/auth/login
- **Current User:** GET http://localhost:5000/api/auth/me (requires JWT token)
- **Logout:** POST http://localhost:5000/api/auth/logout (requires JWT token)

---

## Database

- **Type:** PostgreSQL 15
- **Host:** localhost:5432 (via Docker)
- **Database:** medscribe
- **User:** postgres
- **Password:** medscribe_secure_password_123

All user data is stored in the `users` table with encrypted passwords.
