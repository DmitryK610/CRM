<template>
  <div class="calculation-editor">
    <div class="header">
      <h1>Создать новый расчет</h1>
      <p>Заполните форму для расчета стоимости изделия из камня</p>
    </div>

    <div class="calculation-layout">
      <div class="form-column">
        <form @submit.prevent="handleCalculate" class="calculation-form-container" novalidate>
          <div class="form-group required-field">
            <label for="stoneName">Артикул камня</label>
            <div class="search-container">
              <input id="stoneName" v-model="calculationStore.form.stoneName" @input="handleSearchInput"
                @focus="showDropdown = true" @blur="handleBlur" type="text"
                placeholder="Введите артикул или поиск по названию, поставщику..." class="form-control" required
                autocomplete="off" />
              <div v-if="showDropdown && filteredMaterials.length > 0" class="search-dropdown">
                <div v-for="material in filteredMaterials" :key="material.id" @mousedown="selectMaterial(material)"
                  class="search-item">
                  <div class="font-medium">{{ material.color_code || material.material_name }}</div>
                  <div class="search-item-details">
                    {{ material.material_name }} •
                    {{ material.supplier_details?.company_name || 'Поставщик не указан' }} •
                    {{ formatCurrency(material.cost_per_sqm || 0) }}/м²
                  </div>
                  <div v-if="material.note" class="search-item-note">{{ material.note }}</div>
                </div>
              </div>
              <div v-if="showDropdown && calculationStore.form.stoneName.length > 0 && filteredMaterials.length === 0"
                class="search-dropdown-empty">
                Материал не найден
              </div>
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

          <div class="form-group required-field">
            <label for="productArea">Площадь изделия (м²)</label>
            <input id="productArea" v-model.number="calculationStore.form.productArea" type="number" step="0.01" min="0"
              class="form-control" required />
          </div>

          <div class="form-check">
            <input id="measurementRequired" v-model="calculationStore.form.measurementRequired" type="checkbox"
              class="form-check-input" />
            <label for="measurementRequired" class="form-check-label">Требуется замер</label>
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

          <div class="form-group">
            <label for="deliveryType">Доставка изделия</label>
            <select id="deliveryType" v-model="calculationStore.form.deliveryType" class="form-control">
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
            <router-link to="/calculations" class="btn btn-secondary">
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

            <div class="form-actions">
              <button @click="handleSaveCalculation"
                      :disabled="calculationStore.isLoading || !calculationStore.hasResult"
                      :title="!calculationStore.hasResult ? 'Сначала выполните расчет' : ''"
                      class="btn btn-primary">
                <span v-if="calculationStore.isLoading" class="loader"></span>
                {{ calculationStore.isLoading ? 'Сохранение...' : 'Сохранить расчет' }}
              </button>
              <button @click="clearResult" class="btn btn-secondary clear-results-btn">
                Очистить результат
              </button>
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

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCalculationStore } from '@/stores/calculationStore'
import { useMaterialStore } from '@/stores/materialStore'
import { useClientStore } from '@/stores/clientStore'
import type { Material } from '@/types/material'
import { useRouter } from 'vue-router'

const calculationStore = useCalculationStore()
const materialStore = useMaterialStore()
const clientStore = useClientStore()
const router = useRouter() // Инициализируем роутер
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

// Обработчик нажатия на кнопку "Рассчитать"
const handleCalculate = async () => {
  await calculationStore.performCalculation()
}

// Обработчик нажатия на кнопку "Сохранить расчет"
const handleSaveCalculation = async () => {
  const success = await calculationStore.saveCalculation()
  if (success) {
    router.push('/calculations') // Перенаправление на страницу со всеми расчетами
  }
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
  // Client selection logic handled by computed property
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
.calculation-editor {
  padding: 20px;
  max-width: 1200px;
  margin: 20px auto;
  font-family: 'Arial', sans-serif;
  color: #333;
  background-color: #f9fafb;
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

/* LAYOUT */
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

/* FORM STYLES */
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

/* CHECKBOX */
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

/* MATERIAL SEARCH DROPDOWN */
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

/* COMPLEXITY SECTION */
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

/* FORM ACTIONS */
.form-actions {
  margin-top: 15px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-start;
  gap: 10px;
  flex-wrap: wrap;
}

/* RESULTS PANEL */
.results-panel {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 25px;
  position: sticky;
  top: 20px;
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

/* LOADER */
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

/* BUTTONS */
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


/* RESPONSIVENESS */
@media (max-width: 992px) {
  .calculation-layout {
    flex-direction: column;
  }

  .results-column {
    order: -1;
    /* Move results to the top on smaller screens */
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
