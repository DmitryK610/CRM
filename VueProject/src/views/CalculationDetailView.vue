<template>
  <div class="order-detail-container">
    <div class="flex items-center justify-between mb-6 header-top-section">
      <h1 class="page-title">Детали расчета</h1>
    </div>

    <div v-if="isLoading" class="status-message loading-message">
      <div class="loader"></div>
      <span class="ml-3">Загрузка расчета...</span>
    </div>

    <div v-else-if="error" class="status-message error-message">
      ⚠️ Ошибка загрузки: {{ error }}
    </div>

    <div v-else-if="calculation" class="space-y-6">
      <div class="details-section">
        <h2>Информация о расчете</h2>
        <div class="detail-line">
          <strong>ID расчета:</strong>
          <span>{{ calculation.calculationId || calculation.id }}</span>
        </div>
        <div class="detail-line">
          <strong>Клиент:</strong>
          <span>{{ getClientName(calculation) }}</span>
        </div>
        <div class="detail-line">
          <strong>Дата создания:</strong>
          <span>{{ formatDate(calculation.createdAt || '') }}</span>
        </div>
        <div class="detail-line">
          <strong>Материал:</strong>
          <span>{{ getMaterialName(calculation) }}</span>
        </div>
        <div class="detail-line">
          <strong>Площадь изделия:</strong>
          <span>{{ getProductArea(calculation) }} м²</span>
        </div>
        <div class="detail-line">
          <strong>Замер:</strong>
          <span>{{ getMeasurementRequired(calculation) ? 'Требуется' : 'Не требуется' }}</span>
        </div>
        <div class="detail-line">
          <strong>Склейка поверхностей:</strong>
          <span>{{ getSurfaceBonding(calculation) }} м.п.</span>
        </div>
        <div class="detail-line">
          <strong>Тип кромки:</strong>
          <span>{{ getEdgeType(calculation) }}</span>
        </div>
        <div class="detail-line">
          <strong>Длина кромки:</strong>
          <span>{{ getEdgeLength(calculation) }} м.п.</span>
        </div>
        <div class="detail-line">
          <strong>Тип водоотбойника:</strong>
          <span>{{ getDrainageType(calculation) }}</span>
        </div>
        <div class="detail-line">
          <strong>Длина водоотбойника:</strong>
          <span>{{ getDrainageLength(calculation) }} м.п.</span>
        </div>
        <div class="detail-line">
          <strong>Подгиб с лицевой стороны:</strong>
          <span>{{ getFrontBend(calculation) }} м.п.</span>
        </div>
        <div class="detail-line">
          <strong>Вентиляционные отверстия:</strong>
          <span>{{ getVentilationHoles(calculation) }} шт.</span>
        </div>
        <div class="detail-line">
          <strong>Отверстия под варочную панель:</strong>
          <span>{{ getCooktopCutouts(calculation) }} шт.</span>
        </div>
        <div class="detail-line">
          <strong>Накладные вырезы под раковину:</strong>
          <span>{{ getOverlaySinkCutouts(calculation) }} шт.</span>
        </div>
        <div class="detail-line">
          <strong>Подстольные установки раковины:</strong>
          <span>{{ getUndermountSinkInstallations(calculation) }} шт.</span>
        </div>
        <div class="detail-line">
          <strong>Стыковка на объекте:</strong>
          <span>{{ getOnSiteJoining(calculation) }} шт.</span>
        </div>
        <div class="detail-line">
          <strong>Доставка:</strong>
          <span>{{ getDeliveryType(calculation) }}</span>
        </div>
      </div>

      <div v-if="hasComplexityAdditions" class="details-section">
        <h2>Надбавки за сложность</h2>
        <div class="grid-columns">
          <div v-if="getComplexityAddition(calculation, 'radius10to300') > 0" class="detail-line">
            <strong>Радиус 10-300мм:</strong>
            <span>{{ getComplexityAddition(calculation, 'radius10to300') }} шт.</span>
          </div>
          <div v-if="getComplexityAddition(calculation, 'radius300to1000') > 0" class="detail-line">
            <strong>Радиус 300-1000мм:</strong>
            <span>{{ getComplexityAddition(calculation, 'radius300to1000') }} шт.</span>
          </div>
          <div v-if="getComplexityAddition(calculation, 'verticalRadius') > 0" class="detail-line">
            <strong>Вертикальный радиус:</strong>
            <span>{{ getComplexityAddition(calculation, 'verticalRadius') }} шт.</span>
          </div>
          <div v-if="getComplexityAddition(calculation, 'twoPlaneProduct') > 0" class="detail-line">
            <strong>Изделие в 2х плоскостях:</strong>
            <span>{{ getComplexityAddition(calculation, 'twoPlaneProduct') }} шт.</span>
          </div>
        </div>
      </div>

      <div class="details-section total-cost-section">
        <h2 class="text-center">Общая стоимость</h2>
        <p class="total-amount-display">
          {{ formatCurrency(totalCost) }}
        </p>
      </div>

      <div class="back-button-container">
        <button @click="goBack" class="btn btn-secondary">
          ← Назад к расчетам
        </button>
      </div>
    </div>
    <div v-else class="status-message no-results-message">
      Расчет не найден.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { CalculationHistory } from '@/types/calculation'
