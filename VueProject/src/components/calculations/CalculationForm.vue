<template>
  <div class="calculation-form-view">
    <div class="container mx-auto px-4 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Создать новый расчет</h1>
        <p class="text-gray-600">Заполните форму для расчета стоимости изделия из камня</p>
        <button @click="resetForm" type="button"
          class="mt-2 px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors">
          Сбросить форму
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg shadow-md p-6">
            <form @submit.prevent="handleSubmit" class="space-y-6">
              <div>
                <label for="stoneName" class="block text-sm font-medium text-gray-700 mb-2">
                  Артикул камня *
                </label>
                <div class="relative">
                  <input id="stoneName" v-model="calculationStore.form.stoneName" @input="handleSearchInput"
                    @focus="showDropdown = true" @blur="handleBlur" type="text"
                    placeholder="Введите артикул или поиск по названию, поставщику..."
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required autocomplete="off" />

                  <div v-if="showDropdown && filteredMaterials.length > 0"
                    class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    <div v-for="material in filteredMaterials" :key="material.id" @mousedown="selectMaterial(material)"
                      class="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0">
                      <div class="font-medium">{{ material.color_code || material.material_name }}
                      </div>
                      <div class="text-sm text-gray-600">
                        {{ material.material_name }} •
                        {{ material.supplier_details?.company_name || 'Поставщик не указан' }} •
                        {{ formatCurrency(material.cost_per_sqm || 0) }}/м²
                      </div>
                      <div v-if="material.note" class="text-xs text-gray-500 mt-1">{{
                        material.note }}</div>
                    </div>
                  </div>

                  <div
                    v-if="showDropdown && calculationStore.form.stoneName.length > 0 && filteredMaterials.length === 0"
                    class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-3 text-gray-500 text-center">
                    Материал не найден
                  </div>
                </div>
              </div>

              <div>
                <label for="clientSelect" class="block text-sm font-medium text-gray-700 mb-2">
                  Клиент (опционально)
                </label>
                <div class="relative">
                  <select id="clientSelect" v-model="selectedClientId" @change="handleClientChange"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Без привязки к клиенту (анонимный расчет)</option>
                    <option v-for="client in clientStore.clients" :key="client.id" :value="client.id">
                      {{ client.full_name }} • {{ client.contact_phone }}
                    </option>
                  </select>
                </div>
                <p class="mt-1 text-sm text-gray-500">
                  Выберите клиента для привязки расчета или оставьте пустым для анонимного расчета
                </p>
              </div>

              <div>
                <label for="productArea" class="block text-sm font-medium text-gray-700 mb-2">
                  Площадь изделия (м²) *
                </label>
                <input id="productArea" v-model.number="calculationStore.form.productArea" type="number" step="0.01"
                  min="0"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required />
              </div>

              <div>
                <label class="flex items-center space-x-2">
                  <input v-model="calculationStore.form.measurementRequired" type="checkbox"
                    class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" />
                  <span class="text-sm font-medium text-gray-700">Требуется замер</span>
                </label>
              </div>

              <div>
                <label for="surfaceBonding" class="block text-sm font-medium text-gray-700 mb-2">
                  Склейка поверхностей при ширине более 750мм (м.п.)
                </label>
                <input id="surfaceBonding" v-model.number="calculationStore.form.surfaceBonding" type="number"
                  step="0.01" min="0"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label for="edgeType" class="block text-sm font-medium text-gray-700 mb-2">
                    Тип торцевой кромки
                  </label>
                  <select id="edgeType" v-model="calculationStore.form.edgeType"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="radius">Радиусная</option>
                    <option value="figured">Фигурная</option>
                  </select>
                </div>
                <div>
                  <label for="edgeLength" class="block text-sm font-medium text-gray-700 mb-2">
                    Длина кромки (м.п.)
                  </label>
                  <input id="edgeLength" v-model.number="calculationStore.form.edgeLength" type="number" step="0.01"
                    min="0"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label for="drainageType" class="block text-sm font-medium text-gray-700 mb-2">
                    Тип водоотбойника
                  </label>
                  <select id="drainageType" v-model="calculationStore.form.drainageType"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="overlay">Накладной</option>
                    <option value="integrated">Интегрированный</option>
                  </select>
                </div>
                <div>
                  <label for="drainageLength" class="block text-sm font-medium text-gray-700 mb-2">
                    Длина водоотбойника (м.п.)
                  </label>
                  <input id="drainageLength" v-model.number="calculationStore.form.drainageLength" type="number"
                    step="0.01" min="0"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div>
                <label for="frontBend" class="block text-sm font-medium text-gray-700 mb-2">
                  Подгиб с лицевой стороны (м.п.)
                </label>
                <input id="frontBend" v-model.number="calculationStore.form.frontBend" type="number" step="0.01" min="0"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label for="ventilationHoles" class="block text-sm font-medium text-gray-700 mb-2">
                    Вентиляционные отверстия (шт.)
                  </label>
                  <input id="ventilationHoles" v-model.number="calculationStore.form.ventilationHoles" type="number"
                    min="0"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label for="cooktopCutouts" class="block text-sm font-medium text-gray-700 mb-2">
                    Отверстия под варочную панель (шт.)
                  </label>
                  <input id="cooktopCutouts" v-model.number="calculationStore.form.cooktopCutouts" type="number" min="0"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label for="overlaySinkCutouts" class="block text-sm font-medium text-gray-700 mb-2">
                    Отверстия под накладную мойку (шт.)
                  </label>
                  <input id="overlaySinkCutouts" v-model.number="calculationStore.form.overlaySinkCutouts" type="number"
                    min="0"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label for="undermountSinkInstallations" class="block text-sm font-medium text-gray-700 mb-2">
                    Вклейка мойки подстольного монтажа (шт.)
                  </label>
                  <input id="undermountSinkInstallations"
                    v-model.number="calculationStore.form.undermountSinkInstallations" type="number" min="0"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div>
                <label for="onSiteJoining" class="block text-sm font-medium text-gray-700 mb-2">
                  Стыковка изделия на объекте (шт.)
                </label>
                <input id="onSiteJoining" v-model.number="calculationStore.form.onSiteJoining" type="number" min="0"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div>
                <label for="deliveryType" class="block text-sm font-medium text-gray-700 mb-2">
                  Доставка изделия
                </label>
                <select id="deliveryType" v-model="calculationStore.form.deliveryType"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="city">В черте города</option>
                  <option value="outside_city">За пределы города</option>
                </select>
              </div>

              <div>
                <h3 class="text-lg font-medium text-gray-900 mb-4">Надбавка за сложность</h3>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label for="radius10to300" class="block text-sm font-medium text-gray-700 mb-2">
                      Радиус 10-300мм (шт.)
                    </label>
                    <input id="radius10to300" v-model.number="calculationStore.form.complexityAdditions.radius10to300"
                      type="number" min="0"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label for="radius300to1000" class="block text-sm font-medium text-gray-700 mb-2">
                      Радиус 300-1000мм (шт.)
                    </label>
                    <input id="radius300to1000"
                      v-model.number="calculationStore.form.complexityAdditions.radius300to1000" type="number" min="0"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label for="verticalRadius" class="block text-sm font-medium text-gray-700 mb-2">
                      Вертикальный радиус (шт.)
                    </label>
                    <input id="verticalRadius" v-model.number="calculationStore.form.complexityAdditions.verticalRadius"
                      type="number" min="0"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label for="twoPlaneProduct" class="block text-sm font-medium text-gray-700 mb-2">
                      Изделие в 2х плоскостях (шт.)
                    </label>
                    <input id="twoPlaneProduct"
                      v-model.number="calculationStore.form.complexityAdditions.twoPlaneProduct" type="number" min="0"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              </div>

              <div class="flex gap-4 pt-6">
                <button type="submit" @click="handleSubmit"
                  :disabled="!calculationStore.formIsValid || calculationStore.isLoading"
                  class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2">
                  <span v-if="calculationStore.isLoading" class="animate-spin">⏳</span>
                  {{ calculationStore.isLoading ? 'Расчет...' : 'Рассчитать' }}
                </button>
                <button type="button" @click="resetForm"
                  class="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
                  Сбросить
                </button>
                <router-link to="/calculations"
                  class="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 inline-flex items-center">
                  Назад к списку
                </router-link>
              </div>
            </form>
          </div>
        </div>

        <div class="lg:col-span-1">
          <div class="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Результат расчета</h2>

            <div v-if="calculationStore.hasResult && calculationStore.currentResult" class="space-y-4">
              <div class="text-center p-4 bg-green-50 rounded-lg">
                <p class="text-sm text-gray-600 mb-1">Общая стоимость</p>
                <p class="text-2xl font-bold text-green-600">
                  {{ formatCurrency(calculationStore.currentResult.totalCost) }}
                </p>
              </div>

              <div class="space-y-2">
                <h3 class="font-medium text-gray-900">Детализация:</h3>
                <div v-for="(item, key) in calculationStore.currentResult.breakdown" :key="key"
                  class="flex justify-between text-sm">
                  <span>{{ getBreakdownLabel(String(key)) }}</span>
                  <span class="font-medium">{{ formatCurrency(item.totalPrice) }}</span>
                </div>
              </div>

              <button @click="clearResult"
                class="w-full px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
                Очистить результат
              </button>
            </div>

            <div v-else class="text-center text-gray-500 py-8">
              <p>Заполните форму и нажмите "Рассчитать" для получения результата</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCalculationStore } from '@/stores/calculationStore'
