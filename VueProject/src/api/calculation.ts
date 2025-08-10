

import { api } from '@/utils/api'
import type { CalculationForm, CalculationResult, CalculationHistory } from '@/types/calculation'
import type { PriceListFormData } from '@/types/priceList'

const CALCULATION_ENDPOINT = '/api/calculations/'


interface DjangoPagedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}


export async function calculate(calculationData: CalculationForm): Promise<CalculationResult> {

  if (!calculationData.selectedMaterial && !calculationData.stoneName) {
    throw new Error('Не выбран материал для расчета')
  }

  if (!calculationData.productArea || calculationData.productArea <= 0) {
    throw new Error('Площадь изделия должна быть больше 0')
  }


  const backendData = {

    client: calculationData.selectedClient?.id || null,
    client_info: calculationData.selectedClient
      ? {
          id: calculationData.selectedClient.id,
          full_name: calculationData.selectedClient.full_name,
          contact_phone: calculationData.selectedClient.contact_phone,
          email: calculationData.selectedClient.email,
        }
      : null,


    stoneName: calculationData.selectedMaterial?.color_code || calculationData.stoneName,
    productArea: calculationData.productArea,
    measurementRequired: calculationData.measurementRequired,


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


    complexityAdditions: calculationData.complexityAdditions,


    dollarRate: calculationData.dollarRate,


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

      },
    }),


    preview_only: true,
  }




  try {

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

    throw error
  }
}


export async function saveNewCalculation(
  calculationData: CalculationForm & {
    totalCost: number
    breakdown: Record<string, unknown>
  },
): Promise<CalculationHistory> {
  const backendData = {

    client: calculationData.selectedClient?.id || null,
    client_info: calculationData.selectedClient
      ? {
          id: calculationData.selectedClient.id,
          full_name: calculationData.selectedClient.full_name,
          contact_phone: calculationData.selectedClient.contact_phone,
          email: calculationData.selectedClient.email,
        }
      : null,


    stoneName: calculationData.selectedMaterial?.color_code || calculationData.stoneName,
    productArea: calculationData.productArea,
    measurementRequired: calculationData.measurementRequired,


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


    dollarRate: calculationData.dollarRate,


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

      },
    }),






  }


  const result = await api.post<typeof backendData, CalculationHistory>(
    CALCULATION_ENDPOINT,
    backendData,
  )

  if (!result) {
    throw new Error('Ошибка при сохранении расчета')
  }

  return result
}


export async function getCalculationHistory(): Promise<CalculationHistory[]> {
  const result = await api.get<DjangoPagedResponse<CalculationHistory> | CalculationHistory[]>(
    CALCULATION_ENDPOINT,
  )

  if (!result) {
    return []
  }


  if ('results' in result && Array.isArray(result.results)) {
    return result.results
  }


  if (Array.isArray(result)) {
    return result
  }

  return []
}


export async function getCalculationById(id: string): Promise<CalculationHistory> {
  const result = await api.get<CalculationHistory>(`${CALCULATION_ENDPOINT}${id}/`)

  if (!result) {
    throw new Error('Расчет не найден')
  }

  return result
}


export async function deleteCalculation(id: string | number): Promise<void> {
  await api.delete(`${CALCULATION_ENDPOINT}${id}/`)
}
