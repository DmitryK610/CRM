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
 * Выполняет расчет на основе предоставленных данных БЕЗ сохранения в базу данных.
 * Отправляет данные на бэкенд для расчета с флагом preview_only=true.
 * Возвращает только результат расчета для отображения в интерфейсе.
 * @param calculationData Данные для расчета
 * @returns Результат расчета
 */
export async function calculate(calculationData: CalculationForm): Promise<CalculationResult> {
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

    // Основные данные - используем формат, который ожидает CalculationSerializer
    stoneName: calculationData.selectedMaterial?.color_code || calculationData.stoneName, // сериализатор ожидает color_code
    productArea: calculationData.productArea, // сериализатор ожидает camelCase
    measurementRequired: calculationData.measurementRequired, // сериализатор ожидает camelCase

    // Дополнительные параметры - используем формат, который ожидает CalculationSerializer
    surfaceBonding: calculationData.surfaceBonding, // сериализатор ожидает camelCase
    edgeType: calculationData.edgeType, // сериализатор ожидает camelCase
    edgeLength: calculationData.edgeLength, // сериализатор ожидает camelCase
    drainageType: calculationData.drainageType, // сериализатор ожидает camelCase
    drainageLength: calculationData.drainageLength, // сериализатор ожидает camelCase
    frontBend: calculationData.frontBend, // сериализатор ожидает camelCase
    ventilationHoles: calculationData.ventilationHoles, // сериализатор ожидает camelCase
    cooktopCutouts: calculationData.cooktopCutouts, // сериализатор ожидает camelCase
    overlaySinkCutouts: calculationData.overlaySinkCutouts, // сериализатор ожидает camelCase
    undermountSinkInstallations: calculationData.undermountSinkInstallations, // сериализатор ожидает camelCase
    onSiteJoining: calculationData.onSiteJoining, // сериализатор ожидает camelCase
    deliveryType: calculationData.deliveryType, // сериализатор ожидает camelCase

    // Надбавка за сложность - используем формат, который ожидает CalculationSerializer
    complexityAdditions: calculationData.complexityAdditions, // сериализатор обрабатывает это поле

    // Флаг указывающий, что это предварительный расчет без сохранения
    preview_only: true,
  }

  // Отправляем POST запрос на основной endpoint с флагом preview_only
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
 * Сохраняет новый расчет в базу данных.
 * Эта функция вызывается после того, как расчет был выполнен и его результат получен.
 * @param calculationData Полные данные расчета, включая результат (totalCost, breakdown).
 * @returns Сохраненный объект истории расчета (CalculationHistory).
 */
export async function saveNewCalculation(
  calculationData: CalculationForm & { totalCost: number; breakdown: Record<string, unknown> },
): Promise<CalculationHistory> {
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

    // Основные данные - используем формат, который ожидает CalculationSerializer
    stoneName: calculationData.selectedMaterial?.color_code || calculationData.stoneName, // сериализатор ожидает color_code
    productArea: calculationData.productArea, // сериализатор ожидает camelCase
    measurementRequired: calculationData.measurementRequired, // сериализатор ожидает camelCase

    // Дополнительные параметры - используем формат, который ожидает CalculationSerializer
    surfaceBonding: calculationData.surfaceBonding, // сериализатор ожидает camelCase
    edgeType: calculationData.edgeType, // сериализатор ожидает camelCase
    edgeLength: calculationData.edgeLength, // сериализатор ожидает camelCase
    drainageType: calculationData.drainageType, // сериализатор ожидает camelCase
    drainageLength: calculationData.drainageLength, // сериализатор ожидает camelCase
    frontBend: calculationData.frontBend, // сериализатор ожидает camelCase
    ventilationHoles: calculationData.ventilationHoles, // сериализатор ожидает camelCase
    cooktopCutouts: calculationData.cooktopCutouts, // сериализатор ожидает camelCase
    overlaySinkCutouts: calculationData.overlaySinkCutouts, // сериализатор ожидает camelCase
    undermountSinkInstallations: calculationData.undermountSinkInstallations, // сериализатор ожидает camelCase
    onSiteJoining: calculationData.onSiteJoining, // сериализатор ожидает camelCase
    deliveryType: calculationData.deliveryType, // сериализатор ожидает camelCase

    // Надбавка за сложность - используем формат, который ожидает CalculationSerializer
    complexityAdditions: calculationData.complexityAdditions, // сериализатор обрабатывает это поле

    // Результаты расчета не нужно передавать - бэкенд пересчитает их
    // totalCost: calculationData.totalCost,
    // breakdown: calculationData.breakdown,

    // НЕ передаем preview_only - расчет сохраняется в базу данных
  }

  // Отправляем POST запрос на основной endpoint для сохранения
  const result = await api.post<typeof backendData, CalculationHistory>(
    CALCULATION_ENDPOINT,
    backendData,
  )

  if (!result) {
    throw new Error('Ошибка при сохранении расчета')
  }

  return result
}

/**
 * Получение истории расчетов.
 * @returns Промис с массивом истории расчетов.
 */
export async function getCalculationHistory(): Promise<CalculationHistory[]> {
  const result = await api.get<DjangoPagedResponse<CalculationHistory> | CalculationHistory[]>(
    CALCULATION_ENDPOINT,
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
  const result = await api.get<CalculationHistory>(`${CALCULATION_ENDPOINT}${id}/`)

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
  await api.delete(`${CALCULATION_ENDPOINT}${id}/`)
}
