# 🔐 GitHub Secrets Configuration Template

Configure os seguintes secrets no seu repositório GitHub:

**Settings → Secrets and variables → Actions → New repository secret**

## Required Secrets

### `AZURE_CREDENTIALS_STAGING`
Azure service principal JSON for staging environment

### `DB_HOST_STAGING`
Database host: `loan-system-db-staging.postgres.database.azure.com`

### `DB_USER_STAGING` 
Database user: `loanadmin`

### `DB_PASSWORD_STAGING`
Database password (set during Azure deployment)

### `DB_NAME_STAGING`
Database name: `loan_system_staging`

## Commands to get values:

```bash
# Service Principal for GitHub Actions
az ad sp create-for-rbac --name "loan-system-github" \
  --role contributor \
  --scopes "/subscriptions/SUBSCRIPTION_ID/resourceGroups/rg-loan-system-staging" \
  --sdk-auth

# ACR Credentials
az acr credential show --name loansystemacr --resource-group rg-loan-system-staging
```

## Azure Resources

- Resource Group: `rg-loan-system-staging` 
- Container Registry: `loansystemacr.azurecr.io`
- PostgreSQL: `loan-system-db-staging.postgres.database.azure.com`