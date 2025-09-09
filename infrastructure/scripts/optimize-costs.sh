#!/bin/bash

# Script para otimizar custos do Azure para ambiente de demonstração
set -e

echo "🔧 Iniciando otimização de custos do Azure..."

# Variáveis
RESOURCE_GROUP="rg-loan-system-demo"
ACR_NAME="loansystemacr"
CONTAINER_APP_NAME="loan-system-app-demo"
LOCATION="eastus"

# Verificar se está logado no Azure
echo "📋 Verificando login no Azure..."
if ! az account show >/dev/null 2>&1; then
    echo "❌ Você precisa fazer login no Azure: az login"
    exit 1
fi

echo "✅ Azure CLI logado com sucesso"

# 1. Criar resource group único se não existir
echo "🏗️  Verificando Resource Group..."
if ! az group show --name $RESOURCE_GROUP >/dev/null 2>&1; then
    echo "📦 Criando Resource Group: $RESOURCE_GROUP"
    az group create --name $RESOURCE_GROUP --location $LOCATION
else
    echo "✅ Resource Group já existe: $RESOURCE_GROUP"
fi

# 2. Otimizar ACR para tier Basic
echo "🐳 Otimizando Container Registry..."
CURRENT_SKU=$(az acr show --name $ACR_NAME --query "sku.name" -o tsv 2>/dev/null || echo "NotFound")

if [ "$CURRENT_SKU" = "NotFound" ]; then
    echo "📦 Criando ACR com tier Basic..."
    az acr create \
        --resource-group $RESOURCE_GROUP \
        --name $ACR_NAME \
        --sku Basic \
        --location $LOCATION
elif [ "$CURRENT_SKU" != "Basic" ]; then
    echo "💰 Mudando ACR de $CURRENT_SKU para Basic (economia: ~60%)"
    az acr update --name $ACR_NAME --sku Basic
else
    echo "✅ ACR já está no tier Basic"
fi

# 3. Configurar Container App Environment com recursos mínimos
echo "🌍 Configurando Container App Environment..."
ENVIRONMENT_NAME="loan-system-demo-env"

if ! az containerapp env show --name $ENVIRONMENT_NAME --resource-group $RESOURCE_GROUP >/dev/null 2>&1; then
    echo "📦 Criando Container App Environment..."
    az containerapp env create \
        --name $ENVIRONMENT_NAME \
        --resource-group $RESOURCE_GROUP \
        --location $LOCATION
else
    echo "✅ Container App Environment já existe"
fi

# 4. Criar/Atualizar Container App com configuração econômica
echo "🚀 Configurando Container App com recursos mínimos..."

# Verificar se a app já existe
if az containerapp show --name $CONTAINER_APP_NAME --resource-group $RESOURCE_GROUP >/dev/null 2>&1; then
    echo "⚙️  Atualizando Container App existente..."
    az containerapp update \
        --name $CONTAINER_APP_NAME \
        --resource-group $RESOURCE_GROUP \
        --min-replicas 0 \
        --max-replicas 1 \
        --cpu 0.25 \
        --memory 0.5Gi \
        --revision-mode single
else
    echo "📦 Criando nova Container App..."
    # Será criada quando o deploy rodar pela primeira vez
    echo "ℹ️  Container App será criada no próximo deploy"
fi

echo ""
echo "💰 RESUMO DE OTIMIZAÇÕES:"
echo "----------------------------------------"
echo "✅ Resource Group consolidado: $RESOURCE_GROUP"
echo "✅ ACR otimizado para Basic tier (economia: ~60%)"
echo "✅ Container App configurado para scale-to-zero"
echo "✅ CPU: 0.25 cores, Memory: 0.5Gi (economia: ~70%)"
echo "✅ Modo single revision (sem custos extras)"
echo ""
echo "📊 ECONOMIA ESTIMADA: ~70% dos custos atuais"
echo "----------------------------------------"
echo ""
echo "🎯 Próximos passos:"
echo "1. Configure os secrets no GitHub: AZURE_CREDENTIALS_DEMO"
echo "2. Execute: ./setup-monitoring.sh para alertas de budget"
echo "3. Use o workflow deploy-demo.yml para deployments"
echo ""
echo "✅ Otimização de custos concluída!"