// src/api/employee.ts

import { api } from '@/utils/api';
import type { Employee } from '@/types/employee';

const EMPLOYEES_ENDPOINT = '/api/employees/'; // Замените на фактический эндпоинт вашего API

/**
 * Получает список всех сотрудников.
 * @returns Промис с массивом сотрудников.
 */
export async function getEmployees<T>(): Promise<T> {
  const response = await api.get<T | null>(EMPLOYEES_ENDPOINT);
  if (response === null) {
    throw new Error('Received null response from API');
  }
  return response;
}

/**
 * Получает информацию о конкретном сотруднике по его ID.
 * @param id Идентификатор сотрудника.
 * @returns Промис с информацией о сотруднике.
 */
export async function getEmployeeById<T>(id: number): Promise<T> {
  const response = await api.get<T | null>(`${EMPLOYEES_ENDPOINT}${id}/`);
  if (response === null) {
    throw new Error('Received null response from API');
  }
  return response;
}

/**
 * Создает нового сотрудника.
 * @param employeeData Данные нового сотрудника.
 * @returns Промис с информацией о созданном сотруднике.
 */
export async function createEmployee<T, R>(employeeData: T): Promise<R> {
  const response = await api.post<T, R | null>(EMPLOYEES_ENDPOINT, employeeData);
  if (response === null) {
    throw new Error('Received null response from API');
  }
  return response;
}

/**
 * Обновляет информацию о существующем сотруднике.
 * @param id Идентификатор сотрудника для обновления.
 * @param employeeData Обновленные данные сотрудника.
 * @returns Промис с информацией об обновленном сотруднике.
 */
export async function updateEmployee<T, R>(id: number, employeeData: T): Promise<R> {
  const response = await api.put<T, R | null>(`${EMPLOYEES_ENDPOINT}${id}/`, employeeData);
  if (response === null) {
    throw new Error('Received null response from API');
  }
  return response;
}

/**
 * Удаляет сотрудника по его ID.
 * @param id Идентификатор сотрудника для удаления.
 * @returns Промис без тела ответа (в случае успеха).
 */
export async function deleteEmployee(id: number): Promise<void> {
  await api.delete(`${EMPLOYEES_ENDPOINT}${id}/`);
}
