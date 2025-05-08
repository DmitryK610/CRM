// src/api/supplier.ts

import { api } from '@/utils/api';
import type { Supplier } from '@/types/supplier';

const SUPPLIERS_ENDPOINT = '/api/suppliers/'; // Замените на фактический эндпоинт вашего API

/**
 * Получает список всех поставщиков.
 * @returns Промис с массивом поставщиков.
 */
export async function getSuppliers<T>(): Promise<T> {
  return api.get<T>(SUPPLIERS_ENDPOINT);
}

/**
 * Получает информацию о конкретном поставщике по его ID.
 * @param id Идентификатор поставщика.
 * @returns Промис с информацией о поставщике.
 */
export async function getSupplierById<T>(id: number): Promise<T> {
  return api.get<T>(`${SUPPLIERS_ENDPOINT}${id}/`);
}

/**
 * Создает нового поставщика.
 * @param supplierData Данные нового поставщика.
 * @returns Промис с информацией о созданном поставщике.
 */
export async function createSupplier<T, R>(supplierData: T): Promise<R> {
  return api.post<T, R>(SUPPLIERS_ENDPOINT, supplierData);
}

/**
 * Обновляет информацию о существующем поставщике.
 * @param id Идентификатор поставщика для обновления.
 * @param supplierData Обновленные данные поставщика.
 * @returns Промис с информацией об обновленном поставщике.
 */
export async function updateSupplier<T, R>(id: number, supplierData: T): Promise<R> {
  return api.put<T, R>(`${SUPPLIERS_ENDPOINT}${id}/`, supplierData);
}

/**
 * Удаляет поставщика по его ID.
 * @param id Идентификатор поставщика для удаления.
 * @returns Промис без тела ответа (в случае успеха).
 */
export async function deleteSupplier(id: number): Promise<void> {
  return api.delete(`${SUPPLIERS_ENDPOINT}${id}/`);
}
