# PriceListEditor Component

## Описание

Компонент `PriceListEditor` предназначен для отображения и редактирования всех констант прайс-листа из backend-класса `PriceList`. Компонент позволяет администраторам изменять цены на различные услуги и материалы.

## Структура файлов

```
src/
├── components/
│   └── pricing/
│       └── PriceListEditor.vue           # Основной компонент редактирования
├── views/
│   └── PriceListView.vue                 # View-обертка для маршрутизации
├── stores/
│   └── priceListStore.ts                 # Pinia store для управления состоянием
├── types/
│   └── priceList.ts                      # TypeScript типы
└── api/
    └── priceList.ts                      # API методы
```

## Константы из backend

Компонент работает со следующими константами из класса `PriceList`:

### Основные услуги

- `MEASUREMENT` - Стоимость замера (руб.)
- `SURFACE_BONDING_PER_M` - Склейка поверхности (руб./м²)
- `EDGE_TYPE_PER_M` - Кромка (руб./м)
- `DRAINAGE_TYPE_PER_M` - Водоотбойник (руб./м)
- `FRONT_BEND_PER_M` - Подгиб фронтальный (руб./м)
- `DELIVERY_TYPE` - Доставка (руб.)

### Отверстия и вырезы

- `VENTILATION_HOLE_PER_UNIT` - Вентиляционное отверстие (руб./шт)
- `COOKTOP_CUTOUT_PER_UNIT` - Вырез под варочную панель (руб./шт)
- `OVERLAY_SINK_CUTOUT_PER_UNIT` - Вырез под накладную мойку (руб./шт)
- `UNDERMOUNT_SINK_INSTALLATION_PER_UNIT` - Установка подстольной мойки (руб./шт)

### Дополнительные услуги

- `ON_SITE_JOINING_PER_UNIT` - Стыковка на объекте (руб./шт)
- `RADIUS_10_300_PER_UNIT` - Радиус 10-300 мм (руб./шт)
- `RADIUS_300_1000_PER_UNIT` - Радиус 300-1000 мм (руб./шт)
- `VERTICAL_RADIUS_PER_UNIT` - Вертикальный радиус (руб./шт)
- `TWO_PLANE_PRODUCT_PER_UNIT` - Двухплоскостное изделие (руб./шт)

## Функциональность

### Основные возможности

- ✅ Отображение всех текущих значений прайс-листа
- ✅ Редактирование значений в удобных формах
- ✅ Валидация введенных данных
- ✅ Сохранение изменений через API
- ✅ Отмена несохраненных изменений
- ✅ Сброс к значениям по умолчанию
- ✅ Уведомления об успешных операциях и ошибках
- ✅ Адаптивный дизайн для мобильных устройств

### Состояние изменений

- Кнопки "Сохранить" и "Отменить" активны только при наличии изменений
- Визуальная индикация состояния загрузки
- Автоматическое отслеживание изменений значений

## API Endpoints

Компонент ожидает следующие API endpoints:

```typescript
GET / api / price - list // Получение текущего прайс-листа
PUT / api / price - list // Обновление прайс-листа
POST / api / price - list / reset // Сброс к значениям по умолчанию
```

## Backend Integration

### Django Model (пример)

```python
from django.db import models
from decimal import Decimal

class PriceList(models.Model):
    measurement = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("5000.00"))
    surface_bonding_per_m = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("3000.00"))
    edge_type_per_m = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("2000.00"))
    # ... остальные поля

    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey('auth.User', on_delete=models.SET_NULL, null=True)

    class Meta:
        verbose_name = "Прайс-лист"
        verbose_name_plural = "Прайс-листы"
```

### Django Views (пример)

```python
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class PriceListView(APIView):
    def get(self, request):
        price_list = PriceList.objects.first()
        serializer = PriceListSerializer(price_list)
        return Response(serializer.data)

    def put(self, request):
        price_list = PriceList.objects.first()
        serializer = PriceListSerializer(price_list, data=request.data)
        if serializer.is_valid():
            serializer.save(updated_by=request.user)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
```

## Использование

### В роутере

```typescript
{
  path: 'price-list',
  name: 'PriceList',
  component: PriceListView,
}
```

### Прямое использование компонента

```vue
<template>
  <PriceListEditor />
</template>

<script setup>
import PriceListEditor from '@/components/pricing/PriceListEditor.vue'
</script>
```

### Использование store

```typescript
import { usePriceListStore } from '@/stores/priceListStore'

const priceListStore = usePriceListStore()

// Загрузка данных
await priceListStore.loadPriceList()

// Обновление данных
await priceListStore.updatePriceList(newData)

// Сброс к умолчанию
await priceListStore.resetToDefaults()
```

## Безопасность

- Компонент требует аутентификации пользователя
- Рекомендуется ограничить доступ к редактированию прайс-листа только администраторам
- Все изменения должны логироваться на backend

## Стилизация

Компонент использует:

- Flex-макеты для адаптивности
- CSS Grid для организации форм
- Консистентную цветовую схему с остальным приложением
- Hover-эффекты и transitions для лучшего UX

## Тестирование

Рекомендуется протестировать:

- Загрузку данных при первом открытии
- Валидацию полей (положительные числа)
- Сохранение и отмену изменений
- Сброс к значениям по умолчанию
- Обработку ошибок API
- Адаптивность на мобильных устройствах
