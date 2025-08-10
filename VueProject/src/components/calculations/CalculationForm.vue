<template>
  <div class="calculation-editor" :class="{ 'in-modal': !!props.isModal }">
    <div class="header" v-if="!props.isModal">
      <h1>Создать новый расчет</h1>
      <p>Заполните форму для расчета стоимости изделия из камня</p>
    </div>

    <div class="calculation-layout">
      <div class="form-column">
        <form @submit.prevent="handleCalculate" class="calculation-form-container" novalidate>
          <div class="form-group required-field">
            <label for="material-select">Материал</label>
            <v-select id="material-select" class="form-control v-select-custom" v-model="selectedMaterialId"
              :options="availableMaterials" label="material_name" :reduce="(mat: Material) => mat.id"
              placeholder="-- Выберите или найдите материал --" :filterable="true" :filter="filterMaterials"
              :clearable="true" @option:selected="handleMaterialSelect" @option:deselecting="handleMaterialDeselect"
              :append-to-body="!props.isModal" :calculatePosition="withPopper">
              <template #option="{ material_name, color_code, cost }">
                <div class="option-content">
                  <span class="option-name">{{ material_name }} ({{ color_code }})</span>
                  <span class="option-cost">{{ formatCurrency(cost || 0) }}</span>
                </div>
              </template>
              <template #selected-option="{ material_name, color_code }">
                <span v-if="material_name">{{ material_name }} ({{ color_code }})</span>
                <span v-else>-- Выберите материал --</span>
              </template>
              <template #no-options="{ search, loading }">
                <div v-if="loading">Поиск...</div>
                <div v-else-if="search">Материал "{{ search }}" не найден.</div>
                <div v-else-if="!materialStore.getMaterials?.length">Нет доступных материалов.</div>
                <div v-else>Начните ввод для поиска...</div>
              </template>
            </v-select>
            <div v-if="selectedMaterial" class="selected-material-info">
              <span class="material-info-item"><strong>Артикул:</strong> {{ selectedMaterial.color_code }}</span>
              <span class="material-info-item"><strong>Стоимость:</strong> {{
                formatCurrency(selectedMaterial.cost || 0)
              }}</span>
            </div>
          </div>

          <div class="form-group">
            <label for="clientSelect">Клиент (опционально)</label>
            <select id="clientSelect" v-model="selectedClientId" @change="handleClientChange" class="form-control">
              <option value="">Без привязки к клиенту (анонимный расчет)</option>
              <option v-for="client in clientStore.clients" :key="client.id" :value="client.id">
                {{ client.full_name }} • {{ client.contact_phone }}
              </option>
            </select>
            <p class="field-description">Выберите клиента или оставьте пустым для анонимного расчета.</p>
          </div>

          <div class="form-group">
            <label for="orderSelect">Заказ (опционально)</label>
            <select id="orderSelect" v-model="selectedOrderId" @change="handleOrderChange" class="form-control">
              <option value="">Без привязки к заказу</option>
              <option v-for="order in availableOrders" :key="order.id" :value="order.id">
                Заказ #{{ order.id }} - {{ order.client_info?.full_name || 'N/A' }} - {{
                  formatCurrency(order.total_amount) }}
              </option>
            </select>
            <p class="field-description">Выберите заказ для привязки расчета или оставьте пустым.</p>
          </div>

          <div class="form-group required-field">
            <label for="productArea">Площадь изделия (м²)</label>
            <input id="productArea" v-model.number="calculationStore.form.productArea" type="number" step="0.01" min="0"
              class="form-control" required />
          </div>

          <div class="form-check accent-checkbox">
            <input id="measurementRequired" v-model="calculationStore.form.measurementRequired" type="checkbox"
              class="form-check-input accent-checkbox-input" />
            <label for="measurementRequired" class="form-check-label accent-checkbox-label">Требуется замер</label>
          </div>

          <div class="form-group">
            <label for="surfaceBonding">Склейка поверхностей при ширине более 750мм (м.п.)</label>
            <input id="surfaceBonding" v-model.number="calculationStore.form.surfaceBonding" type="number" step="0.01"
              min="0" class="form-control" />
          </div>

          <div class="form-row">
            <div class="form-group form-group-half">
              <label for="edgeType">Тип торцевой кромки</label>
              <select id="edgeType" v-model="calculationStore.form.edgeType" class="form-control">
                <option value="radius">Радиусная</option>
                <option value="figured">Фигурная</option>
              </select>
            </div>
            <div class="form-group form-group-half">
              <label for="edgeLength">Длина кромки (м.п.)</label>
              <input id="edgeLength" v-model.number="calculationStore.form.edgeLength" type="number" step="0.01" min="0"
                class="form-control" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group form-group-half">
              <label for="drainageType">Тип водоотбойника</label>
              <select id="drainageType" v-model="calculationStore.form.drainageType" class="form-control">
                <option value="overlay">Накладной</option>
                <option value="integrated">Интегрированный</option>
              </select>
            </div>
            <div class="form-group form-group-half">
              <label for="drainageLength">Длина водоотбойника (м.п.)</label>
              <input id="drainageLength" v-model.number="calculationStore.form.drainageLength" type="number" step="0.01"
                min="0" class="form-control" />
            </div>
          </div>

          <div class="form-group">
            <label for="frontBend">Подгиб с лицевой стороны (м.п.)</label>
            <input id="frontBend" v-model.number="calculationStore.form.frontBend" type="number" step="0.01" min="0"
              class="form-control" />
          </div>

          <div class="form-row">
            <div class="form-group form-group-half">
              <label for="ventilationHoles">Вентиляционные отверстия (шт.)</label>
              <input id="ventilationHoles" v-model.number="calculationStore.form.ventilationHoles" type="number" min="0"
                class="form-control" />
            </div>
            <div class="form-group form-group-half">
              <label for="cooktopCutouts">Отверстия под варочную панель (шт.)</label>
              <input id="cooktopCutouts" v-model.number="calculationStore.form.cooktopCutouts" type="number" min="0"
                class="form-control" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group form-group-half">
              <label for="overlaySinkCutouts">Отверстия под накладную мойку (шт.)</label>
              <input id="overlaySinkCutouts" v-model.number="calculationStore.form.overlaySinkCutouts" type="number"
                min="0" class="form-control" />
            </div>
            <div class="form-group form-group-half">
              <label for="undermountSinkInstallations">Вклейка мойки подстольного монтажа (шт.)</label>
              <input id="undermountSinkInstallations" v-model.number="calculationStore.form.undermountSinkInstallations"
                type="number" min="0" class="form-control" />
            </div>
          </div>

          <div class="form-group">
            <label for="onSiteJoining">Стыковка изделия на объекте (шт.)</label>
            <input id="onSiteJoining" v-model.number="calculationStore.form.onSiteJoining" type="number" min="0"
              class="form-control" />
          </div>

          <div class="form-check accent-checkbox">
            <input id="deliveryRequired" type="checkbox" v-model="calculationStore.form.deliveryRequired"
              class="form-check-input accent-checkbox-input" />
            <label for="deliveryRequired" class="form-check-label accent-checkbox-label">Доставка требуется</label>
          </div>

          <div class="form-group">
            <label for="deliveryType">Доставка изделия</label>
            <select id="deliveryType" v-model="calculationStore.form.deliveryType" class="form-control"
              :disabled="!calculationStore.form.deliveryRequired">
              <option value="city">В черте города</option>
              <option value="outside_city">За пределы города</option>
            </select>
          </div>

          <div class="complexity-section">
            <h2>Надбавка за сложность</h2>
            <div class="form-row">
              <div class="form-group form-group-half">
                <label for="radius10to300">Радиус 10-300мм (шт.)</label>
                <input id="radius10to300" v-model.number="calculationStore.form.complexityAdditions.radius10to300"
                  type="number" min="0" class="form-control" />
              </div>
              <div class="form-group form-group-half">
                <label for="radius300to1000">Радиус 300-1000мм (шт.)</label>
                <input id="radius300to1000" v-model.number="calculationStore.form.complexityAdditions.radius300to1000"
                  type="number" min="0" class="form-control" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group form-group-half">
                <label for="verticalRadius">Вертикальный радиус (шт.)</label>
                <input id="verticalRadius" v-model.number="calculationStore.form.complexityAdditions.verticalRadius"
                  type="number" min="0" class="form-control" />
              </div>
              <div class="form-group form-group-half">
                <label for="twoPlaneProduct">Изделие в 2х плоскостях (шт.)</label>
                <input id="twoPlaneProduct" v-model.number="calculationStore.form.complexityAdditions.twoPlaneProduct"
                  type="number" min="0" class="form-control" />
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" :disabled="!calculationStore.formIsValid || calculationStore.isLoading"
              class="btn btn-primary">
              <span v-if="calculationStore.isLoading" class="loader"></span>
              {{ calculationStore.isLoading ? 'Расчет...' : 'Рассчитать' }}
            </button>
            <button type="button" @click="resetForm" class="btn btn-danger">
              Сбросить
            </button>
            <router-link v-if="!props.isModal" to="/calculations" class="btn btn-secondary">
              Назад к списку
            </router-link>
          </div>
        </form>
      </div>

      <div class="results-column">
        <div class="results-panel">
          <h2 class="results-title">Результат расчета</h2>

          <div v-if="calculationStore.hasResult && calculationStore.currentResult" class="results-content">
            <div class="total-cost-panel">
              <p class="total-cost-label">Общая стоимость</p>
              <p class="total-cost-value">
                {{ formatCurrency(calculationStore.currentResult.totalCost) }}
              </p>
            </div>

            <div class="breakdown-section">
              <h3 class="breakdown-title">Детализация:</h3>
              <div v-for="(item, key) in calculationStore.currentResult.breakdown" :key="key" class="breakdown-item">
                <span>{{ getBreakdownLabel(String(key)) }}</span>
                <span class="breakdown-price">{{ formatCurrency(item.totalPrice) }}</span>
              </div>
            </div>

            <div class="form-actions results-actions">
              <button @click="handleSaveCalculation"
                :disabled="calculationStore.isLoading || !calculationStore.hasResult"
                :title="!calculationStore.hasResult ? 'Сначала выполните расчет' : ''" class="btn btn-primary">
                <span v-if="calculationStore.isLoading" class="loader"></span>
                {{ calculationStore.isLoading ? 'Сохранение...' : 'Сохранить расчет' }}
              </button>
              <!-- <button @click="clearResult" class="btn btn-secondary clear-results-btn">
                Очистить результат
              </button> -->
            </div>

          </div>

          <div v-else class="results-placeholder">
            <p>Заполните форму и нажмите "Рассчитать" для получения результата</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import vSelect from 'vue-select'
