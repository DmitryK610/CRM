import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Employee } from '@/types/employee'
import * as employeeApi from '@/api/employee'

export const useEmployeeStore = defineStore('employee', () => {
  const employees = ref<Employee[]>([])

  const isLoading = ref(false)

  const error = ref<string | null>(null)

  const selectedEmployee = ref<Employee | null>(null)

  const getEmployees = computed(() => employees.value)

  const getIsLoading = computed(() => isLoading.value)

  const getError = computed(() => error.value)

  const getSelectedEmployee = computed(() => selectedEmployee.value)

  async function fetchEmployees(options?: { keepCache?: boolean }) {
    const keepCache = options?.keepCache ?? true
    isLoading.value = true
    error.value = null
    if (!keepCache) {
      employees.value = []
    }

    try {
      const fetchedData = await employeeApi.getEmployees<any>()

      if (fetchedData && Array.isArray(fetchedData.results)) {
        employees.value = fetchedData.results
      } else if (Array.isArray(fetchedData)) {
        employees.value = fetchedData
      } else {
        employees.value = []
        error.value = 'Неожиданный формат ответа API при загрузке сотрудников.'
      }
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'Не удалось загрузить сотрудников.'
      error.value = errorMessage
    } finally {
      isLoading.value = false
    }
  }

  async function fetchEmployeeById(id: number) {
    isLoading.value = true
    error.value = null
    selectedEmployee.value = null
    try {
      const fetchedEmployee = await employeeApi.getEmployeeById<Employee>(id)
      selectedEmployee.value = fetchedEmployee
    } catch (err: any) {
      error.value = (err as Error).message || `Не удалось загрузить сотрудника с ID ${id}.`
    } finally {
      isLoading.value = false
    }
  }

  async function createEmployee(employeeData: Omit<Employee, 'id'>) {
    isLoading.value = true
    error.value = null
    try {
      const newEmployee = await employeeApi.createEmployee<Omit<Employee, 'id'>, Employee>(
        employeeData,
      )
      employees.value.push(newEmployee)
    } catch (err: any) {
      error.value = (err as Error).message || 'Не удалось создать сотрудника.'
    } finally {
      isLoading.value = false
    }
  }

  async function updateEmployee(id: number, employeeData: Partial<Employee>) {
    isLoading.value = true
    error.value = null
    try {
      const updatedEmployee = await employeeApi.updateEmployee<Partial<Employee>, Employee>(
        id,
        employeeData,
      )
      const index = employees.value.findIndex((employee) => employee.id === id)
      if (index !== -1) {
        employees.value[index] = updatedEmployee
      }
      if (selectedEmployee.value && selectedEmployee.value.id === id) {
        selectedEmployee.value = updatedEmployee
      }
    } catch (err: any) {
      error.value = (err as Error).message || `Не удалось обновить сотрудника с ID ${id}.`
    } finally {
      isLoading.value = false
    }
  }

  async function deleteEmployee(id: number) {
    isLoading.value = true
    error.value = null
    try {
      await employeeApi.deleteEmployee(id)
      employees.value = employees.value.filter((employee) => employee.id !== id)
      if (selectedEmployee.value && selectedEmployee.value.id === id) {
        selectedEmployee.value = null
      }
    } catch (err: any) {
      error.value = (err as Error).message || `Не удалось удалить сотрудника с ID ${id}.`
    } finally {
      isLoading.value = false
    }
  }

  function setSelectedEmployee(employee: Employee | null) {
    selectedEmployee.value = employee
  }

  return {
    employees,
    isLoading,
    error,
    selectedEmployee,
    getEmployees,
    getIsLoading,
    getError,
    getSelectedEmployee,
    fetchEmployees,
    fetchEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    setSelectedEmployee,
  }
})
