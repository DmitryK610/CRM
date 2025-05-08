export interface Supplier {
  id: number

  company_name: string

  contact_person: string

  email: string

  supplier_address: string

  phone: string

  createdAt: string // Дата и время создания записи

  note: string | null // Дополнительные примечания или комментарии о поставщике
}