import { getCalculationById } from '@/api/calculation'
import { useCalculationStore } from '@/stores/calculationStore'

const route = useRoute()
const router = useRouter()
const calculationStore = useCalculationStore()

// Состояние
const calculation = ref<CalculationHistory | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)

// Получаем ID расчета из параметров маршрута
const calculationId = computed(() => route.params.id as string)

// Computed свойства
const totalCost = computed(() => {
  if (!calculation.value) return 0

  // 1. Пробуем получить из корневого totalCost (Django API возвращает напрямую)
  if (calculation.value.totalCost !== undefined && calculation.value.totalCost !== null) {
    const cost = typeof calculation.value.totalCost === 'string'
      ? parseFloat(calculation.value.totalCost)
      : Number(calculation.value.totalCost)
    return isNaN(cost) ? 0 : cost
  }

  // 2. Если есть breakdown, суммируем все позиции
  if (calculation.value.breakdown) {
    let total = 0
    Object.values(calculation.value.breakdown).forEach((item: unknown) => {
      if (item && typeof item === 'object' && 'totalPrice' in item) {
        const itemObj = item as { totalPrice?: string | number }
        if (itemObj.totalPrice) {
          const price = typeof itemObj.totalPrice === 'string'
            ? parseFloat(itemObj.totalPrice)
            : Number(itemObj.totalPrice)
          if (!isNaN(price)) {
            total += price
          }
        }
      }
    })
    if (total > 0) return total
  }

  return 0
})

const hasComplexityAdditions = computed(() => {
  // 1. Проверяем в корневом уровне (приоритет данным от API)
  const calcWithComplexity = calculation.value as { complexityAdditions?: { radius10to300?: number, radius300to1000?: number, verticalRadius?: number, twoPlaneProduct?: number } }
  if (calcWithComplexity?.complexityAdditions) {
    const additions = calcWithComplexity.complexityAdditions
    return (additions.radius10to300 || 0) > 0 ||
      (additions.radius300to1000 || 0) > 0 ||
      (additions.verticalRadius || 0) > 0 ||
      (additions.twoPlaneProduct || 0) > 0
  }

  // 2. Проверяем в форме как fallback
  const additions = calculation.value?.form?.complexityAdditions
  if (additions) {
    return (additions.radius10to300 || 0) > 0 ||
      (additions.radius300to1000 || 0) > 0 ||
      (additions.verticalRadius || 0) > 0 ||
      (additions.twoPlaneProduct || 0) > 0
  }

  return false
})

