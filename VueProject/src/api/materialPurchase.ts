

import { api } from '@/utils/api'
import type { MaterialPurchase, MaterialPurchaseCreatePayload, MaterialPurchaseUpdatePayload } from '@/types/materialPurchase'


interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

const MATERIAL_PURCHASES_ENDPOINT = 'material-purchases/';



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


export async function getMaterialPurchase(id: number): Promise<MaterialPurchase> {
    const data = await api.get<MaterialPurchase>(`${MATERIAL_PURCHASES_ENDPOINT}${id}/`);
    if (data === null) {
        throw new Error('Received null response from API');
    }
    return data;
}


export async function createMaterialPurchase(payload: MaterialPurchaseCreatePayload): Promise<MaterialPurchase> {
    const data = await api.post<MaterialPurchaseCreatePayload, MaterialPurchase>(MATERIAL_PURCHASES_ENDPOINT, payload);
    if (data === null) {
        throw new Error('Received null response from API');
    }
    return data;
}


export async function updateMaterialPurchase(id: number, payload: MaterialPurchaseUpdatePayload): Promise<MaterialPurchase> {
    const data = await api.patch<MaterialPurchaseUpdatePayload, MaterialPurchase>(`${MATERIAL_PURCHASES_ENDPOINT}${id}/`, payload);
    if (data === null) {
        throw new Error('Received null response from API');
    }
    return data;
}


export async function deleteMaterialPurchase(id: number): Promise<void> {
    await api.delete(`${MATERIAL_PURCHASES_ENDPOINT}${id}/`);
}
