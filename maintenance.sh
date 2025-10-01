#!/bin/bash

# =================================================================
# Dark Channel Agent - Scripts de Manutenção
# Comandos úteis para desenvolvimento e manutenção
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

# Mostrar help
show_help() {
    cat << EOF
Dark Channel Agent - Scripts de Manutenção

Uso: $0 [COMANDO]

COMANDOS DISPONÍVEIS:
    start       - Iniciar aplicação (equivale ao build.sh)
    stop        - Parar todos os serviços
    restart     - Reiniciar aplicação
    status      - Mostrar status dos serviços
    logs        - Mostrar logs de todos os serviços
    logs-f      - Seguir logs em tempo real
    clean       - Limpeza completa (containers, images, volumes)
    update      - Atualizar e rebuild aplicação
    health      - Verificar saúde dos serviços
    shell       - Abrir shell no container especificado
    db-backup   - Fazer backup do banco de dados
    db-restore  - Restaurar backup do banco de dados
    dev         - Iniciar ambiente de desenvolvimento
    prod        - Iniciar ambiente de produção
    help        - Mostrar esta ajuda

EXEMPLOS:
    $0 start                    # Iniciar aplicação
    $0 logs backend             # Ver logs do backend
    $0 shell backend            # Abrir shell no container do backend
    $0 clean                    # Limpeza completa
    $0 db-backup mybackup.sql   # Fazer backup do DB

EOF
}

# Verificar se Docker está disponível
check_docker() {
    if ! command -v docker &> /dev/null || ! docker info &> /dev/null; then
        error "Docker não está disponível!"
        exit 1
    fi
}

# Iniciar aplicação
start_app() {
    log "Iniciando aplicação..."
    ./build.sh
}

# Parar aplicação
stop_app() {
    log "Parando todos os serviços..."
    docker-compose down
    success "Aplicação parada"
}

# Reiniciar aplicação
restart_app() {
    log "Reiniciando aplicação..."
    docker-compose restart
    success "Aplicação reiniciada"
}

# Status dos serviços
show_status() {
    log "Status dos serviços:"
    echo ""
    docker-compose ps
    echo ""
    log "URLs de acesso:"
    echo "  Frontend:        http://localhost:3000"
    echo "  Backend API:     http://localhost:8080"
    echo "  Supabase:        http://localhost:54321"
    echo "  Supabase Studio: http://localhost:54323"
}

# Mostrar logs
show_logs() {
    local service=$1
    if [ -n "$service" ]; then
        log "Mostrando logs do serviço: $service"
        docker-compose logs "$service"
    else
        log "Mostrando logs de todos os serviços"
        docker-compose logs
    fi
}

# Seguir logs
follow_logs() {
    local service=$1
    if [ -n "$service" ]; then
        log "Seguindo logs do serviço: $service (Ctrl+C para sair)"
        docker-compose logs -f "$service"
    else
        log "Seguindo logs de todos os serviços (Ctrl+C para sair)"
        docker-compose logs -f
    fi
}

# Limpeza completa
clean_all() {
    warning "ATENÇÃO: Esta operação irá remover todos os containers, imagens e volumes!"
    read -p "Tem certeza? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log "Executando limpeza completa..."
        
        # Parar e remover containers
        docker-compose down --remove-orphans
        
        # Remover imagens
        docker-compose down --rmi all --remove-orphans
        
        # Remover volumes
        docker-compose down --volumes --remove-orphans
        
        # Limpeza geral do Docker
        docker system prune -af
        docker volume prune -f
        
        success "Limpeza completa executada"
    else
        log "Operação cancelada"
    fi
}

# Atualizar aplicação
update_app() {
    log "Atualizando aplicação..."
    
    # Pull das últimas alterações
    git pull
    
    # Rebuild e restart
    docker-compose build --no-cache
    docker-compose up -d
    
    success "Aplicação atualizada"
}

# Verificar saúde
health_check() {
    log "Verificando saúde dos serviços..."
    
    # Backend
    if curl -f http://localhost:8080/health &> /dev/null; then
        success "✅ Backend está saudável"
    else
        error "❌ Backend não está respondendo"
    fi
    
    # Frontend
    if curl -f http://localhost:3000 &> /dev/null; then
        success "✅ Frontend está saudável"
    else
        error "❌ Frontend não está respondendo"
    fi
    
    # Supabase
    if curl -f http://localhost:54321/health &> /dev/null; then
        success "✅ Supabase está saudável"
    else
        error "❌ Supabase não está respondendo"
    fi
}

# Abrir shell em container
open_shell() {
    local service=$1
    if [ -z "$service" ]; then
        error "Especifique o serviço. Exemplo: $0 shell backend"
        echo "Serviços disponíveis:"
        docker-compose config --services
        exit 1
    fi
    
    log "Abrindo shell no container: $service"
    docker-compose exec "$service" /bin/bash || docker-compose exec "$service" /bin/sh
}

# Backup do banco de dados
db_backup() {
    local backup_file=${1:-"backup-$(date +%Y%m%d_%H%M%S).sql"}
    
    log "Fazendo backup do banco de dados para: $backup_file"
    
    docker-compose exec -T supabase-db pg_dump -U postgres postgres > "$backup_file"
    
    if [ $? -eq 0 ]; then
        success "Backup criado: $backup_file"
    else
        error "Falha ao criar backup"
        exit 1
    fi
}

# Restaurar backup do banco
db_restore() {
    local backup_file=$1
    
    if [ -z "$backup_file" ]; then
        error "Especifique o arquivo de backup. Exemplo: $0 db-restore backup.sql"
        exit 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        error "Arquivo de backup não encontrado: $backup_file"
        exit 1
    fi
    
    warning "ATENÇÃO: Esta operação irá sobrescrever o banco de dados atual!"
    read -p "Tem certeza? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log "Restaurando backup: $backup_file"
        
        docker-compose exec -T supabase-db psql -U postgres -d postgres < "$backup_file"
        
        if [ $? -eq 0 ]; then
            success "Backup restaurado com sucesso"
        else
            error "Falha ao restaurar backup"
            exit 1
        fi
    else
        log "Operação cancelada"
    fi
}

# Ambiente de desenvolvimento
dev_env() {
    log "Iniciando ambiente de desenvolvimento..."
    
    # Usar override para desenvolvimento se existir
    if [ -f "docker-compose.dev.yml" ]; then
        docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
    else
        docker-compose up -d
    fi
    
    success "Ambiente de desenvolvimento iniciado"
}

# Ambiente de produção
prod_env() {
    log "Iniciando ambiente de produção..."
    
    # Usar override para produção se existir
    if [ -f "docker-compose.prod.yml" ]; then
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
    else
        docker-compose up -d
    fi
    
    success "Ambiente de produção iniciado"
}

# Função principal
main() {
    check_docker
    
    case "${1:-help}" in
        start)
            start_app
            ;;
        stop)
            stop_app
            ;;
        restart)
            restart_app
            ;;
        status)
            show_status
            ;;
        logs)
            show_logs "$2"
            ;;
        logs-f)
            follow_logs "$2"
            ;;
        clean)
            clean_all
            ;;
        update)
            update_app
            ;;
        health)
            health_check
            ;;
        shell)
            open_shell "$2"
            ;;
        db-backup)
            db_backup "$2"
            ;;
        db-restore)
            db_restore "$2"
            ;;
        dev)
            dev_env
            ;;
        prod)
            prod_env
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            error "Comando inválido: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

main "$@"