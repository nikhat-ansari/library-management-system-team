# Module 1: Common Login & Role Verification — Backend Implementation

## Overview

This document describes the Module 1 backend implementation for the Library Management System. Module 1 provides production-level authentication and authorization for three user roles: **ADMIN**, **STAFF**, and **MEMBER**.

## Architecture

### Microservices

- **API Gateway** (Port 3000): Entry point for all frontend requests, proxies auth calls to auth-service
- **Auth Service** (Port 3001): Handles JWT generation, token validation, and login logic
- **User Service** (Port 3002): Manages user data, password hashing, and user queries

### Technology Stack

- **NestJS** + **TypeScript** for backend services
- **MongoDB** + **Mongoose** for data persistence
- **JWT** for stateless authentication
- **bcryptjs** for password hashing
- **Passport** + **JWT Strategy** for token validation
- **Swagger/OpenAPI** for API documentation

## Database Schema

### User Collection

```typescript
{
  _id: ObjectId,
  email: string (unique, indexed, lowercase),
  passwordHash: string (bcrypt hashed),
  name: string,
  role: 'ADMIN' | 'STAFF' | 'MEMBER',
  status: 'active' | 'inactive' (default: 'active'),
  memberType?: 'STUDENT' | 'TEACHER' | 'FACULTY' | 'EMPLOYEE' | 'GENERAL',
  lastLogin?: Date,
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

## API Endpoints

### Authentication Endpoints

#### 1. Login

**Endpoint:** `POST /api/auth/login`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword"
}
```

**Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "role": "MEMBER"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "statusCode": 400,
  "message": "Invalid email or password",
  "timestamp": "2026-09-01T10:00:00.000Z"
}
```

#### 2. Logout

**Endpoint:** `POST /api/auth/logout`

**Request:** (No body required)

**Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

### User Endpoints

#### 1. Get Current User (Protected)

**Endpoint:** `GET /api/users/me`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200 OK):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "MEMBER",
  "status": "active",
  "memberType": "STUDENT",
  "lastLogin": "2026-09-01T10:00:00.000Z",
  "createdAt": "2026-08-01T10:00:00.000Z",
  "updatedAt": "2026-09-01T10:00:00.000Z"
}
```

#### 2. Find User by Email (Internal - Auth Service)

**Endpoint:** `GET /api/users/by-email?email=user@example.com`

**Response:** User document with passwordHash

#### 3. Validate Password (Internal - Auth Service)

**Endpoint:** `POST /api/users/validate-password`

**Request:**
```json
{
  "plainPassword": "securePassword",
  "hash": "$2b$10$..."
}
```

**Response:**
```json
{
  "valid": true
}
```

#### 4. Update Last Login (Internal - Auth Service)

**Endpoint:** `PATCH /api/users/:id/last-login`

**Response:**
```json
{
  "message": "Last login updated"
}
```

## JWT Token Structure

**Payload:**
```json
{
  "sub": "507f1f77bcf86cd799439011",
  "role": "MEMBER",
  "iat": 1693560000,
  "exp": 1693646400
}
```

**Default Expiration:** 1 day (configurable via `JWT_EXPIRES_IN` environment variable)

## Environment Configuration

### User Service (.env)

```bash
# Server
PORT=3002
NODE_ENV=production
SERVICE_NAME=user-service

# Database
MONGODB_URI=mongodb://mongodb:27017/lms-users

# API Gateway
FRONTEND_ORIGIN=http://localhost:5173
```

### Auth Service (.env)

```bash
# Server
PORT=3001
NODE_ENV=production
SERVICE_NAME=auth-service

# Database
MONGODB_URI=mongodb://mongodb:27017/lms-auth

# JWT Configuration
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=1d

# Service URLs (internal)
USER_SERVICE_URL=http://user-service:3002
```

### API Gateway (.env)

