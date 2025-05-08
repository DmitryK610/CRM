
import { api } from '@/utils/api';


const CLIENTS_ENDPOINT = '/api/clients/';

/**
 * Получает список всех клиентов.
 * @returns
 */
export async function getClients<T>(searchQuery?: string): Promise<T> {
  let url = CLIENTS_ENDPOINT;
  if (searchQuery) {
    url += `?search=${searchQuery}`;
  }
  const response = await api.get<T | null>(url);
  if (response === null) {
    throw new Error('Received null response from API');
  }
  return response;
}

/**
 * Получает информацию о конкретном клиенте по его ID.
 * @param id Идентификатор клиента.
 * @returns Промис с информацией о клиенте.
 */
export async function getClientById<T>(id: number): Promise<T> {
  const response = await api.get<T | null>(`${CLIENTS_ENDPOINT}${id}/`);
  if (response === null) {
    throw new Error('Received null response from API');
  }
  return response;
}

/**
 * Создает нового клиента.
 * @param clientData Данные нового клиента.
 * @returns Промис с информацией о созданном клиенте.
 */
export async function createClient<T, R>(clientData: T): Promise<R> {
  const response = await api.post<T, R | null>(CLIENTS_ENDPOINT, clientData);
  if (response === null) {
    throw new Error('Received null response from API');
  }
  return response;
}

/**
 * Обновляет информацию о существующем клиенте.
 * @param id Идентификатор клиента для обновления.
 * @param clientData Обновленные данные клиента.
 * @returns Промис с информацией об обновленном клиенте.
 */
export async function updateClient<T, R>(id: number, clientData: T): Promise<R> {
  const response = await api.put<T, R | null>(`${CLIENTS_ENDPOINT}${id}/`, clientData);
  if (response === null) {
    throw new Error('Received null response from API');
  }
  return response;
}

/**
 * Удаляет клиента по его ID.
 * @param id Идентификатор клиента для удаления.
 * @returns Промис без тела ответа (в случае успеха).
 */
export async function deleteClient(id: number): Promise<void> {
  const response = await api.delete(`${CLIENTS_ENDPOINT}${id}/`);
  if (response === null) {
    throw new Error('Received null response from API');
  }
  return;
}
