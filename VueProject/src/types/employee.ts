export interface Employee {
  
  id: number

  
  full_name: string // <-- ИСПРАВЛЕНО на full_name

  phone: string // Номер телефона сотрудника

  position: string // Должность сотрудника

  
  hired_date: string // <-- ИСПРАВЛЕНО на hired_date

  created_at: string // Дата создания записи о сотруднике (возможно, тоже в snake_case в API?)


}
