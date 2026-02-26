# Airlines API

A comprehensive REST API for searching and managing flights and airline data built with NestJS.

## Description

The Airlines API provides a robust backend solution for flight search and management operations. This service offers endpoints for:

- **Airline Management**: Search, create, update, and manage airline information
- **Flight Operations**: Manage flight schedules, routes, and availability
- **Aircraft Management**: Track and manage aircraft fleet information
- **Seat Management**: Handle seat configurations and availability
- **Authentication & Security**: JWT-based authentication with role-based access control

## Technology Stack

- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Caching**: Redis for performance optimization
- **Authentication**: JWT with Passport
- **Documentation**: Swagger/OpenAPI
- **Security**: Helmet, rate limiting, and input validation
- **Logging**: Pino for structured logging

## Features

- ✅ RESTful API design with proper HTTP status codes
- ✅ Database migrations with Drizzle Kit
- ✅ Redis caching for improved performance
- ✅ JWT authentication and authorization
- ✅ Request validation with class-validator
- ✅ Comprehensive API documentation with Swagger
- ✅ Structured logging with Pino
- ✅ Docker containerization with health checks
- ✅ Rate limiting and security middleware

## Quick Start

### Prerequisites
- Node.js (v18 or higher)
- Docker & Docker Compose
- PostgreSQL (if running locally)
- Redis (if running locally)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd airlines

# Install dependencies
npm install
```

### Running the Application

#### Option 1: Docker Compose (Recommended)
```bash
# Start all services with hot reload
npm run start:container
```

This will start:
- **API Server** on port 3000
- **PostgreSQL** database with health checks
- **Redis** cache with health checks

#### Option 2: Local Development
```bash
# Development mode with hot reload
npm run start:dev

# Production mode
npm run start:prod
```

### Database Management

```bash
# Generate database migrations
npm run db:generate

# Run database migrations
npm run db:migrate

# Push schema changes to database
npm run db:push
```

## Testing

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run test coverage
npm run test:cov

# Run end-to-end tests
npm run test:e2e
```

## API Documentation

Once the application is running, you can access the interactive API documentation:

- **Swagger UI**: http://localhost:3000/docs
- **OpenAPI JSON**: http://localhost:3000/docs-json

The documentation includes:
- Detailed endpoint descriptions
- Request/response schemas
- Authentication requirements
- Interactive testing interface

## Project Structure

```
src/
├── airline/           # Airline-related modules
│   ├── airline.controller.ts
│   ├── airline.service.ts
│   └── airline.repository.ts
├── auth/              # Authentication modules
├── config/            # Configuration files
├── database/          # Database connection and schema
├── common/            # Shared utilities and decorators
└── main.ts            # Application entry point
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the package.json file for details.

## Author

**Vladislav Lavysh** - *Initial work* - [GitHub Profile](https://github.com/vladvlav)
