export interface Employee {
  /**
   * Уникальный идентификатор сотрудника.
   */
  id: number

  /**
   * Полное имя сотрудника (из API).
   */
  full_name: string // <-- ИСПРАВЛЕНО на full_name

  phone: string // Номер телефона сотрудника

  position: string // Должность сотрудника

  /**
   * Дата приема на работу (из API).
   */
  hired_date: string // <-- ИСПРАВЛЕНО на hired_date

  created_at: string // Дата создания записи о сотруднике (возможно, тоже в snake_case в API?)
  // Проверьте по логам или ответу API, как точно называется поле даты создания
  // Если в API оно называется 'created_at', измените здесь на created_at: string;
}
