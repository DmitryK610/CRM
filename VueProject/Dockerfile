# Этап 1: Сборка Vue.js приложения
FROM node:20-alpine AS build-stage

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Этап 2: Обслуживание статических файлов с помощью Nginx
FROM nginx:stable-alpine AS production-stage

COPY --from=build-stage /app/dist /usr/share/nginx/html

# Копируем кастомную конфигурацию Nginx (если используется vue-router в режиме history)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]