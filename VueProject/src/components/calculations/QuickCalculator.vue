<template>
  <div class="calculator-component">
    <!-- Компактная форма калькулятора -->
    <div class="bg-white rounded-lg shadow-md p-4">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Быстрый расчет</h3>

      <form @submit.prevent="handleQuickCalculation" class="space-y-4">
        <!-- Основные поля -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="quick-stone" class="block text-sm font-medium text-gray-700 mb-1">
              Камень *
            </label>
            <select id="quick-stone" v-model="quickForm.stoneName"
              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required>
              <option value="">Выберите</option>
              <option v-for="material in materials" :key="material.id" :value="material.material_name">
                {{ material.material_name }}
              </option>
            </select>
          </div>

          <div>
            <label for="quick-area" class="block text-sm font-medium text-gray-700 mb-1">
              Площадь (м²) *
            </label>
            <input id="quick-area" v-model.number="quickForm.productArea" type="number" step="0.01" min="0"
              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required />
          </div>
        </div>

        <!-- Дополнительные опции -->
        <div class="space-y-2">
          <label class="flex items-center space-x-2">
            <input v-model="quickForm.measurementRequired" type="checkbox"
              class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" />
            <span class="text-sm text-gray-700">Требуется замер</span>
          </label>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="quick-edge" class="block text-sm font-medium text-gray-700 mb-1">
                Кромка (м.п.)
              </label>
              <input id="quick-edge" v-model.number="quickForm.edgeLength" type="number" step="0.01" min="0"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label for="quick-delivery" class="block text-sm font-medium text-gray-700 mb-1">
                Доставка
              </label>
              <select id="quick-delivery" v-model="quickForm.deliveryType"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="city">В городе</option>
                <option value="outside_city">За городом</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Кнопки -->
        <div class="flex gap-2 pt-2">
          <button type="submit" :disabled="!isFormValid || isLoading"
            class="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            <span v-if="isLoading" class="animate-spin">⏳</span>
            {{ isLoading ? 'Расчет...' : 'Рассчитать' }}
          </button>

          <button type="button" @click="openFullCalculator"
            class="px-4 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700">
            Подробно
          </button>
        </div>
      </form>

      <!-- Результат -->
      <div v-if="result" class="mt-4 p-3 bg-green-50 rounded-lg">
        <div class="text-center">
          <p class="text-sm text-gray-600 mb-1">Ориентировочная стоимость</p>
          <p class="text-xl font-bold text-green-600">
            {{ formatCurrency(result.totalCost) }}
          </p>
        </div>

        <div class="mt-2 text-xs text-gray-500 text-center">
          <button @click="openFullCalculator" class="text-blue-600 hover:underline">
            Посмотреть детализацию
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineEmits } from 'vue'
import { useRouter } from 'vue-router'
import type { Material } from '@/types/material'
import type { CalculationForm, CalculationResult } from '@/types/calculation'
import { getMaterials } from '@/api/material'
import { calculate } from '@/api/calculation'

// Props и эмиты
const emit = defineEmits<{
  calculated: [result: CalculationResult]
}>()

// Состояние
const router = useRouter()
const materials = ref<Material[]>([])
const isLoading = ref(false)
const result = ref<CalculationResult | null>(null)

// Форма быстрого расчета
const quickForm = ref<CalculationForm>({
  stoneName: '',
  productArea: 0,
  measurementRequired: false,
  surfaceBonding: 0,
  edgeType: 'radius',
  edgeLength: 0,
  drainageType: 'overlay',
  drainageLength: 0,
  frontBend: 0,
  ventilationHoles: 0,
  cooktopCutouts: 0,
  overlaySinkCutouts: 0,
  undermountSinkInstallations: 0,
  onSiteJoining: 0,
  deliveryType: 'city',
  deliveryRequired: false,
  orderId: null,
  dollarRate: 0,
  priceList: {
    measurement: 0,
    surfaceBondingPerM: 0,
    edgeTypePerM: { radius: 0, figured: 0 },
    drainageTypePerM: { overlay: 0, integrated: 0 },
    frontBendPerM: 0,
    deliveryType: { city: 0, outside_city: 0 },
    ventilationHolePerUnit: 0,
    cooktopCutoutPerUnit: 0,
    overlaySinkCutoutPerUnit: 0,
    undermountSinkInstallationPerUnit: 0,
    onSiteJoiningPerUnit: 0,
    radius10To300PerUnit: 0,
    radius300To1000PerUnit: 0,
    verticalRadiusPerUnit: 0,
    twoPlaneProductPerUnit: 0,
    baseMultiplier: 0,
    coefficient0To300: 0,
    coefficient300To340: 0,
    coefficient340To380: 0,
    coefficient380To500: 0,
    coefficient500To550: 0,
    coefficient550Plus: 0,
  },
  complexityAdditions: {
    radius10to300: 0,
    radius300to1000: 0,
    verticalRadius: 0,
    twoPlaneProduct: 0
  }
})

// Computed
const isFormValid = computed(() => {
  return quickForm.value.stoneName.length > 0 && quickForm.value.productArea > 0
})

// Методы
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB'
  }).format(amount)
}

const handleQuickCalculation = async () => {
  if (!isFormValid.value) return

  isLoading.value = true
  try {
    const calculationResult = await calculate(quickForm.value)
    result.value = calculationResult
    emit('calculated', calculationResult)
  } catch {
    // Ошибка при выполнении расчета
  } finally {
    isLoading.value = false
  }
}

const openFullCalculator = () => {
  router.push('/calculations')
}

// Загрузка данных
onMounted(async () => {
  try {
    materials.value = await getMaterials()
  } catch {
    // Ошибка при загрузке материалов
  }
})
</script>

<style scoped>
.calculator-component {
  max-width: 400px;
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
