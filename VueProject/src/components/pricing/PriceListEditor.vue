<template>
  <div class="price-list-editor-container">
    <div v-if="loading" class="loading-overlay">
      <p>Загрузка...</p>
    </div>
    <div v-if="error" class="error-message">
      <p>Ошибка: {{ error }}</p>
      <button @click="clearError">Закрыть</button>
    </div>

    <form @submit.prevent="handleSave">
      <h2>Редактор прайс-листа</h2>

      <fieldset>
        <legend>Базовые услуги (за шт./услугу)</legend>
        <div class="form-grid">
          <div class="form-group">
            <label for="measurement">Замер</label>
            <input id="measurement" v-model.number="formData.measurement" type="number" step="0.01" />
          </div>
          <div class="form-group">
            <label for="deliveryCity">Доставка (в городе)</label>
            <input id="deliveryCity" v-model.number="formData.deliveryType.city" type="number" step="0.01" />
          </div>
          <div class="form-group">
            <label for="deliveryOutside">Доставка (за городом)</label>
            <input id="deliveryOutside" v-model.number="formData.deliveryType.outside_city" type="number" step="0.01" />
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend>Работы (за м.п.)</legend>
        <div class="form-grid">
          <div class="form-group">
            <label for="surfaceBondingPerM">Склейка поверхностей</label>
            <input id="surfaceBondingPerM" v-model.number="formData.surfaceBondingPerM" type="number" step="0.01" />
          </div>
          <div class="form-group">
            <label for="edgeTypeRadius">Кромка (радиус)</label>
            <input id="edgeTypeRadius" v-model.number="formData.edgeTypePerM.radius" type="number" step="0.01" />
          </div>
          <div class="form-group">
            <label for="edgeTypeFigured">Кромка (фигурная)</label>
            <input id="edgeTypeFigured" v-model.number="formData.edgeTypePerM.figured" type="number" step="0.01" />
          </div>
          <div class="form-group">
            <label for="drainageTypeOverlay">Водоотбойник (накладной)</label>
            <input id="drainageTypeOverlay" v-model.number="formData.drainageTypePerM.overlay" type="number"
              step="0.01" />
          </div>
          <div class="form-group">
            <label for="drainageTypeIntegrated">Водоотбойник (интегрированный)</label>
            <input id="drainageTypeIntegrated" v-model.number="formData.drainageTypePerM.integrated" type="number"
              step="0.01" />
          </div>
          <div class="form-group">
            <label for="frontBendPerM">Подгиб</label>
            <input id="frontBendPerM" v-model.number="formData.frontBendPerM" type="number" step="0.01" />
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend>Работы (за шт.)</legend>
        <div class="form-grid">
          <div class="form-group">
            <label for="ventilationHolePerUnit">Вентиляционные отверстия</label>
            <input id="ventilationHolePerUnit" v-model.number="formData.ventilationHolePerUnit" type="number"
              step="0.01" />
          </div>
          <div class="form-group">
            <label for="cooktopCutoutPerUnit">Выпил под варочную панель</label>
            <input id="cooktopCutoutPerUnit" v-model.number="formData.cooktopCutoutPerUnit" type="number" step="0.01" />
          </div>
          <div class="form-group">
            <label for="overlaySinkCutoutPerUnit">Выпил под накладную мойку</label>
            <input id="overlaySinkCutoutPerUnit" v-model.number="formData.overlaySinkCutoutPerUnit" type="number"
              step="0.01" />
          </div>
          <div class="form-group">
            <label for="undermountSinkInstallationPerUnit">Вклейка мойки подстольного монтажа</label>
            <input id="undermountSinkInstallationPerUnit" v-model.number="formData.undermountSinkInstallationPerUnit"
              type="number" step="0.01" />
          </div>
          <div class="form-group">
            <label for="onSiteJoiningPerUnit">Стыковка на объекте</label>
            <input id="onSiteJoiningPerUnit" v-model.number="formData.onSiteJoiningPerUnit" type="number" step="0.01" />
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend>Сложность (за шт.)</legend>
        <div class="form-grid">
          <div class="form-group">
            <label for="radius10To300PerUnit">Радиус 10-300мм</label>
            <input id="radius10To300PerUnit" v-model.number="formData.radius10To300PerUnit" type="number" step="0.01" />
          </div>
          <div class="form-group">
            <label for="radius300To1000PerUnit">Радиус 300-1000мм</label>
            <input id="radius300To1000PerUnit" v-model.number="formData.radius300To1000PerUnit" type="number"
              step="0.01" />
          </div>
          <div class="form-group">
            <label for="verticalRadiusPerUnit">Вертикальный радиус</label>
            <input id="verticalRadiusPerUnit" v-model.number="formData.verticalRadiusPerUnit" type="number"
              step="0.01" />
          </div>
          <div class="form-group">
            <label for="twoPlaneProductPerUnit">Изделие в 2х плоскостях</label>
            <input id="twoPlaneProductPerUnit" v-model.number="formData.twoPlaneProductPerUnit" type="number"
              step="0.01" />
          </div>
        </div>
        <legend>Коэффициенты расчета стоимости</legend>
        <div class="form-grid">
          <div class="form-group">
            <label for="baseMultiplier">Базовый множитель</label>
            <input id="baseMultiplier" v-model.number="formData.baseMultiplier" type="number" step="0.01" />
            <small>Изначально был 265.1</small>
          </div>
          <div class="form-group">
            <label for="coefficient0To300">Коэф. (цена $ до 300)</label>
            <input id="coefficient0To300" v-model.number="formData.coefficient0To300" type="number" step="0.001" />
          </div>
          <div class="form-group">
            <label for="coefficient300To340">Коэф. (цена $ 300-340)</label>
            <input id="coefficient300To340" v-model.number="formData.coefficient300To340" type="number" step="0.001" />
          </div>
          <div class="form-group">
            <label for="coefficient340To380">Коэф. (цена $ 340-380)</label>
            <input id="coefficient340To380" v-model.number="formData.coefficient340To380" type="number" step="0.001" />
          </div>
          <div class="form-group">
            <label for="coefficient380To500">Коэф. (цена $ 380-500)</label>
            <input id="coefficient380To500" v-model.number="formData.coefficient380To500" type="number" step="0.001" />
          </div>
          <div class="form-group">
            <label for="coefficient500To550">Коэф. (цена $ 500-550)</label>
            <input id="coefficient500To550" v-model.number="formData.coefficient500To550" type="number" step="0.001" />
          </div>
          <div class="form-group">
            <label for="coefficient550Plus">Коэф. (цена $ от 550)</label>
            <input id="coefficient550Plus" v-model.number="formData.coefficient550Plus" type="number" step="0.001" />
          </div>
        </div>
      </fieldset>


      <div class="form-actions">
        <button type="submit" class="save-button" :disabled="loading">
          {{ loading ? 'Сохранение...' : 'Сохранить изменения' }}
        </button>
        <button type="button" class="reset-button" @click="handleReset" :disabled="loading">
          Сбросить по умолчанию
        </button>
      </div>
      <p v-if="formData.lastSaved" class="last-saved">
        Последнее сохранение: {{ new Date(formData.lastSaved).toLocaleString() }}
      </p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { usePriceListStore } from '@/stores/priceListStore'
