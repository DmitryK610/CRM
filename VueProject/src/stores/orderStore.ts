import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Order, OrderStatus, AdvancePaymentType } from '@/types/order'
import type { Client } from '@/types/client'
import * as orderApi from '@/api/order'
import * as clientApi from '@/api/client'

interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

interface OrderCreatePayload {
  order_number?: string | null
  client: number
  material: number
  order_date: string
  total_amount: number
  status: OrderStatus
  material_quantity: number
  installation_date?: string | null
  advance_payment_amount?: number | null
  advance_payment_date?: string | null
  note?: string | null
  advance_payment_type?: AdvancePaymentType | null
  calculation_id?: number | null
  order_items: Array<{
    product_name: string
    quantity: number | null
    unit_price: number | null
    id?: number
  }>
}

type OrderUpdatePayload = Partial<Order>

export const useOrderStore = defineStore('orders', () => {
  const orders = ref<Order[]>([])
  const clients = ref<Client[]>([])
  const selectedOrder = ref<Order | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const getOrders = computed(() => orders.value)
  const getClients = computed(() => clients.value)
  const getSelectedOrder = computed(() => selectedOrder.value)
  const getIsLoading = computed(() => isLoading.value)
  const getError = computed(() => error.value)

  function handleError(err: any, action: string) {
    const apiErrorMessage =
      err.response?.data?.detail ||
      (typeof err.response?.data === 'string'
        ? err.response.data
        : JSON.stringify(err.response?.data)) ||
      err.message ||
      `Не удалось выполнить действие при ${action}.`

    error.value = apiErrorMessage
  }

  async function fetchClients(options?: { keepCache?: boolean }) {
    const keepCache = options?.keepCache ?? true
    if (!keepCache) {
      isLoading.value = true
    }
    error.value = null
    try {
      const fetchedClients = await clientApi.getClients<Client[] | PaginatedResponse<Client>>()

      if (Array.isArray(fetchedClients)) {
        clients.value = fetchedClients
      } else if (
        fetchedClients &&
        typeof fetchedClients === 'object' &&
        'results' in fetchedClients &&
        Array.isArray(fetchedClients.results)
      ) {
        clients.value = fetchedClients.results
      } else {
        const err = new Error('Неверный формат данных от API клиентов.')
        handleError(err, 'загрузке клиентов')
      }
    } catch (err) {
      handleError(err, 'загрузке клиентов')
    } finally {
      isLoading.value = false
    }
  }

  async function fetchOrders(options?: { keepCache?: boolean }) {
    const keepCache = options?.keepCache ?? true
    if (!keepCache) {
      isLoading.value = true
    }
    error.value = null
    try {
      const response = await orderApi.getOrders<PaginatedResponse<Order> | Order[]>()
      if ('results' in response && Array.isArray(response.results)) {
        orders.value = response.results
      } else if (Array.isArray(response)) {
        orders.value = response
      } else {
        const err = new Error('Неверный формат данных от API заказов.')
        handleError(err, 'загрузке заказов')
      }
    } catch (err) {
      handleError(err, 'загрузке заказов')
    } finally {
      isLoading.value = false
    }
  }

  async function fetchOrderById(id: number): Promise<Order | null> {
    isLoading.value = true
    error.value = null
    selectedOrder.value = null
    try {
      const fetchedOrder = await orderApi.getOrderById(id)
      if (fetchedOrder && typeof fetchedOrder === 'object' && !Array.isArray(fetchedOrder)) {
        selectedOrder.value = fetchedOrder
        return fetchedOrder
      } else {
        const err = new Error(`Неверный формат данных для заказа с ID ${id}.`)
        handleError(err, `загрузке деталей заказа с ID ${id}`)
        return null
      }
    } catch (err) {
      handleError(err, `загрузке деталей заказа с ID ${id}`)
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function createOrder(payload: OrderCreatePayload): Promise<Order | null> {
    isLoading.value = true
    error.value = null
    try {
      const newOrder = await orderApi.createOrder<OrderCreatePayload, Order>(payload)
      orders.value.push(newOrder)
      return newOrder
    } catch (err) {
      handleError(err, 'создании заказа')
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function updateOrder(id: number, payload: OrderUpdatePayload): Promise<Order | null> {
    isLoading.value = true
    error.value = null
    try {
      const updatedOrder = await orderApi.updateOrder<OrderUpdatePayload, Order>(id, payload)
      const index = orders.value.findIndex((order) => order.id === id)
      if (index !== -1) {
        orders.value[index] = { ...orders.value[index], ...updatedOrder }
      }
      if (selectedOrder.value && selectedOrder.value.id === id) {
        selectedOrder.value = { ...selectedOrder.value, ...updatedOrder }
      }
      return updatedOrder
    } catch (err) {
      handleError(err, `обновлении заказа с ID ${id}`)
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function deleteOrder(id: number): Promise<boolean> {
    isLoading.value = true
    error.value = null
    try {
      await orderApi.deleteOrder(id)
      orders.value = orders.value.filter((order) => order.id !== id)
      if (selectedOrder.value && selectedOrder.value.id === id) {
        selectedOrder.value = null
      }
      return true
    } catch (err) {
      handleError(err, `удалении заказа с ID ${id}`)
      return false
    } finally {
      isLoading.value = false
    }
  }

  function clearSelectedOrder() {
    selectedOrder.value = null
    error.value = null
  }

  function clearError() {
    error.value = null
  }

  return {
    orders,
    clients,
    selectedOrder,
    isLoading,
    error,

    getOrders,
    getClients,
    getSelectedOrder,
    getIsLoading,
    getError,

    fetchOrders,
    fetchOrderById,
    fetchClients,
    createOrder,
    updateOrder,
    deleteOrder,
    clearSelectedOrder,
    clearError,
  }
})
