// src/api/materialPurchase.ts

import { api } from '@/utils/api'
import type { MaterialPurchase, MaterialPurchaseCreatePayload, MaterialPurchaseUpdatePayload } from '@/types/materialPurchase'

// Интерфейс для пагинированных ответов API (если ваш ViewSet использует пагинацию, как стандартно для DRF)
interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

const MATERIAL_PURCHASES_ENDPOINT = '/api/material-purchases/';

// Функция для получения списка закупок материалов
// Может принимать параметры для фильтрации, поиска или пагинации
export async function getMaterialPurchases<T = MaterialPurchase[] | PaginatedResponse<MaterialPurchase>>(params?: any): Promise<T> {
    let url = MATERIAL_PURCHASES_ENDPOINT;
    if (params) {
        const queryString = new URLSearchParams(params).toString();
        url += `?${queryString}`;
    }
    const data = await api.get<T>(url);
    if (data === null) {
        throw new Error('Received null response from API');
    }
    return data;
}

// Функция для получения одной закупки материала по ID
export async function getMaterialPurchase(id: number): Promise<MaterialPurchase> {
    const data = await api.get<MaterialPurchase>(`${MATERIAL_PURCHASES_ENDPOINT}${id}/`);
    if (data === null) {
        throw new Error('Received null response from API');
    }
    return data;
}

// Функция для создания новой закупки материала
export async function createMaterialPurchase(payload: MaterialPurchaseCreatePayload): Promise<MaterialPurchase> {
    const data = await api.post<MaterialPurchaseCreatePayload, MaterialPurchase>(MATERIAL_PURCHASES_ENDPOINT, payload);
    if (data === null) {
        throw new Error('Received null response from API');
    }
    return data;
}

// Функция для обновления существующей закупки материала по ID (используем PATCH для частичного обновления)
export async function updateMaterialPurchase(id: number, payload: MaterialPurchaseUpdatePayload): Promise<MaterialPurchase> {
    const data = await api.patch<MaterialPurchaseUpdatePayload, MaterialPurchase>(`${MATERIAL_PURCHASES_ENDPOINT}${id}/`, payload);
    if (data === null) {
        throw new Error('Received null response from API');
    }
    return data;
}

// Функция для удаления закупки материала по ID
export async function deleteMaterialPurchase(id: number): Promise<void> {
    await api.delete(`${MATERIAL_PURCHASES_ENDPOINT}${id}/`);
}
