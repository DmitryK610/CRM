// src/api/financial.ts

import { api } from '@/utils/api';
import type { FinancialData } from '@/types/financialData';

const FINANCIAL_ENDPOINT = '/api/financial-data/'; // Замените на фактический эндпоинт вашего API

/**
 * Получает финансовые данные.
 * @param params Объект с параметрами запроса (например, для указания периода).
 * @returns Промис с финансовыми данными.
 */
export async function getFinancialData<T>(params?: any): Promise<T> {
  return api.get<T>(FINANCIAL_ENDPOINT, { params });
}

// Вы можете добавить другие функции для работы с финансовыми данными, если они необходимы
// Например, для получения отчетов за определенный период, экспорта данных и т.д.

/**
 * Пример: Получение финансовых данных за определенный период.
 * @param startDate Начальная дата периода.
 * @param endDate Конечная дата периода.
 * @returns Промис с финансовыми данными за указанный период.
 */
// export async function getFinancialDataByPeriod<T>(startDate: string, endDate: string): Promise<T> {
//   return api.get<T>(`${FINANCIAL_ENDPOINT}?start_date=${startDate}&end_date=${endDate}`); // Замените на фактический эндпоинт и параметры
// }

/**
 * Пример: Экспорт финансовых данных в определенном формате.
 * @param format Формат экспорта (например, 'csv', 'excel').
 * @returns Промис с URL-адресом для скачивания файла экспорта.
 */
// export async function exportFinancialData(format: string): Promise<string> {
//   const response = await api.get<{ url: string }>(`${FINANCIAL_ENDPOINT}export/?format=${format}`); // Замените на фактический эндпоинт
//   return response.url;
// }
