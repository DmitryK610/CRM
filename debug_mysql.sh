#!/bin/bash

echo "🔍 ДИАГНОСТИКА ПРОБЛЕМЫ С БАЗОЙ ДАННЫХ"

echo ""
echo "1️⃣ Проверяем доступность MySQL на сервере..."
echo "Пингуем сервер MySQL:"
ping -c 3 185.237.95.34

echo ""
echo "2️⃣ Проверяем открытые порты на MySQL сервере..."
echo "Проверяем порт 3306:"
nc -zv 185.237.95.34 3306 2>&1 || echo "❌ Порт 3306 недоступен"

echo ""
echo "3️⃣ Проверяем настройки 1Panel MySQL..."
echo "Проверяем статус MySQL в 1Panel:"
docker ps | grep mysql || echo "❌ MySQL контейнер не найден"

echo ""
echo "4️⃣ Проверяем переменные окружения..."
echo "MYSQL_HOST: $MYSQL_HOST"
echo "MYSQL_PORT: $MYSQL_PORT"
echo "MYSQL_DATABASE: $MYSQL_DATABASE"
echo "MYSQL_USER: $MYSQL_USER"

echo ""
echo "5️⃣ Пробуем подключиться к MySQL вручную..."
echo "Попытка подключения через mysql client..."
mysql -h 185.237.95.34 -P 3306 -u Admin -p"KotKompot" -e "SELECT 1;" 2>&1 || echo "❌ Прямое подключение не удалось"

echo ""
echo "6️⃣ Проверяем альтернативные подключения..."
echo "Пробуем localhost (если MySQL на том же сервере):"
nc -zv localhost 3306 2>&1 || echo "❌ Localhost:3306 недоступен"

echo ""
echo "7️⃣ Проверяем Docker сети..."
echo "Сети Docker:"
docker network ls

echo ""
echo "8️⃣ Проверяем конфигурацию 1Panel..."
echo "Ищем 1Panel контейнеры:"
docker ps | grep 1panel

echo ""
echo "✅ Диагностика завершена"
echo ""
echo "💡 ВОЗМОЖНЫЕ РЕШЕНИЯ:"
echo "1. Проверить настройки MySQL в 1Panel"
echo "2. Убедиться что MySQL принимает внешние подключения"
echo "3. Проверить firewall правила"
echo "4. Использовать внутренний IP или hostname контейнера MySQL"
