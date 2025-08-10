


export function toTitleCase(str: string): string {
  if (!str) {
    return '';
  }
  return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}


export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}


export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}


export function isEmptyObject(obj: Record<string, unknown>): boolean {
  return Object.keys(obj).length === 0;
}


export function removeNullOrUndefinedProperties<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const result: Partial<T> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key) && obj[key] !== null && obj[key] !== undefined) {
      result[key] = obj[key];
    }
  }
  return result;
}


export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}


export function formatDate(date: string | Date): string {
  if (!date) return '';
  const parsedDate = new Date(date);
  return parsedDate.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}


export function formatCurrency(amount: number): string {
  if (isNaN(amount)) return '0 ₽';
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
  }).format(amount);
}
