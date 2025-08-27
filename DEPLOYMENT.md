# 🚀 Deployment Guide - Loan System

## Overview

This document provides complete instructions for deploying the Loan System to Azure using CI/CD pipelines.

## Architecture

```
┌─────────────────────────────────────────┐
│         Azure Resource Group            │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────────┐  ┌─────────────┐│
│  │ Container Apps   │  │ PostgreSQL  ││
│  │   Environment    │  │  Flexible   ││
│  │                  │  │   Server    ││
│  │ ┌──────────────┐ │  │             ││
│  │ │Backend + FE  │ │  │  Database   ││
│  │ │Container App │◄├──┤             ││
│  │ └──────────────┘ │  └─────────────┘│
│  └──────────────────┘                  │
│                                         │
│  ┌──────────────────┐  ┌─────────────┐│
│  │ Container        │  │   Key       ││
│  │   Registry       │  │   Vault     ││
│  └──────────────────┘  └─────────────┘│
└─────────────────────────────────────────┘
```

## Prerequisites

### Azure Setup

1. **Azure CLI installed**
   ```bash
   curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
   az login
   ```

2. **Azure subscription with permissions:**
   - Contributor role
   - User Access Administrator role

3. **Resource providers registered:**
   ```bash
   az provider register --namespace Microsoft.App
   az provider register --namespace Microsoft.DBforPostgreSQL
   az provider register --namespace Microsoft.ContainerRegistry
   ```

### GitHub Setup

1. **Repository secrets required:**
   ```
   AZURE_CREDENTIALS_STAGING=<service-principal-json>
   AZURE_CREDENTIALS_PROD=<service-principal-json>
   NX_CLOUD_ACCESS_TOKEN=<optional-nx-cloud-token>
   ```

2. **Create service principal:**
   ```bash
   az ad sp create-for-rbac --name "loan-system-github" \
     --role contributor \
     --scopes /subscriptions/<subscription-id> \
     --sdk-auth
   ```

## Deployment Steps

### 1. Initial Infrastructure Setup

Deploy the Azure infrastructure for staging:

```bash
# Login to Azure
az login

# Deploy staging infrastructure
az deployment sub create \
  --location brazilsouth \
  --template-file infrastructure/azure/main.bicep \
  --parameters @infrastructure/azure/parameters/staging.json

# Deploy production infrastructure
az deployment sub create \
  --location brazilsouth \
  --template-file infrastructure/azure/main.bicep \
  --parameters @infrastructure/azure/parameters/production.json
```

### 2. Configure GitHub Secrets

Set the following secrets in your GitHub repository:

#### Azure Credentials
```bash
# Get service principal credentials
az ad sp create-for-rbac --name "loan-system-deploy" \
  --role contributor \
  --scopes /subscriptions/<subscription-id>/resourceGroups/rg-loan-system-staging \
  --sdk-auth

# Copy output to GitHub secret: AZURE_CREDENTIALS_STAGING
```

#### Database Credentials
```bash
# Get database connection details from Azure
az postgres flexible-server show \
  --name loan-system-db-staging \
  --resource-group rg-loan-system-staging
```

Add to GitHub secrets:
- `DB_HOST_STAGING`
- `DB_USER_STAGING` 
- `DB_PASSWORD_STAGING`
- `DB_NAME_STAGING`

### 3. First Deployment

1. **Push to develop branch** to trigger staging deployment:
   ```bash
   git checkout -b develop
   git push origin develop
   ```

