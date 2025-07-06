<template>
  <div class="material-purchase-form-view">
    <header class="component-header">
      <h2>{{ isEditing ? 'Редактировать закупку' : 'Добавить новую закупку' }}</h2>
    </header>

    <div v-if="loadingError" class="status-message error-message">
      <span class="error-icon">⚠️</span>
      <span class="error-text">Ошибка загрузки данных: {{ loadingError }}</span>
      <button @click="clearErrorsAndGoBack()" class="close-error-button" title="Закрыть">×</button>
      <button type="button" class="button button-secondary" @click="clearErrorsAndGoBack">Вернуться назад</button>
    </div>

    <form v-else @submit.prevent="handleSubmit" class="material-form card"
      :class="{ 'is-editing': isEditing, 'form-attempted-submit': formSubmitted }" novalidate>
      <div class="form-grid">

        <div class="form-group required-group form-group-half">
          <label for="material-select">Материал:</label>
          <v-select id="material-select" class="form-control v-select-custom" v-model="currentItem.material"
            :options="availableMaterials" label="material_name" :reduce="(mat: Material) => mat.id"
            placeholder="-- Выберите или найдите материал --" :filterable="true" :filter="filterMaterials"
            :clearable="false" @option:selected="handleMaterialChange" @option:deselecting="handleMaterialChange"
            appendToBody :calculatePosition="withPopper"
            :class="{ 'invalid-field': formSubmitted && !currentItem.material }">
            <template #option="{ option }">
              <div class="option-content">
                <span class="option-name"><strong>{{ (option as Material).material_name }} ({{ (option as Material).color_code }})</strong></span>
              </div>
            </template>
            <template #selected-option="{ option }">
              <span v-if="option"><strong>{{ (option as Material).material_name }} ({{ (option as Material).color_code }})</strong></span>
              <span v-else>-- Выберите --</span>
            </template>
            <template #no-options="{ search, loading }">
              <div v-if="loading">Поиск...</div>
              <div v-else-if="search">Материал "{{ search }}" не найден.</div>
              <div v-else-if="!materialStore.getIsLoading && availableMaterials.length === 0">Нет доступных материалов.
              </div>
              <div v-else>Начните ввод для поиска...</div>
            </template>
          </v-select>
          <div v-if="formSubmitted && !currentItem.material" class="validation-error">
            Выберите материал
          </div>
        </div>

        <div class="form-group form-group-half">
          <label>Артикул:</label>
          <div class="readonly-field form-control">{{ selectedMaterial?.color_code || '---' }}</div>
        </div>

        <div class="form-group required-group">
          <label for="quantity">Количество:</label>
          <input id="quantity" type="number" v-model.number="currentItem.quantity" required min="0.01" step="any"
            placeholder="> 0" class="form-control"
            :class="{ 'invalid-field': formSubmitted && (typeof currentItem.quantity !== 'number' || currentItem.quantity <= 0) }" />
          <div v-if="formSubmitted && (typeof currentItem.quantity !== 'number' || currentItem.quantity <= 0)"
            class="validation-error">
            Введите количество > 0
          </div>
        </div>

        <div class="form-group required-group">
          <label for="total_cost">Общая стоимость:</label>
          <input id="total_cost" type="number" v-model.number="currentItem.total_cost" required min="0" step="0.01"
            placeholder="≥ 0" class="form-control"
            :class="{ 'invalid-field': formSubmitted && (typeof currentItem.total_cost !== 'number' || currentItem.total_cost < 0) }" />
          <div v-if="formSubmitted && (typeof currentItem.total_cost !== 'number' || currentItem.total_cost < 0)"
            class="validation-error">
            Стоимость не может быть &lt; 0 </div>
        </div>

        <div class="form-group required-group">
          <label for="payment_method">Оплата:</label>
          <select id="payment_method" v-model="currentItem.payment_method" required class="form-control"
            :class="{ 'invalid-field': formSubmitted && !currentItem.payment_method }">
            <option value="cashless">Безналичные</option>
            <option value="cash">Наличные</option>
          </select>
          <div v-if="formSubmitted && !currentItem.payment_method" class="validation-error">Выберите способ оплаты
          </div>
        </div>

        <div class="form-group required-group">
          <label for="purchase_order_date">Дата заказа:</label>
          <input id="purchase_order_date" type="date" v-model="currentItem.purchase_order_date" required
            class="form-control"
            :class="{ 'invalid-field': formSubmitted && (!currentItem.purchase_order_date || (currentItem.purchase_order_date && new Date(currentItem.purchase_order_date) > new Date())) }" />
          <div v-if="formSubmitted && !currentItem.purchase_order_date" class="validation-error">
            Укажите дату заказа
          </div>
          <small v-if="currentItem.purchase_order_date && new Date(currentItem.purchase_order_date) > new Date()"
            class="validation-error">
            Дата заказа в будущем
          </small>
        </div>

        <div class="form-group required-group">
          <label for="status">Статус:</label>
          <select id="status" v-model="currentItem.status" required @change="handleStatusChange" class="form-control"
            :class="{ 'invalid-field': formSubmitted && !currentItem.status }">
            <option value="not-received">Ожидается</option>
            <option value="received">Получен</option>
            <option value="cancelled">Отменен</option>
          </select>
          <div v-if="formSubmitted && !currentItem.status" class="validation-error">Выберите статус</div>
        </div>

        <div class="form-group" :class="{ 'required-group': currentItem.status === 'received' }">
          <label for="received_date">Дата получения:</label>
          <input id="received_date" type="date" v-model="currentItem.received_date"
            :required="currentItem.status === 'received'" class="form-control"
            :class="{ 'invalid-field': formSubmitted && currentItem.status === 'received' && (!currentItem.received_date || (currentItem.received_date && new Date(currentItem.received_date) > new Date())) }" />
          <div v-if="formSubmitted && currentItem.status === 'received' && !currentItem.received_date"
            class="validation-error">
            Укажите дату получения для статуса "Получен"
          </div>
          <small
            v-if="currentItem.received_date && currentItem.received_date !== null && new Date(currentItem.received_date) > new Date()"
            class="validation-error">
            Дата получения в будущем
          </small>
        </div>

        <div class="form-group form-group-full-width">
          <label for="notes">Примечание:</label>
          <textarea id="notes" v-model="currentItem.notes" rows="3" placeholder="Дополнительная информация..."
            class="form-control"></textarea>
        </div>

        <div class="form-group">
          <label for="order">Связать с заказом:</label>
          <select id="order" v-model="currentItem.order" class="form-control">
            <option :value="null">-- Не связано --</option>
            <option v-for="order in availableOrders" :key="order.id" :value="order.id">
              №{{ order.order_number || order.id }} ({{ order.client_info?.full_name || 'Клиент ?' }}) - {{
                formatDate(order.order_date) }}
            </option>
          </select>
        </div>
      </div>

      <div v-if="submitError" class="error-message form-submit-error">
        <span class="error-icon">⚠️</span>
        <span class="error-text">Ошибка сохранения: {{ submitError }}</span>
        <button @click="purchaseStore.clearError()" class="close-error-button" title="Закрыть">×</button>
      </div>

      <div class="form-actions">
        <button type="submit" class="button button-primary">
          {{ isEditing ? 'Обновить закупку' : 'Добавить закупку' }}
        </button>

        <button type="button" class="button button-secondary" @click="cancelEdit" v-if="isEditing">Отмена</button>
      </div>
    </form>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMaterialStore } from '@/stores/materialStore';
