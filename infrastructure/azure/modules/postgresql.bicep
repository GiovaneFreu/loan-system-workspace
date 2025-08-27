@description('Location for resources')
param location string

@description('Base name for resources')
param baseName string

@description('Environment')
param environment string

@description('Administrator login')
param administratorLogin string

@secure()
@description('Administrator password')
param administratorPassword string = newGuid()

var serverName = '${baseName}-db-${environment}'
var databaseName = '${baseName}_${environment}'

// PostgreSQL Flexible Server
resource postgresServer 'Microsoft.DBforPostgreSQL/flexibleServers@2022-12-01' = {
  name: serverName
  location: location
  sku: {
    name: environment == 'production' ? 'Standard_B2s' : 'Standard_B1ms'
    tier: environment == 'production' ? 'Burstable' : 'Burstable'
  }
  properties: {
    version: '16'
    administratorLogin: administratorLogin
    administratorLoginPassword: administratorPassword
    storage: {
      storageSizeGB: environment == 'production' ? 64 : 32
    }
    backup: {
      backupRetentionDays: environment == 'production' ? 30 : 7
      geoRedundantBackup: environment == 'production' ? 'Enabled' : 'Disabled'
    }
    highAvailability: {
      mode: environment == 'production' ? 'ZoneRedundant' : 'Disabled'
    }
  }
  tags: {
    environment: environment
    project: baseName
  }
}

// Database
resource database 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2022-12-01' = {
  parent: postgresServer
  name: databaseName
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

output fullyQualifiedDomainName string = postgresServer.properties.fullyQualifiedDomainName
output databaseName string = database.name
output administratorLogin string = administratorLogin