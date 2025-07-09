# Этап 1: Сборка Vue.js приложения
FROM node:20-alpine AS build-stage

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build # Собирает ваш Vue.js проект в папку 'dist'

# Этап 2: Обслуживание статических файлов с помощью Nginx
FROM nginx:stable-alpine AS production-stage

# Копируем собранное Vue.js приложение в стандартный каталог Nginx для веб-файлов
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Копируем вашу кастомную конфигурацию Nginx.
# Этот файл будет заменять стандартную конфигурацию Nginx внутри контейнера.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Открываем порт 80, который будет связан с портом 8080 хоста через docker-compose
EXPOSE 80

# Команда запуска Nginx (необходимо для работы в Docker)
CMD ["nginx", "-g", "daemon off;"]