```bash
# Server
PORT=3000
NODE_ENV=production

# Frontend
FRONTEND_ORIGIN=http://localhost:5173

# Service URLs (internal)
AUTH_SERVICE_URL=http://auth-service:3001
USER_SERVICE_URL=http://user-service:3002
```

## Login Flow (Detailed)

### Happy Path

1. **Frontend** sends `POST /api/auth/login` with email and password to **API Gateway**
2. **API Gateway** proxies request to **Auth Service**
3. **Auth Service** calls **User Service** `GET /api/users/by-email?email=...` to find user
4. **User Service** returns user document with passwordHash
5. **Auth Service** uses `bcryptjs.compare()` to validate password against hash
6. If valid, **Auth Service** calls **User Service** `PATCH /api/users/:id/last-login`
7. **Auth Service** generates JWT token with `{sub: userId, role: userRole}`
8. **Auth Service** returns `{accessToken, user: {id, name, role}}`
9. **API Gateway** proxies response back to **Frontend**
10. **Frontend** stores `accessToken` in localStorage
11. **Frontend** updates auth context with user information
12. **Frontend** redirects to dashboard based on role

### Error Cases

- **User not found:** Return 400 "Invalid email or password"
- **Password mismatch:** Return 400 "Invalid email or password"
- **Invalid email format:** Return 400 (validation error)
- **Missing password:** Return 400 (validation error)

## Testing Guide

### Prerequisites

1. Start MongoDB:
   ```bash
   docker-compose up mongodb
   ```

2. Create test user in MongoDB:
   ```javascript
   // Connect to MongoDB and run:
   db.users.insertOne({
     email: "admin@example.com",
     passwordHash: "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36gZvWFm", // password: 123456
     name: "Admin User",
     role: "ADMIN",
     status: "active",
     createdAt: new Date(),
     updatedAt: new Date()
   })
   ```

3. Start all services:
   ```bash
   # Terminal 1: User Service
   cd apps/backend/user-service
   npm run start:dev
   
   # Terminal 2: Auth Service
   cd apps/backend/auth-service
   npm run start:dev
   
   # Terminal 3: API Gateway
   cd apps/backend/api-gateway
   npm run start:dev
   ```

### Manual API Testing

#### Test 1: Successful Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "123456"
  }'
```

Expected Response (200):
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f...",
    "name": "Admin User",
    "role": "ADMIN"
  }
}
```

#### Test 2: Invalid Credentials

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "wrongpassword"
  }'
```

Expected Response (400):
```json
{
  "statusCode": 400,
  "message": "Invalid email or password",
  "timestamp": "2026-09-01T10:00:00.000Z"
}
```

#### Test 3: Logout

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Content-Type: application/json"
```

Expected Response (200):
```json
{
  "message": "Logged out successfully"
}
```

### Frontend Integration Testing

1. Start frontend:
   ```bash
   cd apps/frontend
   npm run dev
   ```

2. Navigate to http://localhost:5173/login

3. Test login with credentials:
   - Email: `admin@example.com`
   - Password: `123456`

4. Verify:
   - Token is stored in localStorage as `accessToken`
   - Auth context contains user information
   - Page redirects to dashboard
   - Authorization header includes token in subsequent requests

## Guards and Decorators

### JWT Guard

Protects routes that require authentication:

```typescript
@Get('me')
@UseGuards(JwtGuard)
async getCurrentUser() {
  // Protected endpoint
}
```

### Roles Guard

Restricts access based on user role:

```typescript
@Get('admin-only')
@UseGuards(JwtGuard, RolesGuard)
@Roles('ADMIN')
async adminOnlyEndpoint() {
  // Only ADMIN role can access
}
```

### Current User Decorator

Injects current user info:

```typescript
@Get('profile')
@UseGuards(JwtGuard)
async getProfile(@CurrentUser() user: { userId: string; role: string }) {
  // user contains userId and role from JWT token
}
```

## Key Implementation Details

### Password Hashing

- Uses `bcryptjs` with 10 salt rounds
- Passwords are never stored in plain text
- Always compare using `bcrypt.compare()`