export default {
  components: {
    'v-select': vSelect
  }
}
</script>

<script setup lang="ts">
import { ref, computed, onMounted, defineProps, defineEmits } from 'vue'
import { useCalculationStore } from '@/stores/calculationStore'
import { useMaterialStore } from '@/stores/materialStore'
import { useClientStore } from '@/stores/clientStore'
import { useOrderStore } from '@/stores/orderStore'
import type { Material } from '@/types/material'
import { useRouter } from 'vue-router'
import { createPopper } from '@popperjs/core'
import type { Options } from '@popperjs/core'

const calculationStore = useCalculationStore()
const materialStore = useMaterialStore()
const clientStore = useClientStore()
const orderStore = useOrderStore()
const router = useRouter()


const props = defineProps<{ isModal?: boolean }>()
const emit = defineEmits(['close', 'saved'])


const selectedMaterialId = ref<number | null>(null)


const availableMaterials = computed(() => materialStore.getMaterials || [])


const selectedMaterial = computed(() => {
  if (!selectedMaterialId.value) return null
  return availableMaterials.value.find(m => m.id === selectedMaterialId.value) || null
})


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


const selectedOrderId = computed({
  get: () => calculationStore.form.orderId?.toString() || '',
  set: (value: string) => {
    if (value) {
      calculationStore.form.orderId = Number(value)
    } else {
      calculationStore.form.orderId = null
    }
  }
})


