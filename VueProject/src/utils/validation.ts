


export function isRequired(value: unknown): boolean {
  if (value === null || value === undefined) {
    return false;
  }
  if (typeof value === 'string' && value.trim() === '') {
    return false;
  }
  return true;
}


export function isValidEmail(email: string): boolean {
  if (!email) {
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}


export function isValidPhone(phone: string): boolean {
  if (!phone) {
    return false;
  }

  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im;
  return phoneRegex.test(phone);
}


export function isNumber(value: unknown): boolean {
  return typeof value === 'number' && !isNaN(value);
}


export function isInteger(value: unknown): boolean {
  return Number.isInteger(value as number); // Type assertion, предполагаем, что isNumber уже проверил тип
}


export function isPositiveNumber(value: unknown): boolean {
  return typeof value === 'number' && value > 0;
}


export function minLength(value: string, minLength: number): boolean {
  return isRequired(value) && value.length >= minLength;
}


export function maxLength(value: string, maxLength: number): boolean {
  return isRequired(value) && value.length <= maxLength;
}





