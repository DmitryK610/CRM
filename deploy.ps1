# =============================================================================
# PowerShell скрипт для развертывания и управления CRM проектом
# =============================================================================

param(
    [Parameter(Position=0)]
    [string]$Command = "help"
)

# Функции для цветного вывода
function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

# Проверка наличия Docker и Docker Compose
function Test-Requirements {
    Write-Info "Проверяем требования..."
    
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Error "Docker не установлен. Установите Docker и повторите попытку."
        exit 1
    }
    
    if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
        Write-Error "Docker Compose не установлен. Установите Docker Compose и повторите попытку."
        exit 1
    }
    
    Write-Success "Docker и Docker Compose установлены"
}

# Проверка файлов конфигурации
function Test-Config {
    Write-Info "Проверяем конфигурационные файлы..."
    
    if (-not (Test-Path ".env")) {
        Write-Error "Файл .env не найден!"
        exit 1
    }
    
    if (-not (Test-Path "docker-compose.yml")) {
        Write-Error "Файл docker-compose.yml не найден!"
        exit 1
    }
    
    Write-Success "Конфигурационные файлы найдены"
}

# Остановка и удаление контейнеров
function Stop-Containers {
    Write-Info "Останавливаем контейнеры..."
    docker-compose down --remove-orphans
    Write-Success "Контейнеры остановлены"
}

# Удаление образов
function Remove-Images {
    Write-Info "Удаляем старые образы..."
    
    # Получаем образы проекта
    $images = docker images --format "{{.Repository}}:{{.Tag}}" | Where-Object { $_ -match "project_|crm" }
    
    if ($images) {
        $images | ForEach-Object { docker rmi $_ -f }
    }
    
    # Удаляем неиспользуемые образы
    docker image prune -f
    
    Write-Success "Старые образы удалены"
}

# Полная очистка Docker
function Invoke-FullCleanup {
    Write-Warning "Выполняем полную очистку Docker (будут удалены ВСЕ неиспользуемые ресурсы)..."
    $confirm = Read-Host "Вы уверены? (y/N)"
    
    if ($confirm -eq "y" -or $confirm -eq "Y") {
        docker system prune -a -f --volumes
        Write-Success "Полная очистка завершена"
    } else {
        Write-Info "Полная очистка отменена"
    }
}

# Сборка образов
function Build-Images {
    Write-Info "Собираем образы..."
    docker-compose build --no-cache
    Write-Success "Образы собраны"
}

# Запуск контейнеров
function Start-Containers {
    Write-Info "Запускаем контейнеры..."
    docker-compose up -d
    
    Write-Info "Ожидаем запуск backend..."
    Start-Sleep -Seconds 30
    
    # Проверяем статус
    docker-compose ps
    Write-Success "Контейнеры запущены"
}

# Применение миграций
function Invoke-Migrations {
    Write-Info "Применяем миграции базы данных..."
    
    # Ждем пока backend станет здоровым
    $maxAttempts = 30
    $attempt = 0
    
    do {
        try {
            docker-compose exec -T backend python manage.py migrate --check 2>$null
            break
        } catch {
            Start-Sleep -Seconds 2
            $attempt++
            Write-Info "Ожидаем готовность backend... ($attempt/$maxAttempts)"
        }
    } while ($attempt -lt $maxAttempts)
    
    if ($attempt -eq $maxAttempts) {
        Write-Error "Backend не готов после $maxAttempts попыток"
        return
    }
    
    docker-compose exec -T backend python manage.py migrate
    Write-Success "Миграции применены"
}

# Сбор статических файлов
function Invoke-CollectStatic {
    Write-Info "Собираем статические файлы..."
    docker-compose exec -T backend python manage.py collectstatic --noinput
    Write-Success "Статические файлы собраны"
}

# Создание суперпользователя
function New-SuperUser {
    Write-Info "Создание суперпользователя..."
    $create = Read-Host "Создать суперпользователя? (y/N)"
    
    if ($create -eq "y" -or $create -eq "Y") {
        docker-compose exec backend python manage.py createsuperuser
        Write-Success "Суперпользователь создан"
    } else {
        Write-Info "Создание суперпользователя пропущено"
    }
}

# Проверка работоспособности
function Test-Health {
    Write-Info "Проверяем работоспособность сервисов..."
    
    # Проверяем backend
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/health/ping/" -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Success "Backend работает (http://localhost:8000)"
        }
    } catch {
        Write-Error "Backend не отвечает"
    }
    
    # Проверяем frontend
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080/" -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Success "Frontend работает (http://localhost:8080)"
        }
    } catch {
        Write-Error "Frontend не отвечает"
    }
}

# Просмотр логов
function Show-Logs {
    Write-Info "Показываем логи последние 50 строк..."
    docker-compose logs --tail=50
}

# Мониторинг в реальном времени
function Start-Monitor {
    Write-Info "Запускаем мониторинг в реальном времени (Ctrl+C для выхода)..."
    docker-compose logs -f
}