import type { PriceListFormData } from '@/types'

const priceListStore = usePriceListStore()
const { priceList, loading, error } = storeToRefs(priceListStore)

// Функция для создания объекта по умолчанию (соответствует Django модели)
const createDefaultFormData = (): PriceListFormData => ({
  measurement: 1.00,
  surfaceBondingPerM: 1.00,
  edgeTypePerM: {
    radius: 1.00,
    figured: 1.00,
  },
  drainageTypePerM: {
    overlay: 1.00,
    integrated: 1.00,
  },
  frontBendPerM: 1.00,
  deliveryType: {
    city: 1.00,
    outside_city: 1.00,
  },
  ventilationHolePerUnit: 1.00,
  cooktopCutoutPerUnit: 1.00,
  overlaySinkCutoutPerUnit: 1.00,
  undermountSinkInstallationPerUnit: 1.00,
  onSiteJoiningPerUnit: 1.00,
  radius10To300PerUnit: 1.00,
  radius300To1000PerUnit: 1.00,
  verticalRadiusPerUnit: 1.00,
  twoPlaneProductPerUnit: 1.00,
  baseMultiplier: 265.1,
  coefficient0To300: 1.0,
  coefficient300To340: 1.085,
  coefficient340To380: 1.15,
  coefficient380To500: 1.25,
  coefficient500To550: 1.5,
  coefficient550Plus: 1.6,
})

