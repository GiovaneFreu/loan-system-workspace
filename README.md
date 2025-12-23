# Loan System Workspace

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

A comprehensive loan management system built with Nx monorepo, Angular, and NestJS.

## About the Project

This system provides complete loan management functionality, including:

- **Client Management**: Registration, editing, and querying of clients (CPF/CNPJ)
- **Loan Management**: Creation, calculation, and tracking of loans
- **Dashboard**: Metrics visualization and system overview
- **Financial Calculations**: Interest rates, currency conversion, and installments

## Architecture

### Technology Stack
- **Frontend**: Angular 20+ with standalone components
- **Backend**: NestJS with TypeORM
- **Database**: PostgreSQL
- **Styling**: Tailwind CSS
- **Monorepo**: Nx Workspace
- **Containerization**: Docker

### Workspace Structure
```
apps/
├── frontend/          # Angular application
├── frontend-e2e/      # Frontend E2E tests
├── backend/           # NestJS API
└── backend-e2e/       # Backend E2E tests

libs/
└── interfaces/        # Shared TypeScript interfaces
```

## Development

### Prerequisites
- Node.js 18+
- Docker and Docker Compose
- PostgreSQL (or use via Docker)

### Environment Setup

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `infrastructure/environments/.env`

4. Start the database:
```bash
docker-compose -f infrastructure/docker/docker-compose.yml up postgres -d
```

### Running the Application

#### Local Development
```bash
# Start frontend and backend simultaneously
npx nx serve frontend

# Or start only the backend
npx nx serve backend
```

#### With Docker
```bash
# Start all services
docker-compose -f infrastructure/docker/docker-compose.yml up
```

### Production Build

```bash
# Build frontend
npx nx build frontend

# Build backend
npx nx build backend

# Build all projects
npx nx run-many -t build
```

## Deployment (Docker / Koyeb)

The repository now includes a multi-stage `Dockerfile` that builds the Angular frontend and NestJS backend together and runs them on the same server. SQLite is the default database to simplify deployment on lightweight instances such as Koyeb nano.

1. Ensure the following environment variables are set (Koyeb example):
   - `PORT=8080` (default already)
   - `DATABASE_TYPE=sqlite` (default already)
   - `DATABASE_PATH=/var/lib/data/data.db` (points to the attached persistent volume and is the default path)
   - `DATABASE_SYNCHRONIZE=true` (only for initial setups without migrations)
2. Build and run locally:
   ```bash
   docker build -t loan-system .
   docker run -p 8080:8080 -e DATABASE_PATH=/var/lib/data/data.db loan-system
   ```
3. On Koyeb, attach a volume to `/var/lib/data` so the SQLite database persists between deployments. The backend will automatically serve the built Angular frontend from `dist/apps/frontend/browser`.

### Testing

```bash
# Run all tests
npx nx run-many -t test

# Specific tests
npx nx test frontend
npx nx test backend
npx nx test interfaces

# E2E tests
npx nx e2e frontend-e2e
npx nx e2e backend-e2e
```

### Linting

```bash
# Lint all projects
npx nx run-many -t lint

# Specific linting
npx nx lint frontend
npx nx lint backend
```

## Features

### Client Management
- Registration of individuals (CPF) and companies (CNPJ)
- Monthly income tracking
- Loan history per client

### Loan Management
- Multiple currency types
- Automatic interest and installment calculations
- Due date tracking
- Currency conversion

### Dashboard
- System metrics
- Overview of clients and loans
- Financial indicators

## Database Structure

### Main Entities
- **Client**: Client data (CPF/CNPJ, income, etc.)
- **Loan**: Loan information (amount, interest, term, etc.)

### Configuration
- PostgreSQL on port 5433 (development)
- TypeORM for ORM
- Automatic migrations in development

## Useful Scripts

```bash
# Visualize project dependencies
npx nx graph

# Information about a specific project
npx nx show project frontend

# List all projects
npx nx show projects

# Generate new components/modules
npx nx g @nx/angular:component my-component --project=frontend
```

## Development Environment

The system is configured with:
- Hot reload for development
- Automatic proxy between frontend and backend
- pt-BR locale configured
- ESLint and Prettier for code standardization

## Ports

- **Frontend**: http://localhost:4200
- **Backend**: http://localhost:3000
- **PostgreSQL**: localhost:5433

## Contributing

To contribute to the project:

1. Fork the repository
2. Create a branch for your feature (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## License

This project is under the MIT license.