// Функции форматирования (взяты из OrderDetailView.vue для консистентности)
const formatCurrency = (value: number | string | undefined | null): string => {
  if (value === undefined || value === null || value === '') return '---';
  const numValue = Number(value);
  if (isNaN(numValue)) return String(numValue);

  try {
    return numValue.toLocaleString('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  } catch (e) {
    console.error("Error formatting currency:", value, e);
    return `${numValue.toFixed(2)} ₽`;
  }
};

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'не указана';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'некорректная дата';
    }
    // Если в строке есть время (обычно обозначается 'T'), отображаем его
    if (dateString.includes('T') || dateString.includes(':')) {
      return date.toLocaleDateString('ru-RU') + ' ' + date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('ru-RU');
  } catch {
    return 'некорректная дата';
  }
};

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

// Функция для получения названия материала
const getMaterialName = (calculation: CalculationHistory): string => {
  // 1. Проверяем selectedMaterial в форме
  if (calculation.form?.selectedMaterial) {
    return `${calculation.form.selectedMaterial.color_code} (${calculation.form.selectedMaterial.material_name})`
  }

  // 2. Проверяем stoneName в форме или корневом уровне
  if (calculation.form?.stoneName) {
    return calculation.form.stoneName
  }

  if (calculation.stoneName) {
    return calculation.stoneName
  }

  return 'Материал не указан'
}

// Функция для получения площади изделия
const getProductArea = (calculation: CalculationHistory): number => {
  // 1. Проверяем в корневом уровне (camelCase) - приоритет данным от API
  const calcWithCamelCase = calculation as { productArea?: number | string }
  if (calcWithCamelCase.productArea !== undefined && calcWithCamelCase.productArea !== null) {
    const area = typeof calcWithCamelCase.productArea === 'string' ? parseFloat(calcWithCamelCase.productArea) : calcWithCamelCase.productArea
    return isNaN(area) ? 0 : area
  }

  // 2. Проверяем в корневом уровне (snake_case для совместимости)
  if (calculation.product_area !== undefined) {
    const area = typeof calculation.product_area === 'string' ? parseFloat(calculation.product_area) : calculation.product_area
    return isNaN(area) ? 0 : area
  }

  // 3. Проверяем в форме как fallback
  if (calculation.form?.productArea !== undefined && calculation.form.productArea > 0) {
    return calculation.form.productArea
  }

  return 0
}

// Функция для получения требования замера
const getMeasurementRequired = (calculation: CalculationHistory): boolean => {
  // 1. Проверяем camelCase в корневом уровне - приоритет данным от API
  const calcWithCamelCase = calculation as { measurementRequired?: boolean }
  if (calcWithCamelCase.measurementRequired !== undefined) {
    return calcWithCamelCase.measurementRequired
  }

  // 2. Проверяем snake_case в корневом уровне (для совместимости)
  if (calculation.measurement_required !== undefined) {
    return calculation.measurement_required
  }

  // 3. Проверяем в форме как fallback
  if (calculation.form?.measurementRequired !== undefined) {
    return calculation.form.measurementRequired
  }

  return false
}

// Функция для получения склейки поверхностей
const getSurfaceBonding = (calculation: CalculationHistory): number => {
  // 1. Проверяем camelCase в корневом уровне - приоритет данным от API
  const calcWithCamelCase = calculation as { surfaceBonding?: number | string }
  if (calcWithCamelCase.surfaceBonding !== undefined) {
    const bonding = typeof calcWithCamelCase.surfaceBonding === 'string' ? parseFloat(calcWithCamelCase.surfaceBonding) : calcWithCamelCase.surfaceBonding
    return isNaN(bonding) ? 0 : bonding
  }

  // 2. Проверяем snake_case в корневом уровне (для совместимости)
  if (calculation.surface_bonding !== undefined) {
    const bonding = typeof calculation.surface_bonding === 'string' ? parseFloat(calculation.surface_bonding) : calculation.surface_bonding
    return isNaN(bonding) ? 0 : bonding
  }

  // 3. Проверяем в форме как fallback
  if (calculation.form?.surfaceBonding !== undefined && calculation.form.surfaceBonding > 0) {
    return calculation.form.surfaceBonding
  }

  return 0
}

