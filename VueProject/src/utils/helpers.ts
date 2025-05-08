// src/utils/helpers.ts

/**
 * Преобразует строку в формат "Название С Больших Букв".
 * @param str Строка для преобразования.
 * @returns Строка в формате Title Case.
 */
export function toTitleCase(str: string): string {
  if (!str) {
    return '';
  }
  return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

/**
 * Генерирует случайный идентификатор (UUID v4).
 * @returns Случайный UUID.
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Клонирует объект (глубокое копирование).
 * @param obj Объект для клонирования.
 * @returns Клонированный объект.
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Проверяет, является ли объект пустым (не имеет собственных свойств).
 * @param obj Объект для проверки.
 * @returns True, если объект пустой, иначе false.
 */
export function isEmptyObject(obj: Record<string, unknown>): boolean {
  return Object.keys(obj).length === 0;
}

/**
 * Удаляет из объекта свойства со значением null или undefined.
 * @param obj Объект для очистки.
 * @returns Объект без свойств со значением null или undefined.
 */
export function removeNullOrUndefinedProperties<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const result: Partial<T> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key) && obj[key] !== null && obj[key] !== undefined) {
      result[key] = obj[key];
    }
  }
  return result;
}

/**
 * Задерживает выполнение асинхронной функции на заданное количество миллисекунд.
 * @param ms Количество миллисекунд для задержки.
 * @returns Promise, который разрешается после указанной задержки.
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Форматирует дату в читаемый формат.
 * @param date - Дата в формате строки или объекта Date.
 * @returns Отформатированная строка даты.
 */
export function formatDate(date: string | Date): string {
  if (!date) return '';
  const parsedDate = new Date(date);
  return parsedDate.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * Форматирует денежную сумму в читаемый формат.
 * @param amount - Сумма в числовом формате.
 * @returns Отформатированная строка суммы.
 */
export function formatCurrency(amount: number): string {
  if (isNaN(amount)) return '0 ₽';
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
  }).format(amount);
}
