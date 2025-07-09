#!/bin/bash

echo "🔧 Полная диагностика и исправление проблем с контейнерами"

# Остановить все контейнеры
echo "⏹️ Останавливаем все контейнеры..."
docker-compose down

echo ""
echo "🧹 Удаляем проблемные контейнеры..."
docker rm -f vue-frontend backend-api 2>/dev/null || true

echo ""
echo "📊 Проверяем образы:"
docker images | grep crm

echo ""
echo "🔄 Пересобираем образы с нуля..."
docker-compose build --no-cache

echo ""
echo "🚀 Запускаем контейнеры по очереди..."

echo "1️⃣ Сначала запускаем backend..."
docker-compose up -d backend

echo "⏱️ Ждем, пока backend станет healthy..."
for i in {1..12}; do
    if docker inspect backend-api --format='{{.State.Health.Status}}' | grep -q "healthy"; then
        echo "✅ Backend стал healthy"
        break
    fi
    echo "⏳ Ожидание... ($i/12)"
    sleep 10
done

echo ""
echo "📊 Статус backend:"
docker ps | grep backend-api

echo ""
echo "2️⃣ Теперь запускаем frontend..."
docker-compose up -d frontend

echo ""
echo "⏱️ Ждем 30 секунд для стабилизации frontend..."
sleep 30

echo ""
echo "📊 Финальный статус всех контейнеров:"
docker ps -a

echo ""
echo "📝 Логи frontend:"
docker logs vue-frontend

echo ""
echo "📝 Логи backend (последние 20 строк):"
docker logs --tail 20 backend-api

echo ""
echo "🌐 Проверяем доступность сервисов:"
echo "Backend API:"
curl -f http://localhost:8000/health/ping/ || echo "❌ Backend недоступен"

echo ""
echo "Frontend:"
curl -f -I http://localhost:8080/ || echo "❌ Frontend недоступен"

echo ""
echo "✅ Диагностика завершена!"
