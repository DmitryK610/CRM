<template>
  <div class="calculation-detail-view">
    <div class="container mx-auto px-4 py-8">
      <!-- Заголовок с навигацией -->
      <div class="mb-6">
        <div class="flex items-center justify-between">
          <div>
            <button @click="goBack" class="flex items-center text-gray-600 hover:text-gray-800 mb-2">
              ← Назад к расчетам
            </button>
            <h1 class="text-3xl font-bold text-gray-900">
              Детали расчета
            </h1>
          </div>
          <div class="flex gap-3">
            <button @click="duplicateCalculation" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Дублировать
            </button>
            <button @click="exportCalculation" class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              Экспорт
            </button>
          </div>
        </div>
      </div>

      <!-- Состояние загрузки -->
      <div v-if="isLoading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span class="ml-3 text-gray-600">Загрузка расчета...</span>
      </div>

      <!-- Ошибка -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Ошибка загрузки</h3>
            <p class="mt-1 text-sm text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Детали расчета -->
      <div v-else-if="calculation" class="space-y-6">
        <!-- Основная информация -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Основная информация</h2>
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p class="text-sm text-gray-600">ID расчета</p>
              <p class="font-medium">{{ calculation.calculationId || calculation.id }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600">Клиент</p>
              <p class="font-medium">{{ getClientName(calculation) }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600">Дата создания</p>
              <p class="font-medium">{{ formatDate(calculation.createdAt || '') }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600">Материал</p>
              <p class="font-medium">{{ calculation.form?.stoneName || calculation.stoneName }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600">Площадь</p>
              <p class="font-medium">{{ calculation.form?.productArea || calculation.product_area }} м²</p>
            </div>
          </div>
        </div>

        <!-- Итоговая стоимость -->
        <div class="bg-green-50 rounded-lg border border-green-200 p-6">
          <div class="text-center">
            <h2 class="text-xl font-semibold text-gray-900 mb-2">Общая стоимость</h2>
            <p class="text-4xl font-bold text-green-600">
              {{ formatCurrency(totalCost) }}
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Параметры расчета -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Параметры расчета</h2>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-600">Площадь изделия:</span>
                <span class="font-medium">{{ calculation.form?.productArea || calculation.product_area }} м²</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Замер:</span>
                <span class="font-medium">{{ calculation.form?.measurementRequired ? 'Требуется' : 'Не требуется'
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Склейка поверхностей:</span>
                <span class="font-medium">{{ calculation.form?.surfaceBonding || 0 }} м.п.</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Тип кромки:</span>
                <span class="font-medium">{{ calculation.form?.edgeType === 'radius' ? 'Радиусная' : 'Фигурная'
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Длина кромки:</span>
                <span class="font-medium">{{ calculation.form?.edgeLength || 0 }} м.п.</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Тип водоотбойника:</span>
                <span class="font-medium">{{ calculation.form?.drainageType === 'overlay' ? 'Накладной' :
                  'Интегрированный' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Длина водоотбойника:</span>
                <span class="font-medium">{{ calculation.form?.drainageLength || 0 }} м.п.</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Подгиб с лицевой стороны:</span>
                <span class="font-medium">{{ calculation.form?.frontBend || 0 }} м.п.</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Доставка:</span>
                <span class="font-medium">
                  {{ calculation.form?.deliveryType === 'city' ? 'В черте города' : 'За пределами города' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Детализация стоимости -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Детализация стоимости</h2>
            <div class="space-y-3">
              <div v-for="(item, key) in calculation.breakdown" :key="key"
                class="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <p class="font-medium">{{ getBreakdownLabel(String(key)) }}</p>
                  <p class="text-sm text-gray-600">
                    {{ (item as any).quantity }} × {{ formatCurrency((item as any).unitPrice) }}
                  </p>
                </div>
                <div class="text-right">
                  <p class="font-medium">{{ formatCurrency((item as any).totalPrice) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Дополнительные параметры -->
        <div v-if="hasComplexityAdditions" class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Надбавки за сложность</h2>
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div v-if="(calculation.form?.complexityAdditions?.radius10to300 || 0) > 0">
              <p class="text-sm text-gray-600">Радиус 10-300мм</p>
              <p class="font-medium">{{ calculation.form?.complexityAdditions?.radius10to300 }} шт.</p>
            </div>
            <div v-if="(calculation.form?.complexityAdditions?.radius300to1000 || 0) > 0">
              <p class="text-sm text-gray-600">Радиус 300-1000мм</p>
              <p class="font-medium">{{ calculation.form?.complexityAdditions?.radius300to1000 }} шт.</p>
            </div>
            <div v-if="(calculation.form?.complexityAdditions?.verticalRadius || 0) > 0">
              <p class="text-sm text-gray-600">Вертикальный радиус</p>
              <p class="font-medium">{{ calculation.form?.complexityAdditions?.verticalRadius }} шт.</p>
            </div>
            <div v-if="(calculation.form?.complexityAdditions?.twoPlaneProduct || 0) > 0">
              <p class="text-sm text-gray-600">Изделие в 2х плоскостях</p>
              <p class="font-medium">{{ calculation.form?.complexityAdditions?.twoPlaneProduct }} шт.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { CalculationHistory } from '@/types/calculation'
import { getCalculationById } from '@/api/calculation'

const route = useRoute()
const router = useRouter()

// Состояние
const calculation = ref<CalculationHistory | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)

// Получаем ID расчета из параметров маршрута
const calculationId = computed(() => route.params.id as string)

// Computed свойства
const totalCost = computed(() => {
  if (!calculation.value) return 0

  console.log('Computing totalCost from calculation:', calculation.value)

  // Пробуем получить из корневого totalCost (Django API возвращает напрямую)
  if (calculation.value.totalCost) {
    console.log('Found totalCost in root:', calculation.value.totalCost)
    return calculation.value.totalCost
  }

  // Если есть breakdown, суммируем все позиции
  if (calculation.value.breakdown) {
    const sum = Object.values(calculation.value.breakdown).reduce((sum, item) => {
      const breakdownItem = item as { totalPrice?: number }
      return sum + (breakdownItem.totalPrice || 0)
    }, 0)
    console.log('Calculated totalCost from breakdown:', sum)
    return sum
  }

  console.warn('Total cost not found in calculation data:', calculation.value)
  return 0
})

const hasComplexityAdditions = computed(() => {
  if (!calculation.value?.form?.complexityAdditions) return false
  const additions = calculation.value.form.complexityAdditions
  return (additions.radius10to300 || 0) > 0 ||
    (additions.radius300to1000 || 0) > 0 ||
    (additions.verticalRadius || 0) > 0 ||
    (additions.twoPlaneProduct || 0) > 0
})

// Функции форматирования
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB'
  }).format(amount)
}

const formatDate = (dateString: string): string => {
  if (!dateString) return 'Дата не указана'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return 'Дата не указана'
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getBreakdownLabel = (key: string): string => {
  const labels: Record<string, string> = {
    stoneCost: 'Стоимость камня',
    measurementCost: 'Замер',
    surfaceBondingCost: 'Склейка поверхностей',
    edgeCost: 'Торцевая кромка',
    drainageCost: 'Водоотбойник',
    frontBendCost: 'Подгиб с лицевой стороны',
    ventilationCost: 'Вентиляционные отверстия',
    cooktopCost: 'Отверстия под варочную панель',
    sinkCost: 'Обработка мойки',
    joiningCost: 'Стыковка на объекте',
    deliveryCost: 'Доставка',
    complexityCost: 'Надбавка за сложность'
  }
  return labels[key] || key
}

// Функция для получения имени клиента
const getClientName = (calculation: CalculationHistory): string => {
  // 1. Проверяем selectedClient в форме (новая структура)
  if (calculation.form?.selectedClient) {
    return calculation.form.selectedClient.full_name
  }

  // 2. Проверяем client_info от Django API
  if (calculation.client_info && typeof calculation.client_info === 'object') {
    const clientInfo = calculation.client_info as {
      id?: number
      full_name?: string
      name?: string
      clientName?: string
    }
    if (clientInfo.full_name) return clientInfo.full_name
    if (clientInfo.name) return clientInfo.name
    if (clientInfo.clientName) return clientInfo.clientName
  }

  // 3. Если ничего не найдено - расчет анонимный
  return 'Анонимный расчет'
}

// Действия
const goBack = () => {
  router.push('/calculations')
}

const duplicateCalculation = () => {
  if (calculation.value) {
    // Можно добавить логику дублирования расчета
    router.push({
      path: '/calculations',
      query: { duplicate: calculation.value.id }
    })
  }
}

const exportCalculation = () => {
  if (calculation.value) {
    // Простой экспорт в JSON (можно расширить для PDF/Excel)
    const dataStr = JSON.stringify(calculation.value, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `calculation-${calculation.value.id}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

// Загрузка данных
const loadCalculation = async () => {
  if (!calculationId.value) {
    error.value = 'ID расчета не указан'
    return
  }

  isLoading.value = true
  error.value = null

  try {
    calculation.value = await getCalculationById(calculationId.value)
    console.log('Loaded calculation data:', calculation.value)
    console.log('Total cost:', calculation.value?.totalCost)
    console.log('Calculation structure:', {
      hasBreakdown: !!calculation.value?.breakdown,
      hasForm: !!calculation.value?.form,
      calculationId: calculation.value?.calculationId,
      id: calculation.value?.id
    })
  } catch (err) {
    console.error('Ошибка при загрузке расчета:', err)
    error.value = 'Не удалось загрузить расчет'
  } finally {
    isLoading.value = false
  }
}

// Монтирование компонента
onMounted(() => {
  loadCalculation()
})
</script>

<style scoped>
.calculation-detail-view {
  min-height: 100vh;
  background-color: #f9fafb;
}

.container {
  max-width: 1200px;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
