



export function filterByProperty<T>(items: T[], property: keyof T, value: any): T[] {
  if (!items || items.length === 0) {
    return [];
  }
  return items.filter(item => item[property] === value);
}


export function filterByPropertyContains<T>(items: T[], property: keyof T, searchTerm: string): T[] {
  if (!items || items.length === 0 || !searchTerm) {
    return items || [];
  }
  const lowerSearchTerm = searchTerm.toLowerCase();
  return items.filter(item => {
    const propertyValue = item[property];
    if (propertyValue !== null && propertyValue !== undefined) {
      return String(propertyValue).toLowerCase().includes(lowerSearchTerm);
    }
    return false;
  });
}


export function filterByDateRange<T>(
  items: T[],
  dateProperty: keyof T,
  startDate?: Date | null,
  endDate?: Date | null,
): T[] {
  if (!items || items.length === 0) {
    return [];
  }
  return items.filter(item => {
    const dateValue = new Date(item[dateProperty] as any); // Приведение типа к Date. Предполагается, что dateProperty является строкой или Date.
    const itemDate = new Date(dateValue.getFullYear(), dateValue.getMonth(), dateValue.getDate()); // Убираем время для сравнения только дат

    const start = startDate ? new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()) : null;
    const end = endDate ? new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()) : null;

    const isAfterOrEqualStart = start ? itemDate >= start : true;
    const isBeforeOrEqualEnd = end ? itemDate <= end : true;

    return isAfterOrEqualStart && isBeforeOrEqualEnd;
  });
}


export function sortByProperty<T>(items: T[], property: keyof T, ascending: boolean = true): T[] {
  if (!items || items.length === 0) {
    return [];
  }
  return [...items].sort((a, b) => {
    const valueA = a[property];
    const valueB = b[property];

    if (valueA < valueB) {
      return ascending ? -1 : 1;
    }
    if (valueA > valueB) {
      return ascending ? 1 : -1;
    }
    return 0;
  });
}





