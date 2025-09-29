@echo off
echo 🔧 Initializing Supabase...

REM Create data directory if it doesn't exist
if not exist "data\postgres" mkdir data\postgres

echo 🚀 Starting Supabase services...
docker-compose up -d

echo ⏳ Waiting for services to be ready...
timeout /t 10 >nul

echo 🔍 Checking service health...
docker-compose ps

echo.
echo 🌐 Supabase Services:
echo    📊 Supabase Studio: http://172.16.0.34:3000
echo    🔌 Supabase API: http://172.16.0.33
echo    🗄️  PostgreSQL: 172.16.0.30:5432
echo    📁 Data Directory: ./data/postgres
echo.
echo ✅ Supabase initialization complete!
pause