// src/stores/calculationStore.ts

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CalculationForm, CalculationResult, CalculationHistory } from '@/types/calculation'
import type { Material } from '@/types/material'
import type { Client } from '@/types/client' // <--- Импортируем Client type
import {
  calculate,
  getCalculationHistory,
  deleteCalculation as deleteCalculationAPI,
} from '@/api/calculation'
import { useNotificationStore } from './notificationStore'
import { useClientStore } from './clientStore' // <--- Импортируем clientStore

export const useCalculationStore = defineStore('calculation', () => {
  const notificationStore = useNotificationStore()
  const clientStore = useClientStore() // <--- Инициализируем clientStore

  // State
  const isLoading = ref(false)
  const currentResult = ref<CalculationResult | null>(null)
  const history = ref<CalculationHistory[]>([])

  // Default form data
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
    deliveryType: 'city',
    complexityAdditions: {
      radius10to300: 0,
      radius300to1000: 0,
      verticalRadius: 0,
      twoPlaneProduct: 0,
    },
  }

  const form = ref<CalculationForm>({ ...defaultForm })

  // Getters
  const hasResult = computed(() => currentResult.value !== null)
  const formIsValid = computed(() => {
    return (
      form.value.stoneName.length > 0 &&
      form.value.productArea > 0 &&
      form.value.selectedMaterial !== undefined
    )
  })

  // Actions
  async function performCalculation() {
    if (!formIsValid.value) {
      notificationStore.showNotification(
        'Заполните обязательные поля: название камня и площадь изделия',
        'error',
      )
      return
    }

    isLoading.value = true
    try {
      const result = await calculate(form.value)
      currentResult.value = result

      // Создаем запись в истории с сохранением формы целиком
      const historyItem: CalculationHistory = {
        id: result.calculationId ? String(result.calculationId) : String(Date.now()),
        calculationId: result.calculationId || Date.now(),
        form: { ...form.value }, // Сохраняем всю форму включая selectedClient
        totalCost: result.totalCost,
        breakdown: result.breakdown,
        createdAt: result.createdAt || new Date().toISOString(),
        client_info: form.value.selectedClient || result.client_info || null,
        stoneName: form.value.stoneName,
        product_area: form.value.productArea,
        measurement_required: form.value.measurementRequired,
      }

      // Добавляем в начало массива для отображения сверху
      history.value.unshift(historyItem)

      notificationStore.showNotification('Расчет выполнен успешно', 'success')

      // Сбрасываем форму после успешного создания расчета
      resetForm()
    } catch (error: unknown) {
      console.error('Calculation error:', error)
      const errorMessage = (error as Error).message || 'Ошибка при выполнении расчета'
      notificationStore.showNotification(errorMessage, 'error')
    } finally {
      isLoading.value = false
    }
  }

  async function loadHistory() {
    isLoading.value = true
    try {
      // Сохраняем существующие локальные данные о клиентах
      const existingLocalClients = new Map<string | number, Client>()
      history.value.forEach((item) => {
        const id = item.id || item.calculationId
        if (id && item.form?.selectedClient) {
          existingLocalClients.set(id, item.form.selectedClient)
        }
      })

      // Убедимся, что клиенты загружены перед обработкой истории
      if (!clientStore.clients.length) {
        await clientStore.fetchClients()
      }

      const historyData = await getCalculationHistory()

      if (Array.isArray(historyData)) {
        // Обогащаем данные истории информацией о клиенте
        history.value = historyData
          .map((item: CalculationHistory) => {
            const itemId = item.id || item.calculationId
            let clientObj: Client | undefined
            let clientFullName: string = 'Анонимный расчет'

            // Сначала проверяем, есть ли локально сохраненный клиент для этого расчета
            if (itemId && existingLocalClients.has(itemId)) {
              clientObj = existingLocalClients.get(itemId)!
              clientFullName = clientObj.full_name
            }
            // Проверяем, есть ли client_info как объект (предпочтительно от бэкенда)
            else if (
              item.client_info &&
              typeof item.client_info === 'object' &&
              'id' in item.client_info
            ) {
              clientObj = item.client_info as Client
              clientFullName = clientObj.full_name || 'Неизвестный клиент (из client_info)'
            }
            // Если client_info - это просто строка (для обратной совместимости)
            else if (typeof item.client_info === 'string' && item.client_info.trim() !== '') {
              clientFullName = item.client_info
            }
            // Если client - это число (ID), ищем в clientStore
            else if (typeof item.client === 'number') {
              const foundClient = clientStore.clients.find((c) => c.id === item.client)
              if (foundClient) {
                clientObj = foundClient
                clientFullName = foundClient.full_name
              }
            }
            // Если client - это объект клиента
            else if (item.client && typeof item.client === 'object' && 'id' in item.client) {
              clientObj = item.client as Client
              clientFullName = clientObj.full_name || 'Неизвестный клиент (из client object)'
            }

            return {
              ...item,
              client_info: clientObj
                ? {
                    id: clientObj.id,
                    full_name: clientObj.full_name,
                    contact_phone: clientObj.contact_phone,
                    email: clientObj.email,
                    address: clientObj.address,
                  }
                : null,
              form: {
                ...defaultForm,
                stoneName: item.stoneName || item.form?.stoneName || '',
                productArea: item.product_area || item.form?.productArea || 0,
                selectedMaterial: item.form?.selectedMaterial,
                selectedClient: clientObj,
                measurementRequired:
                  item.measurement_required || item.form?.measurementRequired || false,
                surfaceBonding: item.surface_bonding || item.form?.surfaceBonding || 0,
                edgeType: item.edge_type || item.form?.edgeType || 'radius',
                edgeLength: item.edge_length || item.form?.edgeLength || 0,
                drainageType: item.drainage_type || item.form?.drainageType || 'overlay',
                drainageLength: item.drainage_length || item.form?.drainageLength || 0,
                frontBend: item.front_bend || item.form?.frontBend || 0,
                ventilationHoles: item.ventilation_holes || item.form?.ventilationHoles || 0,
                cooktopCutouts: item.cooktop_cutouts || item.form?.cooktopCutouts || 0,
                overlaySinkCutouts: item.overlay_sink_cutouts || item.form?.overlaySinkCutouts || 0,
                undermountSinkInstallations:
                  item.undermount_sink_installations || item.form?.undermountSinkInstallations || 0,
                onSiteJoining: item.on_site_joining || item.form?.onSiteJoining || 0,
                deliveryType: item.delivery_type || item.form?.deliveryType || 'city',
                complexityAdditions: item.form?.complexityAdditions || {
                  radius10to300: 0,
                  radius300to1000: 0,
                  verticalRadius: 0,
                  twoPlaneProduct: 0,
                },
              } as CalculationForm,
              clientNameForDisplay: clientFullName,
            }
          })
          .filter((item) => item && (item.id || item.calculationId))
      } else {
        history.value = []
      }
    } catch (error) {
      console.warn('Failed to load calculation history:', error)
      history.value = []
      notificationStore.showNotification('Ошибка при загрузке истории расчетов.', 'error')
    } finally {
      isLoading.value = false
    }
  }

  function resetForm() {
    form.value = { ...defaultForm }
    currentResult.value = null
  }

  function clearResult() {
    currentResult.value = null
  }

  function setSelectedMaterial(material: Material) {
    form.value.selectedMaterial = material
    form.value.stoneName = material.color_code || material.material_name
  }

  async function deleteCalculation(id: string | number) {
    console.log('Deleting calculation from store:', id)
    isLoading.value = true
    try {
      await deleteCalculationAPI(id)
      console.log('Calculation deleted via API, reloading history...')

      // Удаляем из локального массива для мгновенного обновления UI
      history.value = history.value.filter((calc) => {
        const calcId = calc.id || calc.calculationId
        return calcId !== id && calcId !== String(id) && calcId !== Number(id)
      })

      // Перезагружаем историю для синхронизации с сервером
      // await loadHistory(); // Можно отключить, если уверен в фильтрации
      notificationStore.showNotification('Расчет успешно удален!', 'success')
    } catch (error) {
      console.error('Error deleting calculation:', error)
      notificationStore.showNotification('Ошибка при удалении расчета', 'error')
      throw error
    } finally {
      isLoading.value = false
    }
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
    loadHistory,
    resetForm,
    clearResult,
    setSelectedMaterial,
    deleteCalculation,
  }
})