2. **Create release** for production deployment:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   # Or create release through GitHub UI
   ```

## CI/CD Pipeline

### Automatic Triggers

- **CI Pipeline**: Runs on every push/PR to `main` or `develop`
- **Staging Deploy**: Auto-deploys on push to `develop`
- **Production Deploy**: Manual approval required for releases

### Pipeline Stages

1. **Test & Lint**: Unit tests, linting, security scanning
2. **Build**: Frontend and backend builds
3. **Docker Build**: Multi-stage Docker image creation
4. **Deploy**: Container registry push and Azure deployment

## Environments

### Development (Local)
```bash
docker-compose up -d
```
- **URL**: http://localhost:3000
- **Database**: PostgreSQL on port 5433

### Staging
- **URL**: https://loan-system-staging.azurecontainerapps.io
- **Auto-deploy**: Yes (on develop branch)
- **Database**: Azure PostgreSQL Flexible Server

### Production
- **URL**: https://loan-system.azurecontainerapps.io
- **Deploy**: Manual approval required
- **Database**: Azure PostgreSQL with high availability

## Health Checks

The application provides multiple health check endpoints:

- `/health` - Basic health status
- `/ready` - Readiness probe (includes database check)
- `/live` - Liveness probe

## Monitoring

### Application Insights

Monitor application performance and errors:
```bash
# Get Application Insights connection string
az resource show \
  --resource-group rg-loan-system-staging \
  --name loan-system-logs-staging \
  --resource-type "Microsoft.OperationalInsights/workspaces" \
  --query properties.customerId
```

### Log Analytics

Access centralized logs:
```bash
# Query logs
az monitor log-analytics query \
  --workspace loan-system-logs-staging \
  --analytics-query "ContainerAppConsoleLogs_CL | limit 100"
```

## Scaling

Container Apps automatically scale based on:
- **HTTP requests**: 100 concurrent requests per instance
- **Min replicas**: 1 (staging), 2 (production)
- **Max replicas**: 3 (staging), 10 (production)

## Security

### Best Practices Implemented

- ✅ Non-root container user
- ✅ Secrets stored in Key Vault
- ✅ Managed Identity for service-to-service auth
- ✅ Network isolation with VNet integration
- ✅ Container image scanning (Trivy)
- ✅ Regular dependency updates

### SSL/TLS

- Automatic HTTPS termination at Container Apps ingress
- Azure-managed certificates

## Troubleshooting

### Common Issues

1. **Container not starting**
   ```bash
   # Check container logs
   az containerapp logs show \
     --name loan-system-app-staging \
     --resource-group rg-loan-system-staging
   ```

2. **Database connection failed**
   ```bash
   # Test database connectivity
   az postgres flexible-server connect \
     --name loan-system-db-staging \
     --admin-user loanadmin
   ```

3. **Build failures**
   - Check GitHub Actions logs
   - Verify Node.js version compatibility
   - Ensure all dependencies are installed

### Support Commands

```bash
# Restart container app
az containerapp revision restart \
  --name loan-system-app-staging \
  --resource-group rg-loan-system-staging

# Scale manually
az containerapp update \
  --name loan-system-app-staging \
  --resource-group rg-loan-system-staging \
  --min-replicas 2 \
  --max-replicas 5

# View resource costs
az consumption budget list \
  --resource-group rg-loan-system-staging
```

## Cost Optimization

### Estimated Monthly Costs

- **Staging**: ~$50-80/month
- **Production**: ~$150-300/month

### Cost-saving tips

1. Use Burstable tier for PostgreSQL in staging
2. Enable auto-pause for development databases
3. Set up cost alerts and budgets
4. Review and cleanup unused resources monthly

## Backup & Recovery

### Database Backups

- **Staging**: 7 days retention
- **Production**: 30 days retention + geo-redundant

### Disaster Recovery

```bash
# Restore database from backup
az postgres flexible-server restore \
  --name loan-system-db-staging-restore \
  --resource-group rg-loan-system-staging \
  --source-server loan-system-db-staging \
  --restore-time "2023-12-01T10:00:00Z"
```

## Maintenance

### Regular Tasks

- [ ] Review and update dependencies monthly
- [ ] Monitor resource usage and costs
- [ ] Test backup and recovery procedures
- [ ] Update security patches
- [ ] Review access permissions

### Update Process

1. Update dependencies in development
2. Test thoroughly locally
3. Deploy to staging
4. Run integration tests
5. Deploy to production with approval

---

## 📞 Support

For deployment issues or questions:
- Create an issue in this repository
- Check Azure service health status
- Review application logs in Log Analytics