import { useOrderStore } from '@/stores/orderStore';
import { useMaterialPurchaseStore } from '@/stores/materialPurchaseStore';

import type { MaterialPurchase, MaterialPurchaseCreatePayload, MaterialPurchaseUpdatePayload } from '@/types/materialPurchase';
import type { Material } from '@/types/material';
import type { Order } from '@/types/order';

import vSelect from 'vue-select';

import { createPopper } from '@popperjs/core';
import type { Options } from '@popperjs/core';

const safeFormatDate = (date: string | Date | null | undefined): string | null => {
  if (!date) return null;
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    return d.toISOString().split('T')[0];
  } catch {
    return null;
  }
};

const formatDate = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return '---';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) { return 'Неверная дата'; }
    return date.toLocaleDateString('ru-RU');
  } catch {
    return 'Ошибка даты';
  }
};


const withPopper = (dropdownList: HTMLElement, component: { $refs: { toggle: HTMLElement } }, { width }: { width: string }): (() => void) => {
  dropdownList.style.width = width;
  const popperInstance = createPopper(component.$refs.toggle, dropdownList, {
    placement: 'bottom-start',
    modifiers: [
      { name: 'offset', options: { offset: [0, 4] } },
      { name: 'preventOverflow', options: { boundary: 'viewport' } },
      { name: 'flip', options: { fallbackPlacements: ['top-start'], padding: 8 } },
    ],
  } as Partial<Options>);

  return () => popperInstance.destroy();
};


