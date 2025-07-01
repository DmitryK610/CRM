// src/stores/calculationStore.ts

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CalculationForm, CalculationResult, CalculationHistory } from '@/types/calculation'
import type { Material } from '@/types/material'
import type { Client } from '@/types/client'
import {
  calculate,
  getCalculationHistory,
  deleteCalculation as deleteCalculationAPI,
  saveNewCalculation, // <-- Импортируем новую функцию для сохранения
} from '@/api/calculation'
import { useNotificationStore } from './notificationStore'
import { useClientStore } from './clientStore'

export const useCalculationStore = defineStore('calculation', () => {
  const notificationStore = useNotificationStore()
  const clientStore = useClientStore()

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

  // Функция для выполнения расчета (только получение результата, без сохранения)
  async function performCalculation() {
    if (!formIsValid.value) {
      notificationStore.showNotification(
        'Заполните обязательные поля: артикул камня и площадь изделия',
        'error',
      )
      return
    }

    isLoading.value = true
    try {
      // Вызываем функцию calculate, которая только считает без сохранения
      const result = await calculate(form.value)
      currentResult.value = result
      notificationStore.showNotification(
        'Расчет успешно выполнен. Нажмите "Сохранить расчет" для сохранения.',
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

  // Новая функция для сохранения расчета
  async function saveCalculation(): Promise<boolean> {
    if (!currentResult.value) {
      notificationStore.showNotification('Сначала выполните расчет.', 'error')
      return false
    }

    isLoading.value = true
    try {
      // Отправляем текущие данные формы и результат расчета на сервер для сохранения
      const calculationToSave = {
        ...form.value,
        totalCost: currentResult.value.totalCost,
        breakdown: currentResult.value.breakdown,
        // Передаем только ID клиента, если он выбран, или null
        client_id: form.value.selectedClient?.id || null,
        // Добавляем поля, которые бэкенд может ожидать напрямую
        stone_id: form.value.selectedMaterial?.id,
        product_area: form.value.productArea,
        measurement_required: form.value.measurementRequired,
        surface_bonding: form.value.surfaceBonding,
        edge_type: form.value.edgeType,
        edge_length: form.value.edgeLength,
        drainage_type: form.value.drainageType,
        drainage_length: form.value.drainageLength,
        front_bend: form.value.frontBend,
        ventilation_holes: form.value.ventilationHoles,
        cooktop_cutouts: form.value.cooktopCutouts,
        overlay_sink_cutouts: form.value.overlaySinkCutouts,
        undermount_sink_installations: form.value.undermountSinkInstallations,
        on_site_joining: form.value.onSiteJoining,
        delivery_type: form.value.deliveryType,
        complexity_additions: form.value.complexityAdditions,
      }

      const savedCalculation = await saveNewCalculation(calculationToSave)

      // После успешного сохранения, добавляем его в историю
      const historyItem: CalculationHistory = {
        id: savedCalculation.calculationId
          ? String(savedCalculation.calculationId)
          : String(Date.now()),
        calculationId: savedCalculation.calculationId || Date.now(),
        form: { ...form.value }, // Сохраняем всю форму
        totalCost: savedCalculation.totalCost,
        breakdown: savedCalculation.breakdown,
        createdAt: savedCalculation.createdAt || new Date().toISOString(),
        client_info: form.value.selectedClient || savedCalculation.client_info || null,
        stoneName: form.value.stoneName, // Для отображения в списке истории
        product_area: form.value.productArea, // Для отображения в списке истории
        measurement_required: form.value.measurementRequired, // Для отображения в списке истории
      }
      history.value.unshift(historyItem) // Добавляем в начало

      notificationStore.showNotification('Расчет успешно сохранен!', 'success')
      resetForm() // Сбрасываем форму после сохранения
      clearResult() // Очищаем результат
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
    currentResult.value = null // Очищаем результат при сбросе формы
  }

  function clearResult() {
    currentResult.value = null
  }

  function setSelectedMaterial(material: Material) {
    form.value.selectedMaterial = material
    form.value.stoneName = material.color_code || material.material_name
  }

  async function deleteCalculation(id: string | number) {
    isLoading.value = true
    try {
      await deleteCalculationAPI(id)

      // Удаляем из локального массива для мгновенного обновления UI
      history.value = history.value.filter((calc) => {
        const calcId = calc.id || calc.calculationId
        return calcId !== id && calcId !== String(id) && calcId !== Number(id)
      })
    } catch (error) {
      console.error('Error deleting calculation:', error)
      // Пробрасываем ошибку дальше для обработки в компоненте
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
    saveCalculation, // <--- Добавляем новую функцию в экспортируемые действия
    loadHistory,
    resetForm,
    clearResult,
    setSelectedMaterial,
    deleteCalculation,
  }
})
