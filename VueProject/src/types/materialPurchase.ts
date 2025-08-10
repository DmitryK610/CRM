
interface SimpleSupplier {
  id: number
  company_name: string
}


interface SimpleMaterialDetails {
  id: number
  material_name: string
  color_code: string

  supplier_details: SimpleSupplier | null
}


interface SimpleOrderDetails {
  id: number
  order_number: string | null
}


interface MaterialPurchase {
  id: number // Идентификатор закупки
  material: number // ID связанного материала (для записи/в StartEdit)
  order: number | null // ID связанного заказа (для записи/в StartEdit)
  quantity: number // Закупленное количество
  total_cost: number // Общая стоимость закупки
  payment_method: string // Ключ способа оплаты ('cash', 'cashless')
  purchase_order_date: string // Дата заказа у поставщика (формат YYYY-MM-DD)
  status: string // Ключ статуса получения ('not-received', 'received', 'cancelled')
  received_date: string | null // Дата получения от поставщика (формат YYYY-MM-DD или null)
  notes: string | null // Примечание к закупке
  created_at: string // Дата создания записи (строка ISO 8601)
  updated_at: string // Дата обновления записи (строка ISO 8601)


  material_details: SimpleMaterialDetails | null
  order_details: SimpleOrderDetails | null


  payment_method_display: string
  status_display: string
}



type MaterialPurchaseCreatePayload = Omit<
  MaterialPurchase,
  | 'id'
  | 'created_at'
  | 'updated_at'
  | 'material_details'
  | 'order_details'
  | 'payment_method_display'
  | 'status_display'
>



type MaterialPurchaseUpdatePayload = Partial<MaterialPurchaseCreatePayload>


export type { MaterialPurchase, MaterialPurchaseCreatePayload, MaterialPurchaseUpdatePayload }
