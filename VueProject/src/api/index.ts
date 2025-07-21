// @/api/index.ts
import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';

const instance = axios.create({
  baseURL: 'https://dkor.pro/api', 
  timeout: 10000, // Пример таймаута
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await instance.get<T>(url, config);
    return response.data;
  },
  post: async <T, R>(url: string, data: T, config?: AxiosRequestConfig): Promise<R> => {
    const response = await instance.post<R>(url, data, config);
    return response.data;
  },
  put: async <T, R>(url: string, data: T, config?: AxiosRequestConfig): Promise<R> => {
    const response = await instance.put<R>(url, data, config);
    return response.data;
  },
  delete: async <T = void>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await instance.delete<T>(url, config);
    return response.data;
  },
};
