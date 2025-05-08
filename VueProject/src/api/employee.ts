// src/api/employee.ts

import { api } from '@/utils/api';
import type { Employee } from '@/types/employee';

const EMPLOYEES_ENDPOINT = '/api/employees/'; // Замените на фактический эндпоинт вашего API

/**
 * Получает список всех сотрудников.
 * @returns Промис с массивом сотрудников.
 */
export async function getEmployees<T>(): Promise<T> {
  return api.get<T>(EMPLOYEES_ENDPOINT);
}

/**
 * Получает информацию о конкретном сотруднике по его ID.
 * @param id Идентификатор сотрудника.
 * @returns Промис с информацией о сотруднике.
 */
export async function getEmployeeById<T>(id: number): Promise<T> {
  return api.get<T>(`${EMPLOYEES_ENDPOINT}${id}/`);
}

/**
 * Создает нового сотрудника.
 * @param employeeData Данные нового сотрудника.
 * @returns Промис с информацией о созданном сотруднике.
 */
export async function createEmployee<T, R>(employeeData: T): Promise<R> {
  return api.post<T, R>(EMPLOYEES_ENDPOINT, employeeData);
}

/**
 * Обновляет информацию о существующем сотруднике.
 * @param id Идентификатор сотрудника для обновления.
 * @param employeeData Обновленные данные сотрудника.
 * @returns Промис с информацией об обновленном сотруднике.
 */
export async function updateEmployee<T, R>(id: number, employeeData: T): Promise<R> {
  return api.put<T, R>(`${EMPLOYEES_ENDPOINT}${id}/`, employeeData);
}

/**
 * Удаляет сотрудника по его ID.
 * @param id Идентификатор сотрудника для удаления.
 * @returns Промис без тела ответа (в случае успеха).
 */
export async function deleteEmployee(id: number): Promise<void> {
  return api.delete(`${EMPLOYEES_ENDPOINT}${id}/`);
}
