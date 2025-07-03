import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { Material } from '@/types/material'
import * as materialApi from '@/api/material'
import type { MaterialCreatePayload, MaterialUpdatePayload } from '@/api/material'

interface MaterialPayload {
  material_name: string
  color_code?: string
  note?: string
  cost: number
  supplier: number
}

export const useMaterialStore = defineStore('material', () => {
  const materials = ref<Material[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  // Инициализация курса доллара из localStorage, если есть сохранённое значение
  const dollarRateStorageKey = 'dollarRate'
  const savedDollarRate = localStorage.getItem(dollarRateStorageKey)
  const dollarRate = ref(savedDollarRate ? Number(savedDollarRate) : 100)

  // Добавляем вычисляемое свойство для проверки валидности курса доллара
  const isDollarRateValid = computed(() => dollarRate.value > 0)

  // Следим за изменением курса доллара и сохраняем в localStorage
  watch(dollarRate, (newRate: number) => {
    localStorage.setItem(dollarRateStorageKey, String(newRate))
  })

  const getMaterials = computed(() => materials.value)
  const getIsLoading = computed(() => isLoading.value)
  const getError = computed(() => error.value)

  function handleError(err: unknown, action: string) {
    let apiErrorMessage = `Не удалось выполнить действие при ${action}.`

    if (err instanceof Error) {
      apiErrorMessage = err.message
    } else if (typeof err === 'object' && err !== null) {
      const errorObj = err as Record<string, unknown>
      if (errorObj.response && typeof errorObj.response === 'object') {
        const response = errorObj.response as Record<string, unknown>
        if (response.data && typeof response.data === 'object') {
          const data = response.data as Record<string, unknown>
          if (data.detail && typeof data.detail === 'string') {
            apiErrorMessage = data.detail
          }
        }
      }
    }

    error.value = apiErrorMessage
  }

  async function fetchMaterials(): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      const fetchedMaterials = await materialApi.getMaterials()
      // Убеждаемся, что получили массив
      materials.value = Array.isArray(fetchedMaterials) ? fetchedMaterials : []
    } catch (err) {
      // В случае ошибки устанавливаем пустой массив
      materials.value = []
      handleError(err, 'загрузке материалов')
    } finally {
      isLoading.value = false
    }
  }

  async function fetchMaterialById(id: number): Promise<Material | null> {
    isLoading.value = true
    error.value = null
    try {
      const fetchedMaterial = await materialApi.getMaterialById(id)

      if (fetchedMaterial) {
        const index = materials.value.findIndex((m) => m.id === fetchedMaterial.id)
        if (index !== -1) {
          materials.value[index] = { ...materials.value[index], ...fetchedMaterial }
        }
        return fetchedMaterial
      }
      return null
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
      const apiData: MaterialCreatePayload = {
        material_name: materialData.material_name,
        color_code: materialData.color_code || '',
        note: materialData.note || null,
        cost: materialData.cost,
        supplier: materialData.supplier,
      }

      const newMaterial = await materialApi.createMaterial(apiData)

      if (newMaterial) {
        // Убеждаемся, что materials.value является массивом
        if (!Array.isArray(materials.value)) {
          materials.value = []
        }
        materials.value.push(newMaterial)
      }
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
      const apiData: MaterialUpdatePayload = {}

      if (materialData.material_name !== undefined) {
        apiData.material_name = materialData.material_name
      }
      if (materialData.color_code !== undefined) {
        apiData.color_code = materialData.color_code || ''
      }
      if (materialData.note !== undefined) {
        apiData.note = materialData.note || null
      }
      if (materialData.cost !== undefined) {
        apiData.cost = materialData.cost
      }
      if (materialData.supplier !== undefined) {
        apiData.supplier = materialData.supplier // Вернули supplier
      }

      const updatedMaterial = await materialApi.updateMaterial(id, apiData)
      if (updatedMaterial) {
        // Убеждаемся, что materials.value является массивом
        if (!Array.isArray(materials.value)) {
          materials.value = []
        }
        const index = materials.value.findIndex((material) => material.id === id)
        if (index !== -1) {
          materials.value[index] = { ...materials.value[index], ...updatedMaterial }
        }
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
      // Убеждаемся, что materials.value является массивом
      if (!Array.isArray(materials.value)) {
        materials.value = []
      }
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

  // Метод для проверки и установки валидного значения курса доллара
  function ensureValidDollarRate() {
    if (!isDollarRateValid.value) {
      dollarRate.value = 100 // Сбрасываем на умолчание, если некорректно
    }
  }

  return {
    materials,
    isLoading,
    error,
    dollarRate,
    isDollarRateValid,
    ensureValidDollarRate, // Экспонируем метод
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
