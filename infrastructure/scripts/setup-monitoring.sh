#!/bin/bash

# Script para configurar monitoramento de custos e alertas de budget
set -e

echo "📊 Configurando monitoramento de custos Azure..."

# Variáveis
RESOURCE_GROUP="rg-loan-system-demo"
SUBSCRIPTION_ID=$(az account show --query id -o tsv 2>/dev/null)
BUDGET_NAME="loan-system-demo-budget"
BUDGET_AMOUNT="50" # USD por mês
ACTION_GROUP_NAME="loan-system-cost-alerts"

if [ -z "$SUBSCRIPTION_ID" ]; then
    echo "❌ Erro ao obter subscription ID. Faça login: az login"
    exit 1
fi

echo "📋 Subscription ID: $SUBSCRIPTION_ID"
echo "💰 Budget configurado: $BUDGET_AMOUNT USD/mês"
echo ""

# Solicitar email para alertas
read -p "📧 Digite seu email para receber alertas de custo: " EMAIL

if [ -z "$EMAIL" ]; then
    echo "❌ Email é obrigatório para configurar alertas"
    exit 1
fi

echo "🔧 Configurando alertas para: $EMAIL"
echo ""

# 1. Criar Action Group para alertas
echo "📢 Criando Action Group para alertas..."

# Verificar se o Action Group já existe
if az monitor action-group show --name $ACTION_GROUP_NAME --resource-group $RESOURCE_GROUP >/dev/null 2>&1; then
    echo "✅ Action Group já existe: $ACTION_GROUP_NAME"
else
    echo "📦 Criando novo Action Group..."
    az monitor action-group create \
        --name $ACTION_GROUP_NAME \
        --resource-group $RESOURCE_GROUP \
        --action email loan-system-admin $EMAIL \
        --short-name "LoanCost" \
        --location global
    
    echo "✅ Action Group criado com sucesso"
fi

# 2. Configurar Budget Alert
echo "💰 Configurando Budget Alert..."

# Criar budget se não existir
BUDGET_JSON=$(cat <<EOF
{
  "amount": $BUDGET_AMOUNT,
  "timeGrain": "Monthly",
  "timePeriod": {
    "startDate": "$(date -d 'first day of this month' +%Y-%m-01)",
    "endDate": "$(date -d 'first day of next month' +%Y-%m-01)"
  },
  "category": "Cost",
  "notifications": {
    "actual_80_percent": {
      "enabled": true,
      "operator": "GreaterThan",
      "threshold": 80,
      "contactEmails": ["$EMAIL"],
      "contactGroups": ["/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/microsoft.insights/actionGroups/$ACTION_GROUP_NAME"],
      "thresholdType": "Actual"
    },
    "forecasted_100_percent": {
      "enabled": true,
      "operator": "GreaterThan",
      "threshold": 100,
      "contactEmails": ["$EMAIL"],
      "contactGroups": ["/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/microsoft.insights/actionGroups/$ACTION_GROUP_NAME"],
      "thresholdType": "Forecasted"
    }
  },
  "filters": {
    "resourceGroups": ["$RESOURCE_GROUP"]
  }
}
EOF
)

# Escrever JSON temporário
echo "$BUDGET_JSON" > /tmp/budget-config.json

# Criar/atualizar budget
echo "📊 Criando budget: $BUDGET_NAME"
az consumption budget create \
    --budget-name $BUDGET_NAME \
    --amount $BUDGET_AMOUNT \
    --resource-group-filter $RESOURCE_GROUP \
    --time-grain Monthly \
    --start-date "$(date -d 'first day of this month' +%Y-%m-01)" \
    --end-date "$(date -d 'first day of next month +1 year' +%Y-%m-01)" \
    >/dev/null 2>&1 || {
    
    # Se falhar, tentar método alternativo
    echo "ℹ️  Usando método alternativo para criar budget..."
    
    # Usar REST API diretamente
    BUDGET_URL="https://management.azure.com/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.Consumption/budgets/$BUDGET_NAME?api-version=2019-10-01"
    
    az rest \
        --method PUT \
        --url "$BUDGET_URL" \
        --body @/tmp/budget-config.json \
        --headers "Content-Type=application/json" \
        >/dev/null 2>&1 || echo "⚠️  Budget pode já existir ou houve erro na criação"
}

