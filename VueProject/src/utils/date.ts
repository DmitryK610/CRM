// src/utils/date.ts

/**
 * Форматирует дату в строку в формате ДД.ММ.ГГГГ.
 * @param date Дата для форматирования. Может быть Date, строкой или undefined/null.
 * @returns Отформатированная строка даты или пустая строка, если дата недействительна.
 */
export function formatDate(date: Date | string | undefined | null): string {
  if (!date) {
    return ''; // Возвращаем пустую строку, если дата undefined или null
  }

  const dateObject = typeof date === 'string' ? new Date(date) : date;

  // Проверяем, является ли dateObject валидной датой
  if (isNaN(dateObject.getTime())) {
    return ''; // Возвращаем пустую строку, если дата невалидна
  }

  const day = String(dateObject.getDate()).padStart(2, '0');
  const month = String(dateObject.getMonth() + 1).padStart(2, '0');
  const year = dateObject.getFullYear();
  return `${day}.${month}.${year}`;
}

/**
 * Форматирует дату и время в строку в формате ДД.ММ.ГГГГ ЧЧ:ММ.
 * @param dateTime Дата и время для форматирования. Может быть Date, строкой или undefined/null.
 * @returns Отформатированная строка даты и времени или пустая строка, если дата/время недействительны.
 */
export function formatDateTime(dateTime: Date | string | undefined | null): string {
  if (!dateTime) {
    return '';
  }

  const dateTimeObject = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;

  if (isNaN(dateTimeObject.getTime())) {
    return '';
  }

  const day = String(dateTimeObject.getDate()).padStart(2, '0');
  const month = String(dateTimeObject.getMonth() + 1).padStart(2, '0');
  const year = dateTimeObject.getFullYear();
  const hours = String(dateTimeObject.getHours()).padStart(2, '0');
  const minutes = String(dateTimeObject.getMinutes()).padStart(2, '0');
  return `${day}.${month}.${year} ${hours}:${minutes}`;
}

/**
 * Получает текущую дату в формате ГГГГ-ММ-ДД.
 * @returns Строка с текущей датой.
 */
export function getCurrentDate(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Получает текущую дату и время в формате ГГГГ-ММ-ДДTHH:MM.
 * @returns Строка с текущей датой и временем.
 */
export function getCurrentDateTime(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Вы можете добавить другие полезные функции для работы с датами, например:
// - сравнение дат
// - вычисление разницы между датами
// - получение начала/конца дня/месяца/года
// - преобразование между различными форматами дат
