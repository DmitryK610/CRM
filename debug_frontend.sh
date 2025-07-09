#!/bin/bash

echo "🔍 Диагностика frontend контейнера..."

echo "📊 Текущий статус контейнеров:"
docker ps -a

echo ""
echo "🚀 Попытка запуска frontend контейнера..."
docker start vue-frontend

echo ""
echo "⏱️ Ждем 5 секунд..."
sleep 5

echo ""
echo "📊 Статус после попытки запуска:"
docker ps -a

echo ""
echo "📝 Логи frontend контейнера:"
docker logs vue-frontend

echo ""
echo "🔍 Инспекция frontend контейнера:"
docker inspect vue-frontend | grep -A 10 -B 5 "Error\|ExitCode\|Status"

echo ""
echo "🔍 Проверка образа frontend:"
docker images | grep crm-frontend

echo ""
echo "🔍 Попытка запуска в интерактивном режиме для диагностики:"
echo "Выполните: docker run -it --rm crm-frontend /bin/sh"
