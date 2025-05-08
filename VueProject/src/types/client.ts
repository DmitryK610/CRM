/**
 * @interface Client
 * @description Определяет структуру данных для сущности "Клиент".
 * Соответствует таблице 'Клиент' в базе данных MySQL.
 */
export interface Client {
  /**
   * @property {number} id - Уникальный идентификатор клиента.
   * Соответствует полю 'id' в базе данных.
   */
  id: number

  /**
   * @property {string} full_name - Полное имя клиента (Фамилия Имя Отчество).
   * Соответствует полю 'ФИО' в базе данных.
   */
  full_name: string

  /**
   * @property {string} contact_phone - Контактный телефон клиента.
   * Соответствует полю 'Контактный телефон' в базе данных.
   */
  contact_phone: string

  /**
   * @property {string} email - Адрес электронной почты клиента.
   * Соответствует полю 'электронная почта' в базе данных.
   */
  email: string

  /**
   * @property {string} address - Физический адрес клиента.
   * Соответствует полю 'адрес' в базе данных.
   */
  address: string

  /**
   * @property {string | null} note - Дополнительные примечания или комментарии о клиенте.
   * Поле является необязательным и может быть null.
   * Соответствует полю 'примечание' в базе данных.
   */
  note: string | null

  created_at?: string // Дата создания записи клиента в базе данных
  updatedAt?: string // Дата последнего обновления записи клиента в базе данных
}

/**
 * @type ClientCreateData
 * @description Тип данных для создания нового клиента.
 * Обычно 'id' назначается базой данных, поэтому он исключен.
 * 'note' может быть необязательным при создании.
 */
export type ClientCreateData = Omit<Client, 'id'>
// Или более строгий вариант, если примечание не обязательно при создании:
// export type ClientCreateData = Omit<Client, 'id' | 'note'> & { note?: string | null };

/**
 * @type ClientUpdateData
 * @description Тип данных для обновления существующего клиента.
 * 'id' обязателен для идентификации записи.
 * Все остальные поля необязательны (Partial), так как обновляться может только часть данных.
 */
export type ClientUpdateData = Partial<Omit<Client, 'id'>> & Required<Pick<Client, 'id'>>