const materialStore = useMaterialStore();
const orderStore = useOrderStore();
const purchaseStore = useMaterialPurchaseStore();
const router = useRouter();
const route = useRoute();

const purchaseId = computed<number | null>(() => {
  const id = route.params.id;
  return id ? Number(id) : null;
});

type FormItem = Omit<MaterialPurchase,
  'id' | 'material' | 'order' | 'material_details' | 'order_details' | 'payment_method_display' | 'status_display' | 'created_at' | 'updated_at'
> & {
  id: number | null;
  material: number | null;
  order: number | null;
  quantity: number;
  total_cost: number;
  notes: string | null;
};

const getEmptyItem = (): FormItem => ({
  id: null,
  material: null,
  order: null,
  quantity: 0,
  total_cost: 0,
  payment_method: 'cashless',
  purchase_order_date: safeFormatDate(new Date()) || '',
  status: 'not-received',
  received_date: null,
  notes: null,
});


const currentItem = ref<FormItem>(getEmptyItem());
const isEditing = computed<boolean>(() => purchaseId.value !== null);
const formSubmitted = ref(false);

// Удалены computed properties initialLoading и isSubmitting
// const initialLoading = computed<boolean>(() => ... );
// const isSubmitting = computed<boolean>(() => ... );


const loadingError = computed<string | null>(() =>
  materialStore.getError ||
  orderStore.getError ||
  (isEditing.value ? purchaseStore.error : null)
);

const submitError = computed<string | null>(() => purchaseStore.error);


const availableMaterials = computed<Material[]>(() => materialStore.materials);
const availableOrders = computed<Order[]>(() => orderStore.orders);

const selectedMaterial = computed<Material | undefined>(() => {
  if (!currentItem.value.material) return undefined;
  return materialStore.materials.find(m => m.id === currentItem.value.material);
});


onMounted(async () => {
  clearAllErrors();

  await Promise.allSettled([
    materialStore.fetchMaterials(),
    orderStore.fetchOrders()
  ]);

  let purchaseToEdit: MaterialPurchase | null = null;
  if (isEditing.value && purchaseId.value !== null) {
    try {
      // store's internal isLoading will be true but not used visually
      purchaseToEdit = await purchaseStore.fetchMaterialPurchase(purchaseId.value);
    } catch (err) {
      console.error(`Failed to fetch purchase ID ${purchaseId.value} for editing:`, err);
    }
  }

  if (isEditing.value && purchaseToEdit && purchaseId.value !== null && !purchaseStore.error) {
    currentItem.value = {
      id: purchaseToEdit.id,
      material: typeof purchaseToEdit.material === 'number' ? purchaseToEdit.material : null,
      order: typeof purchaseToEdit.order === 'number' ? purchaseToEdit.order : null,
      quantity: Number(purchaseToEdit.quantity) || 0,
      total_cost: Number(purchaseToEdit.total_cost) || 0,
      payment_method: purchaseToEdit.payment_method || 'cashless',
      purchase_order_date: safeFormatDate(purchaseToEdit.purchase_order_date) || '',
      status: purchaseToEdit.status || 'not-received',
      received_date: purchaseToEdit.status === 'received' ? (safeFormatDate(purchaseToEdit.received_date) || null) : null,
      notes: purchaseToEdit.notes || null,
    };
  } else if (isEditing.value && purchaseId.value !== null && !purchaseToEdit && !purchaseStore.error) {
    purchaseStore.setError(`Закупка с ID ${purchaseId.value} не найдена.`);
  }
  else if (isEditing.value && purchaseStore.error) {
    console.error('Failed to load purchase data for editing due to store error.');
  }


  if (!isEditing.value) {
    resetForm();
  }
});

const handleMaterialChange = () => {
  // Логика обработки изменения материала, если нужна
};

