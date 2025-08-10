


import { api } from '@/utils/api'; // Предполагаем, что api - это ваш настроенный экземпляр Axios или обертка вокруг fetch

import type { Order, OrderStatus } from '@/types/order'; // Импортируем типы Order и OrderStatus


const ORDERS_ENDPOINT = '/api/orders/'; // Замените на фактический эндпоинт вашего API для заказов



export async function getOrders<T>(): Promise<T> {

 const response = await api.get<T | null>(ORDERS_ENDPOINT);
 if (response === null) {
   throw new Error('Received null response from API');
 }
 return response;
}


export async function getOrderById(id: number | string): Promise<Order> {

 const response = await api.get<Order | null>(`${ORDERS_ENDPOINT}${id}/`);
 if (response === null) {
   throw new Error('Received null response from API');
 }
 return response;
}



export async function createOrder<T, R = Order>(orderData: T): Promise<R> {

 const response = await api.post<T, R>(ORDERS_ENDPOINT, orderData);
 if (response === null) {
   throw new Error('API response is null when creating an order');
 }
 return response;
}



export async function updateOrder<T, R = Order>(id: number | string, orderData: T): Promise<R> {


 const response = await api.patch<T, R | null>(`${ORDERS_ENDPOINT}${id}/`, orderData); // Или api.put
 if (response === null) {
   throw new Error('Received null response from API');
 }
 return response;
}


export async function deleteOrder(id: number | string): Promise<void> {

 await api.delete(`${ORDERS_ENDPOINT}${id}/`);
}



export async function updateOrderStatus(id: number | string, status: OrderStatus): Promise<Order> {
 try {



  const response = await api.patch<{ status: OrderStatus }, Order>(`${ORDERS_ENDPOINT}${id}/`, { status: status });


  if (!response) {
    throw new Error(`API response is null when updating order status ${id}`);
  }
  return response;

 } catch (error) {
  console.error(`API Error updating order status ${id}:`, error);
  throw error; // Перебрасываем ошибку дальше для обработки в Store или компоненте
 }
}






