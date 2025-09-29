#!/bin/bash

# DarkChannelAgent - Script de Gerenciamento
# Uso: ./manage.sh [comando]

case "$1" in
    "start-supabase")
        echo "🚀 Iniciando Supabase..."
        cd supabase && docker-compose up -d
        echo "✅ Supabase iniciado!"
        echo "📊 Studio: http://localhost:3001"
        echo "🌐 API: http://localhost:54321"
        echo "🗄️ DB: localhost:5432"
        ;;
    
    "stop-supabase")
        echo "🛑 Parando Supabase..."
        cd supabase && docker-compose down
        echo "✅ Supabase parado!"
        ;;
    
    "start-app")
        echo "🚀 Iniciando aplicação..."
        docker-compose up -d
        echo "✅ Aplicação iniciada!"
        echo "🌐 Frontend: http://localhost:3000"
        echo "⚙️ Backend: http://localhost:8080"
        ;;
    
    "stop-app")
        echo "🛑 Parando aplicação..."
        docker-compose down
        echo "✅ Aplicação parada!"
        ;;
    
    "start-all")
        echo "🚀 Iniciando todos os serviços..."
        cd supabase && docker-compose up -d
        cd .. && docker-compose up -d
        echo "✅ Todos os serviços iniciados!"
        echo ""
        echo "📊 Supabase Studio: http://localhost:3001"
        echo "🌐 Frontend: http://localhost:3000"
        echo "⚙️ Backend: http://localhost:8080"
        echo "🗄️ Database: localhost:5432"
        ;;
    
    "stop-all")
        echo "🛑 Parando todos os serviços..."
        docker-compose down
        cd supabase && docker-compose down
        echo "✅ Todos os serviços parados!"
        ;;
    
    "logs-supabase")
        echo "📋 Logs do Supabase..."
        cd supabase && docker-compose logs -f
        ;;
    
    "logs-app")
        echo "📋 Logs da aplicação..."
        docker-compose logs -f
        ;;
    
    "status")
        echo "📊 Status dos serviços:"
        echo ""
        echo "Supabase:"
        cd supabase && docker-compose ps
        echo ""
        echo "Aplicação:"
        cd .. && docker-compose ps
        ;;
    
    "reset-db")
        echo "🗑️ Resetando banco de dados..."
        cd supabase && docker-compose down -v
        docker-compose up -d
        echo "✅ Banco de dados resetado!"
        ;;
    
    *)
        echo "DarkChannelAgent - Script de Gerenciamento"
        echo ""
        echo "Comandos disponíveis:"
        echo "  start-supabase   - Inicia apenas o Supabase"
        echo "  stop-supabase    - Para apenas o Supabase"
        echo "  start-app        - Inicia apenas a aplicação"
        echo "  stop-app         - Para apenas a aplicação"
        echo "  start-all        - Inicia todos os serviços"
        echo "  stop-all         - Para todos os serviços"
        echo "  logs-supabase    - Mostra logs do Supabase"
        echo "  logs-app         - Mostra logs da aplicação"
        echo "  status           - Mostra status dos serviços"
        echo "  reset-db         - Reseta o banco de dados"
        echo ""
        echo "Exemplo: ./manage.sh start-all"
        ;;
esac