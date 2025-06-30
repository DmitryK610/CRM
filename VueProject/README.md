# vue-project

This template should help get you started developing with Vue 3 in Vite.

## Возможности проекта

### Калькулятор стоимости изделий из камня

Приложение включает в себя комплексную систему расчета стоимости изделий из камня с следующими возможностями:

#### Основные параметры расчета:

- **Выбор камня** - выбор материала по названию
- **Площадь изделия** - указание площади в квадратных метрах
- **Замер** - опция необходимости замера изделия
- **Склейка поверхностей** - для изделий шириной более 750мм (в м.п.)
- **Торцевая кромка** - выбор типа (радиусная/фигурная) и длины в м.п.
- **Водоотбойник** - выбор типа (накладной/интегрированный) и длины в м.п.
- **Подгиб с лицевой стороны** - длина в м.п.

#### Дополнительные услуги:

- **Вентиляционные отверстия** для отвода тепла (в шт.)
- **Выпил отверстий под варочную панель** (в шт.)
- **Выпил отверстий под накладную мойку** (в шт.)
- **Вклейка мойки подстольного монтажа** (в шт.)
- **Стыковка изделия на объекте** (в шт.)
- **Доставка** - в черте города или за пределы

#### Надбавки за сложность:

- Радиус 10-300мм (в шт.)
- Радиус 300-1000мм (в шт.)
- Вертикальный радиус (в шт.)
- Изделие в 2х плоскостях (в шт.)

#### Компоненты системы:

1. **CalculationsView** (`/calculations`) - основная страница с полной формой расчета
2. **QuickCalculator** - компактный компонент для быстрых расчетов
3. **CalculationStore** - Pinia store для управления состоянием расчетов
4. **Calculation API** - интеграция с бэкенд API для выполнения расчетов

#### Функциональность:

- Валидация формы с проверкой обязательных полей
- Асинхронные запросы к API для выполнения расчетов
- Отображение детализированного результата с разбивкой по статьям
- Уведомления об успешных операциях и ошибках
- История расчетов
- Адаптивный дизайн для различных устройств

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
