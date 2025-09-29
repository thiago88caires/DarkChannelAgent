# DarkChannelAgent - Script de Gerenciamento PowerShell
# Uso: .\manage.ps1 [comando]

param(
    [Parameter(Mandatory=$true)]
    [string]$Command
)

switch ($Command) {
    "start-supabase" {
        Write-Host "🚀 Iniciando Supabase..." -ForegroundColor Green
        Set-Location supabase
        docker-compose up -d
        Set-Location ..
        Write-Host "✅ Supabase iniciado!" -ForegroundColor Green
        Write-Host "📊 Studio: http://localhost:3001" -ForegroundColor Cyan
        Write-Host "🌐 API: http://localhost:54321" -ForegroundColor Cyan
        Write-Host "🗄️ DB: localhost:5432" -ForegroundColor Cyan
    }
    
    "stop-supabase" {
        Write-Host "🛑 Parando Supabase..." -ForegroundColor Yellow
        Set-Location supabase
        docker-compose down
        Set-Location ..
        Write-Host "✅ Supabase parado!" -ForegroundColor Green
    }
    
    "start-app" {
        Write-Host "🚀 Iniciando aplicação..." -ForegroundColor Green
        docker-compose up -d
        Write-Host "✅ Aplicação iniciada!" -ForegroundColor Green
        Write-Host "🌐 Frontend: http://localhost:3000" -ForegroundColor Cyan
        Write-Host "⚙️ Backend: http://localhost:8080" -ForegroundColor Cyan
    }
    
    "stop-app" {
        Write-Host "🛑 Parando aplicação..." -ForegroundColor Yellow
        docker-compose down
        Write-Host "✅ Aplicação parada!" -ForegroundColor Green
    }
    
    "start-all" {
        Write-Host "🚀 Iniciando todos os serviços..." -ForegroundColor Green
        Set-Location supabase
        docker-compose up -d
        Set-Location ..
        docker-compose up -d
        Write-Host "✅ Todos os serviços iniciados!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📊 Supabase Studio: http://localhost:3001" -ForegroundColor Cyan
        Write-Host "🌐 Frontend: http://localhost:3000" -ForegroundColor Cyan
        Write-Host "⚙️ Backend: http://localhost:8080" -ForegroundColor Cyan
        Write-Host "🗄️ Database: localhost:5432" -ForegroundColor Cyan
    }
    
    "stop-all" {
        Write-Host "🛑 Parando todos os serviços..." -ForegroundColor Yellow
        docker-compose down
        Set-Location supabase
        docker-compose down
        Set-Location ..
        Write-Host "✅ Todos os serviços parados!" -ForegroundColor Green
    }
    
    "logs-supabase" {
        Write-Host "📋 Logs do Supabase..." -ForegroundColor Blue
        Set-Location supabase
        docker-compose logs -f
    }
    
    "logs-app" {
        Write-Host "📋 Logs da aplicação..." -ForegroundColor Blue
        docker-compose logs -f
    }
    
    "status" {
        Write-Host "📊 Status dos serviços:" -ForegroundColor Blue
        Write-Host ""
        Write-Host "Supabase:" -ForegroundColor Yellow
        Set-Location supabase
        docker-compose ps
        Write-Host ""
        Write-Host "Aplicação:" -ForegroundColor Yellow
        Set-Location ..
        docker-compose ps
    }
    
    "reset-db" {
        Write-Host "🗑️ Resetando banco de dados..." -ForegroundColor Red
        Set-Location supabase
        docker-compose down -v
        docker-compose up -d
        Set-Location ..
        Write-Host "✅ Banco de dados resetado!" -ForegroundColor Green
    }
    
    default {
        Write-Host "DarkChannelAgent - Script de Gerenciamento" -ForegroundColor Blue
        Write-Host ""
        Write-Host "Comandos disponíveis:" -ForegroundColor Yellow
        Write-Host "  start-supabase   - Inicia apenas o Supabase"
        Write-Host "  stop-supabase    - Para apenas o Supabase"
        Write-Host "  start-app        - Inicia apenas a aplicação"
        Write-Host "  stop-app         - Para apenas a aplicação"
        Write-Host "  start-all        - Inicia todos os serviços"
        Write-Host "  stop-all         - Para todos os serviços"
        Write-Host "  logs-supabase    - Mostra logs do Supabase"
        Write-Host "  logs-app         - Mostra logs da aplicação"
        Write-Host "  status           - Mostra status dos serviços"
        Write-Host "  reset-db         - Reseta o banco de dados"
        Write-Host ""
        Write-Host "Exemplo: .\manage.ps1 start-all" -ForegroundColor Cyan
    }
}