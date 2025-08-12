


import { api } from '@/utils/api';
import type { FinancialData } from '@/types/financial';

const FINANCIAL_ENDPOINT = 'financial-data/';


export async function getFinancialData(params?: Record<string, unknown>): Promise<FinancialData> {
  const url = params ? `${FINANCIAL_ENDPOINT}?${new URLSearchParams(params as Record<string, string>).toString()}` : FINANCIAL_ENDPOINT;
  const response = await api.get<FinancialData | null>(url);
  if (response === null) {
    throw new Error('Received null response from API');
  }
  return response;
}