// Функция для получения типа кромки
const getEdgeType = (calculation: CalculationHistory): string => {
  // 1. Проверяем camelCase в корневом уровне - приоритет данным от API
  const calcWithCamelCase = calculation as { edgeType?: string }
  let edgeType = calcWithCamelCase.edgeType || calculation.edge_type

  // 2. Проверяем в форме как fallback
  if (!edgeType) {
    edgeType = calculation.form?.edgeType
  }

  if (edgeType === 'radius') return 'Радиусная'
  if (edgeType === 'figured') return 'Фигурная'
  return 'Не указан'
}

// Функция для получения длины кромки
const getEdgeLength = (calculation: CalculationHistory): number => {
  // 1. Проверяем camelCase в корневом уровне - приоритет данным от API
  const calcWithCamelCase = calculation as { edgeLength?: number | string }
  if (calcWithCamelCase.edgeLength !== undefined) {
    const length = typeof calcWithCamelCase.edgeLength === 'string' ? parseFloat(calcWithCamelCase.edgeLength) : calcWithCamelCase.edgeLength
    return isNaN(length) ? 0 : length
  }

  // 2. Проверяем snake_case в корневом уровне (для совместимости)
  if (calculation.edge_length !== undefined) {
    const length = typeof calculation.edge_length === 'string' ? parseFloat(calculation.edge_length) : calculation.edge_length
    return isNaN(length) ? 0 : length
  }

  // 3. Проверяем в форме как fallback
  if (calculation.form?.edgeLength !== undefined && calculation.form.edgeLength > 0) {
    return calculation.form.edgeLength
  }

  return 0
}

// Функция для получения типа водоотбойника
const getDrainageType = (calculation: CalculationHistory): string => {
  // 1. Проверяем camelCase в корневом уровне - приоритет данным от API
  const calcWithCamelCase = calculation as { drainageType?: string }
  let drainageType = calcWithCamelCase.drainageType || calculation.drainage_type

  // 2. Проверяем в форме как fallback
  if (!drainageType) {
    drainageType = calculation.form?.drainageType
  }

  if (drainageType === 'overlay') return 'Накладной'
  if (drainageType === 'integrated') return 'Интегрированный'
  return 'Не указан'
}

// Функция для получения длины водоотбойника
const getDrainageLength = (calculation: CalculationHistory): number => {
  // 1. Проверяем camelCase в корневом уровне - приоритет данным от API
  const calcWithCamelCase = calculation as { drainageLength?: number | string }
  if (calcWithCamelCase.drainageLength !== undefined) {
    const length = typeof calcWithCamelCase.drainageLength === 'string' ? parseFloat(calcWithCamelCase.drainageLength) : calcWithCamelCase.drainageLength
    return isNaN(length) ? 0 : length
  }

  // 2. Проверяем snake_case в корневом уровне (для совместимости)
  if (calculation.drainage_length !== undefined) {
    const length = typeof calculation.drainage_length === 'string' ? parseFloat(calculation.drainage_length) : calculation.drainage_length
    return isNaN(length) ? 0 : length
  }

  // 3. Проверяем в форме как fallback
  if (calculation.form?.drainageLength !== undefined && calculation.form.drainageLength > 0) {
    return calculation.form.drainageLength
  }

  return 0
}

// Функция для получения подгиба с лицевой стороны
const getFrontBend = (calculation: CalculationHistory): number => {
  // 1. Проверяем camelCase в корневом уровне - приоритет данным от API
  const calcWithCamelCase = calculation as { frontBend?: number | string }
  if (calcWithCamelCase.frontBend !== undefined) {
    const bend = typeof calcWithCamelCase.frontBend === 'string' ? parseFloat(calcWithCamelCase.frontBend) : calcWithCamelCase.frontBend
    return isNaN(bend) ? 0 : bend
  }

  // 2. Проверяем snake_case в корневом уровне (для совместимости)
  if (calculation.front_bend !== undefined) {
    const bend = typeof calculation.front_bend === 'string' ? parseFloat(calculation.front_bend) : calculation.front_bend
    return isNaN(bend) ? 0 : bend
  }

  // 3. Проверяем в форме как fallback
  if (calculation.form?.frontBend !== undefined && calculation.form.frontBend > 0) {
    return calculation.form.frontBend
  }

  return 0
}

