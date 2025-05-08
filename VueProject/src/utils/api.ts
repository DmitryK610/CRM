// src/utils/api.ts

/**
 * Базовый URL для API бэкенда.
 * TODO: Необходимо настроить в соответствии с вашим бэкенд-сервером.
 */
export const API_BASE_URL = 'http://127.0.0.1:8000'; // Пример: '/api' если Django настроен для обслуживания API по этому пути

/**
 * Функция для получения токена из хранилища (например, localStorage).
 * Вам может потребоваться скорректировать это в соответствии с тем, как вы храните свой токен.
 * Возвращает null, если токен не найден.
 */
const getAuthToken = (): string | null => {
 return localStorage.getItem('authToken'); // Убедитесь, что ключ 'authToken' правильный
};

/**
 * Хелпер для обработки ответов fetch и ошибок.
 * @param response Объект Response от fetch.
 * @returns Promise с данными JSON или null для 204 No Content.
 * @throws Error с деталями ошибки HTTP.
 */
async function handleApiResponse<T>(response: Response): Promise<T | null> {
  if (!response.ok) {
    let errorDetail = `HTTP error! status: ${response.status}`;
    try {
      const errorResponse = response.clone();
      const contentType = errorResponse.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        const errorJson = await errorResponse.json();
        errorDetail = errorJson.detail || JSON.stringify(errorJson);
      } else {
        const errorText = await errorResponse.text();
        errorDetail = errorText || `Неизвестная ошибка (${response.status})`;
      }
    } catch (e) {
      console.error("Не удалось разобрать тело ошибки:", e);
    }

    const error = new Error(`Ошибка API (${response.status}): ${errorDetail}`);
    (error as any).response = response;
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  try {
    const jsonResponse = response.clone();
    return await jsonResponse.json() as T;
  } catch (e) {
    console.error('Ошибка при парсинге JSON успешного ответа:', e, response);
    return null;
  }
}

/**
 * Базовая функция для выполнения запросов fetch.
 * @param endpoint Конечная точка API.
 * @param options Опции fetch (method, headers, body и т.д.).
 * @returns Promise с данными от API.
 */
async function request<T>(endpoint: string, options: RequestInit): Promise<T | null> {
 const token = getAuthToken();

 // --- ИСПОЛЬЗУЕМ КЛАСС Headers ДЛЯ ТИПОБЕЗОПАСНОЙ РАБОТЫ С ЗАГОЛОВКАМИ ---
 // Создаем объект Headers, используя headers из options как начальное значение
 const headers = new Headers(options.headers);

 // Устанавливаем Content-Type по умолчанию, если он еще не установлен
 if (!headers.has('Content-Type')) {
  headers.set('Content-Type', 'application/json');
 }

 // Добавляем заголовок авторизации, если есть токен
 if (token) {
  // Используем метод .set() класса Headers, который типобезопасен
  headers.set('Authorization', `Bearer ${token}`); // Или другой формат, например 'Token ваш_токен'
 }
 // --- КОНЕЦ ИСПОЛЬЗОВАНИЯ Headers ---


 const fetchOptions: RequestInit = {
  ...options, // Передаем остальные опции (method, body и т.д.)
  headers: headers, // Присваиваем объект Headers
 };

 // Удаляем body для GET и HEAD запросов, если оно случайно было передано
 if (fetchOptions.method === 'GET' || fetchOptions.method === 'HEAD') {
  delete fetchOptions.body;
 }


 const response = await fetch(`${API_BASE_URL}${endpoint}`, fetchOptions);

 return handleApiResponse<T>(response);
}


/**
 * Функция для выполнения GET-запроса к API.
 * @param endpoint Конечная точка API (например, '/clients').
 * @returns Promise с данными от API.
 */
export async function get<T>(endpoint: string): Promise<T | null> {
 return request<T>(endpoint, { method: 'GET' });
}

/**
 * Функция для выполнения POST-запроса к API.
 * @param endpoint Конечная точка API (например, '/clients').
 * @param data Данные для отправки в теле запроса.
 * @returns Promise с данными от API.
 */
export async function post<T, U>(endpoint: string, data: T): Promise<U | null> {
 return request<U>(endpoint, {
  method: 'POST',
  body: JSON.stringify(data),
 });
}

/**
 * Функция для выполнения PUT-запроса к API.
 * @param endpoint Конечная точка API (например, '/clients/1').
 * @param data Данные для отправки в теле запроса.
 * @returns Promise с данными от API.
 */
export async function put<T, U>(endpoint: string, data: T): Promise<U | null> {
 return request<U>(endpoint, {
  method: 'PUT',
  body: JSON.stringify(data),
 });
}

/**
 * Функция для выполнения PATCH-запроса к API.
 * Используется для частичного обновления ресурса.
 * @param endpoint Конечная точка API (например, '/orders/1').
 * @param data Данные для частичного обновления в теле запроса.
 * @returns Promise с данными от API (обычно обновленный ресурс).
 */
export async function patch<T, U>(endpoint: string, data: T): Promise<U | null> {
 return request<U>(endpoint, {
  method: 'PATCH', // <--- Используем метод PATCH
  body: JSON.stringify(data),
 });
}


/**
 * Функция для выполнения DELETE-запроса к API.
 * @param endpoint Конечная точка API (например, '/clients/1').
 * @returns Promise без тела ответа (в случае успеха).
 */
// DELETE обычно не отправляет тело запроса, но некоторые API могут его ожидать
// Если ваш API ожидает тело для DELETE, добавьте `body: JSON.stringify(data)` в options в вызове request
export async function deleteRequest(endpoint: string): Promise<void | null> { // Типизируем как Promise<void | null> на случай 204
 // Для DELETE мы ожидаем Promise<void>, так как обычно нет тела ответа (например, 204 No Content)
 // handleApiResponse вернет null для 204, что соответствует Promise<void> в данном контексте
 const result = await request<any>(endpoint, { method: 'DELETE' }); // Используем any, т.к. не ожидаем конкретный тип данных

 // Если fetch прошел успешно (статус 2xx), и handleApiResponse вернул null (для 204), все OK.
 // Если fetch вернул другой статус, handleApiResponse выбросит ошибку.
 // Если fetch вернул 200 с телом, result не будет null. В таком случае можно либо проигнорировать тело,
 // либо скорректировать ожидаемый тип в request<...>(...)
 return result; // Возвращаем null (для 204) или данные, если они были
}


// Обновите объект api, чтобы включить новую функцию patch и переименованный delete
export const api = {
 get,
 post,
 put,
 patch, // <--- Добавили функцию patch
 delete: deleteRequest, // Используем переименованную функцию и ключ 'delete'
};

// Теперь, когда вы импортируете `api` из этого файла,
// TypeScript будет знать, что у него есть метод `patch`.
