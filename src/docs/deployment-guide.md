# 🚀 Guia de Deploy - Yume Chatbot

Este guia cobre todas as opções de deploy disponíveis para o projeto Yume, desde a versão simples no GitHub Pages até deploy completo em produção.

## 📋 Visão Geral das Opções

### 1. 🌐 GitHub Pages (Simples)
**Ideal para**: Demonstrações, protótipos, uso básico
- ✅ **Zero configuração** - Funciona imediatamente
- ✅ **Gratuito** - Hospedado pelo GitHub
- ✅ **HTTPS** - Seguro por padrão
- ❌ **Sem backend** - Apenas funcionalidades frontend

### 2. 🐳 Docker Local (Desenvolvimento)
**Ideal para**: Desenvolvimento local, testes completos
- ✅ **Environment isolado** - Não afeta seu sistema
- ✅ **Fácil setup** - Um comando para subir tudo
- ✅ **Backend completo** - IA, banco de dados, métricas
- ❌ **Local apenas** - Não acessível externamente

### 3. ☁️ AWS Completo (Produção)
**Ideal para**: Aplicações em produção, alta disponibilidade
- ✅ **Escalabilidade** - Suporta milhares de usuários
- ✅ **Monitoramento** - Logs, métricas, alertas
- ✅ **Backup automático** - Dados protegidos
- ❌ **Complexo** - Requer conhecimento AWS

### 4. 🎯 Deploy Híbrido (Recomendado)
**Ideal para**: Máxima flexibilidade
- ✅ **Frontend no GitHub Pages** - Rápido e gratuito
- ✅ **Backend em cloud** - IA e dados em produção
- ✅ **Desenvolvimento local** - Docker para testes
- ✅ **Gradual** - Migre conforme necessário

---

## 1. 🌐 Deploy GitHub Pages

### Ativação Automática
```bash
# 1. Certifique-se que index.html está na raiz
ls index.html

# 2. Commit e push para main/master
git add index.html GITHUB_PAGES.md
git commit -m "Add GitHub Pages standalone version"
git push origin main

# 3. Ative GitHub Pages no repositório:
# Settings → Pages → Source: "Deploy from branch" → main → Save
```

### Acesso
```
https://seu-usuario.github.io/yume-chatbot/
```

### Personalização GitHub Pages
```html
<!-- Modificar no index.html -->
<title>Seu Chatbot Personalizado</title>
<meta name="description" content="Sua descrição personalizada">

<!-- Alterar cores no CSS -->
:root {
  --primary: #sua-cor-primaria;
  --background: #sua-cor-de-fundo;
}
```

---

## 2. 🐳 Deploy Docker Local

### Pré-requisitos
```bash
# Instalar Docker e Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Verificar instalação
docker --version
docker-compose --version
```

### Setup Completo
```bash
# 1. Clone e configure
git clone https://github.com/seu-usuario/yume-chatbot.git
cd yume-chatbot

# 2. Configure variáveis de ambiente
cp .env.example .env
nano .env  # Edite com suas configurações

# 3. Suba todos os serviços
docker-compose up -d

# 4. Aguarde inicialização (1-2 minutos)
docker-compose logs -f

# 5. Acesse os serviços
# Frontend: http://localhost:5173
# Backend: http://localhost:3001
# Admin: http://localhost:5173/admin
# Database: localhost:5432
```

### Comandos Úteis
```bash
# Ver status dos containers
docker-compose ps

# Ver logs em tempo real
docker-compose logs -f [service-name]

# Parar todos os serviços
docker-compose down

# Rebuild após mudanças
docker-compose up --build

# Limpar volumes (CUIDADO: apaga dados)
docker-compose down -v
```

### Variáveis de Ambiente (.env)
```bash
# === ESSENCIAIS ===
MISTRAL_API_KEY="sua_chave_mistral_aqui"
JWT_SECRET="seu-jwt-secreto-super-forte"
DATABASE_URL="postgresql://yume:password@postgres:5432/yume_db"

# === OPCIONAIS ===
NODE_ENV="development"
PORT=3001
FRONTEND_URL="http://localhost:5173"
LOG_LEVEL="info"
ENABLE_SPEECH="true"
ENABLE_METRICS="true"
```

---

## 3. ☁️ Deploy AWS Completo

### Pré-requisitos AWS
```bash
# Instalar AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Instalar Terraform
wget https://releases.hashicorp.com/terraform/1.6.0/terraform_1.6.0_linux_amd64.zip
unzip terraform_1.6.0_linux_amd64.zip
sudo mv terraform /usr/local/bin/

# Configurar credenciais AWS
aws configure
```

### Deploy Terraform
```bash
# 1. Navegar para infra
cd infra/terraform

# 2. Inicializar Terraform
terraform init

# 3. Configurar variáveis
cp terraform.tfvars.example terraform.tfvars
nano terraform.tfvars  # Edite com suas configurações

# 4. Planejar deploy
terraform plan

# 5. Aplicar mudanças
terraform apply
# Digite 'yes' quando solicitado

# 6. Aguardar criação (10-15 minutos)
```

