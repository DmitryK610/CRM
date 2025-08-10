import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Supplier } from '@/types/supplier'
import * as supplierApi from '@/api/supplier'

export const useSupplierStore = defineStore('supplier', () => {
  const suppliers = ref<Supplier[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const selectedSupplier = ref<Supplier | null>(null)

  const getSuppliers = computed(() => suppliers.value)
  const getIsLoading = computed(() => isLoading.value)
  const getError = computed(() => error.value)
  const getSelectedSupplier = computed(() => selectedSupplier.value)

  async function fetchSuppliers(options?: { keepCache?: boolean }): Promise<void> {
    const keepCache = options?.keepCache ?? true
    isLoading.value = true
    error.value = null
    if (!keepCache) {
      suppliers.value = []
    }

    try {
  const fetchedData = await supplierApi.getSuppliers<any>()

      if (fetchedData && Array.isArray(fetchedData.results)) {
        suppliers.value = fetchedData.results
      } else if (Array.isArray(fetchedData)) {
        suppliers.value = fetchedData
      } else {
        suppliers.value = []
        error.value = 'Неожиданный формат ответа API при загрузке поставщиков.'
      }
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'Не удалось загрузить поставщиков.'
      error.value = errorMessage
  } finally {
      isLoading.value = false
    }
  }

  async function fetchSupplierById(id: number): Promise<Supplier | null> {
    isLoading.value = true
    error.value = null
    selectedSupplier.value = null
    try {
      const fetchedSupplier = await supplierApi.getSupplierById<Supplier>(id)
      selectedSupplier.value = fetchedSupplier
    } catch (err: any) {
      const errorMessage =
        err instanceof Error ? err.message : `Не удалось загрузить поставщика с ID ${id}.`
      error.value = errorMessage
    } finally {
      isLoading.value = false
    }
    return selectedSupplier.value
  }

  async function createSupplier(supplierData: Omit<Supplier, 'id'>) {
    isLoading.value = true
    error.value = null
    try {
      const newSupplier = await supplierApi.createSupplier<Omit<Supplier, 'id'>, Supplier>(
        supplierData,
      )
      suppliers.value.push(newSupplier)
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'Не удалось создать поставщика.'
      error.value = errorMessage
    } finally {
      isLoading.value = false
    }
  }

  async function updateSupplier(id: number, supplierData: Partial<Supplier>) {
    isLoading.value = true
    error.value = null
    try {
      const updatedSupplier = await supplierApi.updateSupplier<Partial<Supplier>, Supplier>(
        id,
        supplierData,
      )
      const index = suppliers.value.findIndex((supplier) => supplier.id === id)
      if (index !== -1) {
        suppliers.value[index] = updatedSupplier
      }
      if (selectedSupplier.value && selectedSupplier.value.id === id) {
        selectedSupplier.value = updatedSupplier
      }
    } catch (err: any) {
      const errorMessage =
        err instanceof Error ? err.message : `Не удалось обновить поставщика с ID ${id}.`
      error.value = errorMessage
    } finally {
      isLoading.value = false
    }
  }

  async function deleteSupplier(id: number) {
    isLoading.value = true
    error.value = null
    try {
      await supplierApi.deleteSupplier(id)
      suppliers.value = suppliers.value.filter((supplier) => supplier.id !== id)
      if (selectedSupplier.value && selectedSupplier.value.id === id) {
        selectedSupplier.value = null
      }
    } catch (err: any) {
      const errorMessage =
        err instanceof Error ? err.message : `Не удалось удалить поставщика с ID ${id}.`
      error.value = errorMessage
    } finally {
      isLoading.value = false
    }
  }

  function setSelectedSupplier(supplier: Supplier | null) {
    selectedSupplier.value = supplier
  }

  function clearError() {
    error.value = null
  }

  return {
    suppliers,
    isLoading,
    error,
    selectedSupplier,

    getSuppliers,
    getIsLoading,
    getError,
    getSelectedSupplier,

    fetchSuppliers,
    fetchSupplierById,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    setSelectedSupplier,
    clearError,
  }
})
