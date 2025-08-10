<template>
  <div class="price-list-editor-container">
    <div class="header-actions">
      <h1>Прайс-лист</h1>
      <div class="header-buttons">
        <button type="button" class="btn btn-secondary btn-square" @click="openPreview" title="Просмотр всего прайс-листа" aria-label="Прайс-лист">
          <span class="material-symbols-outlined">visibility</span>
        </button>
      </div>
    </div>
    <div v-if="loading" class="loading-overlay">
      <p>Загрузка...</p>
    </div>
    <div v-if="error" class="error-message">
      <p>Ошибка: {{ error }}</p>
      <button @click="clearError">Закрыть</button>
    </div>

    <form @submit.prevent="handleSave">
      <!-- Desktop (sidebar + content) -->
      <div v-if="isWide" class="editor-layout">
        <nav class="sidebar">
          <button type="button" class="nav-item" :class="{active: activeSection==='basic'}" @click="setSection('basic')">Базовые услуги</button>
          <button type="button" class="nav-item" :class="{active: activeSection==='perMeter'}" @click="setSection('perMeter')">Работы (м.п.)</button>
          <button type="button" class="nav-item" :class="{active: activeSection==='perUnit'}" @click="setSection('perUnit')">Работы (шт.)</button>
          <button type="button" class="nav-item" :class="{active: activeSection==='complexity'}" @click="setSection('complexity')">Сложность</button>
          <button type="button" class="nav-item" :class="{active: activeSection==='coefficients'}" @click="setSection('coefficients')">Коэффициенты</button>
        </nav>
        <section class="content">
          <!-- BASIC -->
          <div v-if="activeSection==='basic'" class="section-card">
            <h3>Базовые услуги (за шт./услугу)</h3>
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
          </div>
          <!-- PER METER -->
          <div v-else-if="activeSection==='perMeter'" class="section-card">
            <h3>Работы (за м.п.)</h3>
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
                <input id="drainageTypeOverlay" v-model.number="formData.drainageTypePerM.overlay" type="number" step="0.01" />
              </div>
              <div class="form-group">
                <label for="drainageTypeIntegrated">Водоотбойник (интегрированный)</label>
                <input id="drainageTypeIntegrated" v-model.number="formData.drainageTypePerM.integrated" type="number" step="0.01" />
              </div>
              <div class="form-group">
                <label for="frontBendPerM">Подгиб</label>
                <input id="frontBendPerM" v-model.number="formData.frontBendPerM" type="number" step="0.01" />
              </div>
            </div>
          </div>
          <!-- PER UNIT -->
          <div v-else-if="activeSection==='perUnit'" class="section-card">
            <h3>Работы (за шт.)</h3>
            <div class="form-grid">
              <div class="form-group">
                <label for="ventilationHolePerUnit">Вентиляционные отверстия</label>
                <input id="ventilationHolePerUnit" v-model.number="formData.ventilationHolePerUnit" type="number" step="0.01" />
              </div>
              <div class="form-group">
                <label for="cooktopCutoutPerUnit">Выпил под варочную панель</label>
                <input id="cooktopCutoutPerUnit" v-model.number="formData.cooktopCutoutPerUnit" type="number" step="0.01" />
              </div>
              <div class="form-group">
                <label for="overlaySinkCutoutPerUnit">Выпил под накладную мойку</label>
                <input id="overlaySinkCutoutPerUnit" v-model.number="formData.overlaySinkCutoutPerUnit" type="number" step="0.01" />
              </div>
              <div class="form-group">
                <label for="undermountSinkInstallationPerUnit">Вклейка мойки подстольного монтажа</label>
                <input id="undermountSinkInstallationPerUnit" v-model.number="formData.undermountSinkInstallationPerUnit" type="number" step="0.01" />
              </div>
              <div class="form-group">
                <label for="onSiteJoiningPerUnit">Стыковка на объекте</label>
                <input id="onSiteJoiningPerUnit" v-model.number="formData.onSiteJoiningPerUnit" type="number" step="0.01" />
              </div>
            </div>
          </div>
          <!-- COMPLEXITY -->
          <div v-else-if="activeSection==='complexity'" class="section-card">
            <h3>Сложность (за шт.)</h3>
            <div class="form-grid">
              <div class="form-group">
                <label for="radius10To300PerUnit">Радиус 10-300мм</label>
                <input id="radius10To300PerUnit" v-model.number="formData.radius10To300PerUnit" type="number" step="0.01" />
              </div>
              <div class="form-group">
                <label for="radius300To1000PerUnit">Радиус 300-1000мм</label>
                <input id="radius300To1000PerUnit" v-model.number="formData.radius300To1000PerUnit" type="number" step="0.01" />
              </div>
              <div class="form-group">
                <label for="verticalRadiusPerUnit">Вертикальный радиус</label>
                <input id="verticalRadiusPerUnit" v-model.number="formData.verticalRadiusPerUnit" type="number" step="0.01" />
              </div>
              <div class="form-group">
                <label for="twoPlaneProductPerUnit">Изделие в 2х плоскостях</label>
                <input id="twoPlaneProductPerUnit" v-model.number="formData.twoPlaneProductPerUnit" type="number" step="0.01" />
              </div>
            </div>
          </div>
          <!-- COEFFICIENTS -->
          <div v-else class="section-card">
            <h3>Коэффициенты расчета стоимости</h3>
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
          </div>
        </section>
      </div>

      <!-- Mobile (accordion) -->
      <div v-else>
        <!-- existing accordion sections preserved -->
        <div class="accordion-section">
          <div class="accordion-header" @click="toggleSection('basic')" :class="{ active: openSections.basic }">
            <h3>Базовые услуги (за шт./услугу)</h3>
            <span class="accordion-icon">{{ openSections.basic ? '−' : '+' }}</span>
          </div>
          <div class="accordion-content" :class="{ open: openSections.basic }">
            <div class="form-grid">
              <div class="form-group">
                <label for="measurement-m">Замер</label>
                <input id="measurement-m" v-model.number="formData.measurement" type="number" step="0.01" />
              </div>
              <div class="form-group">
                <label for="deliveryCity-m">Доставка (в городе)</label>
                <input id="deliveryCity-m" v-model.number="formData.deliveryType.city" type="number" step="0.01" />
              </div>
              <div class="form-group">
                <label for="deliveryOutside-m">Доставка (за городом)</label>
                <input id="deliveryOutside-m" v-model.number="formData.deliveryType.outside_city" type="number" step="0.01" />
              </div>
            </div>
          </div>
        </div>
        <div class="accordion-section">
          <div class="accordion-header" @click="toggleSection('perMeter')" :class="{ active: openSections.perMeter }">
            <h3>Работы (за м.п.)</h3>
            <span class="accordion-icon">{{ openSections.perMeter ? '−' : '+' }}</span>
          </div>
          <div class="accordion-content" :class="{ open: openSections.perMeter }">
            <div class="form-grid">
              <div class="form-group">
                <label for="surfaceBondingPerM-m">Склейка поверхностей</label>
                <input id="surfaceBondingPerM-m" v-model.number="formData.surfaceBondingPerM" type="number" step="0.01" />
              </div>
              <div class="form-group">
                <label for="edgeTypeRadius-m">Кромка (радиус)</label>
                <input id="edgeTypeRadius-m" v-model.number="formData.edgeTypePerM.radius" type="number" step="0.01" />
              </div>
              <div class="form-group">
                <label for="edgeTypeFigured-m">Кромка (фигурная)</label>
                <input id="edgeTypeFigured-m" v-model.number="formData.edgeTypePerM.figured" type="number" step="0.01" />
              </div>
              <div class="form-group">
                <label for="drainageTypeOverlay-m">Водоотбойник (накладной)</label>
                <input id="drainageTypeOverlay-m" v-model.number="formData.drainageTypePerM.overlay" type="number" step="0.01" />
              </div>
              <div class="form-group">
                <label for="drainageTypeIntegrated-m">Водоотбойник (интегрированный)</label>
                <input id="drainageTypeIntegrated-m" v-model.number="formData.drainageTypePerM.integrated" type="number" step="0.01" />
              </div>
              <div class="form-group">
                <label for="frontBendPerM-m">Подгиб</label>
                <input id="frontBendPerM-m" v-model.number="formData.frontBendPerM" type="number" step="0.01" />
              </div>
            </div>
          </div>
        </div>
        <div class="accordion-section">
          <div class="accordion-header" @click="toggleSection('perUnit')" :class="{ active: openSections.perUnit }">
            <h3>Работы (за шт.)</h3>
            <span class="accordion-icon">{{ openSections.perUnit ? '−' : '+' }}</span>
          </div>
          <div class="accordion-content" :class="{ open: openSections.perUnit }">
            <div class="form-grid">
              <div class="form-group">
                <label for="ventilationHolePerUnit-m">Вентиляционные отверстия</label>
                <input id="ventilationHolePerUnit-m" v-model.number="formData.ventilationHolePerUnit" type="number" step="0.01" />
              </div>
              <div class="form-group">
                <label for="cooktopCutoutPerUnit-m">Выпил под варочную панель</label>
                <input id="cooktopCutoutPerUnit-m" v-model.number="formData.cooktopCutoutPerUnit" type="number" step="0.01" />
              </div>
              <div class="form-group">
                <label for="overlaySinkCutoutPerUnit-m">Выпил под накладную мойку</label>
                <input id="overlaySinkCutoutPerUnit-m" v-model.number="formData.overlaySinkCutoutPerUnit" type="number" step="0.01" />
              </div>
              <div class="form-group">
                <label for="undermountSinkInstallationPerUnit-m">Вклейка мойки подстольного монтажа</label>
                <input id="undermountSinkInstallationPerUnit-m" v-model.number="formData.undermountSinkInstallationPerUnit" type="number" step="0.01" />
              </div>
              <div class="form-group">
                <label for="onSiteJoiningPerUnit-m">Стыковка на объекте</label>
                <input id="onSiteJoiningPerUnit-m" v-model.number="formData.onSiteJoiningPerUnit" type="number" step="0.01" />
              </div>
            </div>
          </div>
        </div>
        <div class="accordion-section">
          <div class="accordion-header" @click="toggleSection('complexity')" :class="{ active: openSections.complexity }">
            <h3>Сложность (за шт.)</h3>
            <span class="accordion-icon">{{ openSections.complexity ? '−' : '+' }}</span>
          </div>
          <div class="accordion-content" :class="{ open: openSections.complexity }">
            <div class="form-grid">
              <div class="form-group">
                <label for="radius10To300PerUnit-m">Радиус 10-300мм</label>
                <input id="radius10To300PerUnit-m" v-model.number="formData.radius10To300PerUnit" type="number" step="0.01" />
              </div>
              <div class="form-group">
                <label for="radius300To1000PerUnit-m">Радиус 300-1000мм</label>
                <input id="radius300To1000PerUnit-m" v-model.number="formData.radius300To1000PerUnit" type="number" step="0.01" />
              </div>
              <div class="form-group">
                <label for="verticalRadiusPerUnit-m">Вертикальный радиус</label>
                <input id="verticalRadiusPerUnit-m" v-model.number="formData.verticalRadiusPerUnit" type="number" step="0.01" />
              </div>
              <div class="form-group">
                <label for="twoPlaneProductPerUnit-m">Изделие в 2х плоскостях</label>
                <input id="twoPlaneProductPerUnit-m" v-model.number="formData.twoPlaneProductPerUnit" type="number" step="0.01" />
              </div>
            </div>
          </div>
        </div>
        <div class="accordion-section">
          <div class="accordion-header" @click="toggleSection('coefficients')" :class="{ active: openSections.coefficients }">
            <h3>Коэффициенты расчета стоимости</h3>
            <span class="accordion-icon">{{ openSections.coefficients ? '−' : '+' }}</span>
          </div>
          <div class="accordion-content" :class="{ open: openSections.coefficients }">
            <div class="form-grid">
              <div class="form-group">
                <label for="baseMultiplier-m">Базовый множитель</label>
                <input id="baseMultiplier-m" v-model.number="formData.baseMultiplier" type="number" step="0.01" />
                <small>Изначально был 265.1</small>
              </div>
              <div class="form-group">
                <label for="coefficient0To300-m">Коэф. (цена $ до 300)</label>
                <input id="coefficient0To300-m" v-model.number="formData.coefficient0To300" type="number" step="0.001" />
              </div>
              <div class="form-group">
                <label for="coefficient300To340-m">Коэф. (цена $ 300-340)</label>
                <input id="coefficient300To340-m" v-model.number="formData.coefficient300To340" type="number" step="0.001" />
              </div>
              <div class="form-group">
                <label for="coefficient340To380-m">Коэф. (цена $ 340-380)</label>
                <input id="coefficient340To380-m" v-model.number="formData.coefficient340To380" type="number" step="0.001" />
              </div>
              <div class="form-group">
                <label for="coefficient380To500-m">Коэф. (цена $ 380-500)</label>
                <input id="coefficient380To500-m" v-model.number="formData.coefficient380To500" type="number" step="0.001" />
              </div>
              <div class="form-group">
                <label for="coefficient500To550-m">Коэф. (цена $ 500-550)</label>
                <input id="coefficient500To550-m" v-model.number="formData.coefficient500To550" type="number" step="0.001" />
              </div>
              <div class="form-group">
                <label for="coefficient550Plus-m">Коэф. (цена $ от 550)</label>
                <input id="coefficient550Plus-m" v-model.number="formData.coefficient550Plus" type="number" step="0.001" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn btn-primary save-button" :disabled="loading">
          {{ loading ? 'Сохранение...' : 'Сохранить изменения' }}
        </button>
      </div>
      <p v-if="formData.lastSaved" class="last-saved">
        Последнее сохранение: {{ new Date(formData.lastSaved).toLocaleString() }}
      </p>
    </form>

    <!-- Preview Modal placed within the main template -->
    <AppModal :is-open="isPreviewOpen" @close="closePreview" title="Прайс-лист" :maxWidth="900">
      <div class="preview-container">
        <div class="preview-section">
          <h3>Базовые услуги</h3>
          <div class="kv">
            <div class="kv-row"><span class="k">Замер</span><span class="v">{{ formData.measurement }}</span></div>
            <div class="kv-row"><span class="k">Доставка (в городе)</span><span class="v">{{ formData.deliveryType.city }}</span></div>
            <div class="kv-row"><span class="k">Доставка (за городом)</span><span class="v">{{ formData.deliveryType.outside_city }}</span></div>
          </div>
        </div>

        <div class="preview-section">
          <h3>Работы (за м.п.)</h3>
          <div class="kv">
            <div class="kv-row"><span class="k">Склейка поверхностей</span><span class="v">{{ formData.surfaceBondingPerM }}</span></div>
            <div class="kv-row"><span class="k">Кромка (радиус)</span><span class="v">{{ formData.edgeTypePerM.radius }}</span></div>
            <div class="kv-row"><span class="k">Кромка (фигурная)</span><span class="v">{{ formData.edgeTypePerM.figured }}</span></div>
            <div class="kv-row"><span class="k">Водоотбойник (накладной)</span><span class="v">{{ formData.drainageTypePerM.overlay }}</span></div>
            <div class="kv-row"><span class="k">Водоотбойник (интегрированный)</span><span class="v">{{ formData.drainageTypePerM.integrated }}</span></div>
            <div class="kv-row"><span class="k">Подгиб</span><span class="v">{{ formData.frontBendPerM }}</span></div>
          </div>
        </div>

        <div class="preview-section">
          <h3>Работы (за шт.)</h3>
          <div class="kv">
            <div class="kv-row"><span class="k">Вентиляционные отверстия</span><span class="v">{{ formData.ventilationHolePerUnit }}</span></div>
            <div class="kv-row"><span class="k">Выпил под варочную панель</span><span class="v">{{ formData.cooktopCutoutPerUnit }}</span></div>
            <div class="kv-row"><span class="k">Выпил под накладную мойку</span><span class="v">{{ formData.overlaySinkCutoutPerUnit }}</span></div>
            <div class="kv-row"><span class="k">Вклейка мойки подстольного монтажа</span><span class="v">{{ formData.undermountSinkInstallationPerUnit }}</span></div>
            <div class="kv-row"><span class="k">Стыковка на объекте</span><span class="v">{{ formData.onSiteJoiningPerUnit }}</span></div>
          </div>
        </div>

        <div class="preview-section">
          <h3>Сложность (за шт.)</h3>
          <div class="kv">
            <div class="kv-row"><span class="k">Радиус 10-300мм</span><span class="v">{{ formData.radius10To300PerUnit }}</span></div>
            <div class="kv-row"><span class="k">Радиус 300-1000мм</span><span class="v">{{ formData.radius300To1000PerUnit }}</span></div>
            <div class="kv-row"><span class="k">Вертикальный радиус</span><span class="v">{{ formData.verticalRadiusPerUnit }}</span></div>
            <div class="kv-row"><span class="k">Изделие в 2х плоскостях</span><span class="v">{{ formData.twoPlaneProductPerUnit }}</span></div>
          </div>
        </div>

        <div class="preview-section">
          <h3>Коэффициенты</h3>
          <div class="kv">
            <div class="kv-row"><span class="k">Базовый множитель</span><span class="v">{{ formData.baseMultiplier }}</span></div>
            <div class="kv-row"><span class="k">Коэф. (цена $ до 300)</span><span class="v">{{ formData.coefficient0To300 }}</span></div>
            <div class="kv-row"><span class="k">Коэф. (цена $ 300-340)</span><span class="v">{{ formData.coefficient300To340 }}</span></div>
            <div class="kv-row"><span class="k">Коэф. (цена $ 340-380)</span><span class="v">{{ formData.coefficient340To380 }}</span></div>
            <div class="kv-row"><span class="k">Коэф. (цена $ 380-500)</span><span class="v">{{ formData.coefficient380To500 }}</span></div>
            <div class="kv-row"><span class="k">Коэф. (цена $ 500-550)</span><span class="v">{{ formData.coefficient500To550 }}</span></div>
            <div class="kv-row"><span class="k">Коэф. (цена $ от 550)</span><span class="v">{{ formData.coefficient550Plus }}</span></div>
          </div>
        </div>
      </div>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import { storeToRefs } from 'pinia'
