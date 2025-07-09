#!/bin/bash

# =============================================================================
# Скрипт для развертывания и управления CRM проектом
# =============================================================================

set -e  # Остановка при любой ошибке

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функции для цветного вывода
info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Проверка наличия Docker и Docker Compose
check_requirements() {
    info "Проверяем требования..."
    
    if ! command -v docker &> /dev/null; then
        error "Docker не установлен. Установите Docker и повторите попытку."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose не установлен. Установите Docker Compose и повторите попытку."
        exit 1
    fi
    
    success "Docker и Docker Compose установлены"
}

# Проверка файлов конфигурации
check_config() {
    info "Проверяем конфигурационные файлы..."
    
    if [ ! -f ".env" ]; then
        error "Файл .env не найден!"
        exit 1
    fi
    
    if [ ! -f "docker-compose.yml" ]; then
        error "Файл docker-compose.yml не найден!"
        exit 1
    fi
    
    success "Конфигурационные файлы найдены"
}

# Остановка и удаление контейнеров
stop_containers() {
    info "Останавливаем контейнеры..."
    docker-compose down --remove-orphans
    success "Контейнеры остановлены"
}

# Удаление образов
clean_images() {
    info "Удаляем старые образы..."
    
    # Удаляем образы проекта
    docker images | grep -E "(project_|crm)" | awk '{print $3}' | xargs -r docker rmi -f
    
    # Удаляем неиспользуемые образы
    docker image prune -f
    
    success "Старые образы удалены"
}

# Полная очистка Docker
full_cleanup() {
    warning "Выполняем полную очистку Docker (будут удалены ВСЕ неиспользуемые ресурсы)..."
    read -p "Вы уверены? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker system prune -a -f --volumes
        success "Полная очистка завершена"
    else
        info "Полная очистка отменена"
    fi
}

# Сборка образов
build_images() {
    info "Собираем образы..."
    docker-compose build --no-cache
    success "Образы собраны"
}

# Запуск контейнеров
start_containers() {
    info "Запускаем контейнеры..."
    docker-compose up -d
    
    info "Ожидаем запуск backend..."
    sleep 30
    
    # Проверяем статус
    docker-compose ps
    success "Контейнеры запущены"
}

# Применение миграций
apply_migrations() {
    info "Применяем миграции базы данных..."
    
    # Ждем пока backend станет здоровым
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if docker-compose exec -T backend python manage.py migrate --check &> /dev/null; then
            break
        fi
        sleep 2
        ((attempt++))
        info "Ожидаем готовность backend... ($attempt/$max_attempts)"
    done
    
    if [ $attempt -eq $max_attempts ]; then
        error "Backend не готов после $max_attempts попыток"
        return 1
    fi
    
    docker-compose exec -T backend python manage.py migrate
    success "Миграции применены"
}

# Сбор статических файлов
collect_static() {
    info "Статические файлы собираются автоматически при запуске контейнера"
    success "Статические файлы готовы"
}

# Создание суперпользователя
create_superuser() {
    info "Создание суперпользователя..."
    read -p "Создать суперпользователя? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose exec backend python manage.py createsuperuser
        success "Суперпользователь создан"
    else
        info "Создание суперпользователя пропущено"
    fi
}

# Проверка работоспособности
health_check() {
    info "Проверяем работоспособность сервисов..."
    
    # Проверяем backend
    if curl -f http://localhost:8000/health/ping/ &> /dev/null; then
        success "Backend работает (http://localhost:8000)"
    else
        error "Backend не отвечает"
    fi
    
    # Проверяем frontend
    if curl -f http://localhost:8080/ &> /dev/null; then
        success "Frontend работает (http://localhost:8080)"
    else
        error "Frontend не отвечает"
    fi
}

# Просмотр логов
show_logs() {
    info "Показываем логи последние 50 строк..."
    docker-compose logs --tail=50
}

# Мониторинг в реальном времени
monitor() {
    info "Запускаем мониторинг в реальном времени (Ctrl+C для выхода)..."
    docker-compose logs -f
}

