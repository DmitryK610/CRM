import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Client } from '@/types/client'
import * as clientApi from '@/api/client'

export const useClientStore = defineStore('client', () => {
  const clients = ref<Client[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const selectedClient = ref<Client | null>(null)

  const getClients = computed(() => clients.value)
  const getIsLoading = computed(() => isLoading.value)
  const getError = computed(() => error.value)
  const getSelectedClient = computed(() => selectedClient.value)

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

  async function fetchClients(searchQueryOrOptions?: string | { keepCache?: boolean }) {
    const keepCache = typeof searchQueryOrOptions === 'object' ? (searchQueryOrOptions.keepCache ?? false) : false
    const searchQuery = typeof searchQueryOrOptions === 'string' ? searchQueryOrOptions : undefined
    if (!keepCache) {
      isLoading.value = true
    }
    error.value = null
    try {
      const fetchedClients = await clientApi.getClients<Client[] | { results: Client[] }>(
        searchQuery,
      )

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

  async function fetchClientById(id: number): Promise<Client | null> {
    isLoading.value = true
    error.value = null
    selectedClient.value = null
    try {
      const fetchedClient = await clientApi.getClientById<Client>(id)
      if (fetchedClient && typeof fetchedClient === 'object' && !Array.isArray(fetchedClient)) {
        selectedClient.value = fetchedClient
        return fetchedClient
      } else {
        const err = new Error(`Неверный формат данных для клиента с ID ${id}.`)
        handleError(err, `загрузке клиента с ID ${id}`)
        return null
      }
    } catch (err) {
      handleError(err, `загрузке клиента с ID ${id}`)
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function createClient(clientData: Omit<Client, 'id'>): Promise<Client | null> {
    isLoading.value = true
    error.value = null
    try {
      const newClient = await clientApi.createClient<Omit<Client, 'id'>, Client>(clientData)
      clients.value.push(newClient)
      return newClient
    } catch (err) {
      handleError(err, 'создании клиента')
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function updateClient(id: number, clientData: Partial<Client>): Promise<Client | null> {
    isLoading.value = true
    error.value = null
    try {
      const updatedClient = await clientApi.updateClient<Partial<Client>, Client>(id, clientData)
      const index = clients.value.findIndex((client) => client.id === id)
      if (index !== -1) {
        clients.value[index] = { ...clients.value[index], ...updatedClient }
      }
      if (selectedClient.value && selectedClient.value.id === id) {
        selectedClient.value = { ...selectedClient.value, ...updatedClient }
      }
      return updatedClient
    } catch (err) {
      handleError(err, `обновлении клиента с ID ${id}`)
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function deleteClient(id: number): Promise<boolean> {
    isLoading.value = true
    error.value = null
    try {
      await clientApi.deleteClient(id)
      clients.value = clients.value.filter((client) => client.id !== id)
      if (selectedClient.value && selectedClient.value.id === id) {
        selectedClient.value = null
      }
      return true
    } catch (err) {
      handleError(err, `удалении клиента с ID ${id}`)
      return false
    } finally {
      isLoading.value = false
    }
  }

  function setSelectedClient(client: Client | null) {
    selectedClient.value = client
  }

  function clearError() {
    error.value = null
  }

  return {
    clients,
    isLoading,
    error,
    selectedClient,

    getClients,
    getIsLoading,
    getError,
    getSelectedClient,

    fetchClients,
    fetchClientById,
    createClient,
    updateClient,
    deleteClient,
    setSelectedClient,
    clearError,
  }
})
