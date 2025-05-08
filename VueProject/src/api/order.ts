
// src/api/order.ts

import { api } from '@/utils/api'; // Предполагаем, что api - это ваш настроенный экземпляр Axios или обертка вокруг fetch
// Убедитесь, что типы Order и OrderStatus корректно определены
import type { Order, OrderStatus } from '@/types/order'; // Импортируем типы Order и OrderStatus


const ORDERS_ENDPOINT = '/api/orders/'; // Замените на фактический эндпоинт вашего API для заказов

/**
 * Получает список всех заказов.
 * @returns Промис с массивом заказов (или PaginatedResponse, если API пагинирует).
 */
// Тип T здесь соответствует тому, что возвращает ваш API (массив Order[] или PaginatedResponse<Order>)
export async function getOrders<T>(): Promise<T> {
 // Убедитесь, что этот эндпоинт возвращает список заказов
 return api.get<T>(ORDERS_ENDPOINT);
}

/**
 * Получает информацию о конкретном заказе по его ID.
 * @param id Идентификатор заказа (может быть строкой, если ваши ID строковые).
 * @returns Промис с информацией о заказе (типа Order).
 */
export async function getOrderById(id: number | string): Promise<Order> {
 // Убедитесь, что этот эндпоинт возвращает один заказ
 return api.get<Order>(`${ORDERS_ENDPOINT}${id}/`);
}

/**
 * Создает новый заказ.
 * @param orderData Данные нового заказа.
 * @returns Промис с информацией о созданном заказе.
 */
// T - тип данных, отправляемых при создании; R - тип данных в ответе (обычно созданный Order)
export async function createOrder<T, R = Order>(orderData: T): Promise<R> {
 // Убедитесь, что этот эндпоинт и метод (POST) используются для создания
 const response = await api.post<T, R>(ORDERS_ENDPOINT, orderData);
 if (response === null) {
   throw new Error('API response is null when creating an order');
 }
 return response;
}

/**
 * Обновляет информацию о существующем заказе.
 * @param id Идентификатор заказа для обновления (может быть строкой).
 * @param orderData Обновленные данные заказа (Partial<Order> или другой тип).
 * @returns Промис с информацией об обновленном заказе.
 */
// T - тип данных, отправляемых при обновлении; R - тип данных в ответе (обычно обновленный Order)
export async function updateOrder<T, R = Order>(id: number | string, orderData: T): Promise<R> {
 // Используйте PUT (для полной замены) или PATCH (для частичного обновления)
 // PATCH чаще подходит для обновления подмножества полей
 return api.patch<T, R>(`${ORDERS_ENDPOINT}${id}/`, orderData); // Или api.put
}

/**
 * Удаляет заказ по его ID.
 * @param id Идентификатор заказа для удаления (может быть строкой).
 * @returns Промис без тела ответа (в случае успеха).
 */
export async function deleteOrder(id: number | string): Promise<void> {
 // Убедитесь, что этот эндпоинт и метод (DELETE) используются для удаления
 return api.delete(`${ORDERS_ENDPOINT}${id}/`);
}

// --- НОВАЯ ФУНКЦИЯ: Обновление статуса заказа ---
/**
 * Обновляет статус конкретного заказа на бэкенде.
 * @param id Идентификатор заказа (может быть строкой).
 * @param status Новый статус заказа.
 * @returns Промис с обновленным объектом заказа.
 */
export async function updateOrderStatus(id: number | string, status: OrderStatus): Promise<Order> {
 try {
  // Отправляем PATCH запрос на эндпоинт заказа с новым статусом в теле
  // Убедитесь, что ваш бэкенд принимает такой запрос и обновляет статус
  // Эндпоинт может быть и другим, например, `${ORDERS_ENDPOINT}${id}/set_status/`
  const response = await api.patch<{ status: OrderStatus }, Order>(`${ORDERS_ENDPOINT}${id}/`, { status: status });

  // Возвращаем данные из ответа, которые должны быть обновленным объектом Order
  if (!response) {
    throw new Error(`API response is null when updating order status ${id}`);
  }
  return response;

 } catch (error) {
  console.error(`API Error updating order status ${id}:`, error);
  throw error; // Перебрасываем ошибку дальше для обработки в Store или компоненте
 }
}


// Удаляем эту заглушку функции, так как есть getOrders
// export function fetchOrders() {
//  throw new Error('Function not implemented.');
// }
