#!/bin/bash

set -e

echo "🚀 Запуск Django backend..."

# Ожидание готовности базы данных
echo "📡 Проверяем подключение к базе данных..."
python manage.py migrate --check 2>/dev/null || {
    echo "⏳ Ожидаем готовность базы данных..."
    for i in {1..30}; do
        if python manage.py migrate --check >/dev/null 2>&1; then
            echo "✅ База данных готова!"
            break
        fi
        echo "   Попытка $i/30..."
        sleep 2
    done
}

# Применяем миграции
echo "🗄️ Применяем миграции..."
python manage.py migrate

# Собираем статические файлы
echo "📁 Собираем статические файлы..."
python manage.py collectstatic --noinput --clear

# Проверяем что статические файлы собрались
echo "🔍 Проверяем статические файлы..."
ls -la /app/staticfiles/admin/ | head -5

echo "🎉 Backend готов к запуску!"

# Запускаем Gunicorn
exec gunicorn dkor_crm.wsgi:application --bind 0.0.0.0:8000
