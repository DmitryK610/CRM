// src/utils/validation.ts

/**
 * Проверяет, является ли значение обязательным.
 * @param value Значение для проверки.
 * @returns True, если значение не является null или undefined и не является пустой строкой, иначе false.
 */
export function isRequired(value: unknown): boolean {
  if (value === null || value === undefined) {
    return false;
  }
  if (typeof value === 'string' && value.trim() === '') {
    return false;
  }
  return true;
}

/**
 * Проверяет, является ли значение корректным адресом электронной почты.
 * @param email Адрес электронной почты для проверки.
 * @returns True, если адрес электронной почты валидный, иначе false.
 */
export function isValidEmail(email: string): boolean {
  if (!email) {
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Проверяет, является ли значение корректным номером телефона.
 * @param phone Номер телефона для проверки.
 * @returns True, если номер телефона выглядит валидным, иначе false.
 */
export function isValidPhone(phone: string): boolean {
  if (!phone) {
    return false;
  }
  // Простая проверка на наличие цифр и минимальную длину
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im;
  return phoneRegex.test(phone);
}

/**
 * Проверяет, является ли значение числом.
 * @param value Значение для проверки.
 * @returns True, если значение является числом, иначе false.
 */
export function isNumber(value: unknown): boolean {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Проверяет, является ли значение целым числом.
 * @param value Значение для проверки.
 * @returns True, если значение является целым числом, иначе false.
 */
export function isInteger(value: unknown): boolean {
  return Number.isInteger(value as number); // Type assertion, предполагаем, что isNumber уже проверил тип
}

/**
 * Проверяет, является ли значение положительным числом.
 * @param value Значение для проверки.
 * @returns True, если значение является положительным числом (больше нуля), иначе false.
 */
export function isPositiveNumber(value: unknown): boolean {
  return typeof value === 'number' && value > 0;
}

/**
 * Проверяет, имеет ли строка минимальную длину.
 * @param value Строка для проверки.
 * @param minLength Минимальная длина строки.
 * @returns True, если длина строки больше или равна минимальной, иначе false.
 */
export function minLength(value: string, minLength: number): boolean {
  return isRequired(value) && value.length >= minLength;
}

/**
 * Проверяет, имеет ли строка максимальную длину.
 * @param value Строка для проверки.
 * @param maxLength Максимальная длина строки.
 * @returns True, если длина строки меньше или равна максимальной, иначе false.
 */
export function maxLength(value: string, maxLength: number): boolean {
  return isRequired(value) && value.length <= maxLength;
}

// Вы можете добавить другие полезные функции для валидации, например:
// - проверка на совпадение значений
// - проверка формата даты
// - пользовательские валидаторы для конкретных полей
