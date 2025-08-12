
import { api } from '@/utils/api';


const CLIENTS_ENDPOINT = 'clients/';


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


export async function getClientById<T>(id: number): Promise<T> {
  const response = await api.get<T | null>(`${CLIENTS_ENDPOINT}${id}/`);
  if (response === null) {
    throw new Error('Received null response from API');
  }
  return response;
}


export async function createClient<T, R>(clientData: T): Promise<R> {
  const response = await api.post<T, R | null>(CLIENTS_ENDPOINT, clientData);
  if (response === null) {
    throw new Error('Received null response from API');
  }
  return response;
}


export async function updateClient<T, R>(id: number, clientData: T): Promise<R> {
  const response = await api.put<T, R | null>(`${CLIENTS_ENDPOINT}${id}/`, clientData);
  if (response === null) {
    throw new Error('Received null response from API');
  }
  return response;
}


export async function deleteClient(id: number): Promise<void> {
  const response = await api.delete(`${CLIENTS_ENDPOINT}${id}/`);
  if (response === null) {
    throw new Error('Received null response from API');
  }
  return;
}
