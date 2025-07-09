#!/bin/bash

# Скрипт для очистки диска на VPS
echo "🧹 Начинаем очистку диска на сервере..."

# Остановить все контейнеры
echo "⏹️  Останавливаем все контейнеры..."
docker-compose down || true

# Показать текущее использование диска
echo "📊 Текущее использование диска:"
df -h

echo ""
echo "📊 Анализ использования места в текущей директории:"
du -sh * 2>/dev/null | sort -hr | head -20

echo ""
echo "🗑️  Удаляем неиспользуемые Docker образы..."
docker image prune -a -f

echo ""
echo "🗑️  Удаляем неиспользуемые Docker контейнеры..."
docker container prune -f

echo ""
echo "🗑️  Удаляем неиспользуемые Docker volumes..."
docker volume prune -f

echo ""
echo "🗑️  Удаляем неиспользуемые Docker networks..."
docker network prune -f

echo ""
echo "🗑️  Полная очистка Docker системы..."
docker system prune -a -f --volumes

echo ""
echo "🗑️  Очистка логов Docker (старше 7 дней)..."
sudo find /var/lib/docker/containers/ -name "*.log" -mtime +7 -exec rm -f {} \; 2>/dev/null || true

echo ""
echo "🗑️  Очистка системных логов..."
sudo journalctl --vacuum-time=7d 2>/dev/null || true
sudo apt-get clean 2>/dev/null || true
sudo apt-get autoclean 2>/dev/null || true
sudo apt-get autoremove -y 2>/dev/null || true

echo ""
echo "🗑️  Очистка временных файлов..."
sudo rm -rf /tmp/* 2>/dev/null || true
sudo rm -rf /var/tmp/* 2>/dev/null || true

echo ""
echo "🗑️  Очистка кэша пакетного менеджера..."
sudo rm -rf /var/cache/apt/archives/*.deb 2>/dev/null || true

echo ""
echo "📊 Использование диска после очистки:"
df -h

echo ""
echo "📊 Топ-10 директорий по размеру в /:"
sudo du -sh /* 2>/dev/null | sort -hr | head -10

echo ""
echo "✅ Очистка завершена!"
echo "💡 Если места все еще мало, рассмотрите:"
echo "   - Увеличение размера диска VPS"
echo "   - Удаление старых файлов проектов"
echo "   - Настройку ротации логов"

echo ""
echo "🚀 Теперь можно запустить deploy.sh для повторного деплоя"
