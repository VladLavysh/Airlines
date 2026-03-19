# Airlines Application

A full-stack flight booking and management system with a NestJS backend API and Nuxt.js frontend.

## Description

The Airlines Application is a comprehensive flight booking platform that provides:

**Backend API:**
- **Airline Management**: Search, create, update, and manage airline information
- **Flight Operations**: Manage flight schedules, routes, and availability
- **Aircraft Management**: Track and manage aircraft fleet information
- **Seat Management**: Handle seat configurations and availability
- **Booking System**: Create and manage flight bookings
- **Authentication & Security**: JWT-based authentication with role-based access control (user/admin)

**Frontend Application:**
- Modern, responsive UI built with Vue 3 and Nuxt 4
- Flight search and booking interface
- User authentication and profile management
- Admin dashboard for managing flights, airlines, and bookings
- Real-time booking status updates

## Technology Stack

### Backend
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Caching**: Redis for performance optimization
- **Authentication**: JWT with Passport (Local & JWT strategies)
- **API Documentation**: Swagger/OpenAPI
- **Security**: Helmet, CORS, rate limiting, and input validation
- **Logging**: Pino for structured logging
- **Containerization**: Docker with health checks

### Frontend
- **Framework**: Nuxt 4 (Vue 3) with TypeScript
- **UI Library**: Nuxt UI (Radix Vue components)
- **State Management**: Pinia
- **Styling**: TailwindCSS
- **Icons**: Lucide Icons
- **Rendering**: Client-side rendering (CSR)

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
- Node.js (v22 or higher)
- Docker & Docker Compose
- PostgreSQL (if running backend locally without Docker)
- Redis (if running backend locally without Docker)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd airlines

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Running the Application

#### Backend (Docker - Recommended)

```bash
# From the backend directory
cd backend

# Start backend with Docker (includes PostgreSQL & Redis)
npm run start:container
```

This will start:
- **API Server** on port 3000 (http://localhost:3000)
- **PostgreSQL** database on port 5432 with health checks
- **Redis** cache on port 6379 with health checks
- **Swagger API Docs** at http://localhost:3000/api/v1/docs

#### Backend (Local Development)

```bash
# From the backend directory
cd backend

# Make sure PostgreSQL and Redis are running locally
# Update backend/.env with local connection details

# Development mode with hot reload
npm run start:dev

# Production mode
npm run start:prod
```

#### Frontend

The frontend runs separately and is **not containerized**:

```bash
# From the frontend directory
cd frontend

# Start development server
npm run dev
```

The frontend will be available at http://localhost:3002 (or next available port).

**Note**: Make sure the backend is running before starting the frontend. The frontend connects to the backend API at `http://localhost:3000/api/v1`.

### Database Management

All database commands should be run from the `backend/` directory.

#### When using Docker (recommended)
```bash
cd backend

# Generate database migrations
npm run db:generate

# Run database migrations
npm run db:migrate

# Push schema changes to database
npm run db:push
```

#### When running locally (without Docker)
```bash
cd backend

# Generate database migrations
npm run db:generate:local

# Run database migrations
npm run db:migrate:local

# Push schema changes to database
npm run db:push:local
```

**Note**: The `:local` variants use `localhost` for database connection, while the standard commands use the Docker service name `db`. Use `:local` commands when running migrations on your local machine outside of Docker containers.

## Testing

All tests are located in the backend. Run from the `backend/` directory:

```bash
cd backend

# Run unit tests
npm run test

# Run test coverage
npm run test:cov

# Run end-to-end tests
npm run test:e2e
```

### E2E Testing Notes

- Copy `backend/.env.test.example` to `backend/.env.test` if you need custom local test values.
- `npm run test:e2e` automatically starts isolated test dependencies (`db_test` on port `5433` and `redis_test` on port `6380`), waits for readiness, runs migrations, and then executes only `*.e2e-spec.ts` tests.
- Test containers are automatically cleaned up after tests complete.
- CI workflows run migrations and tests with CI-provided environment variables.

## API Documentation

Once the backend is running, you can access the interactive API documentation:

- **Swagger UI**: http://localhost:3000/api/v1/docs
- **OpenAPI JSON**: http://localhost:3000/api/v1/docs-json

The documentation includes:
- Detailed endpoint descriptions
- Request/response schemas
- Authentication requirements
- Interactive testing interface

## Application URLs

- **Frontend**: http://localhost:3002 (or next available port)
- **Backend API**: http://localhost:3000/api/v1
- **API Documentation**: http://localhost:3000/api/v1/docs
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## Project Structure

```
airlines/
├── backend/                    # NestJS Backend API
│   ├── src/
│   │   ├── airline/           # Airline management
│   │   ├── aircraft/          # Aircraft management
│   │   ├── auth/              # Authentication & authorization
│   │   ├── booking/           # Booking system
│   │   ├── flight/            # Flight operations
│   │   ├── passenger/         # Passenger management
│   │   ├── route/             # Route management
│   │   ├── seat/              # Seat management
│   │   ├── seat-class/        # Seat class configuration
│   │   ├── ticket/            # Ticket management
│   │   ├── user/              # User management
│   │   ├── common/            # Shared utilities
│   │   ├── config/            # Configuration
│   │   ├── db/                # Database schema & connection
│   │   └── main.ts            # Application entry point
│   ├── drizzle/               # Database migrations
│   ├── test/                  # E2E tests
│   ├── scripts/               # Utility scripts
│   ├── .env.example           # Environment variables template
│   ├── Dockerfile             # Backend container definition
│   └── package.json           # Backend dependencies
│
├── frontend/                   # Nuxt.js Frontend
│   ├── app/
│   │   ├── pages/             # Application pages/routes
│   │   │   ├── admin/         # Admin dashboard pages
│   │   │   ├── bookings/      # Booking pages
│   │   │   ├── flights/       # Flight search & details
│   │   │   ├── index.vue      # Home page
│   │   │   ├── login.vue      # Login page
│   │   │   ├── register.vue   # Registration page
│   │   │   └── profile.vue    # User profile
│   │   ├── layouts/           # Page layouts
│   │   ├── stores/            # Pinia state stores
│   │   ├── composables/       # Vue composables
│   │   ├── middleware/        # Route middleware
│   │   └── assets/            # Static assets
│   ├── nuxt.config.ts         # Nuxt configuration
│   └── package.json           # Frontend dependencies
│
├── docker-compose.yml          # Docker orchestration (backend only)
├── .github/workflows/          # CI/CD workflows
└── README.md                   # This file
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