const handleStatusChange = () => {
  // Логика обработки изменения статуса
};


watch(() => currentItem.value.status, (newStatus) => {
  if (newStatus !== 'received' && currentItem.value.received_date !== null) {
    currentItem.value.received_date = null;
  }
});


const filterMaterials = (options: Material[], search: string): Material[] => {
  const lowerSearch = search.toLowerCase().trim();
  if (!lowerSearch) {
    return options;
  }
  return options.filter(mat => {
    const name = (mat.material_name || '').toLowerCase();
    const code = (mat.color_code || '').toLowerCase();
    return name.includes(lowerSearch) || code.includes(lowerSearch);
  });
};


const resetForm = () => {
  currentItem.value = getEmptyItem();
  formSubmitted.value = false;
  clearAllErrors();
};

const cancelEdit = () => {
  resetForm();
  router.push({ name: 'MaterialsView' });
};


const validateForm = (): boolean => {
  formSubmitted.value = true;

  const item = currentItem.value;
  let isValid = true;

  if (item.material === null || typeof item.material !== 'number') {
    isValid = false;
  }

  if (typeof item.quantity !== 'number' || item.quantity <= 0) {
    isValid = false;
  }

  if (typeof item.total_cost !== 'number' || item.total_cost < 0) {
    isValid = false;
  }

  if (!item.purchase_order_date) {
    isValid = false;
  }

  if (!item.status) {
    isValid = false;
  }

  if (item.status === 'received' && !item.received_date) {
    isValid = false;
  }


  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);


  if (item.purchase_order_date) {
    const purchaseDate = new Date(item.purchase_order_date);

    if (isNaN(purchaseDate.getTime()) || purchaseDate.getTime() >= tomorrow.getTime()) {
      isValid = false;
    }
  } else {
  }


  if (item.received_date) {
    const receivedDate = new Date(item.received_date);

    if (isNaN(receivedDate.getTime()) || receivedDate.getTime() >= tomorrow.getTime()) {
      isValid = false;
    }
  } else if (item.status === 'received') {
    isValid = false;
  } else {
  }


  if (!isValid) {
    requestAnimationFrame(() => {
      const firstError = document.querySelector('.material-form .validation-error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
      }
    });
  } else {
  }

  return isValid;
};

const handleSubmit = async () => {
  purchaseStore.clearError();
  materialStore.clearError();
  orderStore.clearError();


  if (!validateForm()) {
    return;
  }

  const notesPayload = currentItem.value.notes?.trim() || null;

  const payload = {
    material: currentItem.value.material!,
    order: currentItem.value.order,
    quantity: currentItem.value.quantity!,
    total_cost: currentItem.value.total_cost!,
    payment_method: currentItem.value.payment_method,
    purchase_order_date: currentItem.value.purchase_order_date!,
    received_date: currentItem.value.status === 'received' ? currentItem.value.received_date : null,
    notes: notesPayload,
    status: currentItem.value.status,
  };

  const finalPayload = isEditing.value ? (payload as MaterialPurchaseUpdatePayload) : (payload as MaterialPurchaseCreatePayload);


  try {
    // store's internal isCreating/isUpdating will be true but not used visually
    let savedPurchase: MaterialPurchase | null = null;

    if (isEditing.value && purchaseId.value !== null) {
      savedPurchase = await purchaseStore.updateMaterialPurchase(purchaseId.value, finalPayload as MaterialPurchaseUpdatePayload);
    } else {
      savedPurchase = await purchaseStore.createMaterialPurchase(finalPayload as MaterialPurchaseCreatePayload);
    }

    if (savedPurchase) {
      router.push({ name: 'MaterialsView' });
    } else {
      if (!purchaseStore.error) {
        purchaseStore.setError("Ошибка сохранения закупки.");
      }
    }


  }
  finally {
  }
};


const clearAllErrors = () => {
  purchaseStore.clearError();
  materialStore.clearError();
  orderStore.clearError();
};

const clearErrorsAndGoBack = () => {
  clearAllErrors();
  router.push({ name: 'MaterialsView' });
};

</script>

<style scoped>
/* === Стили из OrderEditor.vue, адаптированные для MaterialStock.vue === */

