<template>
  <AppModal :is-open="true" title="Детали расчета" :maxWidth="1100" @close="closeModal">
    <div class="order-detail-container">
      <div v-if="isLoading" class="status-message loading-message">
        <div class="loader"></div>
        <span class="ml-3">Загрузка расчета...</span>
      </div>

      <div v-else-if="error" class="status-message error-message">
        ⚠️ Ошибка загрузки: {{ error }}
      </div>

      <div v-else-if="calculation" class="space-y-6">
        <div class="details-section">
          <h2>Информация о расчете №{{calculation.calculationId}}</h2>
        
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

        <div class="details-section" v-if="calculation.orderId || hasLinkedOrder">
          <h2>Связанный заказ</h2>
          <div class="detail-line">
            <strong>Заказ:</strong>
            <span v-if="calculation.orderId" class="order-link">
              <router-link :to="`/orders/${calculation.orderId}`" class="btn btn-sm btn-outline-success order-btn">
                Заказ #{{ calculation.orderId }}
              </router-link>
            </span>
            <span v-else class="text-muted">Заказ не создан</span>
          </div>
        </div>
      </div>

      <div v-else class="status-message no-results-message">
        Расчет не найден.
      </div>
    </div>

  </AppModal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppModal from '@/components/ui/AppModal.vue'
import type { CalculationHistory } from '@/types/calculation'
import { getCalculationById } from '@/api/calculation'
import { useCalculationStore } from '@/stores/calculationStore'

const route = useRoute()
const router = useRouter()
const calculationStore = useCalculationStore()



const props = defineProps<{ id?: string | number }>()


const calculation = ref<CalculationHistory | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)


const calculationId = computed(() => {
  const val = props.id ?? route.params.id
  return val != null ? String(val) : ''
})


const totalCost = computed(() => {
  if (!calculation.value) return 0


  if (calculation.value.totalCost !== undefined && calculation.value.totalCost !== null) {
    const cost = typeof calculation.value.totalCost === 'string'
      ? parseFloat(calculation.value.totalCost)
      : Number(calculation.value.totalCost)
    return isNaN(cost) ? 0 : cost
  }


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

  const calcWithComplexity = calculation.value as { complexityAdditions?: { radius10to300?: number, radius300to1000?: number, verticalRadius?: number, twoPlaneProduct?: number } }
  if (calcWithComplexity?.complexityAdditions) {
    const additions = calcWithComplexity.complexityAdditions
    return (additions.radius10to300 || 0) > 0 ||
      (additions.radius300to1000 || 0) > 0 ||
      (additions.verticalRadius || 0) > 0 ||
      (additions.twoPlaneProduct || 0) > 0
  }


  const additions = calculation.value?.form?.complexityAdditions
  if (additions) {
    return (additions.radius10to300 || 0) > 0 ||
      (additions.radius300to1000 || 0) > 0 ||
      (additions.verticalRadius || 0) > 0 ||
      (additions.twoPlaneProduct || 0) > 0
  }

  return false
})

const hasLinkedOrder = computed(() => {
  return calculation.value?.orderId !== undefined && calculation.value?.orderId !== null
})


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

    if (dateString.includes('T') || dateString.includes(':')) {
      return date.toLocaleDateString('ru-RU') + ' ' + date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('ru-RU');
  } catch {
    return 'некорректная дата';
  }
};


const getClientName = (calculation: CalculationHistory): string => {

  if (calculation.form?.selectedClient) {
    return calculation.form.selectedClient.full_name
  }


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


  return 'Анонимный расчет'
}


const getMaterialName = (calculation: CalculationHistory): string => {

  if (calculation.form?.selectedMaterial) {
    return `${calculation.form.selectedMaterial.color_code} (${calculation.form.selectedMaterial.material_name})`
  }


  if (calculation.form?.stoneName) {
    return calculation.form.stoneName
  }

  if (calculation.stoneName) {
    return calculation.stoneName
  }

  return 'Материал не указан'
}


