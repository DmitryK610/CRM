export interface HistoryItem {
  id: number

  описаниеДействия: string

  idСотрудник: number

  датаИВремяИзменения: string // Или Date, в зависимости от формата хранения даты и времени
}
