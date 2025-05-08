// // src/api/calculation.ts

// import { api } from '@/utils/api';
// import type { Calculation } from '@/types/calculation';

// const CALCULATION_ENDPOINT = '/api/calculate/';

// /**
//  * Выполняет расчет на основе предоставленных данных.
//  * @param calculationData
//  * @returns

// export async function calculate<T, R>(calculationData: T): Promise<R> {
//   return api.post<T, R>(CALCULATION_ENDPOINT, calculationData);
// }

// // Вы можете добавить другие функции, связанные с расчетами, если они необходимы
// // Например, для получения истории расчетов или шаблонов расчетов

// /**
//  * Пример: Получение истории расчетов (если необходимо).
//  * @returns Промис с массивом истории расчетов.
//  */
// // export async function getCalculationHistory<T>(): Promise<T> {
// //   return api.get<T>('/api/calculation-history/'); // Замените на фактический эндпоинт
// // }

// /**
//  * Пример: Получение шаблона расчета по ID (если необходимо).
//  * @param id Идентификатор шаблона расчета.
//  * @returns Промис с информацией о шаблоне расчета.
//  */
// // export async function getCalculationTemplateById<T>(id: number): Promise<T> {
// //   return api.get<T>(`/api/calculation-templates/${id}/`); // Замените на фактический эндпоинт
// // }