const getProductArea = (calculation: CalculationHistory): number => {

  const calcWithCamelCase = calculation as { productArea?: number | string }
  if (calcWithCamelCase.productArea !== undefined && calcWithCamelCase.productArea !== null) {
    const area = typeof calcWithCamelCase.productArea === 'string' ? parseFloat(calcWithCamelCase.productArea) : calcWithCamelCase.productArea
    return isNaN(area) ? 0 : area
  }


  if (calculation.product_area !== undefined) {
    const area = typeof calculation.product_area === 'string' ? parseFloat(calculation.product_area) : calculation.product_area
    return isNaN(area) ? 0 : area
  }


  if (calculation.form?.productArea !== undefined && calculation.form.productArea > 0) {
    return calculation.form.productArea
  }

  return 0
}


const getMeasurementRequired = (calculation: CalculationHistory): boolean => {

  const calcWithCamelCase = calculation as { measurementRequired?: boolean }
  if (calcWithCamelCase.measurementRequired !== undefined) {
    return calcWithCamelCase.measurementRequired
  }


  if (calculation.measurement_required !== undefined) {
    return calculation.measurement_required
  }


  if (calculation.form?.measurementRequired !== undefined) {
    return calculation.form.measurementRequired
  }

  return false
}


const getSurfaceBonding = (calculation: CalculationHistory): number => {

  const calcWithCamelCase = calculation as { surfaceBonding?: number | string }
  if (calcWithCamelCase.surfaceBonding !== undefined) {
    const bonding = typeof calcWithCamelCase.surfaceBonding === 'string' ? parseFloat(calcWithCamelCase.surfaceBonding) : calcWithCamelCase.surfaceBonding
    return isNaN(bonding) ? 0 : bonding
  }


  if (calculation.surface_bonding !== undefined) {
    const bonding = typeof calculation.surface_bonding === 'string' ? parseFloat(calculation.surface_bonding) : calculation.surface_bonding
    return isNaN(bonding) ? 0 : bonding
  }


  if (calculation.form?.surfaceBonding !== undefined && calculation.form.surfaceBonding > 0) {
    return calculation.form.surfaceBonding
  }

  return 0
}


const getEdgeType = (calculation: CalculationHistory): string => {

  const calcWithCamelCase = calculation as { edgeType?: string }
  let edgeType = calcWithCamelCase.edgeType || calculation.edge_type


  if (!edgeType) {
    edgeType = calculation.form?.edgeType
  }

  if (edgeType === 'radius') return 'Радиусная'
  if (edgeType === 'figured') return 'Фигурная'
  return 'Не указан'
}


const getEdgeLength = (calculation: CalculationHistory): number => {

  const calcWithCamelCase = calculation as { edgeLength?: number | string }
  if (calcWithCamelCase.edgeLength !== undefined) {
    const length = typeof calcWithCamelCase.edgeLength === 'string' ? parseFloat(calcWithCamelCase.edgeLength) : calcWithCamelCase.edgeLength
    return isNaN(length) ? 0 : length
  }


  if (calculation.edge_length !== undefined) {
    const length = typeof calculation.edge_length === 'string' ? parseFloat(calculation.edge_length) : calculation.edge_length
    return isNaN(length) ? 0 : length
  }


  if (calculation.form?.edgeLength !== undefined && calculation.form.edgeLength > 0) {
    return calculation.form.edgeLength
  }

  return 0
}


const getDrainageType = (calculation: CalculationHistory): string => {

  const calcWithCamelCase = calculation as { drainageType?: string }
  let drainageType = calcWithCamelCase.drainageType || calculation.drainage_type


  if (!drainageType) {
    drainageType = calculation.form?.drainageType
  }

  if (drainageType === 'overlay') return 'Накладной'
  if (drainageType === 'integrated') return 'Интегрированный'
  return 'Не указан'
}


const getDrainageLength = (calculation: CalculationHistory): number => {

  const calcWithCamelCase = calculation as { drainageLength?: number | string }
  if (calcWithCamelCase.drainageLength !== undefined) {
    const length = typeof calcWithCamelCase.drainageLength === 'string' ? parseFloat(calcWithCamelCase.drainageLength) : calcWithCamelCase.drainageLength
    return isNaN(length) ? 0 : length
  }


  if (calculation.drainage_length !== undefined) {
    const length = typeof calculation.drainage_length === 'string' ? parseFloat(calculation.drainage_length) : calculation.drainage_length
    return isNaN(length) ? 0 : length
  }


  if (calculation.form?.drainageLength !== undefined && calculation.form.drainageLength > 0) {
    return calculation.form.drainageLength
  }

  return 0
}


