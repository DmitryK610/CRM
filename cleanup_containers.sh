#!/bin/bash

echo "=== ОЧИСТКА КОНФЛИКТУЮЩИХ КОНТЕЙНЕРОВ ==="

# Останавливаем все контейнеры проекта
echo "Останавливаем все контейнеры..."
docker-compose down --remove-orphans

# Удаляем конфликтующие контейнеры по именам
echo "Удаляем конфликтующие контейнеры..."
docker rm -f vue-frontend backend-api 2>/dev/null || true
docker rm -f crm-production-vue-frontend-1 crm-production-backend-api-1 2>/dev/null || true

# Удаляем неиспользуемые образы проекта
echo "Очищаем старые образы..."
docker image prune -f
docker rmi crm-production_vue-frontend crm-production_backend-api 2>/dev/null || true

# Показываем статус
echo "Текущие контейнеры:"
docker ps -a | grep -E "(vue-frontend|backend-api|crm)"

echo "=== ОЧИСТКА ЗАВЕРШЕНА ==="
echo "Теперь можно запустить: docker-compose up -d --build"
