

import { api } from '@/utils/api';
import type { Employee } from '@/types/employee';

const EMPLOYEES_ENDPOINT = 'employees/';


export async function getEmployees<T>(): Promise<T> {
  const response = await api.get<T | null>(EMPLOYEES_ENDPOINT);
  if (response === null) {
    throw new Error('Received null response from API');
  }
  return response;
}


export async function getEmployeeById<T>(id: number): Promise<T> {
  const response = await api.get<T | null>(`${EMPLOYEES_ENDPOINT}${id}/`);
  if (response === null) {
    throw new Error('Received null response from API');
  }
  return response;
}


export async function createEmployee<T, R>(employeeData: T): Promise<R> {
  const response = await api.post<T, R | null>(EMPLOYEES_ENDPOINT, employeeData);
  if (response === null) {
    throw new Error('Received null response from API');
  }
  return response;
}


export async function updateEmployee<T, R>(id: number, employeeData: T): Promise<R> {
  const response = await api.put<T, R | null>(`${EMPLOYEES_ENDPOINT}${id}/`, employeeData);
  if (response === null) {
    throw new Error('Received null response from API');
  }
  return response;
}


export async function deleteEmployee(id: number): Promise<void> {
  await api.delete(`${EMPLOYEES_ENDPOINT}${id}/`);
}
