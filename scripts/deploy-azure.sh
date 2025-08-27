#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT="staging"
LOCATION="brazilsouth"
BASE_NAME="loan-system"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo "Options:"
    echo "  -e, --environment    Environment (staging|production) [default: staging]"
    echo "  -l, --location      Azure region [default: brazilsouth]"
    echo "  -n, --name          Base name for resources [default: loan-system]"
    echo "  -h, --help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 -e staging"
    echo "  $0 -e production -l brazilsouth"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -l|--location)
            LOCATION="$2"
            shift 2
            ;;
        -n|--name)
            BASE_NAME="$2"
            shift 2
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Validate environment
if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
    print_error "Environment must be either 'staging' or 'production'"
    exit 1
fi

print_status "Starting deployment to $ENVIRONMENT environment..."

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    print_error "Azure CLI is not installed. Please install it first."
    exit 1
fi

# Check if logged in to Azure
if ! az account show &> /dev/null; then
    print_error "Not logged in to Azure. Please run 'az login' first."
    exit 1
fi

# Set variables
RESOURCE_GROUP="rg-${BASE_NAME}-${ENVIRONMENT}"
DEPLOYMENT_NAME="deploy-${BASE_NAME}-${ENVIRONMENT}-$(date +%Y%m%d-%H%M%S)"
PARAMETERS_FILE="infrastructure/azure/parameters/${ENVIRONMENT}.json"

print_status "Deployment configuration:"
echo "  Environment: $ENVIRONMENT"
echo "  Location: $LOCATION"
echo "  Resource Group: $RESOURCE_GROUP"
echo "  Base Name: $BASE_NAME"
echo ""

# Check if parameters file exists
if [[ ! -f "$PARAMETERS_FILE" ]]; then
    print_error "Parameters file not found: $PARAMETERS_FILE"
    exit 1
fi

# Confirm deployment
read -p "Do you want to proceed with the deployment? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Deployment cancelled."
    exit 0
fi

print_status "Validating Bicep template..."

# Validate the deployment
az deployment sub validate \
    --location "$LOCATION" \
    --template-file infrastructure/azure/main.bicep \
    --parameters @"$PARAMETERS_FILE" \
    --parameters location="$LOCATION" baseName="$BASE_NAME"

if [[ $? -ne 0 ]]; then
    print_error "Template validation failed!"
    exit 1
fi

print_status "Template validation successful!"

print_status "Starting Azure deployment..."

# Deploy the infrastructure
DEPLOYMENT_OUTPUT=$(az deployment sub create \
    --location "$LOCATION" \
    --name "$DEPLOYMENT_NAME" \
    --template-file infrastructure/azure/main.bicep \
    --parameters @"$PARAMETERS_FILE" \
    --parameters location="$LOCATION" baseName="$BASE_NAME" \
    --output json)

if [[ $? -ne 0 ]]; then
    print_error "Deployment failed!"
    exit 1
fi

print_status "Deployment completed successfully!"

# Extract outputs
RESOURCE_GROUP_NAME=$(echo "$DEPLOYMENT_OUTPUT" | jq -r '.properties.outputs.resourceGroupName.value')
ACR_LOGIN_SERVER=$(echo "$DEPLOYMENT_OUTPUT" | jq -r '.properties.outputs.acrLoginServer.value')
CONTAINER_APP_URL=$(echo "$DEPLOYMENT_OUTPUT" | jq -r '.properties.outputs.containerAppUrl.value')
DATABASE_HOST=$(echo "$DEPLOYMENT_OUTPUT" | jq -r '.properties.outputs.databaseHost.value')

print_status "Deployment outputs:"
echo "  Resource Group: $RESOURCE_GROUP_NAME"
echo "  ACR Login Server: $ACR_LOGIN_SERVER"
echo "  Application URL: https://$CONTAINER_APP_URL"
echo "  Database Host: $DATABASE_HOST"
echo ""

# Save outputs to file for later use
OUTPUT_FILE=".azure-outputs-${ENVIRONMENT}.json"
echo "$DEPLOYMENT_OUTPUT" > "$OUTPUT_FILE"
print_status "Deployment outputs saved to: $OUTPUT_FILE"

print_status "Next steps:"
echo "1. Configure GitHub secrets with the database connection details"
echo "2. Push your code to trigger the CI/CD pipeline"
echo "3. Monitor the application at: https://$CONTAINER_APP_URL"
echo ""

print_status "Useful commands:"
echo "  # View container logs"
echo "  az containerapp logs show --name ${BASE_NAME}-app-${ENVIRONMENT} --resource-group ${RESOURCE_GROUP_NAME}"
echo ""
echo "  # Scale the application"
echo "  az containerapp update --name ${BASE_NAME}-app-${ENVIRONMENT} --resource-group ${RESOURCE_GROUP_NAME} --min-replicas 2"
echo ""
echo "  # Connect to database"
echo "  az postgres flexible-server connect --name ${BASE_NAME}-db-${ENVIRONMENT} --admin-user loanadmin"

print_status "Deployment complete! 🚀"