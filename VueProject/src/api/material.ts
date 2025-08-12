

import { api } from '@/utils/api'
import type { Material } from '@/types/material'

const MATERIALS_ENDPOINT = 'materials/'

export interface MaterialCreatePayload {
  material_name: string
  color_code: string
  note: string | null
  cost: number
  supplier: number
}

export interface MaterialUpdatePayload {
  material_name?: string
  color_code?: string
  note?: string | null
  cost?: number
  supplier?: number
}


export async function getMaterials(): Promise<Material[]> {
  try {
    const result = await api.get<{ results: Material[] } | Material[]>(MATERIALS_ENDPOINT)


    if (result && typeof result === 'object' && 'results' in result) {

      return Array.isArray(result.results) ? result.results : []
    } else if (Array.isArray(result)) {

      return result
    } else {
      return []
    }
  } catch {

    return []
  }
}


export async function getMaterialById(id: number): Promise<Material> {
  const result = await api.get<Material>(`${MATERIALS_ENDPOINT}${id}/`)
  if (!result) {
    throw new Error('Материал не найден')
  }
  return result
}


export async function createMaterial(materialData: MaterialCreatePayload): Promise<Material> {
  const result = await api.post<MaterialCreatePayload, Material>(MATERIALS_ENDPOINT, materialData)

  if (!result) {
    throw new Error('Ошибка при создании материала')
  }
  return result
}


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


export async function deleteMaterial(id: number): Promise<void> {
  await api.delete(`${MATERIALS_ENDPOINT}${id}/`)
}