// Функция для получения вентиляционных отверстий
const getVentilationHoles = (calculation: CalculationHistory): number => {
  // 1. Проверяем camelCase в корневом уровне - приоритет данным от API
  const calcWithCamelCase = calculation as { ventilationHoles?: number }
  if (calcWithCamelCase.ventilationHoles !== undefined) {
    return calcWithCamelCase.ventilationHoles
  }

  // 2. Проверяем snake_case в корневом уровне (для совместимости)
  if (calculation.ventilation_holes !== undefined) {
    return calculation.ventilation_holes
  }

  // 3. Проверяем в форме как fallback
  if (calculation.form?.ventilationHoles !== undefined && calculation.form.ventilationHoles > 0) {
    return calculation.form.ventilationHoles
  }

  return 0
}

// Функция для получения отверстий под варочную панель
const getCooktopCutouts = (calculation: CalculationHistory): number => {
  // 1. Проверяем camelCase в корневом уровне - приоритет данным от API
  const calcWithCamelCase = calculation as { cooktopCutouts?: number }
  if (calcWithCamelCase.cooktopCutouts !== undefined) {
    return calcWithCamelCase.cooktopCutouts
  }

  // 2. Проверяем snake_case в корневом уровне (для совместимости)
  if (calculation.cooktop_cutouts !== undefined) {
    return calculation.cooktop_cutouts
  }

  // 3. Проверяем в форме как fallback
  if (calculation.form?.cooktopCutouts !== undefined && calculation.form.cooktopCutouts > 0) {
    return calculation.form.cooktopCutouts
  }

  return 0
}

// Функция для получения накладных вырезов под раковину
const getOverlaySinkCutouts = (calculation: CalculationHistory): number => {
  // 1. Проверяем camelCase в корневом уровне - приоритет данным от API
  const calcWithCamelCase = calculation as { overlaySinkCutouts?: number }
  if (calcWithCamelCase.overlaySinkCutouts !== undefined) {
    return calcWithCamelCase.overlaySinkCutouts
  }

  // 2. Проверяем snake_case в корневом уровне (для совместимости)
  if (calculation.overlay_sink_cutouts !== undefined) {
    return calculation.overlay_sink_cutouts
  }

  // 3. Проверяем в форме как fallback
  if (calculation.form?.overlaySinkCutouts !== undefined && calculation.form.overlaySinkCutouts > 0) {
    return calculation.form.overlaySinkCutouts
  }

  return 0
}

// Функция для получения подстольных установок раковины
const getUndermountSinkInstallations = (calculation: CalculationHistory): number => {
  // 1. Проверяем camelCase в корневом уровне - приоритет данным от API
  const calcWithCamelCase = calculation as { undermountSinkInstallations?: number }
  if (calcWithCamelCase.undermountSinkInstallations !== undefined) {
    return calcWithCamelCase.undermountSinkInstallations
  }

  // 2. Проверяем snake_case в корневом уровне (для совместимости)
  if (calculation.undermount_sink_installations !== undefined) {
    return calculation.undermount_sink_installations
  }

  // 3. Проверяем в форме как fallback
  if (calculation.form?.undermountSinkInstallations !== undefined && calculation.form.undermountSinkInstallations > 0) {
    return calculation.form.undermountSinkInstallations
  }

  return 0
}

// Функция для получения стыковки на объекте
const getOnSiteJoining = (calculation: CalculationHistory): number => {
  // 1. Проверяем camelCase в корневом уровне - приоритет данным от API
  const calcWithCamelCase = calculation as { onSiteJoining?: number }
  if (calcWithCamelCase.onSiteJoining !== undefined) {
    return calcWithCamelCase.onSiteJoining
  }

  // 2. Проверяем snake_case в корневом уровне (для совместимости)
  if (calculation.on_site_joining !== undefined) {
    return calculation.on_site_joining
  }

  // 3. Проверяем в форме как fallback
  if (calculation.form?.onSiteJoining !== undefined && calculation.form.onSiteJoining > 0) {
    return calculation.form.onSiteJoining
  }

  return 0
}