import { usePriceListStore } from '@/stores/priceListStore'
import type { PriceListFormData } from '@/types'
import AppModal from '@/components/ui/AppModal.vue'

const priceListStore = usePriceListStore()
const { priceList, loading, error } = storeToRefs(priceListStore)


const openSections = ref({
  basic: true,  // Базовые услуги открыты по умолчанию
  perMeter: false,
  perUnit: false,
  complexity: false,
  coefficients: false
})


const toggleSection = (section: keyof typeof openSections.value) => {
  openSections.value[section] = !openSections.value[section]
}


type SectionKey = 'basic' | 'perMeter' | 'perUnit' | 'complexity' | 'coefficients'
const activeSection = ref<SectionKey>('basic')
const isWide = ref<boolean>(false)
let mediaQuery: MediaQueryList | null = null
const updateIsWide = () => { isWide.value = window.matchMedia('(min-width: 992px)').matches }
const setSection = (s: SectionKey) => { activeSection.value = s }


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


const formData = ref<PriceListFormData>(createDefaultFormData())


const isPreviewOpen = ref(false)
const openPreview = () => { isPreviewOpen.value = true }
const closePreview = () => { isPreviewOpen.value = false }





onMounted(async () => {
  updateIsWide()
  mediaQuery = window.matchMedia('(min-width: 992px)')
  mediaQuery.addEventListener?.('change', updateIsWide)
  await priceListStore.loadPriceList()

  if (priceList.value) {
    formData.value = JSON.parse(JSON.stringify(priceList.value))
  }
})

