import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';

// Функция для очистки URL от дублирующихся слэшей
const normalizeUrl = (url: string) => url.replace(/([^:]\/)\/+/g, '$1');

const instance = axios.create({
  baseURL: 'https://dkor.pro/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавляем интерцептор для очистки URL
instance.interceptors.request.use(config => {
  config.url = normalizeUrl(config.url || '');
  return config;
});

export const api = {
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await instance.get<T>(normalizeUrl(url), config);
    return response.data;
  },
  post: async <T, R>(url: string, data: T, config?: AxiosRequestConfig): Promise<R> => {
    const response = await instance.post<R>(normalizeUrl(url), data, config);
    return response.data;
  },
  put: async <T, R>(url: string, data: T, config?: AxiosRequestConfig): Promise<R> => {
    const response = await instance.put<R>(normalizeUrl(url), data, config);
    return response.data;
  },
  delete: async <T = void>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await instance.delete<T>(normalizeUrl(url), config);
    return response.data;
  },
};