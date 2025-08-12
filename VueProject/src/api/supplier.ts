

import { api } from '@/utils/api';
import type { Supplier } from '@/types/supplier';

const SUPPLIERS_ENDPOINT = 'suppliers/';


export async function getSuppliers<T>(): Promise<T> {
  const response = await api.get<T | null>(SUPPLIERS_ENDPOINT);
  if (response === null) {
    throw new Error('Received null response from API');
  }
  return response;
}


export async function getSupplierById<T>(id: number): Promise<T> {
  const response = await api.get<T | null>(`${SUPPLIERS_ENDPOINT}${id}/`);
  if (response === null) {
    throw new Error('Received null response from API');
  }
  return response;
}


export async function createSupplier<T, R>(supplierData: T): Promise<R> {
  const response = await api.post<T, R | null>(SUPPLIERS_ENDPOINT, supplierData);
  if (response === null) {
    throw new Error('Received null response from API');
  }
  return response;
}


export async function updateSupplier<T, R>(id: number, supplierData: T): Promise<R> {
  const response = await api.put<T, R | null>(`${SUPPLIERS_ENDPOINT}${id}/`, supplierData);
  if (response === null) {
    throw new Error('Received null response from API');
  }
  return response;
}


export async function deleteSupplier(id: number): Promise<void> {
  await api.delete(`${SUPPLIERS_ENDPOINT}${id}/`);
}
