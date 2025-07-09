#!/bin/bash

echo "🔧 Диагностика и исправление проблем с проксированием API"

echo "1️⃣ Проверяем текущую конфигурацию nginx во frontend контейнере:"
docker exec vue-frontend cat /etc/nginx/conf.d/default.conf | grep -A 5 -B 5 "location /api/"

echo ""
echo "2️⃣ Проверяем сетевое соединение между контейнерами:"
docker exec vue-frontend ping -c 2 backend-api || echo "❌ Нет связи между контейнерами"

echo ""
echo "3️⃣ Проверяем что backend отвечает напрямую:"
curl -s http://localhost:8000/api/ | head -5

echo ""
echo "4️⃣ Проверяем что происходит при запросе через frontend:"
curl -s http://localhost:8080/api/ | head -5

echo ""
echo "5️⃣ Проверяем логи nginx frontend'а:"
docker logs --tail 10 vue-frontend

echo ""
echo "6️⃣ Останавливаем все контейнеры..."
docker-compose down

echo ""
echo "7️⃣ Удаляем frontend контейнер и образ для принудительной пересборки..."
docker rm -f vue-frontend 2>/dev/null || true
docker rmi crm-frontend 2>/dev/null || true

echo ""
echo "8️⃣ Получаем последние изменения из репозитория..."
git pull

echo ""
echo "9️⃣ Пересобираем frontend образ с нуля..."
docker-compose build frontend --no-cache

echo ""
echo "🔟 Запускаем все контейнеры заново..."
docker-compose up -d

echo ""
echo "⏱️ Ждем 30 секунд для стабилизации..."
sleep 30

echo ""
echo "✅ Проверяем результат:"
echo "Backend напрямую:"
curl -s http://localhost:8000/health/ping/

echo ""
echo "API через frontend (должно работать):"
curl -s http://localhost:8080/api/ | head -3

echo ""
echo "Health через frontend:"
curl -s http://localhost:8080/health/ping/

echo ""
echo "Админка через frontend:"
curl -s -I http://localhost:8080/admin/ | head -3

echo ""
echo "Новая конфигурация nginx:"
docker exec vue-frontend cat /etc/nginx/conf.d/default.conf | grep -A 5 "location /api/"

echo ""
echo "📊 Статус контейнеров:"
docker ps

echo ""
echo "🎉 Диагностика завершена!"
echo "🌐 Попробуйте теперь: http://185.237.95.34:8080"