const availableOrders = computed(() => {
  const orders = orderStore.getOrders || []
  if (calculationStore.form.selectedClient?.id) {
    return orders.filter(order => order.client === calculationStore.form.selectedClient?.id)
  }
  return orders
})


const filterMaterials = (options: Material[], search: string): Material[] => {
  const lowerSearch = search.toLowerCase().trim()
  if (!lowerSearch) {
    return options
  }
  return options.filter(mat => {
    const name = (mat.material_name || '').toLowerCase()
    const code = (mat.color_code || '').toLowerCase()
    return name.includes(lowerSearch) || code.includes(lowerSearch)
  })
}


const withPopper = (dropdownList: HTMLElement, component: { $refs: { toggle: HTMLElement } }, { width }: { width: string }): (() => void) => {
  dropdownList.style.width = width
  const popperInstance = createPopper(component.$refs.toggle, dropdownList, {
    placement: 'bottom-start',
    modifiers: [
      { name: 'offset', options: { offset: [0, 4] } },
      { name: 'preventOverflow', options: { boundary: 'viewport' } },
      { name: 'flip', options: { fallbackPlacements: ['top-start'], padding: 8 } },
    ],
  } as Partial<Options>)

  return () => popperInstance.destroy()
}


const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB'
  }).format(amount)
}


