


export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/' // Для продакшена и dev


const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken') // Убедитесь, что ключ 'authToken' правильный
}


async function handleApiResponse<T>(response: Response): Promise<T | null> {
  if (!response.ok) {
    let errorDetail = `HTTP error! status: ${response.status}`
    try {
      const errorResponse = response.clone()
      const contentType = errorResponse.headers.get('content-type')

      if (contentType && contentType.includes('application/json')) {
        const errorJson = await errorResponse.json()
        errorDetail = errorJson.detail || JSON.stringify(errorJson)
      } else {
        const errorText = await errorResponse.text()
        errorDetail = errorText || `Неизвестная ошибка (${response.status})`
      }
    } catch (e) {

    }

    const error = new Error(`Ошибка API (${response.status}): ${errorDetail}`)
    ;(error as any).response = response
    throw error
  }

  if (response.status === 204) {
    return null
  }

  try {
    const jsonResponse = response.clone()
    return (await jsonResponse.json()) as T
  } catch (e) {

    return null
  }
}


async function request<T>(endpoint: string, options: RequestInit): Promise<T | null> {
  const token = getAuthToken()



  const headers = new Headers(options.headers)


  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }


  if (token) {

    headers.set('Authorization', `Bearer ${token}`) // Или другой формат, например 'Token ваш_токен'
  }


  const fetchOptions: RequestInit = {
    ...options, // Передаем остальные опции (method, body и т.д.)
    headers: headers, // Присваиваем объект Headers
  }


  if (fetchOptions.method === 'GET' || fetchOptions.method === 'HEAD') {
    delete fetchOptions.body
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, fetchOptions)

  return handleApiResponse<T>(response)
}


export async function get<T>(endpoint: string): Promise<T | null> {
  return request<T>(endpoint, { method: 'GET' })
}


export async function post<T, U>(endpoint: string, data: T): Promise<U | null> {
  return request<U>(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}


export async function put<T, U>(endpoint: string, data: T): Promise<U | null> {
  return request<U>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}


export async function patch<T, U>(endpoint: string, data: T): Promise<U | null> {
  return request<U>(endpoint, {
    method: 'PATCH', // <--- Используем метод PATCH
    body: JSON.stringify(data),
  })
}




export async function deleteRequest(endpoint: string): Promise<void | null> {



  const result = await request<any>(endpoint, { method: 'DELETE' }) // Используем any, т.к. не ожидаем конкретный тип данных





  return result // Возвращаем null (для 204) или данные, если они были
}


export const api = {
  get,
  post,
  put,
  patch, // <--- Добавили функцию patch
  delete: deleteRequest, // Используем переименованную функцию и ключ 'delete'
}



