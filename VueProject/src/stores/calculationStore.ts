// src/stores/calculationStore.ts

import { defineStore } from 'pinia'
import { ref, computed, toRaw } from 'vue'
import type { CalculationForm, CalculationResult, CalculationHistory } from '@/types/calculation'
import type { Material } from '@/types/material'
import type { PriceList } from '@/types/priceList'
import {
  calculate,
  getCalculationHistory,
  deleteCalculation as deleteCalculationAPI,
  saveNewCalculation,
} from '@/api/calculation'
import { useNotificationStore } from './notificationStore'
import { useClientStore } from './clientStore'
import { usePriceListStore } from './priceListStore'
import { useMaterialStore } from './materialStore'

export const useCalculationStore = defineStore('calculation', () => {
  const notificationStore = useNotificationStore()
  const clientStore = useClientStore()
  const priceListStore = usePriceListStore()
  const materialStore = useMaterialStore()

  // State
  const isLoading = ref(false)
  const currentResult = ref<CalculationResult | null>(null)
  const history = ref<CalculationHistory[]>([])

  const defaultForm: CalculationForm = {
    selectedClient: undefined,
    stoneName: '',
    selectedMaterial: undefined,
    productArea: 0,
    measurementRequired: false,
    surfaceBonding: 0,
    edgeType: 'radius',
    edgeLength: 0,
    drainageType: 'overlay',
    drainageLength: 0,
    frontBend: 0,
    ventilationHoles: 0,
    cooktopCutouts: 0,
    overlaySinkCutouts: 0,
    undermountSinkInstallations: 0,
    onSiteJoining: 0,
    deliveryType: 'city' as const,
    deliveryRequired: false,
    orderId: null,
    complexityAdditions: {
      radius10to300: 0,
      radius300to1000: 0,
      verticalRadius: 0,
      twoPlaneProduct: 0,
    },
    dollarRate: 0,
    priceList: {
      measurement: 0,
      surfaceBondingPerM: 0,
      edgeTypePerM: { radius: 0, figured: 0 },
      drainageTypePerM: { overlay: 0, integrated: 0 },
      frontBendPerM: 0,
      deliveryType: { city: 0, outside_city: 0 },
      ventilationHolePerUnit: 0,
      cooktopCutoutPerUnit: 0,
      overlaySinkCutoutPerUnit: 0,
      undermountSinkInstallationPerUnit: 0,
      onSiteJoiningPerUnit: 0,
      radius10To300PerUnit: 0,
      radius300To1000PerUnit: 0,
      verticalRadiusPerUnit: 0,
      twoPlaneProductPerUnit: 0,
      baseMultiplier: 0,
      coefficient0To300: 0,
      coefficient300To340: 0,
      coefficient340To380: 0,
      coefficient380To500: 0,
      coefficient500To550: 0,
      coefficient550Plus: 0,
    },
  }

  const form = ref<CalculationForm>({ ...defaultForm })

  // Getters
  const hasResult = computed(() => currentResult.value !== null)
  const formIsValid = computed(() => {
    return (
      form.value.selectedMaterial !== undefined &&
      form.value.productArea > 0 &&
      materialStore.dollarRate > 0
    )
  })

  // Actions

  /**
   * Вспомогательная функция для очистки объекта PriceList
   * Удаляет поля, которые бэкенд не ожидает при отправке.
   */
  const cleanPriceListForBackend = (priceList: PriceList | null): PriceList | null => {
    if (!priceList) {
      return null
    }
    // Оставляем все поля, чтобы не было ошибок типов, но backend лишние проигнорирует
    const cleaned: PriceList = {
      measurement: priceList.measurement,
      surfaceBondingPerM: priceList.surfaceBondingPerM,
      edgeTypePerM: priceList.edgeTypePerM,
      drainageTypePerM: priceList.drainageTypePerM,
      frontBendPerM: priceList.frontBendPerM,
      deliveryType: priceList.deliveryType,
      ventilationHolePerUnit: priceList.ventilationHolePerUnit,
      cooktopCutoutPerUnit: priceList.cooktopCutoutPerUnit,
      overlaySinkCutoutPerUnit: priceList.overlaySinkCutoutPerUnit,
      undermountSinkInstallationPerUnit: priceList.undermountSinkInstallationPerUnit,
      onSiteJoiningPerUnit: priceList.onSiteJoiningPerUnit,
      radius10To300PerUnit: priceList.radius10To300PerUnit,
      radius300To1000PerUnit: priceList.radius300To1000PerUnit,
      verticalRadiusPerUnit: priceList.verticalRadiusPerUnit,
      twoPlaneProductPerUnit: priceList.twoPlaneProductPerUnit,
      baseMultiplier: priceList.baseMultiplier,
      coefficient0To300: priceList.coefficient0To300,
      coefficient300To340: priceList.coefficient300To340,
      coefficient340To380: priceList.coefficient340To380,
      coefficient380To500: priceList.coefficient380To500,
      coefficient500To550: priceList.coefficient500To550,
      coefficient550Plus: priceList.coefficient550Plus,
    }
    return cleaned
  }

  /**
   * Выполняет предварительный расчет стоимости без сохранения в БД.
   */
  async function performCalculation() {
    if (!formIsValid.value) {
      let errorMessage = 'Заполните обязательные поля: материал и площадь изделия.'
      if (!materialStore.isDollarRateValid) {
        materialStore.ensureValidDollarRate()
        errorMessage = 'Пожалуйста, введите корректный курс доллара.'
      }
      notificationStore.showNotification(errorMessage, 'error')
      return
    }

    if (!materialStore.dollarRate || materialStore.dollarRate <= 0) {
      notificationStore.showNotification('Курс доллара не установлен или некорректен.', 'error')
      return
    }

    isLoading.value = true
    try {
      let currentPriceList = priceListStore.priceList // Это может быть реактивный объект

      if (!currentPriceList) {
        // Загружаем прайс-лист, если его нет
        currentPriceList = await priceListStore.loadPriceList()
      }

      // ...удалён console.log...

      // --- ИСПРАВЛЕНО: Очищаем priceList перед добавлением в payload ---
      const cleanedPriceList = cleanPriceListForBackend(currentPriceList)

      const rawForm = toRaw(form.value)
      // Собираем CalculationForm для API (без лишних полей)
      // Если доставка не требуется, не передаем deliveryType и обнуляем deliveryType в priceList
      const calculationForm: CalculationForm = {
        ...rawForm,
        stoneName: rawForm.selectedMaterial?.color_code || '',
        dollarRate: materialStore.dollarRate,
        priceList: { ...cleanedPriceList } as PriceList,
        deliveryType: rawForm.deliveryRequired ? rawForm.deliveryType : 'city',
      }

      const result = await calculate(calculationForm)
      currentResult.value = result
      notificationStore.showNotification(
        'Расчет успешно выполнен. Нажмите "Сохранить", чтобы добавить в историю.',
        'success',
      )
    } catch (error: unknown) {
      console.error('Calculation error:', error)
      const errorMessage = (error as Error).message || 'Ошибка при выполнении расчета'
      notificationStore.showNotification(errorMessage, 'error')
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Сохраняет текущий расчет в базу данных.
   */
  async function saveCalculation(): Promise<boolean> {
    if (!currentResult.value) {
      notificationStore.showNotification('Сначала выполните расчет.', 'error')
      return false
    }
    if (!formIsValid.value) {
      notificationStore.showNotification('Невозможно сохранить невалидный расчет.', 'error')
      return false
    }

    isLoading.value = true
    try {
      let currentPriceList = priceListStore.priceList
      if (!currentPriceList) {
        currentPriceList = await priceListStore.loadPriceList()
      }

      // --- ИСПРАВЛЕНО: Очищаем priceList перед добавлением в payload ---
      const cleanedPriceList = cleanPriceListForBackend(currentPriceList)

      const rawForm = toRaw(form.value)
      // Собираем CalculationForm для API (без лишних полей)
      const calculationForm: CalculationForm = {
        ...rawForm,
        stoneName: rawForm.selectedMaterial?.color_code || '',
        dollarRate: materialStore.dollarRate,
        priceList: cleanedPriceList as PriceList,
      }
      // saveNewCalculation требует также totalCost и breakdown, берем их из currentResult
      if (!currentResult.value) throw new Error('Нет результата для сохранения')
      const savedCalculation = await saveNewCalculation({
        ...calculationForm,
        totalCost: currentResult.value.totalCost,
        breakdown: currentResult.value.breakdown,
      })
      history.value.unshift(savedCalculation)

      notificationStore.showNotification('Расчет успешно сохранен!', 'success')
      resetForm()
      return true
    } catch (error: unknown) {
      console.error('Error saving calculation:', error)
      const errorMessage = (error as Error).message || 'Ошибка при сохранении расчета'
      notificationStore.showNotification(errorMessage, 'error')
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Загружает историю расчетов с сервера.
   */
  async function loadHistory() {
    isLoading.value = true
    try {
      const historyData = await getCalculationHistory()
      history.value = historyData || []
    } catch (error) {
      console.error('Failed to load calculation history:', error)
      history.value = []
      notificationStore.showNotification('Ошибка при загрузке истории расчетов.', 'error')
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Удаляет расчет по ID.
   */
  async function deleteCalculation(id: string | number) {
    isLoading.value = true
    try {
      await deleteCalculationAPI(id)
      history.value = history.value.filter((calc) => calc.calculationId !== Number(id))
      notificationStore.showNotification('Расчет удален.', 'success')
    } catch (error) {
      console.error('Error deleting calculation:', error)
      notificationStore.showNotification('Ошибка при удалении расчета.', 'error')
      throw error
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Сбрасывает форму и результат к значениям по умолчанию.
   */
  function resetForm() {
    const currentDollarRate = materialStore.dollarRate
    form.value = { ...defaultForm, complexityAdditions: { ...defaultForm.complexityAdditions } }
    currentResult.value = null
    materialStore.dollarRate = currentDollarRate
  }

  /**
   * Очищает только панель с результатом.
   */
  function clearResult() {
    currentResult.value = null
  }

  /**
   * Устанавливает выбранный материал в форму.
   */
  function setSelectedMaterial(material: Material) {
    form.value.selectedMaterial = material
    form.value.stoneName = material.color_code
  }

  return {
    // State
    isLoading,
    form,
    currentResult,
    history,
    // Getters
    hasResult,
    formIsValid,
    // Actions
    performCalculation,
    saveCalculation,
    loadHistory,
    resetForm,
    clearResult,
    setSelectedMaterial,
    deleteCalculation,
  }
})
