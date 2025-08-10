


export function formatDate(date: Date | string | undefined | null): string {
  if (!date) {
    return ''; // Возвращаем пустую строку, если дата undefined или null
  }

  const dateObject = typeof date === 'string' ? new Date(date) : date;


  if (isNaN(dateObject.getTime())) {
    return ''; // Возвращаем пустую строку, если дата невалидна
  }

  const day = String(dateObject.getDate()).padStart(2, '0');
  const month = String(dateObject.getMonth() + 1).padStart(2, '0');
  const year = dateObject.getFullYear();
  return `${day}.${month}.${year}`;
}


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


export function getCurrentDate(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}


export function getCurrentDateTime(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}