const getFrontBend = (calculation: CalculationHistory): number => {

  const calcWithCamelCase = calculation as { frontBend?: number | string }
  if (calcWithCamelCase.frontBend !== undefined) {
    const bend = typeof calcWithCamelCase.frontBend === 'string' ? parseFloat(calcWithCamelCase.frontBend) : calcWithCamelCase.frontBend
    return isNaN(bend) ? 0 : bend
  }


  if (calculation.front_bend !== undefined) {
    const bend = typeof calculation.front_bend === 'string' ? parseFloat(calculation.front_bend) : calculation.front_bend
    return isNaN(bend) ? 0 : bend
  }


  if (calculation.form?.frontBend !== undefined && calculation.form.frontBend > 0) {
    return calculation.form.frontBend
  }

  return 0
}


const getVentilationHoles = (calculation: CalculationHistory): number => {

  const calcWithCamelCase = calculation as { ventilationHoles?: number }
  if (calcWithCamelCase.ventilationHoles !== undefined) {
    return calcWithCamelCase.ventilationHoles
  }


  if (calculation.ventilation_holes !== undefined) {
    return calculation.ventilation_holes
  }


  if (calculation.form?.ventilationHoles !== undefined && calculation.form.ventilationHoles > 0) {
    return calculation.form.ventilationHoles
  }

  return 0
}


const getCooktopCutouts = (calculation: CalculationHistory): number => {

  const calcWithCamelCase = calculation as { cooktopCutouts?: number }
  if (calcWithCamelCase.cooktopCutouts !== undefined) {
    return calcWithCamelCase.cooktopCutouts
  }


  if (calculation.cooktop_cutouts !== undefined) {
    return calculation.cooktop_cutouts
  }


  if (calculation.form?.cooktopCutouts !== undefined && calculation.form.cooktopCutouts > 0) {
    return calculation.form.cooktopCutouts
  }

  return 0
}


const getOverlaySinkCutouts = (calculation: CalculationHistory): number => {

  const calcWithCamelCase = calculation as { overlaySinkCutouts?: number }
  if (calcWithCamelCase.overlaySinkCutouts !== undefined) {
    return calcWithCamelCase.overlaySinkCutouts
  }


  if (calculation.overlay_sink_cutouts !== undefined) {
    return calculation.overlay_sink_cutouts
  }


  if (calculation.form?.overlaySinkCutouts !== undefined && calculation.form.overlaySinkCutouts > 0) {
    return calculation.form.overlaySinkCutouts
  }

  return 0
}


const getUndermountSinkInstallations = (calculation: CalculationHistory): number => {

  const calcWithCamelCase = calculation as { undermountSinkInstallations?: number }
  if (calcWithCamelCase.undermountSinkInstallations !== undefined) {
    return calcWithCamelCase.undermountSinkInstallations
  }


  if (calculation.undermount_sink_installations !== undefined) {
    return calculation.undermount_sink_installations
  }


  if (calculation.form?.undermountSinkInstallations !== undefined && calculation.form.undermountSinkInstallations > 0) {
    return calculation.form.undermountSinkInstallations
  }

  return 0
}


const getOnSiteJoining = (calculation: CalculationHistory): number => {

  const calcWithCamelCase = calculation as { onSiteJoining?: number }
  if (calcWithCamelCase.onSiteJoining !== undefined) {
    return calcWithCamelCase.onSiteJoining
  }


  if (calculation.on_site_joining !== undefined) {
    return calculation.on_site_joining
  }


  if (calculation.form?.onSiteJoining !== undefined && calculation.form.onSiteJoining > 0) {
    return calculation.form.onSiteJoining
  }

  return 0
}


const getDeliveryType = (calculation: CalculationHistory): string => {

  const calcWithCamelCase = calculation as { deliveryType?: string }
  let deliveryType = calcWithCamelCase.deliveryType || calculation.delivery_type


  if (!deliveryType) {
    deliveryType = calculation.form?.deliveryType
  }

  if (deliveryType === 'city') return 'В черте города'
  if (deliveryType === 'outside_city') return 'За пределами города'
  return 'Не указан'
}


