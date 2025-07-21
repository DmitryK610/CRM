# PowerShell скрипт для обновления CRM системы на Ubuntu сервере
# Этот скрипт запускается с Windows и выполняет команды на удаленном сервере

param(
    [string]$ServerIP = "ваш_ip_сервера",
    [string]$Username = "root"
)

Write-Host "🚀 Подключаемся к серверу $ServerIP..." -ForegroundColor Green

# Команды для выполнения на сервере
$Commands = @"
cd ~/CRM
echo '🚀 Начинаем обновление CRM системы...'

echo '📦 Останавливаем контейнеры CRM...'
docker-compose stop frontend backend
docker-compose rm -f frontend backend

echo '🗑️ Удаляем старые образы...'
docker rmi -f crm-frontend crm-backend 2>/dev/null || true

echo '🧹 Очищаем неиспользуемые ресурсы...'
docker container prune -f
docker image prune -f

echo '📥 Обновляем код из Git...'
git add . 2>/dev/null || true
git stash 2>/dev/null || true
git fetch origin
git reset --hard origin/main
git pull origin main

echo '🏗️ Пересобираем контейнеры...'
docker-compose build --no-cache frontend backend

echo '🚀 Запускаем контейнеры...'
docker-compose up -d frontend backend

echo '⏳ Ожидаем запуска...'
sleep 15

echo '🔍 Проверяем статус...'
docker-compose ps

echo '🏥 Проверяем здоровье системы...'
curl -f http://127.0.0.1:8000/health/ping/ 2>/dev/null && echo 'Backend OK' || echo 'Backend ERROR'
curl -f http://127.0.0.1:8080 2>/dev/null && echo 'Frontend OK' || echo 'Frontend ERROR'

echo '📊 Проверяем HTTPS...'
echo "Frontend: `$(curl -s -o /dev/null -w '%{http_code}' https://dkor.pro)"
echo "Backend: `$(curl -s -o /dev/null -w '%{http_code}' https://dkor.pro/api/suppliers/)"

echo '✅ Обновление завершено!'
echo '🌍 Сайт: https://dkor.pro'
"@

# Выполняем команды на сервере через SSH
Write-Host "Выполняем обновление на сервере..." -ForegroundColor Yellow

# Вариант 1: Если у вас настроен SSH ключ
try {
    ssh $Username@$ServerIP $Commands
    Write-Host "✅ Обновление успешно завершено!" -ForegroundColor Green
}
catch {
    Write-Host "❌ Ошибка подключения к серверу" -ForegroundColor Red
    Write-Host "Попробуйте выполнить команды вручную:" -ForegroundColor Yellow
    Write-Host $Commands -ForegroundColor Cyan
}

# Вариант 2: Если SSH ключ не настроен, показываем команды для ручного выполнения
Write-Host "`n🔧 Альтернативно, подключитесь к серверу и выполните:" -ForegroundColor Yellow
Write-Host "ssh $Username@$ServerIP" -ForegroundColor Cyan
Write-Host "Затем скопируйте и выполните команды из файла update_crm.sh" -ForegroundColor Cyan