onBeforeUnmount(() => {
  if (mediaQuery) {
    mediaQuery.removeEventListener?.('change', updateIsWide)
  }
})


watch(priceList, (newPriceList) => {
  if (newPriceList) {
    formData.value = JSON.parse(JSON.stringify(newPriceList))
  }
})

const handleSave = async () => {
  if (!loading.value) {
    try {

  await priceListStore.updatePriceList(formData.value)



    } catch (error) {
      console.error('Error saving price list:', error)

    }
  }
}

const clearError = () => {
  priceListStore.clearError();
}
</script>

<style scoped>

.price-list-editor-container { padding: 20px 24px; max-width: var(--max-container-width); margin: 20px auto; color: #333; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.1); }
.header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; gap: 16px; border-bottom: 1px solid #e0e0e0; padding-bottom: 12px; }
.header-actions h1 { margin: 0; font-size: 1.8rem; font-weight: 600; color: #007bff; flex-grow: 1; text-align: left; }
.header-buttons { display: flex; align-items: center; gap: 10px; }


.editor-layout { display: grid; grid-template-columns: 240px 1fr; gap: 16px; }
.sidebar { background: #fff; border: 1px solid #e9ecef; border-radius: 8px; padding: 8px; position: sticky; top: 10px; height: fit-content; }
.nav-item { width: 100%; text-align: left; padding: 10px 12px; border: 1px solid transparent; border-radius: 6px; background: transparent; cursor: pointer; font-weight: 600; color: #333; display: flex; align-items: center; gap: 8px; }
.nav-item:hover { background: #f8f9fa; }
.nav-item.active { background: #e9f2ff; border-color: #cfe2ff; color: #0a58ca; }
.content { min-height: 300px; }
.section-card { background: #fff; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
.section-card h3 { margin: 0 0 12px; font-size: 1.1rem; font-weight: 600; color: #333; text-align: left; }

.form-group small {
  font-size: 0.8em;
  color: #6c757d;
  margin-top: 4px;
}

form { background-color: transparent; padding: 0; border-radius: 0; box-shadow: none; height: auto; overflow: visible; }


.accordion-section {
  margin-bottom: 16px;
  background-color: #ffffff;
  border-radius: 8px;
  transition: box-shadow 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.accordion-section:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.accordion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  cursor: pointer;
  transition: background-color 0.2s ease;
  user-select: none;
}

.accordion-header:hover {
  background-color: #e9ecef;
}

.accordion-header.active {
  background-color: #007bff;
  color: white;
}

.accordion-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: inherit;
  text-align: left;
}

.accordion-icon {
  font-size: 1.5rem;
  font-weight: bold;
  transition: transform 0.2s ease;
  min-width: 20px;
  text-align: center;
}


.accordion-header.active .accordion-icon {
  transform: rotate(180deg);
}

.accordion-content {
  display: none; 
  background-color: #f8f9fa;
}

.accordion-content.open {
  display: block; 
  padding: 20px;
}


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
  color: #333;
  font-size: 0.9rem;
  text-align: left;
}

.form-group input {
  display: block;
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 1rem;
  color: #333;
  background-color: #fff;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-group input:focus {
  border-color: #007bff;
  outline: none;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}


.form-actions {
  margin-top: 15px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}


.btn { padding: 10px 20px; border: 1px solid transparent; border-radius: 4px; font-size: 1rem; font-weight: 500; cursor: pointer; text-decoration: none; text-align: center; display: inline-flex; align-items: center; justify-content: center; gap: 8px; transition: background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out; }
.btn:hover { opacity: 0.95; }
.btn-primary { background-color: #007bff; color: #fff; border-color: #007bff; }
.btn-primary:hover { background-color: #0056b3; border-color: #0056b3; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-secondary { background-color: #e9ecef; color: #333; border-color: #e9ecef; }
.btn-secondary:hover { background-color: #dde1e5; }

.btn-square { width: 40px; height: 40px; padding: 0; display: inline-flex; align-items: center; justify-content: center; }
.btn-square .material-symbols-outlined { font-size: 20px; line-height: 1; }


.last-saved {
  text-align: center;
  margin-top: 15px;
  color: #6c757d;
  font-size: 0.875rem;
  font-style: italic;
}


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


@media (max-width: 992px) {
  .price-list-editor-container {
    padding: 15px;
  }
  .editor-layout { display: block; }
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

  .save-button {
    width: 100%;
  }

  .accordion-section {
    margin-bottom: 12px;
  }
  
  .accordion-header {
    padding: 12px 16px;
  }
  
  .accordion-header h3 {
    font-size: 1rem;
  }
  
  .accordion-content.open {
    padding: 16px;
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

  .accordion-header {
    padding: 10px 12px;
  }
  
  .accordion-header h3 {
    font-size: 0.9rem;
  }
  
  .accordion-content.open {
    padding: 12px;
  }
}
</style>

<style scoped>
.preview-container { max-height: 70vh; overflow: auto; padding-right: 4px; }
.preview-section { background: #fff; border: 1px solid #e9ecef; border-radius: 8px; padding: 16px; margin-bottom: 12px; }
.preview-section h3 { margin: 0 0 10px; font-size: 1rem; color: #333; text-align: left; }
.kv { display: grid; grid-template-columns: 1fr; gap: 6px; }
.kv-row { display: grid; grid-template-columns: 1.2fr 1fr; gap: 12px; align-items: center; }
.k { color: #555; text-align: left; }
.v { font-weight: 600; color: #222; text-align: right; }
@media (max-width: 520px) { .kv-row { grid-template-columns: 1fr; text-align: left; } .v { text-align: left; } }
</style>