// Функция для получения типа доставки
const getDeliveryType = (calculation: CalculationHistory): string => {
  // 1. Проверяем camelCase в корневом уровне - приоритет данным от API
  const calcWithCamelCase = calculation as { deliveryType?: string }
  let deliveryType = calcWithCamelCase.deliveryType || calculation.delivery_type

  // 2. Проверяем в форме как fallback
  if (!deliveryType) {
    deliveryType = calculation.form?.deliveryType
  }

  if (deliveryType === 'city') return 'В черте города'
  if (deliveryType === 'outside_city') return 'За пределами города'
  return 'Не указан'
}

// Функция для получения надбавок за сложность
const getComplexityAddition = (calculation: CalculationHistory, type: 'radius10to300' | 'radius300to1000' | 'verticalRadius' | 'twoPlaneProduct'): number => {
  // 1. Проверяем в корневом уровне (приоритет данным от API)
  const calcWithComplexity = calculation as { complexityAdditions?: { [key: string]: number } }
  if (calcWithComplexity?.complexityAdditions?.[type] !== undefined) {
    return calcWithComplexity.complexityAdditions[type]
  }

  // 2. Проверяем в форме как fallback
  const formValue = calculation.form?.complexityAdditions?.[type]
  if (formValue !== undefined && formValue > 0) {
    return formValue
  }

  return 0
}

// Действия
const goBack = () => {
  router.push('/calculations')
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
    // Сначала попробуем найти расчет в истории store
    const calculationFromStore = calculationStore.history.find(
      calc => (calc.id && calc.id.toString() === calculationId.value) ||
        (calc.calculationId && calc.calculationId.toString() === calculationId.value)
    )

    if (calculationFromStore) {
      calculation.value = calculationFromStore
    } else {
      // Если не найден в store, загружаем через API
      calculation.value = await getCalculationById(calculationId.value)
    }
  } catch (err) {
    console.error('Ошибка при загрузке расчета:', err)
    error.value = 'Не удалось загрузить расчет. Возможно, расчет не существует или у вас нет прав доступа.'
  } finally {
    isLoading.value = false
  }
}

// Монтирование компонента
onMounted(async () => {
  // Если история не загружена, загружаем её
  if (calculationStore.history.length === 0) {
    try {
      await calculationStore.loadHistory()
    } catch (err) {
      console.warn('Не удалось загрузить историю расчетов:', err)
    }
  }

  // Загружаем конкретный расчет
  await loadCalculation()
})
</script>

<style scoped>
/* Основной контейнер */
.order-detail-container {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin: 20px auto;
  max-width: 800px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
  box-sizing: border-box;
}

/* Заголовок страницы */
.page-title {
  color: #2c3e50;
  text-align: center;
  margin-top: 0;
  margin-bottom: 24px;
  font-size: 24px;
  font-weight: 600;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
  flex-grow: 1;
  /* Чтобы заголовок занимал доступное пространство */
}

/* Верхняя секция с заголовком */
.header-top-section {
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  /* Отступ под верхней секцией */
}


/* Секции деталей */
.details-section {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 6px;
  background-color: #f9f9f9;
}

.details-section h2 {
  color: #555;
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 1.4rem;
  border-bottom: 1px solid #ddd;
  padding-bottom: 8px;
}

/* Отдельные строки деталей */
.detail-line {
  display: flex;
  margin-bottom: 10px;
  line-height: 1.5;
  font-size: 1rem;
  align-items: baseline;
  flex-wrap: wrap;
}

.detail-line strong {
  font-weight: bold;
  width: 200px;
  flex-shrink: 0;
  margin-right: 15px;
  text-align: left;
}

.detail-line span {
  flex-grow: 1;
}

/* Секция итоговой стоимости */
.total-cost-section {
  background-color: #e8f5e9;
  border-color: #c8e6c9;
  text-align: center;
}

.total-amount-display {
  font-size: 2.5rem;
  font-weight: bold;
  color: #2e7d32;
  margin-top: 10px;
}

