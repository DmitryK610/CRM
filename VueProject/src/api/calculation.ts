// src/api/calculation.ts

import { api } from '@/utils/api'
import type { CalculationForm, CalculationResult, CalculationHistory } from '@/types/calculation'

const CALCULATION_ENDPOINT = '/api/calculations/'

// Интерфейс для ответа Django REST Framework с пагинацией
interface DjangoPagedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

/**
 * Выполняет расчет на основе предоставленных данных.
 * @param calculationData Данные для расчета
 * @returns Результат расчета
 */
export async function calculate(calculationData: CalculationForm): Promise<CalculationResult> {
  // Создаем минимальную структуру данных для backend
  const backendData = {
    // Информация о клиенте (если выбран)
    client: calculationData.selectedClient?.id || null,
    client_info: calculationData.selectedClient
      ? {
          id: calculationData.selectedClient.id,
          full_name: calculationData.selectedClient.full_name,
          contact_phone: calculationData.selectedClient.contact_phone,
          email: calculationData.selectedClient.email,
        }
      : null,

    // Основные данные
    stoneName: calculationData.stoneName,
    material: calculationData.selectedMaterial?.id,
    productArea: calculationData.productArea,
    measurementRequired: calculationData.measurementRequired,

    // Дополнительные параметры
    surfaceBonding: calculationData.surfaceBonding,
    edgeType: calculationData.edgeType,
    edgeLength: calculationData.edgeLength,
    drainageType: calculationData.drainageType,
    drainageLength: calculationData.drainageLength,
    frontBend: calculationData.frontBend,
    ventilationHoles: calculationData.ventilationHoles,
    cooktopCutouts: calculationData.cooktopCutouts,
    overlaySinkCutouts: calculationData.overlaySinkCutouts,
    undermountSinkInstallations: calculationData.undermountSinkInstallations,
    onSiteJoining: calculationData.onSiteJoining,
    deliveryType: calculationData.deliveryType,
    complexityAdditions: calculationData.complexityAdditions,
  }

  const result = await api.post<typeof backendData, CalculationResult>(
    CALCULATION_ENDPOINT,
    backendData,
  )

  if (!result) {
    throw new Error('Ошибка при выполнении расчета')
  }

  return result
}

/**
 * Получение истории расчетов.
 * @returns Промис с массивом истории расчетов.
 */
export async function getCalculationHistory(): Promise<CalculationHistory[]> {
  const result = await api.get<DjangoPagedResponse<CalculationHistory> | CalculationHistory[]>(
    '/api/calculations/',
  )

  if (!result) {
    return []
  }

  // Если это объект с пагинацией Django REST Framework
  if ('results' in result && Array.isArray(result.results)) {
    return result.results
  }

  // Если это обычный массив
  if (Array.isArray(result)) {
    return result
  }

  return []
}

/**
 * Получение расчета по ID.
 * @param id Идентификатор расчета.
 * @returns Промис с информацией о расчете.
 */
export async function getCalculationById(id: string): Promise<CalculationHistory> {
  const result = await api.get<CalculationHistory>(`/api/calculations/${id}/`)

  if (!result) {
    throw new Error('Расчет не найден')
  }

  return result
}

/**
 * Удаление расчета по ID.
 * @param id Идентификатор расчета.
 * @returns Промис, который завершается после удаления.
 */
export async function deleteCalculation(id: string | number): Promise<void> {
  await api.delete(`/api/calculations/${id}/`)
}
