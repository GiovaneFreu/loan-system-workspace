# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a loan management system built with:
- **Frontend**: Angular 20+ with standalone components and Tailwind CSS
- **Backend**: NestJS with TypeORM and PostgreSQL
- **Shared**: TypeScript interfaces library
- **Monorepo**: Nx workspace with proper dependency management

## Architecture

### Nx Workspace Structure
```
apps/
├── frontend/          # Angular frontend application
├── frontend-e2e/      # E2E tests for frontend
├── backend/           # NestJS backend API
└── backend-e2e/       # E2E tests for backend

libs/
└── interfaces/        # Shared TypeScript interfaces
```

### Frontend Architecture
- **Standalone Components**: Uses Angular standalone components (no NgModule for components)
- **Feature Modules**: Organized by business domains (loans, clients, dashboard)  
- **Routing**: Lazy-loaded feature modules with `loadChildren`
- **Locale**: Configured for Portuguese Brazil (`pt-BR`)
- **Proxy**: Backend API proxied during development via `proxy.conf.json`

### Backend Architecture
- **Modules**: Feature-based modules (clients, loans, dashboard, health)
- **Database**: PostgreSQL with TypeORM, entities include Client and Loan
- **Config**: Environment-based configuration with validation
- **Static Files**: Serves Angular frontend from `/dist/apps/frontend/browser`
- **Health Check**: Available for monitoring
- **Connection Resilience**: Database connection with retry logic (5 attempts, 5s delay)

### Database Configuration
- Uses PostgreSQL with TypeORM
- Environment variables for database connection
- SSL support configurable
- Entities: Client, Loan
- Development database: PostgreSQL 17 Alpine via Docker

## Development Commands

### Running Applications
```bash
# Start frontend (depends on backend)
npx nx serve frontend

# Start backend only  
npx nx serve backend

# Start both with Docker
docker-compose -f infrastructure/docker/docker-compose.yml up
```

### Building
```bash
# Build frontend
npx nx build frontend

# Build backend  
npx nx build backend

# Build all projects
npx nx run-many -t build
```

### Testing
```bash
# Test specific project
npx nx test frontend
npx nx test backend
npx nx test interfaces

# Test all projects
npx nx run-many -t test

# E2E tests
npx nx e2e frontend-e2e
npx nx e2e backend-e2e
```

### Linting
```bash
# Lint specific project
npx nx lint frontend
npx nx lint backend

# Lint all projects
npx nx run-many -t lint
```

### Database
Development database runs on port 5433 (not 5432) to avoid conflicts.

## Code Conventions

### Frontend
- Use standalone components with Angular 20+ features
- Feature-based module organization under `apps/frontend/src/app/pages/`
- Shared components in `apps/frontend/src/app/core/components/`
- Services in feature-specific directories
- Barrel exports (`index.ts`) for clean imports
- Portuguese locale support
- Tailwind CSS for styling

### Backend
- Feature modules following NestJS conventions
- Controllers, services, DTOs, and entities per module
- Environment configuration with validation
- TypeORM for database operations
- Proper error handling and logging
- Health checks for monitoring

### Shared Code
- Common interfaces in `libs/interfaces`
- Export through barrel files (`index.ts`)
- Type-safe contracts between frontend and backend

## Environment Configuration
Environment files expected in `infrastructure/environments/`:
- `.env` (base)
- `.env.development`
- `.env.docker`
- Other environment-specific files

Required environment variables:
- `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME`
- `DATABASE_SSL` (boolean)
- `NODE_ENV`

## Key Files
- `apps/frontend/proxy.conf.json`: API proxy configuration for development
- `apps/backend/src/app/app.module.ts`: Main application module with all imports
- `libs/interfaces/src/index.ts`: Shared interface exports
- `infrastructure/docker/docker-compose.yml`: Development Docker setup