#!/bin/bash

# Скрипт для быстрого получения force_update_server.sh с GitHub
# Используется для первичного получения скрипта принудительного обновления

echo "=== ПОЛУЧЕНИЕ СКРИПТА ПРИНУДИТЕЛЬНОГО ОБНОВЛЕНИЯ ==="

cd /root/CRM || exit 1

# Скачиваем скрипт напрямую с GitHub
echo "Скачиваем force_update_server.sh с GitHub..."
curl -o force_update_server.sh https://raw.githubusercontent.com/DmitryK610/CRM/development/force_update_server.sh

# Делаем исполняемым
chmod +x force_update_server.sh

echo "Скрипт загружен! Теперь можно запустить:"
echo "./force_update_server.sh"
