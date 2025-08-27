targetScope = 'subscription'

@description('Environment name (staging or production)')
@allowed([
  'staging'
  'production'
])
param environment string

@description('Azure region for resources')
param location string = 'brazilsouth'

@description('Base name for resources')
param baseName string = 'loan-system'

// Resource Group
resource rg 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: 'rg-${baseName}-${environment}'
  location: location
  tags: {
    environment: environment
    project: baseName
    managedBy: 'bicep'
  }
}

// Deploy modules
module acr './modules/registry.bicep' = {
  scope: rg
  name: 'acr-deployment'
  params: {
    location: location
    baseName: baseName
    environment: environment
  }
}

module database './modules/postgresql.bicep' = {
  scope: rg
  name: 'database-deployment'
  params: {
    location: location
    baseName: baseName
    environment: environment
    administratorLogin: 'loanadmin'
  }
}

module containerApp './modules/container-app.bicep' = {
  scope: rg
  name: 'container-app-deployment'
  params: {
    location: location
    baseName: baseName
    environment: environment
    acrLoginServer: acr.outputs.loginServer
    databaseHost: database.outputs.fullyQualifiedDomainName
  }
}

// Outputs
output resourceGroupName string = rg.name
output acrLoginServer string = acr.outputs.loginServer
output containerAppUrl string = containerApp.outputs.applicationUrl
output databaseHost string = database.outputs.fullyQualifiedDomainName