#!/bin/bash

# Скрипт для решения конфликта контейнеров
echo "=== РЕШЕНИЕ КОНФЛИКТА КОНТЕЙНЕРОВ ==="

cd /root/CRM || exit 1

echo "Останавливаем все контейнеры..."
docker-compose down 2>/dev/null || true

echo "Принудительно останавливаем конфликтующие контейнеры..."
docker stop backend-api vue-frontend 2>/dev/null || true

echo "Удаляем конфликтующие контейнеры..."
docker rm backend-api vue-frontend 2>/dev/null || true

echo "Очищаем неиспользуемые ресурсы..."
docker system prune -f

echo "Пересобираем и запускаем контейнеры..."
docker-compose build --no-cache
docker-compose up -d

echo "Проверяем статус..."
docker-compose ps

echo "=== ГОТОВО ==="
echo "Проверьте логи:"
echo "docker-compose logs -f"
