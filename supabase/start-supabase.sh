#!/bin/bash

echo "🔧 Initializing Supabase..."

# Create data directory if it doesn't exist
mkdir -p ./data/postgres

echo "🚀 Starting Supabase services..."
docker-compose up -d

echo "⏳ Waiting for services to be ready..."
sleep 10

echo "🔍 Checking service health..."
docker-compose ps

echo ""
echo "🌐 Supabase Services:"
echo "   📊 Supabase Studio: http://172.16.0.34:3000"
echo "   🔌 Supabase API: http://172.16.0.33"
echo "   🗄️  PostgreSQL: 172.16.0.30:5432"
echo "   📁 Data Directory: ./data/postgres"
echo ""
echo "✅ Supabase initialization complete!"