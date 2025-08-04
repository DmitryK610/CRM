#!/bin/bash

# Скрипт для пересборки CRM контейнеров с обновлением из Git
# MySQL и OpenResty остаются без изменений

echo "🚀 Начинаем обновление CRM системы..."

# Переходим в директорию проекта
cd ~/CRM || { echo "❌ Ошибка: директория ~/CRM не найдена"; exit 1; }

echo "📦 Останавливаем и удаляем старые контейнеры..."
# Останавливаем только наши контейнеры
docker-compose stop frontend backend
docker-compose rm -f frontend backend

echo "🗑️ Удаляем старые образы CRM..."
# Удаляем только образы CRM (не трогаем MySQL и OpenResty)
docker rmi -f crm-frontend crm-backend 2>/dev/null || true

echo "🧹 Очищаем неиспользуемые контейнеры и образы..."
# Удаляем висячие контейнеры и образы
docker container prune -f
docker image prune -f

echo "📥 Обновляем код из Git репозитория..."
# Сохраняем изменения (если есть)
git add . 2>/dev/null || true
git stash 2>/dev/null || true

# Обновляем из основного репозитория
git remote remove origin 2>/dev/null || true
git remote add origin git@github.com:DmitryK610/CRM.git
git fetch origin
git reset --hard origin/development
git pull origin development

echo "🏗️ Пересобираем образы контейнеров..."
# Пересобираем контейнеры без кеша
docker-compose build --no-cache --pull frontend backend

echo "🚀 Запускаем обновленные контейнеры..."
# Запускаем контейнеры
docker-compose up -d frontend backend

echo "⏳ Ожидаем запуска контейнеров..."
sleep 15

echo "🔍 Проверяем статус контейнеров..."
docker-compose ps

echo "🏥 Проверяем здоровье backend..."
timeout 30 bash -c 'until curl -f http://127.0.0.1:8000/health/ping/ 2>/dev/null; do sleep 2; echo "Ожидание backend..."; done'

echo "🌐 Проверяем frontend..."
timeout 30 bash -c 'until curl -f http://127.0.0.1:8080 2>/dev/null; do sleep 2; echo "Ожидание frontend..."; done'

echo "📊 Итоговая проверка через HTTPS..."
echo "Frontend: $(curl -s -o /dev/null -w '%{http_code}' https://dkor.pro)"
echo "Backend API: $(curl -s -o /dev/null -w '%{http_code}' https://dkor.pro/api/suppliers/)"
echo "Health check: $(curl -s -o /dev/null -w '%{http_code}' https://dkor.pro/health/ping/)"

echo "✅ Обновление завершено!"
echo "🌍 Ваш сайт доступен по адресу: https://dkor.pro"
echo "🔧 Django Admin: https://dkor.pro/admin/"

# Показываем логи последних запросов
echo "📋 Последние логи backend:"
docker logs backend-api --tail 10