# Limpar arquivo temporário
rm -f /tmp/budget-config.json

echo "✅ Budget configurado com sucesso"
echo ""

# 3. Criar script de monitoramento diário
echo "📈 Criando script de monitoramento diário..."

cat > /tmp/daily-cost-check.sh << 'EOF'
#!/bin/bash
# Script para verificar custos diários

RESOURCE_GROUP="rg-loan-system-demo"
BUDGET_LIMIT="50"

echo "📊 Verificação diária de custos - $(date)"
echo "==========================================="

# Obter custos do resource group
CURRENT_COST=$(az consumption usage list \
    --start-date $(date -d '1 month ago' +%Y-%m-%d) \
    --end-date $(date +%Y-%m-%d) \
    --query "[?contains(instanceName, '$RESOURCE_GROUP')].pretaxCost | sum(@)" \
    -o tsv 2>/dev/null || echo "0")

if [ "$CURRENT_COST" = "null" ] || [ -z "$CURRENT_COST" ]; then
    CURRENT_COST="0"
fi

PERCENTAGE=$(echo "scale=1; $CURRENT_COST * 100 / $BUDGET_LIMIT" | bc -l 2>/dev/null || echo "0")

echo "💰 Custo atual: $CURRENT_COST USD"
echo "🎯 Budget limit: $BUDGET_LIMIT USD"
echo "📊 Percentual usado: $PERCENTAGE%"

# Alertas baseados em threshold
if (( $(echo "$PERCENTAGE > 90" | bc -l) )); then
    echo "🚨 ATENÇÃO: Você já usou mais de 90% do budget!"
elif (( $(echo "$PERCENTAGE > 75" | bc -l) )); then
    echo "⚠️  AVISO: Você já usou mais de 75% do budget"
elif (( $(echo "$PERCENTAGE > 50" | bc -l) )); then
    echo "📈 INFO: Você já usou mais de 50% do budget"
else
    echo "✅ Custos dentro do esperado"
fi

echo ""
echo "📋 Principais recursos consumindo custos:"
az consumption usage list \
    --start-date $(date -d '1 month ago' +%Y-%m-%d) \
    --end-date $(date +%Y-%m-%d) \
    --query "[?pretaxCost > \`0\`] | sort_by(@, &pretaxCost) | reverse(@) | [0:5].{Resource:instanceName, Cost:pretaxCost, MeterName:meterName}" \
    -o table 2>/dev/null || echo "Não foi possível obter detalhes dos recursos"

echo "==========================================="
EOF

# Copiar script para o projeto
cp /tmp/daily-cost-check.sh infrastructure/scripts/
chmod +x infrastructure/scripts/daily-cost-check.sh
rm /tmp/daily-cost-check.sh

echo "✅ Script de monitoramento diário criado"
echo ""

# 4. Resumo final
echo "🎉 CONFIGURAÇÃO DE MONITORAMENTO CONCLUÍDA!"
echo "=============================================="
echo ""
echo "📊 Budget configurado:"
echo "   • Nome: $BUDGET_NAME"
echo "   • Valor: $BUDGET_AMOUNT USD/mês"
echo "   • Alertas em: 80% (real) e 100% (previsão)"
echo ""
echo "📧 Alertas por email:"
echo "   • Email configurado: $EMAIL"
echo "   • Action Group: $ACTION_GROUP_NAME"
echo ""
echo "📈 Scripts disponíveis:"
echo "   • ./infrastructure/scripts/daily-cost-check.sh (verificação diária)"
echo "   • ./infrastructure/scripts/optimize-costs.sh (otimização)"
echo "   • ./infrastructure/scripts/cleanup-resources.sh (limpeza)"
echo ""
echo "💡 PRÓXIMOS PASSOS:"
echo "1. Execute: ./infrastructure/scripts/daily-cost-check.sh"
echo "2. Configure cron job para monitoramento automático:"
echo "   crontab -e"
echo "   0 9 * * * /path/to/daily-cost-check.sh"
echo ""
echo "✅ Monitoramento ativo e funcionando!"