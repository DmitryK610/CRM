export enum OrderStatus {
  NEW = 'Новый',
  CALCULATION_CONFIRMED = 'Расчет подтвержден',
  AWAITING_ADVANCE = 'Ожидает аванса',
  IN_PRODUCTION = 'В производстве',
  READY_FOR_INSTALLATION = 'Готов к установке',
  AWAITING_INSTALLATION = 'Ожидает установки',
  INSTALLATION = 'Установка',
  COMPLETED = 'Выполнен',
  CANCELLED = 'Отменен',
}

export enum AdvancePaymentType {
  CASH = 'cash',
  CASHLESS = 'cashless',
}

export interface OrderCreatePayload {
  order_number?: string | null
  client: number
  material: number
  order_date: string
  total_amount: number
  status: OrderStatus
  material_quantity: number
  installation_date?: string | null
  advance_payment_amount?: number | null
  advance_payment_date?: string | null
  note?: string | null
  advance_payment_type?: AdvancePaymentType | null
  calculation?: number | null
  order_items: Array<{
    product_name: string
    quantity: number | null
    unit_price: number | null
    id?: number
  }>
}

export type OrderUpdatePayload = Partial<OrderCreatePayload>

export interface ClientInfo {
  id: number
  full_name: string | null
  contact_phone: string | null
}

export interface MaterialInfo {
  id: number
  material_name: string | null
  color_code: string | null
}

export interface EmployeeInfo {
  id: number | null
}

export interface OrderItem {
  id?: number | null
  _tempId?: number
  product_name: string
  quantity: number | null
  unit_price: number | null
  total_price?: number | null
  order?: number | null
  description?: string | null
}

export interface Order {
  id: number
  client: number | null
  calculation: number | null
  total_amount: number
  material: number | null
  material_quantity: number | null
  status: OrderStatus | null
  advance_payment_amount: number | null
  advance_payment_date: string | null
  installation_date: string | null
  employee_id: number | null
  needs_installation: boolean
  needs_delivery: boolean
  advance_payment_type: AdvancePaymentType | null
  order_number?: string | null
  created_at: string
  updated_at: string
  order_date: string | null
  note: string | null
  client_info?: ClientInfo
  material_info?: MaterialInfo
  employee_info?: EmployeeInfo | null
  order_items: OrderItem[]
}
