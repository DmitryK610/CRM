// src/api/materialPurchase.ts

import axios from 'axios'; // Предполагается, что axios установлен и сконфигурирован (например, с базовым URL)
import type { MaterialPurchase, MaterialPurchaseCreatePayload, MaterialPurchaseUpdatePayload } from '@/types/materialPurchase'; // Импортируем определенные вами типы

// Интерфейс для пагинированных ответов API (если ваш ViewSet использует пагинацию, как стандартно для DRF)
interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

// URL базового эндпоинта для закупок материалов
// Убедитесь, что этот путь соответствует вашим urls.py (например, '/api/material-purchases/')
const API_URL = '/api/material-purchases/';

// Функция для получения списка закупок материалов
// Может принимать параметры для фильтрации, поиска или пагинации (например, { params: { order_id: 1, search: 'Гранит' } })
export async function getMaterialPurchases<T = MaterialPurchase[] | PaginatedResponse<MaterialPurchase>>(params?: any): Promise<T> {
    const response = await axios.get<T>(API_URL, { params });
    return response.data;
}

// Функция для получения одной закупки материала по ID
export async function getMaterialPurchase(id: number): Promise<MaterialPurchase> {
    const response = await axios.get<MaterialPurchase>(`${API_URL}${id}/`);
    return response.data;
}

// Функция для создания новой закупки материала
export async function createMaterialPurchase(payload: MaterialPurchaseCreatePayload): Promise<MaterialPurchase> {
    const response = await axios.post<MaterialPurchase>(API_URL, payload);
    return response.data;
}

// Функция для обновления существующей закупки материала по ID (используем PATCH для частичного обновления)
export async function updateMaterialPurchase(id: number, payload: MaterialPurchaseUpdatePayload): Promise<MaterialPurchase> {
    const response = await axios.patch<MaterialPurchase>(`${API_URL}${id}/`, payload);
    return response.data;
}

// Функция для удаления закупки материала по ID
export async function deleteMaterialPurchase(id: number): Promise<void> {
    await axios.delete<void>(`${API_URL}${id}/`);
}
