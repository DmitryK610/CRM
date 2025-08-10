


export function formatCurrency(value: number, currency: string = '€', locale: string = 'nl-NL'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
}


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


export function parseCurrencyString(currencyString: string): number {
  const cleanedString = currencyString.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(/,/g, '.');
  const parsedValue = parseFloat(cleanedString);
  return isNaN(parsedValue) ? NaN : parsedValue;
}




