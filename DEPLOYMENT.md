# Инструкция по развертыванию на VPS сервере с HTTPS

## Архитектура развертывания

1. **Nginx/OpenResty** - на портах 80 (редирект) и 443 (HTTPS)
2. **MySQL** - на порту 3306 (база данных)
3. **Let's Encrypt** - автоматические SSL сертификаты
4. **Docker Compose** с двумя контейнерами:
   - **Frontend** (Vue.js + nginx) - localhost:8080
   - **Backend** (Django + Gunicorn) - localhost:8000

## Подготовка сервера

### 1. Установите Docker и Docker Compose
```bash
# Обновляем систему
sudo apt update && sudo apt upgrade -y

# Устанавливаем Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Добавляем пользователя в группу docker
sudo usermod -aG docker $USER

# Устанавливаем Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Настройте MySQL
```bash
# Установите MySQL Server
sudo apt install mysql-server -y

# Настройте безопасность
sudo mysql_secure_installation

# Создайте базу данных и пользователя
sudo mysql -u root -p
```

```sql
CREATE DATABASE dkor_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'Admin'@'%' IDENTIFIED BY 'KotKompot';
GRANT ALL PRIVILEGES ON dkor_db.* TO 'Admin'@'%';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Настройте Nginx/OpenResty с SSL
```bash
# Установите Nginx
sudo apt install nginx -y

# Установите Certbot для SSL сертификатов
sudo apt install snapd -y
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot
sudo ln -sf /snap/bin/certbot /usr/bin/certbot

# Создайте директорию для challenge
sudo mkdir -p /var/www/certbot

# Скопируйте конфигурацию
sudo cp openresty.conf /etc/nginx/sites-available/dkor.pro
sudo ln -s /etc/nginx/sites-available/dkor.pro /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Получите SSL сертификат (замените на ваш домен)
sudo certbot certonly --webroot \
    --webroot-path=/var/www/certbot \
    --email admin@dkor.pro \
    --agree-tos \
    --no-eff-email \
    -d dkor.pro \
    -d www.dkor.pro

# Проверьте конфигурацию и перезапустите
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

# Настройте автоматическое обновление сертификата
sudo crontab -l | { cat; echo "0 12 * * * /usr/bin/certbot renew --quiet && systemctl reload nginx"; } | sudo crontab -
```

## Развертывание приложения

### 1. Клонируйте репозиторий
```bash
git clone https://github.com/DmitryK610/CRM.git
cd CRM
```

### 2. Настройте переменные окружения
Убедитесь, что в `.env` файле указаны правильные настройки:
```env
MYSQL_HOST="185.237.95.34"  # IP вашего сервера
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=dkor.pro,www.dkor.pro,localhost,127.0.0.1,backend-api,185.237.95.34
```

### 3. Соберите и запустите контейнеры
```bash
# Собираем образы
docker-compose build

# Запускаем контейнеры
docker-compose up -d

# Проверяем статус
docker-compose ps
```

### 4. Выполните миграции и соберите статические файлы
```bash
# Выполняем миграции
docker-compose exec backend python manage.py migrate

# Собираем статические файлы Django (важно для HTTPS)
docker-compose exec backend python manage.py collectstatic --noinput

# Создаем суперпользователя
docker-compose exec backend python manage.py createsuperuser
```

### 5. Проверьте работоспособность
- Фронтенд: https://dkor.pro
- API: https://dkor.pro/api/
- Админ панель: https://dkor.pro/admin/
- Healthcheck: https://dkor.pro/health/ping/
- HTTP автоматически перенаправляется на HTTPS

## Обслуживание

### Просмотр логов
```bash
# Логи всех сервисов
docker-compose logs

# Логи конкретного сервиса
docker-compose logs backend
docker-compose logs frontend
```

### Обновление приложения
```bash
# Получаем последние изменения
git pull

# Пересобираем и перезапускаем
docker-compose down
docker-compose build
docker-compose up -d

# Выполняем миграции если нужно
docker-compose exec backend python manage.py migrate
```

### Резервное копирование базы данных
```bash
# Создание бэкапа
mysqldump -u Admin -p dkor_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Восстановление из бэкапа
mysql -u Admin -p dkor_db < backup_file.sql
```

## Мониторинг

### Проверка состояния контейнеров
```bash
docker-compose ps
docker-compose top
```

### Проверка использования ресурсов
```bash
docker stats
```

### Автоматический перезапуск
Контейнеры настроены с `restart: unless-stopped`, поэтому они автоматически перезапустятся при сбое или перезагрузке сервера.

## Безопасность и SSL

### Настройка файрвола
```bash
# Активируем UFW
sudo ufw enable

# Разрешаем SSH (ВАЖНО: сделайте это ПЕРВЫМ!)
sudo ufw allow ssh

# Разрешаем HTTP и HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Запрещаем прямой доступ к Docker портам
sudo ufw deny 8000
sudo ufw deny 8080

# Проверяем статус
sudo ufw status verbose
```

### SSL сертификаты
- Сертификаты обновляются автоматически через cron
- Проверка: `sudo certbot renew --dry-run`
- Статус: `sudo certbot certificates`

## Решение проблем

### Контейнеры не запускаются
1. Проверьте логи: `docker-compose logs`
2. Убедитесь, что порты не заняты: `netstat -tulpn | grep :8000`
3. Проверьте подключение к базе данных

### Админ панель не загружает стили
1. Убедитесь, что статические файлы собраны: `docker-compose exec backend python manage.py collectstatic`
2. Проверьте настройки STATIC_URL и STATIC_ROOT в settings.py

### Проблемы с CORS
1. Проверьте настройки CORS_ALLOWED_ORIGINS в .env
2. Убедитесь, что домен правильно указан в DJANGO_ALLOWED_HOSTS
