// src/api/calculation.ts

import { api } from '@/utils/api'
import type { CalculationForm, CalculationResult, CalculationHistory } from '@/types/calculation'
import type { PriceListFormData } from '@/types/priceList'

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
  // Проверяем обязательные поля
  if (!calculationData.selectedMaterial && !calculationData.stoneName) {
    throw new Error('Не выбран материал для расчета')
  }

  if (!calculationData.productArea || calculationData.productArea <= 0) {
    throw new Error('Площадь изделия должна быть больше 0')
  }

  // Если доставка не требуется, не отправляем deliveryType и не учитываем delivery_type в priceList
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
    stoneName: calculationData.selectedMaterial?.color_code || calculationData.stoneName,
    productArea: calculationData.productArea,
    measurementRequired: calculationData.measurementRequired,

    // Дополнительные параметры - используем формат, который ожидает CalculationSerializer
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
    ...(calculationData.deliveryRequired !== false && {
      deliveryType: calculationData.deliveryType,
    }),

    // Надбавка за сложность - используем формат, который ожидает CalculationSerializer
    complexityAdditions: calculationData.complexityAdditions,

    // Добавляем dollarRate в backendData
    dollarRate: calculationData.dollarRate,

    // --- ИСПРАВЛЕНО: Удалены поля, которые вызывали TypeError ---
    ...(calculationData.priceList && {
      priceList: {
        measurement: calculationData.priceList.measurement,
        surface_bonding_per_m: calculationData.priceList.surfaceBondingPerM,
        edge_type_per_m: {
          radius: calculationData.priceList.edgeTypePerM.radius,
          figured: calculationData.priceList.edgeTypePerM.figured,
        },
        drainage_type_per_m: {
          overlay: calculationData.priceList.drainageTypePerM.overlay,
          integrated: calculationData.priceList.drainageTypePerM.integrated,
        },
        front_bend_per_m: calculationData.priceList.frontBendPerM,
        ...(calculationData.deliveryRequired !== false && {
          delivery_type: {
            city: calculationData.priceList.deliveryType.city,
            outside_city: calculationData.priceList.deliveryType.outside_city,
          },
        }),
        ventilation_hole_per_unit: calculationData.priceList.ventilationHolePerUnit,
        cooktop_cutout_per_unit: calculationData.priceList.cooktopCutoutPerUnit,
        overlay_sink_cutout_per_unit: calculationData.priceList.overlaySinkCutoutPerUnit,
        undermount_sink_installation_per_unit:
          calculationData.priceList.undermountSinkInstallationPerUnit,
        on_site_joining_per_unit: calculationData.priceList.onSiteJoiningPerUnit,
        radius_10_to_300_per_unit: calculationData.priceList.radius10To300PerUnit,
        radius_300_to_1000_per_unit: calculationData.priceList.radius300To1000PerUnit,
        vertical_radius_per_unit: calculationData.priceList.verticalRadiusPerUnit,
        two_plane_product_per_unit: calculationData.priceList.twoPlaneProductPerUnit,
        // Удалены поля lastSaved, baseMultiplier и все коэффициенты, так как бэкенд не ожидает их здесь
      },
    }),

    // Флаг указывающий, что это предварительный расчет без сохранения
    preview_only: true,
  }

  // Логирование данных для отладки
  // ...удалён console.log...

  try {
    // Отправляем POST запрос на основной endpoint с флагом preview_only
    const result = await api.post<typeof backendData, CalculationResult>(
      CALCULATION_ENDPOINT,
      backendData,
    )

    if (!result) {
      throw new Error('Ошибка при выполнении расчета')
    }

    return result
  } catch (error) {
    console.error('Calculation API error:', error)
    // Пробрасываем ошибку дальше для обработки в store
    throw error
  }
}

/**
 * Сохраняет новый расчет в базу данных.
 * Эта функция вызывается после того, как расчет был выполнен и его результат получен.
 * @param calculationData Полные данные расчета, включая результат (totalCost, breakdown) и прайс-лист.
 * @returns Сохраненный объект истории расчета (CalculationHistory).
 */
export async function saveNewCalculation(
  calculationData: CalculationForm & {
    totalCost: number
    breakdown: Record<string, unknown>
  },
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
    stoneName: calculationData.selectedMaterial?.color_code || calculationData.stoneName,
    productArea: calculationData.productArea,
    measurementRequired: calculationData.measurementRequired,

    // Дополнительные параметры - используем формат, который ожидает CalculationSerializer
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

    // Надбавка за сложность - используем формат, который ожидает CalculationSerializer
    complexityAdditions: calculationData.complexityAdditions,

    // Добавляем dollarRate в backendData для сохранения
    dollarRate: calculationData.dollarRate,

    // --- ИСПРАВЛЕНО: Удалены поля, которые вызывали TypeError ---
    ...(calculationData.priceList && {
      priceList: {
        measurement: calculationData.priceList.measurement,
        surface_bonding_per_m: calculationData.priceList.surfaceBondingPerM,
        edge_type_per_m: {
          radius: calculationData.priceList.edgeTypePerM.radius,
          figured: calculationData.priceList.edgeTypePerM.figured,
        },
        drainage_type_per_m: {
          overlay: calculationData.priceList.drainageTypePerM.overlay,
          integrated: calculationData.priceList.drainageTypePerM.integrated,
        },
        front_bend_per_m: calculationData.priceList.frontBendPerM,
        delivery_type: {
          city: calculationData.priceList.deliveryType.city,
          outside_city: calculationData.priceList.deliveryType.outside_city,
        },
        ventilation_hole_per_unit: calculationData.priceList.ventilationHolePerUnit,
        cooktop_cutout_per_unit: calculationData.priceList.cooktopCutoutPerUnit,
        overlay_sink_cutout_per_unit: calculationData.priceList.overlaySinkCutoutPerUnit,
        undermount_sink_installation_per_unit:
          calculationData.priceList.undermountSinkInstallationPerUnit,
        on_site_joining_per_unit: calculationData.priceList.onSiteJoiningPerUnit,
        radius_10_to_300_per_unit: calculationData.priceList.radius10To300PerUnit,
        radius_300_to_1000_per_unit: calculationData.priceList.radius300To1000PerUnit,
        vertical_radius_per_unit: calculationData.priceList.verticalRadiusPerUnit,
        two_plane_product_per_unit: calculationData.priceList.twoPlaneProductPerUnit,
        // Удалены поля lastSaved, baseMultiplier и все коэффициенты, так как бэкенд не ожидает их здесь
      },
    }),

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
