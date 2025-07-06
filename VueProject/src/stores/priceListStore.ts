import { defineStore } from 'pinia'
import { ref } from 'vue'
import { priceListApi } from '@/api/priceList'
import type { PriceList } from '@/types'

export const usePriceListStore = defineStore('priceList', () => {
  // Состояние
  const priceList = ref<PriceList | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Загрузка прайс-листа
  const loadPriceList = async () => {
    try {
      loading.value = true
      error.value = null

      const data = await priceListApi.get()
      priceList.value = data

      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Ошибка загрузки прайс-листа'

      // Возвращаем значения по умолчанию в случае ошибки (соответствуют Django модели)
      const defaultPriceList: PriceList = {
        measurement: 1.0,
        surfaceBondingPerM: 1.0,
        edgeTypePerM: {
          radius: 1.0,
          figured: 1.0,
        },
        drainageTypePerM: {
          overlay: 1.0,
          integrated: 1.0,
        },
        frontBendPerM: 1.0,
        deliveryType: {
          city: 1.0,
          outside_city: 1.0,
        },
        ventilationHolePerUnit: 1.0,
        cooktopCutoutPerUnit: 1.0,
        overlaySinkCutoutPerUnit: 1.0,
        undermountSinkInstallationPerUnit: 1.0,
        onSiteJoiningPerUnit: 1.0,
        radius10To300PerUnit: 1.0,
        radius300To1000PerUnit: 1.0,
        verticalRadiusPerUnit: 1.0,
        twoPlaneProductPerUnit: 1.0,
        baseMultiplier: 265.1,
        coefficient0To300: 1.0,
        coefficient300To340: 1.085,
        coefficient340To380: 1.15,
        coefficient380To500: 1.25,
        coefficient500To550: 1.5,
        coefficient550Plus: 1.6,
      }

      priceList.value = defaultPriceList
      return defaultPriceList
    } finally {
      loading.value = false
    }
  }

  // Обновление прайс-листа
  const updatePriceList = async (data: PriceList) => {
    try {
      loading.value = true
      error.value = null

      const updatedData = await priceListApi.update(data)
      priceList.value = updatedData

      return updatedData
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Ошибка обновления прайс-листа'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Сброс к значениям по умолчанию
  const resetToDefaults = async () => {
    try {
      loading.value = true
      error.value = null

      const defaultData = await priceListApi.reset()
      priceList.value = defaultData

      return defaultData
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Ошибка сброса прайс-листа'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Очистка ошибки
  const clearError = () => {
    error.value = null
  }

  return {
    // Состояние
    priceList,
    loading,
    error,

    // Действия
    loadPriceList,
    updatePriceList,
    resetToDefaults,
    clearError,
  }
})
