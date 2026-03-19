# JWT Authentication Implementation

## Overview

Complete JWT authentication system with access/refresh tokens, token rotation, role-based access control, and enhanced password validation.

## Features Implemented

### 1. Authentication Endpoints
- **POST /api/v1/auth/register** - Register new user (default role: user)
- **POST /api/v1/auth/login** - Login with email/password
- **POST /api/v1/auth/refresh** - Refresh access token (with token rotation)
- **POST /api/v1/auth/logout** - Logout and revoke refresh token

### 2. Token Management
- **Access tokens**: 1 hour expiration
- **Refresh tokens**: 30 day expiration
- **Token rotation**: Old refresh tokens are revoked when new ones are issued
- **Database storage**: Refresh tokens stored in PostgreSQL for revocation capability

### 3. Security Features
- **Password requirements**: Minimum 8 characters with uppercase, lowercase, number, and special character
- **Argon2 hashing**: Secure password hashing algorithm
- **Token revocation**: Refresh tokens can be revoked on logout
- **User soft delete**: Deleted users' tokens automatically become invalid

### 4. Guards & Decorators

#### Guards
- **JwtAuthGuard**: Protects routes requiring authentication
- **LocalAuthGuard**: Validates login credentials
- **RolesGuard**: Enforces role-based access control

#### Decorators
- **@Public()**: Mark routes as public (skip JWT authentication)
- **@Roles(UserRole.ADMIN)**: Require specific roles
- **@CurrentUser()**: Extract current user from request
- **@CurrentUser('id')**: Extract specific user property

## Usage Examples

### Protecting Routes

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { UserRole } from 'src/user/types/user.interface';

@Controller('protected')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProtectedController {
  
  // Requires authentication
  @Get('profile')
  getProfile(@CurrentUser() user: any) {
    return user;
  }

  // Requires admin role
  @Roles(UserRole.ADMIN)
  @Get('admin-only')
  adminOnly() {
    return { message: 'Admin access granted' };
  }
}
```

### Public Routes

```typescript
import { Controller, Get } from '@nestjs/common';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('public')
export class PublicController {
  
  @Public()
  @Get('info')
  getInfo() {
    return { message: 'This is public' };
  }
}
```

## API Request/Response Examples

### Register
```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "password": "SecurePass123!"
}
```

Response:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "user",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

### Login
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

### Refresh Token
```bash
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Logout
```bash
POST /api/v1/auth/logout
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Protected Route
```bash
GET /api/v1/protected/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Database Schema

### refresh_token Table
```sql
CREATE TABLE "refresh_token" (
  "id" serial PRIMARY KEY NOT NULL,
  "token" varchar(500) NOT NULL UNIQUE,
  "user_id" integer NOT NULL,
  "expires_at" timestamp NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "revoked_at" timestamp,
  FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade
);

CREATE INDEX "refresh_token_token_idx" ON "refresh_token" ("token");
CREATE INDEX "refresh_token_user_id_idx" ON "refresh_token" ("user_id");
```

## Environment Variables

Add these to your `.env` file:

```env
JWT_ACCESS_SECRET=your-super-secret-access-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_ACCESS_EXPIRATION=1h
JWT_REFRESH_EXPIRATION=30d
```

## Migration

Run the migration to create the refresh_token table:

```bash
# For Docker/CI
npm run db:migrate

# For local development
npm run db:migrate:local
```

## Password Validation Rules

Passwords must meet the following requirements:
- Minimum 8 characters
- At least 1 uppercase letter (A-Z)
- At least 1 lowercase letter (a-z)
- At least 1 number (0-9)
- At least 1 special character (!@#$%^&*()_+-=[]{};\\':"\\|,.<>/?)

## File Structure

```
src/
├── auth/
│   ├── decorators/
│   │   ├── current-user.decorator.ts
│   │   ├── public.decorator.ts
│   │   └── roles.decorator.ts
│   ├── dto/
│   │   ├── auth-response.dto.ts
│   │   ├── login.dto.ts
│   │   ├── refresh-token.dto.ts
│   │   └── register.dto.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   ├── local-auth.guard.ts
│   │   └── roles.guard.ts
│   ├── strategies/
│   │   ├── jwt.strategy.ts
│   │   └── local.strategy.ts
│   ├── auth.controller.ts
│   ├── auth.module.ts
│   ├── auth.repository.ts
│   └── auth.service.ts
├── common/
│   └── validators/
│       └── is-strong-password.validator.ts
└── user/
    ├── dto/
    │   └── create-user.dto.ts (updated)
    ├── user.repository.ts (updated)
    └── user.service.ts (updated)
```

## Security Considerations

1. **JWT Secrets**: Store in environment variables, never commit to version control
2. **Token Rotation**: Prevents refresh token reuse attacks
3. **Database Storage**: Enables token revocation capability
4. **Soft Deletes**: User deletion automatically invalidates tokens
5. **Password Hashing**: Argon2 algorithm for secure password storage
6. **Rate Limiting**: Consider adding throttling to auth endpoints (ThrottlerModule already configured)

## Next Steps

1. **Add environment variables** to your `.env` file
2. **Run database migration** to create refresh_token table
3. **Test authentication flow** using the examples above
4. **Apply guards** to your existing controllers as needed
5. **Define admin routes** using the @Roles decorator

## Testing Checklist

- [ ] Register new user with valid password
- [ ] Register fails with weak password
- [ ] Login with correct credentials
- [ ] Login fails with wrong credentials
- [ ] Access protected route with valid token
- [ ] Access protected route without token (should fail)
- [ ] Refresh tokens successfully
- [ ] Old refresh token cannot be reused after refresh
- [ ] Logout revokes refresh token
- [ ] Revoked refresh token cannot be used
- [ ] Admin-only route blocks regular users
- [ ] Admin-only route allows admin users