/* Общие стили контейнера - Сохранено ваше название класса */
.material-purchase-form-view {
  padding: 20px;
  max-width: 800px;
  /* Немного увеличена максимальная ширина */
  margin: 20px auto;
  font-family: 'Arial', sans-serif;
  /* Изменен шрифт на более общий */
  color: #333;
  background-color: #ffffff;
  /* Белый фон */
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  /* Более мягкая тень */
  box-sizing: border-box;
  /* Убедимся, что padding учитывается в ширине */
}

h1 {
  color: #007bff;
  /* Основной синий цвет */
  text-align: center;
  margin-bottom: 25px;
  font-size: 2rem;
  font-weight: 600;
  border-bottom: 1px solid #eee;
  /* Линия под заголовком */
  padding-bottom: 10px;
}

h2 {
  /* Добавляем стиль для h2 */
  font-size: 1.5rem;
  margin-top: 25px;
  /* Отступ сверху, чтобы отделить секции */
  margin-bottom: 15px;
  color: #007bff;
  border-bottom: 1px solid #e9ecef;
  /* Линия под заголовком секции */
  padding-bottom: 8px;
}


/* Сообщения состояния (Загрузка, Ошибка) - Классы сохранены */
.status-message {
  padding: 12px;
  border-radius: 5px;
  margin-bottom: 15px;
  /* Отступ снизу */
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.95rem;
  font-weight: 500;
  box-sizing: border-box;
  max-width: 100%;
  /* Чтобы не вылезали за контейнер */
}

.loading-message {
  background-color: #e9f7ef;
  /* Светло-зеленый */
  color: #28a745;
  /* Зеленый текст */
  border: 1px solid #28a745;
}

.error-message {
  background-color: #f8d7da;
  /* Светло-красный фон */
  color: #721c24;
  /* Темно-красный текст */
  border: 1px solid #f5c6cb;
  /* Красная рамка */
  flex-direction: column;
  /* Элементы в столбик */
  align-items: flex-start;
  /* Выравниваем по левому краю */
  gap: 8px;
}

.error-message .error-icon {
  font-size: 1.2em;
  /* Размер иконки */
  flex-shrink: 0;
  /* Не сжимать иконку */
}

.error-message .error-text {
  flex-grow: 1;
  /* Текст занимает место */
}

/* Стили для кнопки закрытия в сообщении об ошибке */
.error-message .close-error-button {
  background: none;
  border: none;
  font-size: 1.5em;
  /* Увеличиваем размер кнопки */
  line-height: 1;
  cursor: pointer;
  color: inherit;
  /* Наследует цвет текста сообщения */
  padding: 0;
  margin-left: auto;
  /* Прижимает кнопку к правому краю */
  align-self: flex-end;
  /* Выравнивает кнопку внизу справа в колонке */
}

/* Добавляем стиль для кнопки "Вернуться назад" в сообщении об ошибке */
.error-message .button {
  /* Адаптировано для класса .button */
  align-self: center;
  /* Выравниваем по центру */
  margin-top: 10px;
}


/* Спиннер - Класс сохранен */
.loader {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007bff;
  /* Цвет спиннера */
  border-radius: 50%;
  width: 18px;
  height: 18px;
  animation: spin 1s linear infinite;
  flex-shrink: 0;
  /* Не сжимать спиннер */
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* Стили формы - Класс формы сохранен */
.material-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
  /* Расстояние между группами полей */
}

/* Класс для сетки формы - Сохранено ваше название класса */
.form-grid {
  display: flex;
  gap: 20px;
  /* Расстояние между колонками */
  flex-wrap: wrap;
  /* Перенос на новую строку на узких экранах */
}

/* Класс для групп полей - Класс сохранен */
.form-group {
  flex-grow: 1;
  /* Группа полей может растягиваться */
  display: flex;
  flex-direction: column;
}

/* Классы для половинной и полной ширины групп - Классы сохранены */
.form-group-half {
  flex-basis: calc(50% - 10px);
  /* 50% ширины минус половина gap */
  min-width: 150px;
  /* Минимальная ширина */
}

.form-group-full-width {
  flex-basis: 100%;
  min-width: auto;
}

/* Класс для групп одной трети - Удален, т.к. нет в шаблоне */
/* .form-group-one-third { ... } */


label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #555;
  font-size: 0.9rem;
}