# Резервное копирование volumes
function Backup-Volumes {
    Write-Info "Создаем резервную копию volumes..."
    $backupDir = "./backups/$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    
    # Backup static files
    docker run --rm -v project_static_volume:/data -v "${PWD}/${backupDir}:/backup" alpine tar czf /backup/static_backup.tar.gz -C /data .
    
    # Backup media files
    docker run --rm -v project_media_volume:/data -v "${PWD}/${backupDir}:/backup" alpine tar czf /backup/media_backup.tar.gz -C /data .
    
    Write-Success "Резервная копия создана в $backupDir"
}

# Получение обновлений из репозитория
function Update-FromRepo {
    Write-Info "Получаем обновления из репозитория..."
    
    # Проверяем что мы в git репозитории
    if (-not (Test-Path ".git")) {
        Write-Error "Это не git репозиторий!"
        return
    }
    
    # Показываем текущую ветку
    $currentBranch = git branch --show-current
    Write-Info "Текущая ветка: $currentBranch"
    
    # Получаем обновления
    git fetch origin
    git pull origin $currentBranch
    
    Write-Success "Обновления получены"
}

# Полное развертывание
function Invoke-FullDeploy {
    Write-Info "🚀 Начинаем полное развертывание..."
    
    Test-Requirements
    Test-Config
    Stop-Containers
    Remove-Images
    Build-Images
    Start-Containers
    Invoke-Migrations
    Invoke-CollectStatic
    Test-Health
    New-SuperUser
    
    Write-Success "🎉 Развертывание завершено успешно!"
    Write-Info "Сервисы доступны по адресам:"
    Write-Info "  - Frontend: http://localhost:8080"
    Write-Info "  - Backend API: http://localhost:8000/api/"
    Write-Info "  - Admin: http://localhost:8000/admin/"
}

# Быстрое обновление
function Invoke-QuickUpdate {
    Write-Info "⚡ Быстрое обновление..."
    
    Stop-Containers
    Update-FromRepo
    Build-Images
    Start-Containers
    Invoke-Migrations
    Invoke-CollectStatic
    Test-Health
    
    Write-Success "Обновление завершено!"
}

# Показать статус
function Show-Status {
    Write-Info "Статус контейнеров:"
    docker-compose ps
    
    Write-Host ""
    Write-Info "Использование ресурсов:"
    docker stats --no-stream --format "table {{.Name}}`t{{.CPUPerc}}`t{{.MemUsage}}`t{{.NetIO}}"
    
    Write-Host ""
    Write-Info "Информация о volumes:"
    docker volume ls | Where-Object { $_ -match "project" }
}

# Справка
function Show-Help {
    Write-Host "CRM Project Deployment Script (PowerShell)"
    Write-Host "Использование: .\deploy.ps1 [команда]"
    Write-Host ""
    Write-Host "Команды:"
    Write-Host "  deploy         - Полное развертывание проекта"
    Write-Host "  update         - Быстрое обновление из репозитория"
    Write-Host "  start          - Запустить контейнеры"
    Write-Host "  stop           - Остановить контейнеры"
    Write-Host "  restart        - Перезапустить контейнеры"
    Write-Host "  rebuild        - Пересобрать и перезапустить"
    Write-Host "  status         - Показать статус сервисов"
    Write-Host "  logs           - Показать логи"
    Write-Host "  monitor        - Мониторинг в реальном времени"
    Write-Host "  migrate        - Применить миграции"
    Write-Host "  collectstatic  - Собрать статические файлы"
    Write-Host "  superuser      - Создать суперпользователя"
    Write-Host "  backup         - Создать резервную копию"
    Write-Host "  cleanup        - Очистка Docker ресурсов"
    Write-Host "  health         - Проверка работоспособности"
    Write-Host "  help           - Показать эту справку"
    Write-Host ""
    Write-Host "Примеры:"
    Write-Host "  .\deploy.ps1 deploy      # Полное развертывание"
    Write-Host "  .\deploy.ps1 update      # Быстрое обновление"
    Write-Host "  .\deploy.ps1 logs        # Просмотр логов"
}

# Основная логика
switch ($Command.ToLower()) {
    "deploy" { Invoke-FullDeploy }
    "update" { Invoke-QuickUpdate }
    "start" { Test-Config; Start-Containers }
    "stop" { Stop-Containers }
    "restart" { Stop-Containers; Start-Containers }
    "rebuild" { Stop-Containers; Build-Images; Start-Containers }
    "status" { Show-Status }
    "logs" { Show-Logs }
    "monitor" { Start-Monitor }
    "migrate" { Invoke-Migrations }
    "collectstatic" { Invoke-CollectStatic }
    "superuser" { New-SuperUser }
    "backup" { Backup-Volumes }
    "cleanup" { Invoke-FullCleanup }
    "health" { Test-Health }
    default { Show-Help }
}
