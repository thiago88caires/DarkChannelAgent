#!/bin/bash

# =================================================================
# Dark Channel Agent - Script de Troubleshooting
# Diagnóstico de problemas de build e deployment
# =================================================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }
success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }

# Detectar comando Docker Compose
if command -v docker-compose >/dev/null 2>&1; then
    DOCKER_COMPOSE_CMD="docker-compose"
elif docker compose version >/dev/null 2>&1; then
    DOCKER_COMPOSE_CMD="docker compose"
else
    error "Docker Compose não encontrado!"
    exit 1
fi

echo "🔧 DARK CHANNEL AGENT - TROUBLESHOOTING"
echo "========================================"

# Verificar sistema
log "1. Verificando sistema..."
echo "OS: $(uname -a)"
echo "Docker: $(docker --version)"
echo "Docker Compose: $($DOCKER_COMPOSE_CMD --version)"
echo "Usuário: $(whoami)"
echo "PWD: $(pwd)"
echo ""

# Verificar espaço em disco
log "2. Verificando espaço em disco..."
df -h
echo ""

# Verificar arquivos do projeto
log "3. Verificando arquivos do projeto..."
echo "Arquivos no diretório:"
ls -la
echo ""

if [ -f "docker-compose.yml" ]; then
    success "✅ docker-compose.yml encontrado"
else
    error "❌ docker-compose.yml NÃO encontrado"
fi

if [ -f "frontend/package.json" ]; then
    success "✅ frontend/package.json encontrado"
    echo "Frontend dependencies:"
    cat frontend/package.json | grep -A 10 -B 2 '"dependencies"'
else
    error "❌ frontend/package.json NÃO encontrado"
fi

if [ -f "backend/package.json" ]; then
    success "✅ backend/package.json encontrado"
else
    error "❌ backend/package.json NÃO encontrado"
fi

echo ""

# Verificar Docker
log "4. Verificando Docker..."
echo "Containers rodando:"
docker ps
echo ""
echo "Todas as imagens:"
docker images
echo ""
echo "Uso do sistema Docker:"
docker system df
echo ""

# Verificar rede
log "5. Verificando conectividade..."
echo "Portas em uso:"
netstat -tulpn 2>/dev/null | grep -E ':(3000|8080|54321|54323)' || echo "Nenhuma porta da aplicação em uso"
echo ""

# Verificar logs se containers estiverem rodando
log "6. Verificando logs de containers existentes..."
if $DOCKER_COMPOSE_CMD ps -q | grep -q .; then
    echo "Logs dos containers:"
    $DOCKER_COMPOSE_CMD logs --tail=20
else
    echo "Nenhum container da aplicação rodando"
fi
echo ""

# Teste de build isolado
log "7. Teste de build do frontend (diagnóstico)..."
if [ -d "frontend" ]; then
    cd frontend
    
    echo "Conteúdo do diretório frontend:"
    ls -la
    echo ""
    
    echo "Testando npm install local:"
    if npm install --no-audit --no-fund; then
        success "✅ npm install funcionou"
        
        echo "Verificando se vite está disponível:"
        if npx vite --version; then
            success "✅ Vite está funcionando"
            
            echo "Tentando build local:"
            if npm run build; then
                success "✅ Build local funcionou!"
                echo "Arquivos gerados:"
                ls -la dist/ 2>/dev/null || echo "Diretório dist não encontrado"
            else
                error "❌ Build local falhou"
            fi
        else
            error "❌ Vite não está funcionando"
        fi
    else
        error "❌ npm install falhou"
    fi
    
    cd ..
else
    error "❌ Diretório frontend não encontrado"
fi
echo ""

# Verificar .env
log "8. Verificando configuração .env..."
if [ -f ".env" ]; then
    success "✅ Arquivo .env encontrado"
    echo "Variáveis importantes:"
    grep -E "(SUPABASE|JWT|POSTGRES)" .env || echo "Nenhuma variável crítica encontrada"
else
    warning "⚠️ Arquivo .env NÃO encontrado"
    echo "Criando arquivo .env básico..."
    cat > .env << 'EOF'
POSTGRES_PASSWORD=postgres123
JWT_SECRET=your-jwt-secret-here
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
SUPABASE_PUBLIC_URL=http://localhost:54321
SUPABASE_INTERNAL_URL=http://supabase-gateway
SITE_URL=http://localhost:3000
API_EXTERNAL_URL=http://localhost:54321
PGRST_DB_SCHEMAS=public
DISABLE_SIGNUP=false
ENABLE_EMAIL_SIGNUP=true
ENABLE_EMAIL_AUTOCONFIRM=true
ENABLE_PHONE_SIGNUP=false
ENABLE_PHONE_AUTOCONFIRM=false
JWT_EXPIRY=3600
SMTP_ADMIN_EMAIL=admin@example.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
SMTP_SENDER_NAME=DarkChannelAgent
N8N_BASE_URL=http://localhost:5678
N8N_WEBHOOK_SCREENPLAY_URL=http://localhost:5678/webhook/screenplay
N8N_WEBHOOK_VIDEO_URL=http://localhost:5678/webhook/video
N8N_CALLBACK_SECRET=your-callback-secret
PAYMENT_PROVIDER=stripe
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
CREDITS_PRICE_CENTS=3000
ALLOW_ANON=true
ALLOW_ANON_ADMIN=false
ADDITIONAL_REDIRECT_URLS=http://localhost:3000
EOF
    success "✅ Arquivo .env criado"
fi
echo ""

# Sugestões de solução
log "🔧 SUGESTÕES DE SOLUÇÃO:"
echo ""
echo "Para o erro 'vite: Permission denied':"
echo "1. Execute: chmod +x build.sh && ./build.sh"
echo "2. Se persistir: $DOCKER_COMPOSE_CMD build --no-cache frontend"
echo "3. Limpe tudo: $DOCKER_COMPOSE_CMD down && docker system prune -f"
echo "4. Build individual: docker build -t test-frontend ./frontend"
echo ""
echo "Para problemas gerais:"
echo "1. Verifique se há espaço em disco suficiente (>2GB)"
echo "2. Reinicie o Docker: sudo systemctl restart docker"
echo "3. Limpe cache npm: npm cache clean --force"
echo "4. Use build sem cache: $DOCKER_COMPOSE_CMD build --no-cache"
echo ""
echo "Para depuração avançada:"
echo "1. Build manual: cd frontend && npm install && npm run build"
echo "2. Verifique Dockerfile: cat frontend/Dockerfile"
echo "3. Logs detalhados: $DOCKER_COMPOSE_CMD logs frontend"
echo ""

success "🎯 Troubleshooting concluído!"
echo "Se o problema persistir, execute os comandos sugeridos acima."