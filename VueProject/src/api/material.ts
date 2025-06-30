// src/api/material.ts

import { api } from '@/utils/api'
import type { Material } from '@/types/material'

const MATERIALS_ENDPOINT = '/api/materials/'

export interface MaterialCreatePayload {
  material_name: string
  color_code: string
  note: string | null
  cost: number
  cost_per_sqm: number
  supplier: number
}

export interface MaterialUpdatePayload {
  material_name?: string
  color_code?: string
  note?: string | null
  cost?: number
  cost_per_sqm?: number
  supplier?: number
}

/**
 * Получает список всех материалов.
 * @returns Промис с массивом материалов.
 */
export async function getMaterials(): Promise<Material[]> {
  try {
    const result = await api.get<{ results: Material[] } | Material[]>(MATERIALS_ENDPOINT)

    // Проверяем, пагинированный ли ответ (с полем results) или прямой массив
    if (result && typeof result === 'object' && 'results' in result) {
      // Пагинированный ответ Django
      return Array.isArray(result.results) ? result.results : []
    } else if (Array.isArray(result)) {
      // Прямой массив
      return result
    } else {
      return []
    }
  } catch {
    // В случае ошибки возвращаем пустой массив
    return []
  }
}

/**
 * Получает информацию о конкретном материале по его ID.
 * @param id Идентификатор материала.
 * @returns Промис с информацией о материале.
 */
export async function getMaterialById(id: number): Promise<Material> {
  const result = await api.get<Material>(`${MATERIALS_ENDPOINT}${id}/`)
  if (!result) {
    throw new Error('Материал не найден')
  }
  return result
}

/**
 * Создает новый материал.
 * @param materialData Данные нового материала.
 * @returns Промис с информацией о созданном материале.
 */
export async function createMaterial(materialData: MaterialCreatePayload): Promise<Material> {
  const result = await api.post<MaterialCreatePayload, Material>(MATERIALS_ENDPOINT, materialData)

  if (!result) {
    throw new Error('Ошибка при создании материала')
  }
  return result
}

/**
 * Обновляет информацию о существующем материале.
 * @param id Идентификатор материала для обновления.
 * @param materialData Обновленные данные материала.
 * @returns Промис с информацией об обновленном материале.
 */
export async function updateMaterial(
  id: number,
  materialData: MaterialUpdatePayload,
): Promise<Material> {
  const result = await api.put<MaterialUpdatePayload, Material>(
    `${MATERIALS_ENDPOINT}${id}/`,
    materialData,
  )
  if (!result) {
    throw new Error('Ошибка при обновлении материала')
  }
  return result
}

/**
 * Удаляет материал по его ID.
 * @param id Идентификатор материала для удаления.
 * @returns Промис без тела ответа (в случае успеха).
 */
export async function deleteMaterial(id: number): Promise<void> {
  await api.delete(`${MATERIALS_ENDPOINT}${id}/`)
}
