#!/bin/bash

# =================================================================
# Dark Channel Agent - Build & Deploy Script
# Para uso com Jenkins CI/CD
# =================================================================

set -e  # Exit on any error

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log com timestamp
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Verificar se o Docker está instalado e rodando
check_docker() {
    log "Verificando se Docker está instalado e rodando..."
    
    if ! command -v docker &> /dev/null; then
        error "Docker não está instalado!"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        error "Docker não está rodando!"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        error "Docker Compose não está instalado!"
        exit 1
    fi
    
    success "Docker está funcionando corretamente"
}

# Verificar se arquivo .env existe
check_env() {
    log "Verificando arquivo de configuração..."
    
    if [ ! -f ".env" ]; then
        error "Arquivo .env não encontrado!"
        error "Crie um arquivo .env baseado no .env.example"
        exit 1
    fi
    
    success "Arquivo .env encontrado"
}

# Limpar containers e imagens antigas
cleanup() {
    log "Limpando containers e imagens antigas..."
    
    # Parar todos os containers se estiverem rodando
    if docker-compose ps -q | grep -q .; then
        warning "Parando containers existentes..."
        docker-compose down --remove-orphans
    fi
    
    # Remover imagens antigas (opcional - pode ser comentado para builds mais rápidos)
    log "Removendo imagens antigas da aplicação..."
    docker image prune -f
    docker-compose down --rmi local --remove-orphans 2>/dev/null || true
    
    success "Cleanup concluído"
}

# Build das imagens Docker
build_images() {
    log "Iniciando build das imagens Docker..."
    
    # Build com cache para otimizar tempo de build
    docker-compose build --parallel
    
    if [ $? -eq 0 ]; then
        success "Build das imagens concluído com sucesso"
    else
        error "Falha no build das imagens"
        exit 1
    fi
}

# Verificar dependências do backend
check_backend_deps() {
    log "Verificando dependências do backend..."
    
    if [ ! -f "backend/package.json" ]; then
        error "package.json do backend não encontrado!"
        exit 1
    fi
    
    success "Dependências do backend verificadas"
}

# Verificar dependências do frontend
check_frontend_deps() {
    log "Verificando dependências do frontend..."
    
    if [ ! -f "frontend/package.json" ]; then
        error "package.json do frontend não encontrado!"
        exit 1
    fi
    
    success "Dependências do frontend verificadas"
}

# Aguardar que os serviços estejam saudáveis
wait_for_services() {
    log "Aguardando serviços ficarem saudáveis..."
    
    local max_attempts=60
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        log "Tentativa $attempt/$max_attempts - Verificando status dos serviços..."
        
        # Verificar se todos os serviços com healthcheck estão healthy
        if docker-compose ps | grep -E "(healthy|Up)" | wc -l | grep -q "$(docker-compose config --services | wc -l)"; then
            success "Todos os serviços estão funcionando!"
            return 0
        fi
        
        sleep 10
        ((attempt++))
    done
    
    error "Timeout: Serviços não ficaram saudáveis em tempo hábil"
    docker-compose logs
    exit 1
}

# Executar a aplicação
start_application() {
    log "Iniciando aplicação..."
    
    # Subir todos os serviços
    docker-compose up -d
    
    if [ $? -eq 0 ]; then
        success "Aplicação iniciada com sucesso"
        log "Aguardando inicialização completa dos serviços..."
        wait_for_services
    else
        error "Falha ao iniciar aplicação"
        docker-compose logs
        exit 1
    fi
}

# Mostrar status da aplicação
show_status() {
    log "Status da aplicação:"
    echo ""
    docker-compose ps
    echo ""
    log "URLs de acesso:"
    echo "  Frontend:        http://localhost:3000"
    echo "  Backend API:     http://localhost:8080"
    echo "  Supabase:        http://localhost:54321"
    echo "  Supabase Studio: http://localhost:54323"
}

# Verificar saúde dos serviços
health_check() {
    log "Executando verificação de saúde..."
    
    # Verificar backend
    if curl -f http://localhost:8080/health &> /dev/null; then
        success "Backend está respondendo"
    else
        warning "Backend não está respondendo"
    fi
    
    # Verificar frontend
    if curl -f http://localhost:3000 &> /dev/null; then
        success "Frontend está respondendo"
    else
        warning "Frontend não está respondendo"
    fi
    
    # Verificar Supabase
    if curl -f http://localhost:54321/health &> /dev/null; then
        success "Supabase está respondendo"
    else
        warning "Supabase não está respondendo"
    fi
}

# Função principal
main() {
    log "=== Iniciando build e deploy da Dark Channel Agent ==="
    
    # Verificações iniciais
    check_docker
    check_env
    check_backend_deps
    check_frontend_deps
    
    # Cleanup
    cleanup
    
    # Build e deploy
    build_images
    start_application
    
    # Verificações finais
    show_status
    health_check
    
    success "=== Deploy concluído com sucesso! ==="
    log "A aplicação está rodando e pronta para uso."
}

# Tratamento de erros
trap 'error "Script interrompido! Executando cleanup..."; docker-compose down' INT TERM ERR

# Executar função principal
main "$@"