# Резервное копирование volumes
backup_volumes() {
    info "Создаем резервную копию volumes..."
    local backup_dir="./backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_dir"
    
    # Backup static files
    docker run --rm -v project_static_volume:/data -v "$(pwd)/$backup_dir":/backup alpine tar czf /backup/static_backup.tar.gz -C /data .
    
    # Backup media files
    docker run --rm -v project_media_volume:/data -v "$(pwd)/$backup_dir":/backup alpine tar czf /backup/media_backup.tar.gz -C /data .
    
    success "Резервная копия создана в $backup_dir"
}

# Получение обновлений из репозитория
update_from_repo() {
    info "Получаем обновления из репозитория..."
    
    # Проверяем что мы в git репозитории
    if [ ! -d ".git" ]; then
        error "Это не git репозиторий!"
        return 1
    fi
    
    # Показываем текущую ветку
    current_branch=$(git branch --show-current)
    info "Текущая ветка: $current_branch"
    
    # Получаем обновления
    git fetch origin
    git pull origin "$current_branch"
    
    success "Обновления получены"
}

# Полное развертывание
full_deploy() {
    info "🚀 Начинаем полное развертывание..."
    
    check_requirements
    check_config
    stop_containers
    clean_images
    build_images
    start_containers
    apply_migrations
    collect_static
    health_check
    create_superuser
    
    success "🎉 Развертывание завершено успешно!"
    info "Сервисы доступны по адресам:"
    info "  - Frontend: http://localhost:8080"
    info "  - Backend API: http://localhost:8000/api/"
    info "  - Admin: http://localhost:8000/admin/"
}

# Быстрое обновление
quick_update() {
    info "⚡ Быстрое обновление..."
    
    stop_containers
    update_from_repo
    build_images
    start_containers
    apply_migrations
    collect_static
    health_check
    
    success "Обновление завершено!"
}

# Показать статус
show_status() {
    info "Статус контейнеров:"
    docker-compose ps
    
    echo
    info "Использование ресурсов:"
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
    
    echo
    info "Информация о volumes:"
    docker volume ls | grep project
}

# Справка
show_help() {
    echo "CRM Project Deployment Script"
    echo "Использование: $0 [команда]"
    echo
    echo "Команды:"
    echo "  deploy         - Полное развертывание проекта"
    echo "  update         - Быстрое обновление из репозитория"
    echo "  start          - Запустить контейнеры"
    echo "  stop           - Остановить контейнеры"
    echo "  restart        - Перезапустить контейнеры"
    echo "  rebuild        - Пересобрать и перезапустить"
    echo "  status         - Показать статус сервисов"
    echo "  logs           - Показать логи"
    echo "  monitor        - Мониторинг в реальном времени"
    echo "  migrate        - Применить миграции"
    echo "  collectstatic  - Собрать статические файлы"
    echo "  superuser      - Создать суперпользователя"
    echo "  backup         - Создать резервную копию"
    echo "  cleanup        - Очистка Docker ресурсов"
    echo "  health         - Проверка работоспособности"
    echo "  help           - Показать эту справку"
    echo
    echo "Примеры:"
    echo "  $0 deploy      # Полное развертывание"
    echo "  $0 update      # Быстрое обновление"
    echo "  $0 logs        # Просмотр логов"
}

# Основная логика
case "${1:-help}" in
    "deploy")
        full_deploy
        ;;
    "update")
        quick_update
        ;;
    "start")
        check_config
        start_containers
        ;;
    "stop")
        stop_containers
        ;;
    "restart")
        stop_containers
        start_containers
        ;;
    "rebuild")
        stop_containers
        build_images
        start_containers
        ;;
    "status")
        show_status
        ;;
    "logs")
        show_logs
        ;;
    "monitor")
        monitor
        ;;
    "migrate")
        apply_migrations
        ;;
    "collectstatic")
        collect_static
        ;;
    "superuser")
        create_superuser
        ;;
    "backup")
        backup_volumes
        ;;
    "cleanup")
        full_cleanup
        ;;
    "health")
        health_check
        ;;
    "help"|*)
        show_help
        ;;
esac
