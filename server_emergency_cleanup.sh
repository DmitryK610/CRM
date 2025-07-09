#!/bin/bash

echo "🚨 ЭКСТРЕННАЯ ОЧИСТКА И ПЕРЕЗАПУСК СЕРВЕРА 🚨"
echo "=============================================="

# Показать текущее использование диска
echo "📊 Текущее использование диска:"
df -h

echo -e "\n⏹️ Останавливаем все контейнеры..."
docker-compose down || true

echo ""
echo "🗑️ Удаляем все контейнеры проекта..."
docker rm -f vue-frontend backend-api 2>/dev/null || true

echo ""
echo "🗑️ Быстрая очистка Docker..."
docker system prune -f

# 1. Остановить и удалить все контейнеры
echo "⏹️ Остановка всех контейнеров..."
docker stop $(docker ps -aq) 2>/dev/null || true

echo "🗑️ Удаление всех контейнеров..."
docker rm $(docker ps -aq) 2>/dev/null || true

# 2. Удалить все образы
echo "🗑️ Удаление всех неиспользуемых образов..."
docker image prune -af

# 3. Удалить все volumes
echo "🗑️ Удаление всех неиспользуемых volumes..."
docker volume prune -f

# 4. Удалить все networks
echo "🗑️ Удаление всех неиспользуемых networks..."
docker network prune -f

# 5. Полная очистка Docker
echo "🗑️ Полная очистка Docker системы..."
docker system prune -af --volumes

# 6. Очистка логов Docker
echo "🗑️ Очистка логов Docker..."
truncate -s 0 /var/lib/docker/containers/*/*-json.log 2>/dev/null || true

# 7. Очистка журналов systemd
echo "🗑️ Очистка журналов systemd..."
journalctl --vacuum-time=1d 2>/dev/null || true

# 8. Очистка временных файлов
echo "🗑️ Очистка временных файлов..."
rm -rf /tmp/* 2>/dev/null || true
rm -rf /var/tmp/* 2>/dev/null || true

# 9. Очистка кэша APT
echo "🗑️ Очистка кэша APT..."
apt-get clean 2>/dev/null || true
apt-get autoremove -y 2>/dev/null || true

# 10. Очистка старых логов
echo "🗑️ Очистка старых логов..."
find /var/log -name "*.log" -type f -mtime +7 -delete 2>/dev/null || true
find /var/log -name "*.gz" -type f -delete 2>/dev/null || true

# 11. Очистка старых файлов ядра
echo "🗑️ Очистка старых файлов ядра..."
apt-get autoremove --purge -y 2>/dev/null || true

# 12. Показать результат
echo -e "\n✅ Очистка завершена!"
echo "📊 Использование диска после очистки:"
df -h

echo -e "\n🐳 Статус Docker:"
docker system df

echo -e "\n🎯 Теперь можно запустить деплой заново:"
echo "cd ~/CRM && docker-compose up -d --build"
