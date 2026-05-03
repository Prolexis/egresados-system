#!/bin/bash
set -e

echo "🚀 Iniciando Egresados System..."
echo ""

# Paso 1: Levantar servicios Docker
echo "📦 Levantando servicios con Docker Compose..."
docker compose up --build -d

echo "⏳ Esperando a que los servicios estén listos..."

# Esperar a que los health checks pasen
echo "🔍 Verificando salud de los servicios..."
sleep 60

# Paso 2: Ejecutar migraciones y seed
echo "🗄️ Ejecutando migraciones de base de datos..."
docker compose exec api npx prisma migrate dev --name init || echo "⚠️ No se necesitan nuevas migraciones"

echo "🌱 Aplicando seed de datos..."
docker compose exec api npx prisma db seed || echo "⚠️ Seed ya aplicado"

# Paso 3: Ejecutar chequeo de salud
echo "🩺 Ejecutando chequeo de salud..."
node health-check.js

echo ""
echo "✅ ¡Sistema listo!"
echo "   🌐 Frontend: http://localhost:3000"
echo "   📡 API: http://localhost:3001"
echo "   🩺 Health Check API: http://localhost:3001/health"
echo ""