import { useMaterialStore } from '@/stores/materialStore'
import { useClientStore } from '@/stores/clientStore'
import type { Material } from '@/types/material'
import type { Client } from '@/types/client' // Импортируем тип Client

const calculationStore = useCalculationStore()
const materialStore = useMaterialStore()
const clientStore = useClientStore()
const showDropdown = ref(false)

// Computed для отслеживания выбранного клиента
const selectedClientId = computed({
  get: () => calculationStore.form.selectedClient?.id?.toString() || '',
  set: (value: string) => {
    if (value) {
      const selectedClient = clientStore.clients.find(client => client.id === Number(value))
      calculationStore.form.selectedClient = selectedClient
    } else {
      calculationStore.form.selectedClient = undefined
    }
  }
})

// Computed для фильтрации материалов по поисковому запросу
const filteredMaterials = computed(() => {
  const materials = materialStore.getMaterials
  if (!Array.isArray(materials)) {
    return []
  }

  // Показываем результаты только при наличии поискового запроса
  if (!calculationStore.form.stoneName.trim()) {
    return []
  }

  const query = calculationStore.form.stoneName.toLowerCase().trim()
  return materials
    .filter(material => {
      return [
        material.id?.toString().includes(query),
        material.material_name?.toLowerCase().includes(query),
        material.color_code?.toLowerCase().includes(query),
        material.note?.toLowerCase().includes(query),
        material.supplier_details?.company_name?.toLowerCase().includes(query)
      ].some(Boolean);
    })
    .slice(0, 10) // Ограничиваем результаты поиска
})

