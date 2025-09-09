# 💰 Guia de Otimização de Custos Azure

Este guia ajuda você a reduzir custos do Azure em **70-85%** para este projeto de demonstração.

## 📊 Economia Esperada

| Configuração Atual | Configuração Otimizada | Economia |
|-------------------|------------------------|----------|
| $180-340/mês | $35-55/mês | **~85%** |

## 🚀 Implementação Rápida (5 minutos)

### 1. **Executar Otimização Automática**
```bash
# Fazer login no Azure
az login

# Executar otimização
./infrastructure/scripts/optimize-costs.sh
```

### 2. **Limpar Recursos Desnecessários** (Opcional)
```bash
# Script interativo para limpeza
./infrastructure/scripts/cleanup-resources.sh
```

### 3. **Configurar Monitoramento**
```bash
# Configurar alertas de budget
./infrastructure/scripts/setup-monitoring.sh
```

### 4. **Atualizar GitHub Secrets**
Substitua os secrets atuais por:
- `AZURE_CREDENTIALS_DEMO` (ao invés de STAGING/PRODUCTION)

## 📋 O que Mudou

### ✅ **Antes (Caro)**
- 3 ambientes: Production + Staging + Demo
- Container Apps sempre ativas
- ACR Standard/Premium tier
- PostgreSQL General Purpose

### ✅ **Depois (Econômico)**
- 1 ambiente: Demo apenas
- Container Apps scale-to-zero
- ACR Basic tier  
- PostgreSQL Flexible (Burstable)

## 🔧 Configurações Técnicas

### **Container Apps**
```yaml
# Configuração econômica
min_replicas: 0      # Scale to zero quando não usado
max_replicas: 1      # Máximo 1 instância
cpu: 0.25           # 1/4 de core
memory: 0.5Gi       # 512MB RAM
revision_mode: single # Sem custos extras de revisões
```

### **Azure Container Registry**
```bash
# Mudança de tier
Standard/Premium → Basic
# Economia: ~60% no ACR
```

### **PostgreSQL**
```yaml
# De General Purpose para Burstable
tier: Burstable
size: B1ms          # 1 vCore, 2GB RAM
storage: 32GB       # Mínimo necessário
```

## 📈 Monitoramento Contínuo

### **Verificação Diária**
```bash
# Executar manualmente
./infrastructure/scripts/daily-cost-check.sh

# Ou configurar cron job
crontab -e
# Adicionar: 0 9 * * * /path/to/daily-cost-check.sh
```

### **Alertas Automáticos**
- **80% do budget**: Email de aviso
- **100% do budget**: Email de alerta crítico
- **Budget mensal**: $50 USD

## 🎯 Workflow Otimizado

Use o novo workflow `.github/workflows/deploy-demo.yml`:

```yaml
# Deploy automático para ambiente único
on:
  push:
    branches: [main, develop]  # Ambos vão para demo

# Características:
- Testes mais rápidos (sem coverage)
- Build otimizado
- Limpeza automática de imagens antigas
- Container App scale-to-zero
```

## 🔍 Troubleshooting

### **Container App não inicia**
```bash
# Verificar logs
az containerapp logs show \
  --name loan-system-app-demo \
  --resource-group rg-loan-system-demo
```

### **Budget alerts não chegam**
```bash
# Verificar action group
az monitor action-group show \
  --name loan-system-cost-alerts \
  --resource-group rg-loan-system-demo
```

### **Custos ainda altos**
```bash
# Analisar custos por recurso
az consumption usage list \
  --start-date $(date -d '1 month ago' +%Y-%m-%d) \
  --end-date $(date +%Y-%m-%d) \
  --query "[?pretaxCost > \`0\`] | sort_by(@, &pretaxCost) | reverse(@)"
```

## 📞 Comandos Úteis

```bash
# Ver custos atuais
az consumption usage list --start-date 2024-01-01 --end-date 2024-01-31

# Listar todos os recursos
az resource list --resource-group rg-loan-system-demo

# Parar Container App (custo zero)
az containerapp revision deactivate \
  --name loan-system-app-demo \
  --resource-group rg-loan-system-demo \
  --revision [revision-name]
```

## ⚠️ Importantes

1. **Backup**: Este é ambiente de demo, sem backup automático
2. **Performance**: Configuração mínima pode ser lenta em picos
3. **Scale-to-zero**: Primeira requisição pode demorar 10-30s
4. **Storage**: Limpeza automática de imagens antigas (manter só 3)

---

## 💡 Dicas Extras

- **Pausa noturna**: Container Apps escalam para zero automaticamente
- **Finais de semana**: Custos praticamente zero se não houver uso
- **Desenvolvimento**: Use Docker local quando possível
- **Testes**: Execute localmente para não consumir recursos Azure

✅ **Resultado**: Projeto funcional com custos mínimos para demonstração!