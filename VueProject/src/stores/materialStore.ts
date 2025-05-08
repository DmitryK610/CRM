import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Material } from '@/types/material'
import * as materialApi from '@/api/material'

interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

interface MaterialPayload {
  material_name: string
  color_code?: string | null
  note?: string | null
  cost: number
  supplier: number
}

export const useMaterialStore = defineStore('material', () => {
  const materials = ref<Material[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const getMaterials = computed(() => materials.value)
  const getIsLoading = computed(() => isLoading.value)
  const getError = computed(() => error.value)

  function handleError(err: any, action: string) {
    const apiErrorMessage =
      err.response?.data?.detail ||
      (typeof err.response?.data === 'string'
        ? err.response.data
        : JSON.stringify(err.response?.data)) ||
      err.message ||
      `Не удалось выполнить действие при ${action}.`
    error.value = apiErrorMessage
  }

  async function fetchMaterials(searchQuery?: string): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      const params: any = {}
      if (searchQuery) {
        params.search = searchQuery
      }

      const fetchedMaterials = await materialApi.getMaterials<
        Material[] | PaginatedResponse<Material>
      >()

      if (Array.isArray(fetchedMaterials)) {
        materials.value = fetchedMaterials
      } else if (
        fetchedMaterials &&
        typeof fetchedMaterials === 'object' &&
        'results' in fetchedMaterials &&
        Array.isArray(fetchedMaterials.results)
      ) {
        materials.value = fetchedMaterials.results
      } else {
        const err = new Error('Неверный формат данных от API материалов.')
        handleError(err, 'загрузке материалов')
      }
    } catch (err) {
      handleError(err, 'загрузке материалов')
    } finally {
      isLoading.value = false
    }
  }

  async function fetchMaterialById(id: number): Promise<Material | null> {
    isLoading.value = true
    error.value = null
    try {
      const fetchedMaterial = await materialApi.getMaterialById<Material>(id)

      if (fetchedMaterial === null || fetchedMaterial === undefined) {
        const err = new Error(`Материал с ID ${id} не найден.`)
        handleError(err, `загрузке материала с ID ${id}`)
        return null
      }

      if (typeof fetchedMaterial === 'object' && !Array.isArray(fetchedMaterial)) {
        const index = materials.value.findIndex((m) => m.id === fetchedMaterial.id)
        if (index !== -1) {
          materials.value[index] = { ...materials.value[index], ...fetchedMaterial }
        }
        return fetchedMaterial
      } else {
        const err = new Error(`Неверный формат данных для материала с ID ${id}.`)
        handleError(err, `загрузке материала с ID ${id}`)
        return null
      }
    } catch (err) {
      handleError(err, `загрузке материала с ID ${id}`)
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function createMaterial(materialData: MaterialPayload): Promise<Material | null> {
    isLoading.value = true
    error.value = null
    try {
      const newMaterial = await materialApi.createMaterial<MaterialPayload, Material>(materialData)
      return newMaterial
    } catch (err) {
      handleError(err, 'создании материала')
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function updateMaterial(
    id: number,
    materialData: Partial<MaterialPayload>,
  ): Promise<Material | null> {
    isLoading.value = true
    error.value = null
    try {
      const updatedMaterial = await materialApi.updateMaterial<Partial<MaterialPayload>, Material>(
        id,
        materialData,
      )
      const index = materials.value.findIndex((material) => material.id === id)
      if (index !== -1) {
        materials.value[index] = { ...materials.value[index], ...updatedMaterial }
      }
      return updatedMaterial
    } catch (err) {
      handleError(err, `обновлении материала с ID ${id}`)
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function deleteMaterial(id: number): Promise<boolean> {
    isLoading.value = true
    error.value = null
    try {
      await materialApi.deleteMaterial(id)
      materials.value = materials.value.filter((material) => material.id !== id)
      return true
    } catch (err) {
      handleError(err, `удалении материала с ID ${id}`)
      return false
    } finally {
      isLoading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    materials,
    isLoading,
    error,

    getMaterials,
    getIsLoading,
    getError,

    fetchMaterials,
    fetchMaterialById,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    clearError,
  }
})
