# Этап 1: Сборка Vue.js приложения
# Используем официальный образ Node.js для сборки фронтенда.
# Выбрана версия 20-alpine для уменьшения размера образа.
FROM node:20-alpine AS build-stage

# Устанавливаем рабочую директорию внутри контейнера.
WORKDIR /app

# Копируем файлы package.json и package-lock.json (или yarn.lock),
# чтобы сначала установить зависимости, используя преимущества кэширования слоев Docker.
COPY package*.json ./

# Устанавливаем зависимости проекта.
# Используйте npm ci, если у вас есть package-lock.json для более детерминированной установки.
RUN npm install

# Копируем остальные файлы проекта Vue.js.
COPY . .

# Запускаем сборку Vue.js приложения.
# Убедитесь, что команда `npm run build` генерирует статические файлы в директорию `dist`.
RUN npm run build

# Этап 2: Обслуживание статических файлов с помощью Nginx
# Используем легковесный образ Nginx для обслуживания собранного фронтенда.
FROM nginx:stable-alpine AS production-stage

# Копируем собранные статические файлы из предыдущей стадии `build-stage`
# в директорию, откуда Nginx по умолчанию обслуживает статику.
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Опционально: Копируем вашу кастомную конфигурацию Nginx.
# Если ваш Vue.js проект использует "history mode" для маршрутизации,
# вам потребуется специальная конфигурация Nginx для перенаправления всех запросов на index.html.
# Создайте файл nginx.conf в вашей папке VueProject и скопируйте его сюда.
# Пример простого nginx.conf для history mode:
# ```nginx
# server {
#     listen 80;
#     server_name localhost;
#
#     location / {
#         root   /usr/share/nginx/html;
#         index  index.html index.htm;
#         try_files $uri $uri/ /index.html; # Важно для history mode
#     }
#
#     error_page   500 502 503 504  /50x.html;
#     location = /50x.html {
#         root   /usr/share/nginx/html;
#     }
# }
# ```
# Если у вас нет кастомной конфигурации и вы не используете history mode, эту строку можно закомментировать.
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Открываем порт 80, который Nginx будет использовать для обслуживания приложения.
EXPOSE 80

# Команда, которая будет выполняться при запуске контейнера: запуск Nginx в режиме демона.
CMD ["nginx", "-g", "daemon off;"]