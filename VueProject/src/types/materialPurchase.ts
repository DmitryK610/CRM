// Определение типа для вложенных деталей поставщика (согласно SimpleSupplierSerializer)
interface SimpleSupplier {
  id: number
  company_name: string
}

// Определение типа для вложенных деталей материала (согласно SimpleMaterialSerializer)
interface SimpleMaterialDetails {
  id: number
  material_name: string
  color_code: string

  supplier_details: SimpleSupplier | null
}

// Определение типа для вложенных деталей заказа (согласно SimpleOrderSerializer)
interface SimpleOrderDetails {
  id: number
  order_number: string | null
}

// Основной тип MaterialPurchase, отражающий структуру данных, получаемых от API
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

  // Вложенные детали объектов, предоставляемые Serializer (только для чтения на фронтенде)
  material_details: SimpleMaterialDetails | null
  order_details: SimpleOrderDetails | null

  // Текстовые представления полей выбора, предоставляемые Serializer (только для чтения)
  payment_method_display: string
  status_display: string
}

// Тип для полезной нагрузки при создании закупки (данные, отправляемые на бэкенд POST)
// Исключает поля, генерируемые бэкендом или предназначенные только для чтения/отображения
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

// Тип для полезной нагрузки при обновлении закупки (данные, отправляемые на бэкенд PUT/PATCH)
// Частичный тип позволяет отправлять только измененные поля
type MaterialPurchaseUpdatePayload = Partial<MaterialPurchaseCreatePayload>

// Экспорт основного типа MaterialPurchase и, опционально, типов для payload
export type { MaterialPurchase, MaterialPurchaseCreatePayload, MaterialPurchaseUpdatePayload }
