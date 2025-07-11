#!/bin/bash

echo "🔍 Быстрая диагностика frontend проблемы"

echo "1️⃣ Останавливаем все контейнеры..."
docker-compose down

echo ""
echo "2️⃣ Удаляем frontend контейнер..."
docker rm -f vue-frontend 2>/dev/null || true

echo ""
echo "3️⃣ Пытаемся запустить только frontend без зависимостей..."
docker-compose -f docker-compose-test.yml up -d frontend

echo ""
echo "⏱️ Ждем 10 секунд..."
sleep 10

echo ""
echo "📊 Статус frontend:"
docker ps -a | grep vue-frontend

echo ""
echo "📝 Логи frontend:"
docker logs vue-frontend

echo ""
echo "🔍 Детальная инспекция frontend контейнера:"
docker inspect vue-frontend | grep -A 5 -B 5 "Error\|ExitCode\|Status\|Health"

echo ""
echo "4️⃣ Если frontend не запустился, попробуем вручную..."
if ! docker ps | grep -q vue-frontend; then
    echo "❌ Frontend не запустился. Пробуем запустить образ вручную..."
    docker run --rm -p 8080:80 crm-frontend &
    sleep 5
    echo "📊 Проверяем, запустился ли вручную:"
    curl -I http://localhost:8080/ || echo "❌ Все еще не работает"
fi

echo ""
echo "✅ Диагностика завершена"