/* Тексты без результатов/сообщений */
.text-muted {
  color: #6c757d;
  text-align: center;
  padding: 15px;
  font-style: italic;
}

/* Кнопки действий */
.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.btn {
  padding: 10px 20px;
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
  text-decoration: none;
  display: inline-block;
  text-align: center;
  box-sizing: border-box;
  white-space: nowrap;
  flex-shrink: 0;
}

.btn-primary {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.btn-primary:hover {
  background-color: #0056b3;
  border-color: #0056b3;
}

.btn-success {
  background-color: #28a745;
  color: white;
  border-color: #28a745;
}

.btn-success:hover {
  background-color: #218838;
  border-color: #1e7e34;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
  border-color: #6c757d;
}

.btn-secondary:hover {
  background-color: #5a6268;
  border-color: #545b62;
}

/* Сообщения о состоянии (загрузка, ошибка, нет результатов) */
.status-message {
  padding: 16px;
  border-radius: 8px;
  margin: 20px auto;
  max-width: 800px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1rem;
  font-weight: 500;
  box-sizing: border-box;
  justify-content: center;
}

.loading-message {
  background-color: #e3f2fd;
  color: #1976d2;
}

.error-message {
  background-color: #ffebee;
  color: #d32f2f;
}

.no-results-message {
  background-color: #fff3cd;
  color: #856404;
  text-align: center;
  justify-content: center;
}

/* Спиннер загрузки */
.loader {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* Контейнер для кнопки "Назад" внизу */
.back-button-container {
  text-align: center;
  margin-top: 30px;
  /* Отступ сверху от предыдущего блока */
}

/* Дополнительные стили для секций с несколькими колонками (для сложности) */
.grid-columns {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

@media (min-width: 768px) {
  .grid-columns {
    grid-template-columns: repeat(2, 1fr);
  }

  /* Выравнивание заголовка */
  .page-title {
    text-align: left;
    /* Заголовок слева на больших экранах */
    margin-bottom: 0;
  }

  .header-top-section {
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
  }
}

@media (min-width: 1024px) {
  .grid-columns {
    grid-template-columns: repeat(4, 1fr);
  }
}


/* Адаптивность */
@media (max-width: 768px) {
  .order-detail-container {
    padding: 15px;
    margin: 15px;
  }

  .page-title {
    font-size: 20px;
    margin-bottom: 20px;
  }

  .details-section {
    padding: 12px;
  }

  .details-section h2 {
    font-size: 1.3rem;
    margin-bottom: 12px;
  }

  .detail-line {
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 8px;
  }

  .detail-line strong {
    width: auto;
    margin-right: 0;
    margin-bottom: 4px;
  }

  .detail-line span {
    width: 100%;
  }

  .action-buttons {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .action-buttons .btn {
    width: 100%;
  }

  .status-message {
    padding: 12px;
    font-size: 0.95rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .status-message:not(.loading-message):not(.error-message) {
    align-items: center;
    text-align: center;
  }

  .back-button-container {
    margin-top: 20px;
    text-align: center;
  }

  /* На мобильных заголовок и кнопки действия в колонку */
  .header-top-section {
    flex-direction: column;
    align-items: center;
    margin-bottom: 20px;
    gap: 15px;
  }

  .page-title {
    text-align: center;
  }
}

@media (max-width: 480px) {
  .order-detail-container {
    padding: 10px;
    margin: 10px;
  }

  .page-title {
    font-size: 18px;
    margin-bottom: 15px;
  }

  .details-section h2 {
    font-size: 1.2rem;
  }

  .details-section {
    padding: 10px;
  }

  .detail-line {
    margin-bottom: 6px;
    font-size: 0.9rem;
  }

  .detail-line strong {
    margin-bottom: 3px;
  }

  .btn {
    padding: 8px 15px;
    font-size: 0.9rem;
  }

  .status-message {
    padding: 10px;
    font-size: 0.85rem;
    gap: 6px;
  }

  .loader {
    width: 18px;
    height: 18px;
  }
}
</style>
