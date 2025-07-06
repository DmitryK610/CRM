# Используем официальный образ Python
FROM python:3.11-slim

# Устанавливаем переменные окружения
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DJANGO_SETTINGS_MODULE=dkor_crm.settings \
    PIP_NO_CACHE_DIR=1

# Устанавливаем системные зависимости
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        gcc \
        python3-dev \
        default-libmysqlclient-dev \
        pkg-config \
        curl \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Создаем пользователя приложения
RUN useradd -m appuser && mkdir /app && chown appuser:appuser /app

WORKDIR /app

# Копируем зависимости
COPY --chown=appuser:appuser requirements.txt .

# Устанавливаем зависимости
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Копируем приложение
COPY --chown=appuser:appuser . .

# Проверка структуры проекта (для отладки)
RUN ["ls", "-la", "/app/dkor_crm"]

# Переключаем пользователя
USER appuser

# Открываем порт
EXPOSE 8000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health/ || exit 1

# Команда запуска
CMD ["gunicorn", "dkor_crm.wsgi:application", "--bind", "0.0.0.0:8000"]