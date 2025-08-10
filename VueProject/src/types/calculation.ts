

import type { Material } from './material'
import type { Client } from './client'
import type { PriceList } from './priceList' 

export interface CalculationForm {
  selectedClient?: Client // Полный объект клиента, если выбран
  stoneName: string
  selectedMaterial?: Material // Полный объект материала, если выбран
  productArea: number
  measurementRequired: boolean
  surfaceBonding: number
  edgeType: 'radius' | 'figured'
  edgeLength: number
  drainageType: 'overlay' | 'integrated'
  drainageLength: number
  frontBend: number
  ventilationHoles: number
  cooktopCutouts: number
  overlaySinkCutouts: number
  undermountSinkInstallations: number
  onSiteJoining: number
  deliveryType: 'city' | 'outside_city'
  deliveryRequired: boolean // Новое поле: требуется ли доставка
  orderId?: number | null // Добавлено поле для связи с заказом
  complexityAdditions: {
    radius10to300: number
    radius300to1000: number
    verticalRadius: number
    twoPlaneProduct: number
  }
 
  dollarRate: number 
  priceList: PriceList 
}

export interface CalculationResult {
  totalCost: number
  breakdown: Record<
    string,
    { name: string; quantity: number; unitPrice: number; totalPrice: number }
  >
  calculationId?: number | string // ID может быть числом или строкой

  client_info?: Client | string | null
  stoneName?: string
  createdAt?: string
  orderId?: number | null // Добавлено поле для связи с заказом

  product_area?: number // Добавлено, если бэкенд возвращает product_area
  measurement_required?: boolean
  surface_bonding?: number
  edge_type?: 'radius' | 'figured'
  edge_length?: number
  drainage_type?: 'overlay' | 'integrated'
  drainage_length?: number
  front_bend?: number
  ventilation_holes?: number
  cooktop_cutouts?: number
  overlay_sink_cutouts?: number
  undermount_sink_installations?: number
  on_site_joining?: number
  delivery_type?: 'city' | 'outside_city'


  dollar_rate?: number // Добавлено, если бэкенд возвращает dollar_rate в результате
  price_list?: PriceList // Добавлено, если бэкенд возвращает price_list в результате


}

export interface CalculationHistory extends Omit<CalculationResult, 'client_info'> {
  id?: number | string // Для старых записей, где может быть просто 'id'
  client?: number | Client | null // client может быть ID или полным объектом
  form?: CalculationForm // Если вы сохраняете всю форму в истории
  clientNameForDisplay?: string // Добавлено для удобства отображения имени клиента
  client_info?: Client | string | null | Record<string, unknown> // Расширяем тип для совместимости с разными API
  orderId?: number | null // Добавлено поле для связи с заказом
  orderNumber?: string | null // Добавлено для отображения номера заказа
}
