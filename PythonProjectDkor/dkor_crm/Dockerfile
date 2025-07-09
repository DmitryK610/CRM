# Используем официальный образ Python
FROM python:3.11-slim

# Устанавливаем переменные окружения
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DJANGO_SETTINGS_MODULE=dkor_crm.settings \
    PIP_NO_CACHE_DIR=1

# Принимаем build args для переменных окружения
ARG DJANGO_SECRET_KEY
ARG DJANGO_DEBUG=False
ARG DJANGO_ALLOWED_HOSTS
ARG MYSQL_DATABASE
ARG MYSQL_USER
ARG MYSQL_PASSWORD
ARG MYSQL_HOST
ARG MYSQL_PORT

# Устанавливаем переменные окружения из build args (только для сборки)
ENV DJANGO_SECRET_KEY=${DJANGO_SECRET_KEY}
ENV DJANGO_DEBUG=${DJANGO_DEBUG}
ENV DJANGO_ALLOWED_HOSTS=${DJANGO_ALLOWED_HOSTS}
ENV MYSQL_DATABASE=${MYSQL_DATABASE}
ENV MYSQL_USER=${MYSQL_USER}
ENV MYSQL_PASSWORD=${MYSQL_PASSWORD}
ENV MYSQL_HOST=${MYSQL_HOST}
ENV MYSQL_PORT=${MYSQL_PORT}

# Устанавливаем системные зависимости, необходимые для компиляции некоторых Python-пакетов
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        gcc \
        python3-dev \
        default-libmysqlclient-dev \
        pkg-config \
        curl \
    && apt-get clean && rm -rf /var/lib/apt/lists/* # Очистка кэша после установки

# Создаем пользователя приложения для повышения безопасности
RUN useradd -m appuser && mkdir /app && chown appuser:appuser /app

WORKDIR /app

# Копируем файл зависимостей
COPY --chown=appuser:appuser requirements.txt .

# Устанавливаем зависимости Python
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Копируем весь код вашего приложения
COPY --chown=appuser:appuser . .

# Проверка структуры проекта (может быть полезно для отладки, но не обязательно)
# RUN ["ls", "-la", "/app/dkor_crm"]

# !!! ДОБАВЛЕНА ЭТА СТРОКА !!!
# Создаем директории для статических и медиа файлов
RUN mkdir -p /app/staticfiles /app/media && chown -R appuser:appuser /app/staticfiles /app/media

# Собираем статические файлы Django (теперь переменные окружения доступны)
RUN python manage.py collectstatic --noinput

# Копируем entrypoint скрипт
COPY --chown=appuser:appuser entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Переключаем пользователя на созданного 'appuser'
USER appuser

# Открываем порт, который прослушивает Gunicorn
EXPOSE 8000

# Healthcheck для Docker Compose
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health/ || exit 1

# Команда запуска через entrypoint скрипт
ENTRYPOINT ["/app/entrypoint.sh"]