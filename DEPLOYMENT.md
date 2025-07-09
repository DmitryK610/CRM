# Инструкция по развертыванию на VPS сервере

## Архитектура развертывания

1. **OpenResty (nginx)** - на порту 80 (главный прокси)
2. **MySQL** - на порту 3306 (база данных)
3. **Docker Compose** с двумя контейнерами:
   - **Frontend** (Vue.js + nginx) - порт 8080
   - **Backend** (Django + Gunicorn) - порт 8000

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

### 3. Настройте OpenResty/Nginx
```bash
# Установите OpenResty или Nginx
sudo apt install nginx -y

# Скопируйте конфигурацию
sudo cp nginx.conf /etc/nginx/sites-available/dkor.pro
sudo ln -s /etc/nginx/sites-available/dkor.pro /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Проверьте конфигурацию и перезапустите
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
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

### 4. Выполните миграции и создайте суперпользователя
```bash
# Выполняем миграции
docker-compose exec backend python manage.py migrate

# Создаем суперпользователя
docker-compose exec backend python manage.py createsuperuser
```

### 5. Проверьте работоспособность
- Фронтенд: http://dkor.pro
- API: http://dkor.pro/api/
- Админ панель: http://dkor.pro/admin/
- Healthcheck: http://dkor.pro/health/ping/

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