const getComplexityAddition = (calculation: CalculationHistory, type: 'radius10to300' | 'radius300to1000' | 'verticalRadius' | 'twoPlaneProduct'): number => {

  const calcWithComplexity = calculation as { complexityAdditions?: { [key: string]: number } }
  if (calcWithComplexity?.complexityAdditions?.[type] !== undefined) {
    return calcWithComplexity.complexityAdditions[type]
  }


  const formValue = calculation.form?.complexityAdditions?.[type]
  if (formValue !== undefined && formValue > 0) {
    return formValue
  }

  return 0
}


const goBack = () => {
  router.push('/calculations')
}

const closeModal = () => {

  goBack()
}


const loadCalculation = async () => {
  if (!calculationId.value) {
    error.value = 'ID расчета не указан'
    return
  }

  isLoading.value = true
  error.value = null

  try {

    const calculationFromStore = calculationStore.history.find(
      calc => (calc.id && calc.id.toString() === calculationId.value) ||
        (calc.calculationId && calc.calculationId.toString() === calculationId.value)
    )

    if (calculationFromStore) {
      calculation.value = calculationFromStore
    } else {

      calculation.value = await getCalculationById(calculationId.value)
    }
  } catch (err) {
    console.error('Ошибка при загрузке расчета:', err)
    error.value = 'Не удалось загрузить расчет. Возможно, расчет не существует или у вас нет прав доступа.'
  } finally {
    isLoading.value = false
  }
}


onMounted(async () => {

  if (calculationStore.history.length === 0) {
    try {
      await calculationStore.loadHistory({ keepCache: false })
    } catch (err) {
      console.warn('Не удалось загрузить историю расчетов:', err)
    }
  } else {

    calculationStore.loadHistory({ keepCache: true }).catch(() => {})
  }


  await loadCalculation()
})
</script>

<style scoped>

.order-detail-container {
  padding: 0;
  margin: 0;
  max-width: 100%;
  background-color: transparent;
  border: none;
  box-shadow: none;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
  box-sizing: border-box;
}


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
  
}


.header-top-section {
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  
}



.details-section {
  margin-bottom: 16px;
  padding: 0;
  border: none;
  border-radius: 0;
  background-color: transparent; 
}

.details-section h2 {
  color: #555;
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 1.4rem;
  border-bottom: 1px solid #ddd;
  padding-bottom: 8px;
}


.detail-line {
  display: flex;
  margin-bottom: 10px;
  line-height: 1.5;
  font-size: 1rem;
  align-items: baseline;
  flex-wrap: nowrap; 
  white-space: nowrap; 
  overflow: hidden;
  text-overflow: ellipsis;
}

.detail-line strong {
  font-weight: bold;
  width: 350px; 
  flex-shrink: 0;
  margin-right: 10px; 
  text-align: left;
}

.detail-line span {
  flex-grow: 1;
  min-width: 0; 
  text-align: center; 
}


.order-detail-container .detail-line {
  align-items: center;
}
.order-detail-container .detail-line::after {
  content: '';
  flex: 0 1 180px;
  max-width: 220px;
  border-bottom: 1px dotted #e9ecef;
  order: 1;
  margin: 0 8px;
}
.order-detail-container .detail-line strong { order: 0; }
.order-detail-container .detail-line > span { order: 2; text-align: left; flex: 0 0 50%; }


.order-detail-container .grid-columns .detail-line::after { display: none; }
.order-detail-container .grid-columns .detail-line > span { text-align: left; }

@media (max-width: 768px) {
  .order-detail-container .detail-line::after { display: none; }
  .order-detail-container .detail-line > span { flex: initial; width: 100%; }
}


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


.text-muted {
  color: #6c757d;
  text-align: center;
  padding: 15px;
  font-style: italic;
}


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

.btn-outline-success {
  background-color: transparent;
  color: #28a745;
  border-color: #28a745;
}

.btn-outline-success:hover {
  background-color: #28a745;
  color: white;
  border-color: #28a745;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 0.8rem;
}

.order-link {
  display: inline-block;
}

.order-btn {
  margin: 0;
  border-radius: 3px;
}

.text-muted {
  color: #6c757d;
  font-style: italic;
}


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


.back-button-container {
  text-align: center;
  margin-top: 30px;
  
}


.grid-columns {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

@media (min-width: 768px) {
  .grid-columns {
    grid-template-columns: repeat(2, 1fr);
  }

  
  .page-title {
    text-align: left;
    
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
  text-align: left; /* unify mobile text alignment */
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