# Используем официальный образ Python
FROM python:3.11-slim

# Устанавливаем переменные окружения
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Устанавливаем зависимости системы
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    libmysqlclient-dev \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем только requirements.txt для кэширования зависимостей
COPY requirements.txt /app/

# Устанавливаем зависимости Python
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Копируем остальные файлы проекта
COPY . /app

# Открываем порт для приложения
EXPOSE 8000

# Команда для запуска приложения
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "project_name.wsgi:application"]
