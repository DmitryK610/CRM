
export interface Client {
  
  id: number

  
  full_name: string

  
  contact_phone: string

  
  email: string

  
  address: string

  
  note: string | null

  created_at?: string // Дата создания записи клиента в базе данных
  updatedAt?: string // Дата последнего обновления записи клиента в базе данных
}


export type ClientCreateData = Omit<Client, 'id'>




export type ClientUpdateData = Partial<Omit<Client, 'id'>> & Required<Pick<Client, 'id'>>
