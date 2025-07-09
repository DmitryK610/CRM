# Скрипт для принудительного обновления сервера с последними изменениями
# Используется когда есть локальные конфликты на сервере

Write-Host "=== ПРИНУДИТЕЛЬНОЕ ОБНОВЛЕНИЕ СЕРВЕРА ==="
Write-Host "Это удалит все локальные изменения и заменит их версией из репозитория"

Set-Location "c:\Users\user\Desktop\Project"

# Остановка контейнеров
Write-Host "Останавливаем контейнеры..."
docker-compose down

# Сохранение текущих изменений в stash (на всякий случай)
Write-Host "Сохраняем локальные изменения в stash..."
git stash push -m "Local changes before force update $(Get-Date)"

# Принудительный сброс к HEAD
Write-Host "Сбрасываем к HEAD..."
git reset --hard HEAD

# Получение последних изменений
Write-Host "Получаем последние изменения из репозитория..."
git fetch origin development

# Принудительное слияние
Write-Host "Принудительно обновляемся до последней версии..."
git reset --hard origin/development

# Проверка статуса
Write-Host "Статус после обновления:"
git status

Write-Host "=== ОБНОВЛЕНИЕ ЗАВЕРШЕНО ==="
Write-Host "Теперь можно пересобрать и запустить контейнеры:"
Write-Host "docker-compose build --no-cache"
Write-Host "docker-compose up -d"