/* Стили стандартных контролов формы (input, select, textarea) - Класс сохранен */
.form-control {
  display: block;
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  /* Более стандартный радиус */
  box-sizing: border-box;
  font-size: 1rem;
  color: #495057;
  background-color: #fff;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

/* Отдельный стиль для readonly полей - Адаптировано для класса .readonly-field */
.readonly-field.form-control {
  /* Теперь шаблон добавляет form-control */
  background-color: #e9ecef;
  /* Светло-серый фон */
  opacity: 1;
  /* Убираем стандартное уменьшение прозрачности для disabled */
  cursor: default;
  /* Курсор по умолчанию */
}

.form-control:focus {
  border-color: #007bff;
  outline: none;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.form-control:disabled {
  background-color: #e9ecef;
  opacity: 1;
}


/* Стили для подсветки обязательных полей */
/* Применяется к div.form-group с классом .required-group (адаптировано) */
.form-group.required-group label::after {
  content: ' *';
  color: #dc3545;
  /* Красная звездочка */
  margin-left: 4px;
}

/* Стили для невалидных полей и сообщений */

/* Стиль для самого контрола (input, select, textarea) - Класс сохранен */
.material-form .form-control.invalid-field {
  /* Адаптировано для класса .material-form */
  border-color: #dc3545 !important;
  /* Красная рамка */
  padding-right: calc(1.5em + 0.75rem);
  /* Дополнительный отступ для иконки валидации */
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' width='12' height='12' fill='none' stroke='%23dc3545'%3e%3ccircle cx='6' cy='6' r='4.5'/%3e%3cpath stroke-linecap='round' d='M3.5 8.5l5-5M8.5 8.5l-5-5'/%3e%3c/svg%3e");
  /* Иконка ошибки (крестик) */
  background-repeat: no-repeat;
  background-position: right calc(0.375em + 0.1875rem) center;
  background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
}

/* Сообщение обратной связи (под полем) - Класс сохранен */
.material-form .validation-error {
  /* Адаптировано с .invalid-feedback на .validation-error */
  /* display: none; */
  /* Скрываем по умолчанию, т.к. видимость управляется v-if */
  width: 100%;
  margin-top: 0.25rem;
  /* Отступ сверху */
  font-size: 0.875em;
  /* Размер шрифта */
  color: #dc3545;
  /* Красный цвет текста */
}

/* v-select кастомные стили для соответствия форме - Адаптировано для класса .material-form */
/* Требуется глубокий селектор или глобальные стили для изменения внутренней структуры v-select */
/* Пример (может потребоваться корректировка в зависимости от версии v-select) */
/*
  .material-form .v-select-custom.form-control .vs__dropdown-toggle {
   border: 1px solid #ced4da;
   border-radius: 4px;
   padding: 10px 12px;
   min-height: 38px;
  }
  .material-form .v-select-custom.form-control.vs--open .vs__dropdown-toggle {
   border-color: #007bff;
   box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }
  .material-form .v-select-custom.form-control.invalid-field .vs__dropdown-toggle {
   border-color: #dc3545 !important;
   box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
  }
  */
/* Сообщение загрузки для select */
.select-loading-info.validation-error {
  /* Адаптировано для класса .validation-error */
  color: #6c757d;
  /* Цвет текста для статуса загрузки */
  font-size: 0.875em;
  margin-top: 5px;
}

/* Если есть маленький спиннер внутри select-loading-info */
/* .select-loading-info .loader-small {
   display: inline-block;
   margin-right: 5px;
   vertical-align: middle;
  } */


/* Секции, отсутствующие в шаблоне - Удалены из стилей */
/* .order-items-section { ... } */
/* .order-items-section h2 { ... } */
/* .order-items-panel { ... } */
/* .order-items-list { ... } */
/* .order-item-row { ... } */
/* .order-item-row span { ... } */
/* .order-item-row button { ... } */
/* .order-item-form-panel { ... } */


/* Контейнер кнопок формы - Класс сохранен */
.form-actions {
  margin-top: 25px;
  padding-top: 15px;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* Базовые стили кнопок - Адаптировано для класса .button */
.button {
  padding: 10px 20px;
  font-size: 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  text-decoration: none;
  /* Для ссылок */
  display: inline-block;
  text-align: center;
  vertical-align: middle;
  border: 1px solid transparent;
  /* Добавляем прозрачную рамку */
  box-sizing: border-box;
}

/* Цвета кнопок - Адаптировано для классов .button-... */
.button-primary {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.button-primary:hover {
  background-color: #0056b3;
  border-color: #0056b3;
}

.button-secondary {
  background-color: #6c757d;
  color: white;
  border-color: #6c757d;
}

.button-secondary:hover {
  background-color: #5a6268;
  border-color: #545b62;
}

.button-success {
  background-color: #28a745;
  color: white;
  border-color: #28a745;
}

.button-success:hover {
  background-color: #218838;
  border-color: #1e7e34;
}

.button-danger {
  background-color: #dc3545;
  color: white;
  border-color: #dc3545;
}

.button-danger:hover {
  background-color: #c82333;
  border-color: #bd2130;
}

/* Состояния disabled для кнопок */
.button:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}


/* --- Адаптивность --- */
@media (max-width: 768px) {

  /* Главный контейнер - Сохранено ваше название класса */
  .material-purchase-form-view {
    padding: 15px;
    margin: 15px auto;
  }

  h1 {
    font-size: 1.7rem;
    margin-bottom: 20px;
  }

  h2 {
    font-size: 1.4rem;
    margin-top: 20px;
    margin-bottom: 10px;
  }

  /* Сетка формы - Сохранено ваше название класса */
  .form-grid {
    gap: 15px;
    /* Уменьшаем gap в рядах */
  }

  /* Группы полей - Классы сохранены */
  .form-group-half,
  .form-group-one-third {
    /* one-third остался в стилях, но не в шаблоне */
    flex-basis: 100%;
    /* Элементы в рядах становятся в колонку */
    min-width: auto;
  }

  .form-control {
    padding: 8px 10px;
    font-size: 0.95rem;
  }

  label {
    margin-bottom: 6px;
    font-size: 0.85rem;
  }

  .error-message {
    padding: 10px;
    gap: 6px;
    font-size: 0.9rem;
  }

  .error-message .close-error-button {
    font-size: 1.3em;
  }

  .error-message .button {
    /* Адаптировано для класса .button */
    padding: 6px 12px;
    font-size: 0.9rem;
  }


  /* Контейнер кнопок формы - Класс сохранен */
  .form-actions {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  /* Кнопки - Адаптировано для класса .button */
  .form-actions .button {
    width: 100%;
    text-align: center;
    padding: 10px 20px;
    font-size: 1rem;
  }

  .form-actions .button:last-child {
    margin-bottom: 0;
    /* Убираем нижний отступ у последней кнопки */
  }


  /* Адаптация иконки валидации для меньших полей - Класс формы сохранен */
  .material-form .form-control.invalid-field {
    /* Адаптировано для класса .material-form */
    background-position: right calc(0.1em + 0.1875rem) center;
    padding-right: calc(1.5em + 0.4rem);
  }


}

@media (max-width: 480px) {

  /* Главный контейнер - Сохранено ваше название класса */
  .material-purchase-form-view {
    padding: 10px;
    margin: 10px auto;
  }

  h1 {
    font-size: 1.5rem;
    margin-bottom: 15px;
  }

  h2 {
    font-size: 1.3rem;
    margin-top: 15px;
    margin-bottom: 8px;
  }

  /* Сетка формы - Сохранено ваше название класса */
  .form-grid {
    gap: 10px;
    /* Еще уменьшаем gap */
  }

  .form-control {
    padding: 6px 8px;
    font-size: 0.9rem;
  }

  label {
    font-size: 0.8rem;
  }

  .status-message {
    padding: 8px;
    gap: 5px;
    font-size: 0.8rem;
  }

  .status-message .loader {
    width: 16px;
    height: 16px;
    border-width: 2px;
  }

  .error-message .close-error-button {
    font-size: 1.2em;
  }

  .error-message .button {
    /* Адаптировано для класса .button */
    padding: 5px 10px;
    font-size: 0.8rem;
  }


  /* Контейнер кнопок формы - Класс сохранен */
  .form-actions {
    gap: 6px;
  }

  /* Кнопки - Адаптировано для класса .button */
  .form-actions .button {
    padding: 8px 15px;
    font-size: 0.9rem;
  }

}
</style>
