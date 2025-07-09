#!/bin/bash

echo "🔄 Быстрый перезапуск с новой конфигурацией nginx"

echo "⏹️ Останавливаем контейнеры..."
docker-compose down

echo ""
echo "🔄 Пересобираем frontend с новой nginx конфигурацией..."
docker-compose build frontend

echo ""
echo "🚀 Запускаем контейнеры..."
docker-compose up -d

echo ""
echo "⏱️ Ждем 30 секунд для стабилизации..."
sleep 30

echo ""
echo "📊 Статус контейнеров:"
docker ps

echo ""
echo "🧪 Тестируем API через frontend nginx:"
echo "API через frontend (порт 8080):"
curl -f http://localhost:8080/api/ || echo "❌ API через frontend не работает"

echo ""
echo "API напрямую (порт 8000):"
curl -f http://localhost:8000/api/ || echo "❌ API напрямую не работает"

echo ""
echo "Health check через frontend:"
curl -f http://localhost:8080/health/ping/ || echo "❌ Health через frontend не работает"

echo ""
echo "Админка через frontend:"
curl -f -I http://localhost:8080/admin/ || echo "❌ Админка через frontend не работает"

echo ""
echo "✅ Тест завершен!"
echo "🌐 Теперь все должно работать через http://your-server-ip:8080/"
