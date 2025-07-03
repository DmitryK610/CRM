export interface Material {
  id: number

  material_name: string

  color_code: string // Артикул материала

  supplier: number // Идентификатор поставщика

  cost: number

  note?: string // Дополнительное поле для описания материала

  created_at: string // Add the missing property

  image_url?: string // URL изображения материала (если есть)

  supplier_details?: {
    // Добавьте это свойство
    id: number
    company_name: string
  }
}
