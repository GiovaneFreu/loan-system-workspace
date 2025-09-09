# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a loan management system built with:
- **Frontend**: Angular 20+ with standalone components and Tailwind CSS
- **Backend**: NestJS with TypeORM and PostgreSQL (port 3000)
- **Backend Java**: Jakarta EE 11 with Hibernate and PostgreSQL (port 3001)
- **Shared**: TypeScript interfaces library + Java interfaces library
- **Monorepo**: Nx workspace with proper dependency management

## Architecture

### Nx Workspace Structure
```
apps/
├── frontend/          # Angular frontend application
├── frontend-e2e/      # E2E tests for frontend
├── backend/           # NestJS backend API (port 3000)
├── backend-java/      # Jakarta EE 11 backend API (port 3001)
└── backend-e2e/       # E2E tests for backend

libs/
├── interfaces/        # Shared TypeScript interfaces
└── java-interfaces/   # Shared Java interfaces
```

### Frontend Architecture
- **Standalone Components**: Uses Angular standalone components (no NgModule for components)
- **Feature Modules**: Organized by business domains (loans, clients, dashboard)  
- **Routing**: Lazy-loaded feature modules with `loadChildren`
- **Locale**: Configured for Portuguese Brazil (`pt-BR`)
- **Proxy**: Backend API proxied during development via `proxy.conf.json`

### Backend Architecture (NestJS)
- **Modules**: Feature-based modules (clients, loans, dashboard, health)
- **Database**: PostgreSQL with TypeORM, entities include Client and Loan
- **Config**: Environment-based configuration with validation
- **Static Files**: Serves Angular frontend from `/dist/apps/frontend/browser`
- **Health Check**: Available for monitoring
- **Connection Resilience**: Database connection with retry logic (5 attempts, 5s delay)

### Backend Java Architecture (Jakarta EE 11)
- **REST APIs**: JAX-RS controllers for clients and loans
- **Database**: PostgreSQL with Hibernate/JPA, same entities as NestJS backend
- **ORM**: Hibernate 6.x as JPA provider
- **CDI**: Context and Dependency Injection for service management
- **Build**: Gradle (IntelliJ IDEA + CLI support)
- **Server**: WildFly application server (port 8080)
- **Development**: Hybrid approach - IntelliJ for daily work, CLI for automation
- **Deployment**: WAR files to `dist/apps/backend-java/`

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

# Start Java backend via IntelliJ
# Open IntelliJ → WildFly Configuration → Run

# Start both with Docker
docker-compose -f infrastructure/docker/docker-compose.yml up
```

### Building
```bash
# Build frontend
npx nx build frontend

# Build backend  
npx nx build backend

# Build Java backend
# Option 1: IntelliJ - Gradle Tool Window → Tasks → build → war
# Option 2: CLI - npx nx build backend-java
# Option 3: Direct - cd apps/backend-java && ./gradlew war

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

# Test with coverage
npx nx test frontend --configuration=ci
npx nx test backend --configuration=ci

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
- `nx.json`: Nx workspace configuration with target defaults and plugins

## Backend Java Development Guide

### 🚀 Quick Start
```bash
# Read comprehensive development guide
cat apps/backend-java/README.md

# Build Java backend
npx nx build backend-java

# Test Java backend
npx nx test backend-java
```

### 📋 IntelliJ IDEA (Recommended for Daily Development)
- **Hot reload** & advanced debugging
- **Integrated WildFly** server management
- **Database tools** and visual query builder
- **Code completion** and refactoring

**Setup Steps:**
1. Import Project: `apps/backend-java` in IntelliJ
2. Configure WildFly server in Application Servers
3. Create Run Configuration → WildFly → Add Deployment
4. Run/Debug your application

**Endpoints:** `http://localhost:8080/api/clients`

### 🖥️ CLI Approach (Great for CI/CD & Automation)
- **Automated builds** and scripting
- **CI/CD pipeline** integration  
- **No IDE dependency**
- **Script-friendly** commands

**Commands:**
```bash
cd apps/backend-java
./gradlew war          # Build WAR
./gradlew test         # Run tests  
./gradlew clean war    # Clean build
npx nx build backend-java  # Via Nx
```

**Output:** `dist/apps/backend-java/backend-java-1.0.0.war`

## Dependencies and Architecture Notes
- **Frontend Dependencies**: Angular 20+ with Jest for testing, ESLint for linting, Playwright for E2E
- **Backend Dependencies**: NestJS 11+, TypeORM 0.3+, class-validator/class-transformer for DTOs
- **Backend Java Dependencies**: Jakarta EE 11, Hibernate 6.x, PostgreSQL driver
- **Shared Libraries**: TypeScript interfaces (`libs/interfaces`) + Java interfaces (`libs/java-interfaces`)
- **Development Tools**: Nx 21+, Tailwind CSS for styling, date-fns for date handling
- **Testing Framework**: Jest with Angular preset for unit tests, Playwright for E2E tests
- **Code Quality**: ESLint with Angular rules, Prettier for formatting