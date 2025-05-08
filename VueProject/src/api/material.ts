// src/api/material.ts

import { api } from '@/utils/api';

const MATERIALS_ENDPOINT = '/api/materials/'; // Замените на фактический эндпоинт вашего API

/**
 * Получает список всех материалов.
 * @returns Промис с массивом материалов.
 */
export async function getMaterials<T>(): Promise<T> {
  return api.get<T>(MATERIALS_ENDPOINT);
}

/**
 * Получает информацию о конкретном материале по его ID.
 * @param id Идентификатор материала.
 * @returns Промис с информацией о материале.
 */
export async function getMaterialById<T>(id: number): Promise<T> {
  return api.get<T>(`${MATERIALS_ENDPOINT}${id}/`);
}

/**
 * Создает новый материал.
 * @param materialData Данные нового материала.
 * @returns Промис с информацией о созданном материале.
 */
export async function createMaterial<T, R>(materialData: T): Promise<R> {
  return api.post<T, R>(MATERIALS_ENDPOINT, materialData);
}

/**
 * Обновляет информацию о существующем материале.
 * @param id Идентификатор материала для обновления.
 * @param materialData Обновленные данные материала.
 * @returns Промис с информацией об обновленном материале.
 */
export async function updateMaterial<T, R>(id: number, materialData: T): Promise<R> {
  return api.put<T, R>(`${MATERIALS_ENDPOINT}${id}/`, materialData);
}

/**
 * Удаляет материал по его ID.
 * @param id Идентификатор материала для удаления.
 * @returns Промис без тела ответа (в случае успеха).
 */
export async function deleteMaterial(id: number): Promise<void> {
  return api.delete(`${MATERIALS_ENDPOINT}${id}/`);
}