### Configuração terraform.tfvars
```hcl
# Região AWS
aws_region = "us-east-1"

# Projeto
project_name = "yume-chatbot"
environment = "production"

# Rede
vpc_cidr = "10.0.0.0/16"
availability_zones = ["us-east-1a", "us-east-1b"]

# Database
db_instance_class = "db.t3.micro"  # Pequeno para start
db_allocated_storage = 20

# ECS
ecs_task_cpu = 256     # 0.25 vCPU
ecs_task_memory = 512  # 512 MB

# Domínio (opcional)
domain_name = "yume.seudominio.com"
create_certificate = true
```

### Acompanhar Deploy
```bash
# Ver outputs importantes
terraform output

# Acessar aplicação
terraform output application_url

# Ver logs
aws logs tail /aws/ecs/yume-chatbot --follow

# Verificar saúde
aws elbv2 describe-target-health --target-group-arn $(terraform output target_group_arn)
```

---

## 4. 🎯 Deploy Híbrido (Recomendado)

### Estratégia Gradual

#### Fase 1: Prototipagem (GitHub Pages)
```bash
# Deploy simples para validação
git add index.html
git commit -m "Add standalone prototype"
git push origin main
# Ativar GitHub Pages
```

#### Fase 2: Desenvolvimento (Docker Local)
```bash
# Desenvolvimento com backend completo
docker-compose up -d
# Desenvolver funcionalidades avançadas
```

#### Fase 3: Produção (AWS)
```bash
# Deploy quando pronto para usuários reais
cd infra/terraform
terraform apply
```

### Configuração Híbrida

#### Frontend GitHub Pages + Backend AWS
```javascript
// No index.html, configure endpoint dinâmico
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3001' 
  : 'https://api.yume.seudominio.com';
```

#### Múltiplos Ambientes
```bash
# Desenvolvimento
docker-compose -f docker-compose.dev.yml up

# Staging
terraform workspace select staging
terraform apply

# Produção
terraform workspace select production
terraform apply
```

---

## 🔧 Configurações Avançadas

### SSL/TLS
```yaml
# docker-compose.yml - Adicionar certificado
services:
  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl/certs
    ports:
      - "443:443"
```

### Monitoramento
```yaml
# Adicionar ao docker-compose.yml
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
  
  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
```

### Backup Automático
```bash
# Script de backup (backup.sh)
#!/bin/bash
docker exec postgres pg_dump -U yume yume_db > backup_$(date +%Y%m%d_%H%M%S).sql
aws s3 cp backup_*.sql s3://yume-backups/
```

### CI/CD GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy Yume
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to AWS
        run: |
          cd infra/terraform
          terraform apply -auto-approve
```

---

## 🚨 Troubleshooting

### GitHub Pages
```bash
# Site não carrega
1. Verificar se index.html está na raiz
2. Aguardar até 10 minutos para propagação
3. Limpar cache do navegador
4. Verificar Settings → Pages → Source

# JavaScript não funciona
1. Verificar console do navegador (F12)
2. Testar em modo privado
3. Verificar sintaxe do código
```

### Docker
```bash
# Container não inicia
docker-compose logs [service-name]

# Erro de porta ocupada
sudo lsof -i :3001  # Ver processo usando porta
sudo kill -9 [PID]  # Matar processo

# Erro de memória
docker system prune -a  # Limpar cache
docker-compose up --force-recreate
```

### AWS
```bash
# Deploy falha
terraform destroy  # Limpar recursos
terraform apply    # Tentar novamente

# Aplicação não acessível
aws elbv2 describe-target-health --target-group-arn [ARN]
aws logs tail /aws/ecs/yume-chatbot

# Erro de permissões
aws iam list-attached-user-policies --user-name [username]
```

---

## 📊 Comparação de Opções

| Aspecto | GitHub Pages | Docker Local | AWS Completo |
|---------|--------------|--------------|--------------|
| **Custo** | Gratuito | Gratuito | $20-100/mês |
| **Setup** | 5 minutos | 15 minutos | 2 horas |
| **Escalabilidade** | Limitada | Não aplicável | Alta |
| **Backend** | ❌ | ✅ | ✅ |
| **IA Real** | ❌ | ✅ | ✅ |
| **Banco de Dados** | ❌ | ✅ | ✅ |
| **Monitoramento** | ❌ | Básico | Completo |
| **SSL** | ✅ | Manual | ✅ |
| **Backup** | ❌ | Manual | ✅ |
| **Ideal para** | Demo/Prototipo | Desenvolvimento | Produção |

---

## 🎯 Recomendações por Caso de Uso

### Para Demonstrações
**Use GitHub Pages**
- Setup em 5 minutos
- URL profissional
- Zero custo

### Para Desenvolvimento
**Use Docker Local**
- Backend completo
- Fácil debug
- Isolamento total

### Para MVP
**Use AWS + GitHub Pages**
- Frontend no GitHub Pages
- Backend simples no AWS Lambda
- Custo controlado

### Para Produção
**Use AWS Completo**
- ECS/Fargate para containers
- RDS para banco
- CloudWatch para monitoramento

---

## 📞 Suporte

Se encontrar problemas durante o deploy:

1. **Consulte logs**: Sempre o primeiro passo
2. **GitHub Issues**: Reporte problemas específicos
3. **Documentação**: Consulte docs detalhadas
4. **Community**: Discord/Telegram para ajuda rápida

---

**💡 Dica Final**: Comece simples com GitHub Pages, evolua para Docker local durante desenvolvimento, e migre para AWS quando pronto para usuários reais.