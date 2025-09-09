#!/bin/bash

# Script para limpar recursos desnecessários e economizar custos
set -e

echo "🧹 Iniciando limpeza de recursos Azure para economizar custos..."

# Variáveis
DEMO_RG="rg-loan-system-demo"
STAGING_RG="rg-loan-system-staging"
PRODUCTION_RG="rg-loan-system-production"
ACR_NAME="loansystemacr"

# Verificar login
if ! az account show >/dev/null 2>&1; then
    echo "❌ Você precisa fazer login no Azure: az login"
    exit 1
fi

echo "📋 Analisando recursos atuais..."
echo ""

# Função para mostrar custos estimados de um resource group
show_rg_info() {
    local rg_name=$1
    if az group show --name $rg_name >/dev/null 2>&1; then
        echo "📦 Resource Group: $rg_name"
        local resources=$(az resource list --resource-group $rg_name --query "length(@)" -o tsv 2>/dev/null || echo "0")
        echo "   └── Recursos: $resources"
        
        # Listar tipos de recursos principais
        az resource list --resource-group $rg_name --query "[].type" -o tsv 2>/dev/null | sort | uniq -c | while read count type; do
            echo "       • $count x $type"
        done
        echo ""
    else
        echo "❌ Resource Group não encontrado: $rg_name"
        echo ""
    fi
}

# Mostrar situação atual
show_rg_info $PRODUCTION_RG
show_rg_info $STAGING_RG
show_rg_info $DEMO_RG

echo "💡 OPÇÕES DE LIMPEZA PARA ECONOMIZAR:"
echo "----------------------------------------"
echo ""

# Menu interativo
echo "Selecione uma opção:"
echo ""
echo "1) 🔥 ECONOMIA MÁXIMA: Mover tudo para ambiente demo único"
echo "   • Deleta staging e production resource groups"
echo "   • Mantém apenas o ambiente demo"
echo "   • Economia estimada: 70-80%"
echo ""
echo "2) 🛡️  ECONOMIA MODERADA: Manter apenas staging"
echo "   • Deleta production resource group"
echo "   • Mantém staging para desenvolvimento"
echo "   • Economia estimada: 50%"
echo ""
echo "3) 🧹 LIMPEZA DE IMAGENS ACR: Limpar imagens antigas"
echo "   • Remove imagens antigas do Container Registry"
echo "   • Mantém apenas últimas 5 versões"
echo "   • Economia estimada: 20-30% do storage ACR"
echo ""
echo "4) 📊 APENAS MOSTRAR INFORMAÇÕES: Não deletar nada"
echo "   • Mostra apenas custos estimados"
echo ""
echo "0) ❌ CANCELAR"
echo ""

read -p "Digite sua opção (0-4): " option

case $option in
    1)
        echo ""
        echo "⚠️  ATENÇÃO: Esta opção deletará TODOS os recursos de production e staging!"
        echo "📦 Resources groups que serão DELETADOS:"
        echo "   • $PRODUCTION_RG"
        echo "   • $STAGING_RG"
        echo ""
        read -p "Tem certeza? Digite 'DELETE' para confirmar: " confirm
        
        if [ "$confirm" = "DELETE" ]; then
            echo "🔥 Executando economia máxima..."
            
            # Deletar production
            if az group show --name $PRODUCTION_RG >/dev/null 2>&1; then
                echo "🗑️  Deletando resource group: $PRODUCTION_RG"
                az group delete --name $PRODUCTION_RG --yes --no-wait
            fi
            
            # Deletar staging
            if az group show --name $STAGING_RG >/dev/null 2>&1; then
                echo "🗑️  Deletando resource group: $STAGING_RG"
                az group delete --name $STAGING_RG --yes --no-wait
            fi
            
            echo "✅ Comandos de deleção executados em background"
            echo "💰 Economia estimada: $150-250/mês → $20-40/mês"
            echo ""
            echo "📋 Próximos passos:"
            echo "1. Execute: ./optimize-costs.sh"
            echo "2. Configure secrets GitHub: AZURE_CREDENTIALS_DEMO"
            echo "3. Use apenas o workflow deploy-demo.yml"
        else
            echo "❌ Operação cancelada"
        fi
        ;;
        
    2)
        echo ""
        echo "⚠️  Esta opção deletará o ambiente de PRODUCTION"
        echo "📦 Resource group que será DELETADO:"
        echo "   • $PRODUCTION_RG"
        echo ""
        read -p "Confirma a deleção do production? Digite 'DELETE': " confirm
        
        if [ "$confirm" = "DELETE" ]; then
            echo "🛡️  Executando economia moderada..."
            
            if az group show --name $PRODUCTION_RG >/dev/null 2>&1; then
                echo "🗑️  Deletando resource group: $PRODUCTION_RG"
                az group delete --name $PRODUCTION_RG --yes --no-wait
                echo "✅ Production deletado"
                echo "💰 Economia estimada: 50% dos custos"
            fi
        else
            echo "❌ Operação cancelada"
        fi
        ;;
        
    3)
        echo "🧹 Limpando imagens antigas do ACR..."
        
        # Listar repositórios
        repositories=$(az acr repository list --name $ACR_NAME -o tsv 2>/dev/null || echo "")
        
        if [ -z "$repositories" ]; then
            echo "ℹ️  Nenhum repositório encontrado no ACR"
        else
            for repo in $repositories; do
                echo "📦 Limpando repositório: $repo"
                
                # Manter apenas 5 imagens mais recentes
                az acr repository show-manifests \
                    --name $ACR_NAME \
                    --repository $repo \
                    --orderby time_desc \
                    --query '[5:].digest' -o tsv | \
                while read digest; do
                    if [ ! -z "$digest" ]; then
                        echo "   🗑️  Removendo: $repo@$digest"
                        az acr repository delete \
                            --name $ACR_NAME \
                            --image $repo@$digest \
                            --yes >/dev/null 2>&1 || true
                    fi
                done
            done
            
            echo "✅ Limpeza do ACR concluída"
            echo "💰 Economia estimada no storage: 20-30%"
        fi
        ;;
        
    4)
        echo "📊 INFORMAÇÕES DE CUSTOS ESTIMADOS:"
        echo "----------------------------------------"
        echo ""
        echo "🏷️  Custos mensais aproximados (região East US):"
        echo ""
        echo "Production + Staging + Demo:"
        echo "• Container Apps (3x): $60-120"
        echo "• ACR Standard: $20"
        echo "• PostgreSQL (3x): $90-180"
        echo "• Storage/Networking: $10-20"
        echo "📊 TOTAL: $180-340/mês"
        echo ""
        echo "Apenas Demo otimizado:"
        echo "• Container App (1x, scale-to-zero): $10-20"
        echo "• ACR Basic: $5"
        echo "• PostgreSQL Flexible (Burstable): $15-25"
        echo "• Storage/Networking: $5"
        echo "📊 TOTAL: $35-55/mês"
        echo ""
        echo "💰 ECONOMIA POTENCIAL: $145-285/mês (80-85%)"
        ;;
        
    0)
        echo "❌ Operação cancelada pelo usuário"
        exit 0
        ;;
        
    *)
        echo "❌ Opção inválida"
        exit 1
        ;;
esac

echo ""
echo "✅ Script de limpeza concluído!"