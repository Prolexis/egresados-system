@echo off
echo 🚀 Iniciando Egresados System...
echo.

echo 📦 Levantando servicios con Docker Compose...
docker compose up --build -d

echo ⏳ Esperando a que los servicios estén listos...
timeout /t 60 /nobreak >nul

echo 🗄️ Ejecutando migraciones de base de datos...
docker compose exec api npx prisma migrate dev --name init
if errorlevel 1 echo ⚠️ No se necesitan nuevas migraciones

echo 🌱 Aplicando seed de datos...
docker compose exec api npx prisma db seed
if errorlevel 1 echo ⚠️ Seed ya aplicado

echo 🩺 Ejecutando chequeo de salud...
node health-check.js

echo.
echo ✅ ¡Sistema listo!
echo    🌐 Frontend: http://localhost:3000
echo    📡 API: http://localhost:3001
echo    🩺 Health Check API: http://localhost:3001/health
echo.
pause
