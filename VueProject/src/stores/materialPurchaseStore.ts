// src/stores/materialPurchaseStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  MaterialPurchase,
  MaterialPurchaseCreatePayload,
  MaterialPurchaseUpdatePayload,
} from '@/types/materialPurchase'
import * as materialPurchaseApi from '@/api/materialPurchase'

export const useMaterialPurchaseStore = defineStore('materialPurchases', () => {
  // --- Состояния ---
  const procurements = ref<MaterialPurchase[]>([])
  const _isLoading = ref(false)
  const _isCreating = ref(false)
  const _isUpdating = ref(false)
  const _isDeleting = ref(false)
  const _isFetchingDetails = ref(false)
  const _error = ref<string | null>(null)
  const _fetchDetailsError = ref<string | null>(null)

  // --- Геттеры ---
  const procurementsList = computed(() => procurements.value)
  const isLoading = computed(() => _isLoading.value)
  const isCreating = computed(() => _isCreating.value)
  const isUpdating = computed(() => _isUpdating.value)
  const isDeleting = computed(() => _isDeleting.value)
  const isFetchingDetails = computed(() => _isFetchingDetails.value)
  const error = computed(() => _error.value)
  const fetchDetailsError = computed(() => _fetchDetailsError.value)

  const getPurchaseById = computed(() => (id: number) => {
    return procurements.value.find((p) => p.id === id) || null
  })

  // --- Действия ---
  function handleError(err: unknown, action: string): void {
    console.error(`Ошибка при ${action}:`, err)

    // Универсальная обработка ошибок
    if (err instanceof Error) {
      _error.value = err.message
    } else if (typeof err === 'string') {
      _error.value = err
    } else {
      _error.value = `Неизвестная ошибка при ${action}`
    }
  }

  async function fetchMaterialPurchases(params?: unknown): Promise<void> {
    _isLoading.value = true
    _error.value = null

    try {
      const data = await materialPurchaseApi.getMaterialPurchases(params)
      procurements.value = Array.isArray(data) ? data : data.results
    } catch (err: unknown) {
      handleError(err, 'загрузке списка закупок')
      throw err
    } finally {
      _isLoading.value = false
    }
  }

  async function fetchMaterialPurchase(id: number): Promise<MaterialPurchase | null> {
    _isLoading.value = true
    _error.value = null

    try {
      const purchase = await materialPurchaseApi.getMaterialPurchase(id)

      const index = procurements.value.findIndex((p) => p.id === id)
      if (index !== -1) {
        procurements.value[index] = purchase
      } else {
        procurements.value.push(purchase)
      }

      return purchase
    } catch (err: unknown) {
      handleError(err, `загрузке закупки ID ${id}`)
      return null
    } finally {
      _isLoading.value = false
    }
  }

  async function createMaterialPurchase(
    payload: MaterialPurchaseCreatePayload,
  ): Promise<MaterialPurchase | null> {
    _isCreating.value = true
    _error.value = null

    try {
      const newPurchase = await materialPurchaseApi.createMaterialPurchase(payload)
      procurements.value.push(newPurchase)
      return newPurchase
    } catch (err: unknown) {
      handleError(err, 'создании закупки')
      return null
    } finally {
      _isCreating.value = false
    }
  }

  async function updateMaterialPurchase(
    id: number,
    payload: MaterialPurchaseUpdatePayload,
  ): Promise<MaterialPurchase | null> {
    _isUpdating.value = true
    _error.value = null

    try {
      // Вызывает API-уровень
      const updatedPurchase = await materialPurchaseApi.updateMaterialPurchase(id, payload)

      // Обновление списка в сторе (используя данные из updatedPurchase)
      const index = procurements.value.findIndex((p) => p.id === id)
      if (index !== -1) {
        procurements.value[index] = updatedPurchase
      }

      return updatedPurchase
    } catch (err: unknown) {
      handleError(err, `обновлении закупки ID ${id}`)
      return null
    } finally {
      _isUpdating.value = false
    }
  }
  async function deleteMaterialPurchase(id: number): Promise<boolean> {
    _isDeleting.value = true
    _error.value = null

    try {
      await materialPurchaseApi.deleteMaterialPurchase(id)
      procurements.value = procurements.value.filter((p) => p.id !== id)
      return true
    } catch (err: unknown) {
      handleError(err, `удалении закупки ID ${id}`)
      return false
    } finally {
      _isDeleting.value = false
    }
  }

  function setError(message: string | null): void {
    _error.value = message
  }

  function clearError(): void {
    _error.value = null
  }

  function clearFetchDetailsError(): void {
    _fetchDetailsError.value = null
  }

  return {
    // Состояния
    procurements,

    // Геттеры
    procurementsList,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    isFetchingDetails,
    error,
    fetchDetailsError,
    getPurchaseById,

    // Действия
    fetchMaterialPurchases,
    fetchMaterialPurchase,
    createMaterialPurchase,
    updateMaterialPurchase,
    deleteMaterialPurchase,
    setError,
    clearError,
    clearFetchDetailsError,
  }
})
