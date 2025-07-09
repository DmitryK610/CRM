#!/bin/bash

echo "🔄 Исправляем конфликты git и обновляем репозиторий"

echo "1️⃣ Сохраняем локальные изменения..."
git stash push -m "Backup local scripts before merge"

echo ""
echo "2️⃣ Получаем обновления из репозитория..."
git pull origin development

echo ""
echo "3️⃣ Восстанавливаем локальные скрипты..."
git stash pop || echo "Stash уже пуст или применен"

echo ""
echo "4️⃣ Проверяем статус файлов..."
git status

echo ""
echo "5️⃣ Добавляем все файлы для коммита..."
git add .

echo ""
echo "6️⃣ Коммитим объединенные изменения..."
git commit -m "Merge local scripts with repository updates" || echo "Нет изменений для коммита"

echo ""
echo "7️⃣ Отправляем обновления в репозиторий..."
git push origin development

echo ""
echo "✅ Конфликты разрешены, репозиторий обновлен!"
echo "🚀 Теперь можно запустить setup_openresty.sh"
