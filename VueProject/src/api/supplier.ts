// src/api/supplier.ts

import { api } from '@/utils/api';
import type { Supplier } from '@/types/supplier';

const SUPPLIERS_ENDPOINT = '/api/suppliers/'; // Замените на фактический эндпоинт вашего API

/**
 * Получает список всех поставщиков.
 * @returns Промис с массивом поставщиков.
 */
export async function getSuppliers<T>(): Promise<T> {
  const response = await api.get<T | null>(SUPPLIERS_ENDPOINT);
  if (response === null) {
    throw new Error('Received null response from API');
  }
  return response;
}

/**
 * Получает информацию о конкретном поставщике по его ID.
 * @param id Идентификатор поставщика.
 * @returns Промис с информацией о поставщике.
 */
export async function getSupplierById<T>(id: number): Promise<T> {
  const response = await api.get<T | null>(`${SUPPLIERS_ENDPOINT}${id}/`);
  if (response === null) {
    throw new Error('Received null response from API');
  }
  return response;
}

/**
 * Создает нового поставщика.
 * @param supplierData Данные нового поставщика.
 * @returns Промис с информацией о созданном поставщике.
 */
export async function createSupplier<T, R>(supplierData: T): Promise<R> {
  const response = await api.post<T, R | null>(SUPPLIERS_ENDPOINT, supplierData);
  if (response === null) {
    throw new Error('Received null response from API');
  }
  return response;
}

/**
 * Обновляет информацию о существующем поставщике.
 * @param id Идентификатор поставщика для обновления.
 * @param supplierData Обновленные данные поставщика.
 * @returns Промис с информацией об обновленном поставщике.
 */
export async function updateSupplier<T, R>(id: number, supplierData: T): Promise<R> {
  const response = await api.put<T, R | null>(`${SUPPLIERS_ENDPOINT}${id}/`, supplierData);
  if (response === null) {
    throw new Error('Received null response from API');
  }
  return response;
}

/**
 * Удаляет поставщика по его ID.
 * @param id Идентификатор поставщика для удаления.
 * @returns Промис без тела ответа (в случае успеха).
 */
export async function deleteSupplier(id: number): Promise<void> {
  await api.delete(`${SUPPLIERS_ENDPOINT}${id}/`);
}