// Функция для форматирования валюты
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB'
  }).format(amount)
}

// Функция для получения человекочитаемых названий в детализации
const getBreakdownLabel = (key: string): string => {
  const labels: Record<string, string> = {
    delivery: 'Доставка', // Добавлено, так как в вашем логе breakdown есть 'delivery'
    material: 'Стоимость камня', // Добавлено, так как в вашем логе breakdown есть 'material'
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

// Обработчик отправки формы
const handleSubmit = async () => {
  console.log('Form submitted with client:', calculationStore.form.selectedClient)
  await calculationStore.performCalculation()
  // После успешного расчета можно перенаправить на страницу со списком, если нужно:
  // if (calculationStore.hasResult) {
  //   router.push('/calculations')
  // }
}

// Сброс формы
const resetForm = () => {
  calculationStore.resetForm()
  showDropdown.value = false
}

// Очистка результата
const clearResult = () => {
  calculationStore.clearResult()
}

// Обработчик ввода в поле поиска
const handleSearchInput = () => {
  showDropdown.value = true
}

// Обработчик потери фокуса
const handleBlur = () => {
  // Небольшая задержка, чтобы клик по элементу списка успел сработать
  setTimeout(() => {
    showDropdown.value = false
  }, 200)
}

// Выбор клиента
const handleClientChange = () => {
  // Логика уже обрабатывается в computed selectedClientId
  console.log('Client changed to:', calculationStore.form.selectedClient?.full_name || 'Анонимный расчет')
}

// Выбор материала из списка
const selectMaterial = (material: Material) => {
  calculationStore.setSelectedMaterial(material)
  showDropdown.value = false
}

// Загрузка материалов и клиентов при монтировании компонента
onMounted(async () => {
  try {
    await Promise.all([
      materialStore.fetchMaterials(),
      clientStore.fetchClients()
    ])
  } catch {
    // Ошибки при загрузке обрабатываются в stores
  }
})
</script>



<style scoped>
.calculation-form-view {
  min-height: 100vh;
  background-color: #f9fafb;
}

.container {
  max-width: 1200px;
}

/* Улучшенные стили для форм */
input:focus,
select:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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
