# Loan System Workspace

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

[![Nx](https://img.shields.io/badge/Nx-22.x-0f172a)](https://nx.dev)
[![Angular](https://img.shields.io/badge/Angular-21-DD0031?logo=angular&logoColor=white)](https://angular.dev)
[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com)
[![CI](https://github.com/GiovaneFreu/loan-system-workspace/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/GiovaneFreu/loan-system-workspace/actions/workflows/ci.yml)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Cloud%20Run-4285F4?logo=googlecloud&logoColor=white)](https://loan-system-121742301150.us-central1.run.app/)

A loan management system built as an Nx monorepo with Angular and NestJS. The project emphasizes clean domain boundaries, shared contracts, and a production-ready deployment flow using a single container.

## Highlights
- Client and loan management with financial calculations
- Dashboard metrics and consolidated overview
- Standalone Angular components with Tailwind CSS and pt-BR locale
- NestJS API with TypeORM, environment validation, and health checks
- Shared interfaces library for frontend-backend contracts
- Multi-stage Docker build, frontend served by backend in production

## Live Demo
- https://loan-system-121742301150.us-central1.run.app/

The demo runs on Google Cloud Run and scales to zero when idle, so the first request after a pause can take a few seconds. It uses an in-container SQLite database seeded with fictitious data (`DEMO_SEED=true`), which resets whenever the service restarts.

## Tech Stack
- **Frontend**: Angular 21, RxJS, Tailwind CSS
- **Backend**: NestJS 11, TypeORM
- **Database**: SQLite (production default), PostgreSQL (development)
- **Monorepo**: Nx 22
- **Testing**: Jest, Playwright
- **Containerization**: Docker

## Monorepo Structure
```
apps/
├── frontend/          # Angular application
├── frontend-e2e/      # Frontend E2E tests
├── backend/           # NestJS API
└── backend-e2e/       # Backend E2E tests

libs/
└── interfaces/        # Shared TypeScript interfaces
```

## Architecture
```mermaid
flowchart LR
  subgraph Browser
    UI[Angular Frontend]
  end
  subgraph CloudRun["Google Cloud Run (Demo)"]
    APP[NestJS API\n+ Angular Static]
    VOL[(SQLite\nin-container, seeded)]
  end
  subgraph Data
    PG[(PostgreSQL\nDevelopment)]
  end
  subgraph Monorepo
    IF[Shared Interfaces]
  end

  UI -->|/api + static| APP
  APP -->|SQLite| VOL
  APP -.->|TypeORM| PG
  UI --- IF
  APP --- IF
```

## Environment Configuration
Environment files are loaded from `infrastructure/environments/.env.<NODE_ENV>` and `infrastructure/environments/.env`. These files are gitignored. Use `infrastructure/environments/.env.example` as a template.

### Production (SQLite)
```
NODE_ENV=production
PORT=8080
DATABASE_TYPE=sqlite
DATABASE_PATH=/var/lib/data/data.db
DATABASE_SYNCHRONIZE=true
DEMO_SEED=true   # optional: seeds fictitious data when the database is empty
```

For persistent data, mount a volume at `/var/lib/data` or switch to PostgreSQL. Use `DATABASE_SYNCHRONIZE=true` only for the initial deployment.

### Development (PostgreSQL via Docker)
```
NODE_ENV=development
PORT=3000
DATABASE_TYPE=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5433
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=loan-system
DATABASE_SSL=false
```

## Local Development
1. Install dependencies:
```bash
npm install
```

2. Create `infrastructure/environments/.env.development` using the development template above.

3. Start PostgreSQL:
```bash
docker-compose -f infrastructure/docker/docker-compose.yml up postgres -d
```

4. Run the apps:
```bash
# Start frontend and backend simultaneously
npx nx serve frontend

# Or start only the backend
npx nx serve backend
```

The Angular dev server proxies `/api` to `http://localhost:3000`.

## Production Build
```bash
npx nx build frontend
npx nx build backend
npx nx run-many -t build
```

## Deployment (Docker / Google Cloud Run)
1. Build the image:
```bash
docker build -t loan-system .
```

2. Run locally:
```bash
docker run -p 8080:8080 \
  -e PORT=8080 \
  -e DATABASE_TYPE=sqlite \
  -e DATABASE_PATH=/var/lib/data/data.db \
  -e DATABASE_SYNCHRONIZE=true \
  loan-system
```

3. Deploy to Cloud Run from source (Cloud Build builds the root `Dockerfile`):
```bash
gcloud run deploy loan-system --source . \
  --region us-central1 --allow-unauthenticated \
  --min-instances 0 --max-instances 1 --memory 512Mi \
  --set-env-vars NODE_ENV=production,DEMO_SEED=true
```

### Continuous deployment
Every push to `main` runs the **CI Pipeline**: lint, unit tests with coverage thresholds, Playwright e2e tests, production builds and a container smoke test. When it passes, **Deploy to Cloud Run** builds `infrastructure/docker/Dockerfile.prod`, pushes the image to Artifact Registry, deploys it and checks the health endpoint.

GitHub Actions authenticates to Google Cloud with Workload Identity Federation, so no service account keys are stored in the repository. The one-time setup is scripted in `infrastructure/gcp/setup-github-deploy.sh`.

## API
- Base path: `/api`
- Health check: `/api/health`

## Testing
```bash
npx nx run-many -t test
npx nx test frontend
npx nx test backend
npx nx test interfaces
npx nx e2e frontend-e2e
npx nx e2e backend-e2e
```

## Linting
```bash
npx nx run-many -t lint
npx nx lint frontend
npx nx lint backend
```

## Useful Nx Commands
```bash
npx nx graph
npx nx show project frontend
npx nx show projects
npx nx g @nx/angular:component my-component --project=frontend
```

## Data Model
- **Client**: CPF/CNPJ, income, and profile data
- **Loan**: Amount, rate, term, schedule, and status

## Ports
- **Frontend (dev)**: http://localhost:4200
- **Backend (dev)**: http://localhost:3000 (configurable via `PORT`)
- **Backend (prod)**: http://localhost:8080 (configurable via `PORT`)
- **PostgreSQL (dev)**: localhost:5433

## License
MIT