const getBreakdownLabel = (key: string): string => {
  const labels: Record<string, string> = {
    delivery: 'Доставка',
    material: 'Стоимость камня',
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


const handleMaterialSelect = (material: Material) => {
  selectedMaterialId.value = material.id
  calculationStore.setSelectedMaterial(material)
}


const handleMaterialDeselect = () => {
  selectedMaterialId.value = null

  calculationStore.form.selectedMaterial = undefined
  calculationStore.form.stoneName = ''
}


const handleCalculate = async () => {
  await calculationStore.performCalculation()
}


const handleSaveCalculation = async () => {
  const success = await calculationStore.saveCalculation()
  if (success) {
    if (props.isModal) {
      emit('saved')
      emit('close')
    } else {
      router.push('/calculations')
    }
  }
}


const resetForm = () => {
  calculationStore.resetForm()
  selectedMaterialId.value = null
}







const handleClientChange = () => {

  if (calculationStore.form.orderId) {
    calculationStore.form.orderId = null
  }
}


const handleOrderChange = () => {

  if (calculationStore.form.orderId) {
    const selectedOrder = availableOrders.value.find(order => order.id === calculationStore.form.orderId)
    if (selectedOrder && selectedOrder.client_info) {

      if (!calculationStore.form.selectedClient) {
        const clientFromOrder = clientStore.clients.find(client => client.id === selectedOrder.client)
        if (clientFromOrder) {
          calculationStore.form.selectedClient = clientFromOrder
        }
      }
    }
  }
}


onMounted(async () => {
  try {
    await Promise.all([
      materialStore.fetchMaterials(),
      clientStore.fetchClients(),
      orderStore.fetchOrders()
    ])
  } catch {

  }
})
</script>

<style scoped>
.calculation-editor {
  padding: 20px;
  max-width: 1200px;
  margin: 20px auto;
  font-family: 'Arial', sans-serif;
  color: #333;
  background-color: #f9fafb;
}

.calculation-editor.in-modal {
  padding: 0;
  margin: 0;
  max-width: 100%;
  box-shadow: none;
  border-radius: 0;
  background-color: transparent;
}


.calculation-editor.in-modal .calculation-form-container {
  background-color: transparent;
  padding: 0;
  box-shadow: none;
  border-radius: 0;
}

.calculation-editor.in-modal .results-panel {
  background-color: transparent;
  box-shadow: none;
  padding: 0;
}

.calculation-editor.in-modal .calculation-layout {
  gap: 16px;
}

.header {
  text-align: left;
  margin-bottom: 25px;
}

.header h1 {
  color: #007bff;
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.header p {
  font-size: 1rem;
  color: #555;
}


.calculation-layout {
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
}

.form-column {
  flex: 2;
  min-width: 350px;
}

.results-column {
  flex: 1;
  min-width: 300px;
}


.calculation-form-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  background-color: #ffffff;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.form-row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.form-group {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.form-group-half {
  flex-basis: calc(50% - 10px);
  min-width: 150px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #555;
  font-size: 0.9rem;
}

.form-control {
  display: block;
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 1rem;
  color: #495057;
  background-color: #fff;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-control:focus {
  border-color: #007bff;
  outline: none;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.required-field label::after {
  content: ' *';
  color: #dc3545;
  margin-left: 4px;
}

.field-description {
  margin-top: 5px;
  font-size: 0.85rem;
  color: #6c757d;
}


.form-check {
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-check-input {
  width: 1em;
  height: 1em;
  margin-top: 0.15em;
  border: 1px solid #ced4da;
  border-radius: 0.25em;
  cursor: pointer;
}

.form-check-label {
  margin-bottom: 0;
  font-weight: 500;
}


.accent-checkbox {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.accent-checkbox-input {
  width: 22px;
  height: 22px;
  accent-color: #007bff;
  border: 2px solid #007bff;
  margin-right: 10px;
  transition: box-shadow 0.2s;
  box-shadow: 0 0 0 2px #e3f0ff;
}

.accent-checkbox-input:focus {
  outline: none;
  box-shadow: 0 0 0 3px #b3d7ff;
}

.accent-checkbox-label {
  font-weight: 600;
  color: #007bff;
  font-size: 1.05rem;
  cursor: pointer;
  user-select: none;
}


.search-container {
  position: relative;
}

.search-dropdown {
  position: absolute;
  z-index: 10;
  width: 100%;
  margin-top: 4px;
  background-color: #fff;
  border: 1px solid #ced4da;
  border-radius: 4px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-height: 240px;
  overflow-y: auto;
}

.search-dropdown-empty {
  position: absolute;
  z-index: 10;
  width: 100%;
  margin-top: 4px;
  background-color: #fff;
  border: 1px solid #ced4da;
  border-radius: 4px;
  padding: 12px;
  text-align: center;
  color: #6c757d;
}

.search-item {
  padding: 10px 12px;
  cursor: pointer;
  border-bottom: 1px solid #e9ecef;
}

.search-item:last-child {
  border-bottom: none;
}

.search-item:hover {
  background-color: #f8f9fa;
}

.search-item .font-medium {
  font-weight: 600;
}

.search-item-details {
  font-size: 0.9rem;
  color: #6c757d;
}

.search-item-note {
  font-size: 0.8rem;
  color: #888;
  margin-top: 4px;
}


.complexity-section {
  margin-top: 15px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

.complexity-section h2 {
  font-size: 1.2rem;
  margin-bottom: 15px;
  color: #333;
  font-weight: 600;
}


.form-actions {
  margin-top: 15px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-start;
  gap: 10px;
  flex-wrap: wrap;
}


.results-actions {
  justify-content: flex-end;
}
.results-actions .btn {
  min-width: 180px;
}
.results-actions .btn + .btn {
  
  flex-basis: 180px;
}

@media (max-width: 768px) {
  .results-actions {
    justify-content: stretch;
  }
  .results-actions .btn {
    flex: 1 1 50%;
    min-width: 0;
  }
}


.results-panel {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 25px;
  position: sticky;
  top: 20px;
}

.calculation-editor.in-modal .results-panel {
  position: sticky;
  top: 10px;
}

.results-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 20px;
  color: #333;
  text-align: center;
}

.results-placeholder {
  text-align: center;
  color: #6c757d;
  padding: 40px 10px;
}

.total-cost-panel {
  text-align: center;
  padding: 15px;
  background-color: #e9f7ef;
  border-radius: 8px;
  margin-bottom: 25px;
}

.total-cost-label {
  color: #28a745;
  font-size: 0.9rem;
  margin-bottom: 5px;
}

.total-cost-value {
  color: #218838;
  font-size: 1.8rem;
  font-weight: bold;
}

.breakdown-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 25px;
}

.breakdown-title {
  font-weight: 600;
  color: #333;
  font-size: 1rem;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 8px;
}

.breakdown-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.95rem;
}

.breakdown-price {
  font-weight: 500;
}

.clear-results-btn {
  width: 100%;
}


.loader {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #fff;
  border-radius: 50%;
  width: 1em;
  height: 1em;
  animation: spin 1s linear infinite;
  display: inline-block;
  margin-right: 8px;
  vertical-align: middle;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}


.btn {
  padding: 10px 20px;
  font-size: 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

.btn-primary {
  background-color: #007bff;
  color: white;
  border: 1px solid #007bff;
}

.btn-primary:hover {
  background-color: #0056b3;
  border-color: #0056b3;
}

.btn-success {
  background-color: #28a745;
  color: white;
  border: 1px solid #28a745;
}

.btn-success:hover {
  background-color: #218838;
  border-color: #1e7e34;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
  border: 1px solid #6c757d;
}

.btn-secondary:hover {
  background-color: #5a6268;
  border-color: #545b62;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
  border: 1px solid #dc3545;
}

.btn-danger:hover {
  background-color: #c82333;
  border-color: #bd2130;
}

.btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}


.v-select-custom {
  font-size: 1rem;
}

.v-select-custom .vs__dropdown-toggle {
  border: 1px solid #ced4da;
  border-radius: 4px;
  padding: 6px 12px;
  min-height: 42px;
}

.v-select-custom.vs--open .vs__dropdown-toggle {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.v-select-custom .vs__search {
  font-size: 1rem;
  padding: 4px 0;
  margin: 0;
}

.v-select-custom .vs__selected {
  font-size: 1rem;
  color: #495057;
  padding: 4px 0;
  margin: 0;
}

.v-select-custom .vs__dropdown-menu {
  border: 1px solid #ced4da;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-height: 300px;
}

.v-select-custom .vs__dropdown-option {
  padding: 8px 12px;
}

.v-select-custom .vs__dropdown-option--highlight {
  background-color: #007bff;
  color: white;
}

.option-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.option-name {
  font-weight: 600;
  color: #333;
}

.option-cost {
  font-size: 0.85rem;
  color: #28a745;
  font-weight: 500;
}

.vs__dropdown-option--highlight .option-name,
.vs__dropdown-option--highlight .option-cost {
  color: white;
}


.selected-material-info {
  margin-top: 10px;
  padding: 12px;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  font-size: 0.9rem;
}

.material-info-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.material-info-item strong {
  color: #495057;
}



@media (max-width: 992px) {
  .calculation-layout {
    flex-direction: column;
  }

  .results-column {
    order: -1;
    
  }

  .results-panel {
    position: static;
  }
}

@media (max-width: 768px) {
  .form-row {
    gap: 15px;
  }

  .form-group-half {
    flex-basis: 100%;
  }

  .form-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .form-actions .btn {
    width: 100%;
  }
}
</style>
