@description('Location for resources')
param location string

@description('Base name for resources')
param baseName string

@description('Environment')
param environment string

@description('ACR login server')
param acrLoginServer string

@description('Database host')
param databaseHost string

@secure()
@description('Database password')
param databasePassword string = ''

var envName = '${baseName}-env-${environment}'
var appName = '${baseName}-app-${environment}'

// Log Analytics Workspace
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: '${baseName}-logs-${environment}'
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: environment == 'production' ? 90 : 30
  }
  tags: {
    environment: environment
    project: baseName
  }
}

// Container Apps Environment
resource containerEnvironment 'Microsoft.App/managedEnvironments@2023-05-01' = {
  name: envName
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalytics.properties.customerId
        sharedKey: logAnalytics.listKeys().primarySharedKey
      }
    }
    zoneRedundant: environment == 'production'
  }
  tags: {
    environment: environment
    project: baseName
  }
}

// Container App
resource containerApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: appName
  location: location
  properties: {
    managedEnvironmentId: containerEnvironment.id
    configuration: {
      ingress: {
        external: true
        targetPort: 3000
        transport: 'http'
        traffic: [
          {
            latestRevision: true
            weight: 100
          }
        ]
        corsPolicy: {
          allowedOrigins: ['*']
          allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
          allowedHeaders: ['*']
        }
      }
      registries: [
        {
          server: acrLoginServer
          username: ''
          passwordSecretRef: 'acr-password'
        }
      ]
      secrets: [
        {
          name: 'acr-password'
          value: ''
        }
        {
          name: 'db-password'
          value: databasePassword
        }
      ]
      dapr: {
        enabled: false
      }
      maxInactiveRevisions: 2
    }
    template: {
      containers: [
        {
          name: 'loan-system'
          image: '${acrLoginServer}/loan-system:latest'
          resources: {
            cpu: environment == 'production' ? 1 : json('0.5')
            memory: environment == 'production' ? '2Gi' : '1Gi'
          }
          env: [
            {
              name: 'NODE_ENV'
              value: environment
            }
            {
              name: 'DATABASE_HOST'
              value: databaseHost
            }
            {
              name: 'DATABASE_PORT'
              value: '5432'
            }
            {
              name: 'DATABASE_USER'
              value: 'loanadmin'
            }
            {
              name: 'DATABASE_PASSWORD'
              secretRef: 'db-password'
            }
            {
              name: 'DATABASE_NAME'
              value: 'loan_system_${environment}'
            }
          ]
          probes: [
            {
              type: 'Liveness'
              httpGet: {
                path: '/health'
                port: 3000
              }
              initialDelaySeconds: 10
              periodSeconds: 30
            }
            {
              type: 'Readiness'
              httpGet: {
                path: '/ready'
                port: 3000
              }
              initialDelaySeconds: 5
              periodSeconds: 10
            }
          ]
        }
      ]
      scale: {
        minReplicas: environment == 'production' ? 2 : 1
        maxReplicas: environment == 'production' ? 10 : 3
        rules: [
          {
            name: 'http-rule'
            http: {
              metadata: {
                concurrentRequests: '100'
              }
            }
          }
        ]
      }
    }
  }
  tags: {
    environment: environment
    project: baseName
  }
}

output applicationUrl string = containerApp.properties.configuration.ingress.fqdn