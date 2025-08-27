targetScope = 'subscription'

@description('Azure region for resources')
param location string = 'brazilsouth'

@description('Base name for resources')
param baseName string = 'loan-system'

// Resource Group
resource rg 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: 'rg-${baseName}-staging'
  location: location
  tags: {
    environment: 'staging'
    project: baseName
    managedBy: 'bicep'
  }
}

// Container Registry
resource acr 'Microsoft.ContainerRegistry/registries@2023-01-01-preview' = {
  scope: rg
  name: replace('${baseName}acr', '-', '')
  location: location
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: true
    publicNetworkAccess: 'Enabled'
    networkRuleBypassOptions: 'AzureServices'
  }
  tags: {
    environment: 'staging'
    project: baseName
  }
}

// PostgreSQL Flexible Server
resource postgresServer 'Microsoft.DBforPostgreSQL/flexibleServers@2022-12-01' = {
  scope: rg
  name: '${baseName}-db-staging'
  location: location
  sku: {
    name: 'Standard_B1ms'
    tier: 'Burstable'
  }
  properties: {
    version: '16'
    administratorLogin: 'loanadmin'
    administratorLoginPassword: 'LoanSystem@123!'
    storage: {
      storageSizeGB: 32
    }
    backup: {
      backupRetentionDays: 7
      geoRedundantBackup: 'Disabled'
    }
    highAvailability: {
      mode: 'Disabled'
    }
  }
  tags: {
    environment: 'staging'
    project: baseName
  }
}

// Database
resource database 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2022-12-01' = {
  parent: postgresServer
  name: 'loan_system_staging'
  properties: {
    charset: 'UTF8'
    collation: 'en_US.utf8'
  }
}

// Firewall rule for Azure services
resource firewallRuleAzure 'Microsoft.DBforPostgreSQL/flexibleServers/firewallRules@2022-12-01' = {
  parent: postgresServer
  name: 'AllowAzureServices'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

// Outputs
output resourceGroupName string = rg.name
output acrLoginServer string = acr.properties.loginServer
output databaseHost string = postgresServer.properties.fullyQualifiedDomainName
output databaseAdmin string = postgresServer.properties.administratorLogin