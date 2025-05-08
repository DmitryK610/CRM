// src/utils/currency.ts

/**
 * Форматирует число как денежную строку в формате "сумма валюта", например "1.234,56 €".
 * @param value Число для форматирования.
 * @param currency Символ валюты (по умолчанию '€').
 * @param locale Локаль для форматирования (по умолчанию 'nl-NL' для нидерландского стиля).
 * @returns Отформатированная денежная строка.
 */
export function formatCurrency(value: number, currency: string = '€', locale: string = 'nl-NL'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
}

/**
 * Форматирует число как денежную строку с указанным количеством знаков после запятой.
 * @param value Число для форматирования.
 * @param decimals Количество знаков после запятой (по умолчанию 2).
 * @param decimalSeparator Разделитель десятичной части (по умолчанию ',').
 * @param thousandsSeparator Разделитель тысяч (по умолчанию '.').
 * @returns Отформатированная денежная строка.
 */
export function formatNumberWithDecimal(
  value: number,
  decimals: number = 2,
  decimalSeparator: string = ',',
  thousandsSeparator: string = '.',
): string {
  const formattedValue = value.toFixed(decimals);
  const parts = formattedValue.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);
  return parts.join(decimalSeparator);
}

/**
 * Преобразует денежную строку в число. Удаляет символы валюты и форматирования.
 * @param currencyString Денежная строка для преобразования.
 * @returns Числовое значение или NaN, если преобразование не удалось.
 */
export function parseCurrencyString(currencyString: string): number {
  const cleanedString = currencyString.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(/,/g, '.');
  const parsedValue = parseFloat(cleanedString);
  return isNaN(parsedValue) ? NaN : parsedValue;
}

// Вы можете добавить другие полезные функции для работы с валютами, например:
// - получение символа валюты по локали
// - преобразование между различными валютами (если это необходимо)
