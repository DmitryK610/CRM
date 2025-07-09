#!/bin/bash

echo "🔧 Настройка OpenResty для проксирования CRM приложения"

echo "1️⃣ Создаем конфигурацию OpenResty..."
cat > /tmp/crm_openresty.conf << 'EOF'
server {
    listen 80;
    server_name _;
    
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;
    
    client_max_body_size 100M;
    
    # API запросы к Django backend
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
        proxy_buffering off;
    }
    
    # Админка Django
    location /admin/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
        proxy_buffering off;
    }
    
    # Статические файлы Django
    location /static/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        expires 1d;
        add_header Cache-Control "public, immutable";
    }
    
    # Медиа файлы Django
    location /media/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        expires 1d;
        add_header Cache-Control "public, immutable";
    }
    
    # Health check
    location /health/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Все остальные запросы к Vue.js frontend
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
        proxy_buffering off;
        
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
    
    # Статические ресурсы Vue
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

echo ""
echo "2️⃣ Копируем конфигурацию в контейнер OpenResty..."
docker cp /tmp/crm_openresty.conf 1Panel-openresty-969C:/etc/nginx/conf.d/crm.conf

echo ""
echo "3️⃣ Проверяем конфигурацию OpenResty..."
docker exec 1Panel-openresty-969C nginx -t

echo ""
echo "4️⃣ Перезагружаем OpenResty..."
docker exec 1Panel-openresty-969C nginx -s reload

echo ""
echo "5️⃣ Обновляем docker-compose для внутренней связи..."
docker-compose down

echo ""
echo "6️⃣ Пересобираем контейнеры с новой конфигурацией..."
docker-compose build --no-cache

echo ""
echo "7️⃣ Запускаем контейнеры без внешних портов..."
docker-compose up -d

echo ""
echo "⏱️ Ждем 30 секунд для стабилизации..."
sleep 30

echo ""
echo "📊 Статус контейнеров:"
docker ps

echo ""
echo "🌐 Проверяем доступность через OpenResty:"
echo "Фронтенд (через OpenResty):"
curl -I http://localhost/ || echo "❌ Фронтенд недоступен"

echo ""
echo "API (через OpenResty):"
curl -s http://localhost/api/ | head -3

echo ""
echo "Админка (через OpenResty):"
curl -I http://localhost/admin/ || echo "❌ Админка недоступна"

echo ""
echo "Health check (через OpenResty):"
curl -s http://localhost/health/ping/ || echo "❌ Health check недоступен"

echo ""
echo "✅ Настройка OpenResty завершена!"
echo "🌍 Приложение доступно через OpenResty: http://185.237.95.34"
echo "📱 Откройте в браузере: http://185.237.95.34"
echo "⚙️ Админка: http://185.237.95.34/admin/"
echo "🔗 API: http://185.237.95.34/api/"

echo ""
echo "🔍 Логи OpenResty:"
docker logs --tail 5 1Panel-openresty-969C
