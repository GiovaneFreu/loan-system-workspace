@description('Location for resources')
param location string

@description('Base name for resources')
param baseName string

@description('Environment')
param environment string

var acrName = replace('${baseName}acr', '-', '')

resource acr 'Microsoft.ContainerRegistry/registries@2023-01-01-preview' = {
  name: acrName
  location: location
  sku: {
    name: environment == 'production' ? 'Standard' : 'Basic'
  }
  properties: {
    adminUserEnabled: true
    publicNetworkAccess: 'Enabled'
    networkRuleBypassOptions: 'AzureServices'
  }
  tags: {
    environment: environment
    project: baseName
  }
}

output loginServer string = acr.properties.loginServer
output name string = acr.name