// Local reactive state for the form - инициализируем с дефолтными значениями
const formData = ref<PriceListFormData>(createDefaultFormData())

onMounted(async () => {
  await priceListStore.loadPriceList()
  // Deep copy the store's state to the local form data
  if (priceList.value) {
    formData.value = JSON.parse(JSON.stringify(priceList.value))
  }
})

// If the store's data changes (e.g., after a reset), update the form
watch(priceList, (newPriceList) => {
  if (newPriceList) {
    formData.value = JSON.parse(JSON.stringify(newPriceList))
  }
})

const handleSave = async () => {
  if (!loading.value) {
    try {
      // The store action will handle API call and state update
      await priceListStore.updatePriceList(formData.value)

      // Показываем уведомление об успешном сохранении
      // ...удалён console.log...
    } catch (error) {
      console.error('Error saving price list:', error)
      // Ошибка будет отображена через store
    }
  }
}

const handleReset = async () => {
  if (confirm('Вы уверены, что хотите сбросить все цены к значениям по умолчанию?')) {
    await priceListStore.resetToDefaults()
  }
}

const clearError = () => {
  priceListStore.clearError();
}
</script>

<style scoped>
/* Стили из CalculationForm - общие стили контейнера */
.price-list-editor-container {
  padding: 20px;
  max-width: 1200px;
  margin: 20px auto;
  font-family: 'Arial', sans-serif;
  color: #333;
  background-color: #f9fafb;
}

.form-group small {
  font-size: 0.8em;
  color: #6c757d;
  margin-top: 4px;
}

h2 {
  color: #007bff;
  font-size: 2rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: 25px;
}

form {
  background-color: #ffffff;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

/* Стили fieldset - применены стили из CalculationForm */
fieldset {
  border: 1px solid #ced4da;
  border-radius: 4px;
  padding: 20px;
  margin-bottom: 20px;
  background-color: #f8f9fa;
}

legend {
  font-weight: 600;
  color: #007bff;
  padding: 0 8px;
  font-size: 1.1rem;
}

/* Сетка форм - один столбец */
.form-grid {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #555;
  font-size: 0.9rem;
}

.form-group input {
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

.form-group input:focus {
  border-color: #007bff;
  outline: none;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

/* Стили кнопок - применены стили из CalculationForm */
.form-actions {
  margin-top: 15px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.save-button,
.reset-button {
  padding: 10px 20px;
  font-size: 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  min-width: 120px;
}

.save-button {
  background-color: #007bff;
  color: white;
  border: 1px solid #007bff;
}

.save-button:hover:not(:disabled) {
  background-color: #0056b3;
  border-color: #0056b3;
}

.save-button:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.reset-button {
  background-color: #dc3545;
  color: white;
  border: 1px solid #dc3545;
}

.reset-button:hover:not(:disabled) {
  background-color: #c82333;
  border-color: #bd2130;
}

.reset-button:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

/* Информация о последнем сохранении */
.last-saved {
  text-align: center;
  margin-top: 15px;
  color: #6c757d;
  font-size: 0.875rem;
  font-style: italic;
}

/* Оверлей загрузки */
.loading-overlay {
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  z-index: 10;
  border-radius: 8px;
}

.loading-overlay p {
  color: #007bff;
  font-size: 1.1rem;
  font-weight: 500;
}

/* Сообщения об ошибках */
.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 12px 15px;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.95rem;
}

.error-message button {
  background: none;
  border: none;
  color: #721c24;
  cursor: pointer;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.15s ease-in-out;
}

.error-message button:hover {
  background-color: rgba(114, 28, 36, 0.1);
}

/* Адаптивность - из CalculationForm */
@media (max-width: 992px) {
  .price-list-editor-container {
    padding: 15px;
  }
}

@media (max-width: 768px) {
  .price-list-editor-container {
    margin: 10px;
    padding: 15px;
  }

  .form-grid {
    gap: 12px;
  }

  .form-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .save-button,
  .reset-button {
    width: 100%;
  }

  fieldset {
    padding: 15px;
    margin-bottom: 15px;
  }

  form {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  h2 {
    font-size: 1.5rem;
  }

  .form-group label {
    font-size: 0.85rem;
  }

  .form-group input {
    padding: 8px 10px;
    font-size: 0.9rem;
  }

  fieldset {
    padding: 12px;
  }

  legend {
    font-size: 1rem;
  }
}
</style>