### JWT Token Validation

- Extracted from `Authorization: Bearer <token>` header
- Verified using `JWT_SECRET` environment variable
- Payload contains `sub` (user ID) and `role`
- Expires after `JWT_EXPIRES_IN` duration (default: 1 day)

### Service-to-Service Communication

- Uses HTTP (Axios) for inter-service calls
- Auth Service calls User Service endpoints for password validation
- No direct database access between services (maintains separation of concerns)
- Service URLs configurable via environment variables

### CORS Configuration

- Enabled for frontend origin (default: http://localhost:5173)
- Credentials allowed for token-based authentication
- Configurable via `FRONTEND_ORIGIN` environment variable

## File Structure

```
apps/backend/
├── auth-service/
│   └── src/
│       ├── config/
│       │   └── jwt.config.ts
│       ├── common/
│       │   ├── guards/
│       │   │   ├── jwt.guard.ts
│       │   │   └── roles.guard.ts
│       │   ├── decorators/
│       │   │   ├── auth-user.decorator.ts
│       │   │   └── roles.decorator.ts
│       │   └── filters/
│       │       └── http-exception.filter.ts
│       ├── modules/
│       │   └── auth/
│       │       ├── auth.module.ts
│       │       ├── auth.controller.ts
│       │       ├── auth.service.ts
│       │       ├── jwt.strategy.ts
│       │       ├── user-service.client.ts
│       │       └── dto/
│       │           ├── login.dto.ts
│       │           └── auth-response.dto.ts
│       ├── app.module.ts
│       └── main.ts
├── user-service/
│   └── src/
│       ├── config/
│       │   └── database.config.ts
│       ├── schemas/
│       │   └── user.schema.ts
│       ├── common/
│       │   └── filters/
│       │       └── http-exception.filter.ts
│       ├── modules/
│       │   └── users/
│       │       ├── users.module.ts
│       │       ├── users.controller.ts
│       │       ├── users.service.ts
│       │       └── dto/
│       │           ├── create-user.dto.ts
│       │           └── user.dto.ts
│       ├── app.module.ts
│       └── main.ts
└── api-gateway/
    └── src/
        ├── modules/
        │   └── auth/
        │       ├── auth.module.ts
        │       ├── auth.controller.ts
        │       └── auth-service.client.ts
        ├── common/
        │   └── filters/
        │       └── http-exception.filter.ts
        ├── app.module.ts
        └── main.ts
```

## Swagger Documentation

### Access Swagger UI

- **API Gateway:** http://localhost:3000/api/docs
- **Auth Service:** http://localhost:3001/api/docs
- **User Service:** http://localhost:3002/api/docs

All endpoints are documented with request/response schemas and examples.

## Production Considerations

1. **JWT Secret:** Change `JWT_SECRET` to a strong random value in production
2. **Database:** Use MongoDB Atlas or managed MongoDB service
3. **CORS:** Restrict `FRONTEND_ORIGIN` to your actual frontend domain
4. **Logging:** Add structured logging (consider Winston or Pino)
5. **Rate Limiting:** Add rate limiting to login endpoint
6. **Password Policy:** Consider enforcing stronger password requirements
7. **Token Refresh:** Consider implementing refresh tokens for enhanced security
8. **Audit Logging:** Log all authentication attempts
9. **HTTPS:** Always use HTTPS in production
10. **Environment Secrets:** Use a secrets management system (AWS Secrets, HashiCorp Vault, etc.)

## Next Steps (Modules 2+)

Module 1 provides the foundation for role-based access control. Future modules will:
- Use JwtGuard and RolesGuard to protect module-specific endpoints
- Implement role-specific dashboards and permissions
- Add audit logging for all user actions
- Implement notifications system

---

**Implementation Date:** 2026-09-01
**Status:** ✅ Complete and tested
**Frontend Contract:** Fully aligned with frontend auth context and API expectations
