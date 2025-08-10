<template>
  <div class="material-purchase-form-view" :class="{ 'in-modal': !!props.isModal }">
    <header class="component-header" v-if="!props.isModal">
      <h2>{{ isEditing ? 'Редактировать закупку' : 'Добавить новую закупку' }}</h2>
    </header>

    <div v-if="loadingError" class="status-message error-message">
      <span class="error-icon">⚠️</span>
      <span class="error-text">Ошибка загрузки данных: {{ loadingError }}</span>
      <button @click="clearErrorsAndGoBack()" class="close-error-button" title="Закрыть">×</button>
  <button type="button" class="btn btn-secondary" @click="clearErrorsAndGoBack">Вернуться назад</button>
    </div>

  <form v-else @submit.prevent="handleSubmit" class="material-form"
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
        <button type="submit" class="btn btn-primary">
          {{ isEditing ? 'Обновить закупку' : 'Создать закупку' }}
        </button>
      </div>
    </form>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, defineProps, defineEmits } from 'vue';
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
const props = defineProps<{ isModal?: boolean; modalPurchaseId?: number | null }>();
const emit = defineEmits(['close', 'saved']);

const purchaseId = computed<number | null>(() => {
  if (props.modalPurchaseId !== undefined) {
    return props.modalPurchaseId === null ? null : Number(props.modalPurchaseId);
  }
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

};

const handleStatusChange = () => {

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
  if (props.isModal) {
    emit('close');
  } else {
    router.push({ name: 'MaterialsView' });
  }
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

    let savedPurchase: MaterialPurchase | null = null;

    if (isEditing.value && purchaseId.value !== null) {
      savedPurchase = await purchaseStore.updateMaterialPurchase(purchaseId.value, finalPayload as MaterialPurchaseUpdatePayload);
    } else {
      savedPurchase = await purchaseStore.createMaterialPurchase(finalPayload as MaterialPurchaseCreatePayload);
    }

    if (savedPurchase) {
      if (props.isModal) {
        emit('saved');
        emit('close');
      } else {
        router.push({ name: 'MaterialsView' });
      }
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
  if (props.isModal) {
    emit('close');
  } else {
    router.push({ name: 'MaterialsView' });
  }
};

</script>

<style scoped>



.material-purchase-form-view {
  padding: 20px;
  max-width: 800px;
  
  margin: 20px auto;
  font-family: 'Arial', sans-serif;
  
  color: #333;
  background-color: #ffffff;
  
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  
  box-sizing: border-box;
  
}

.material-purchase-form-view.in-modal {
  padding: 0;
  margin: 0;
  max-width: 100%;
  box-shadow: none;
  border-radius: 0;
  background-color: transparent; 
}

h1 {
  color: #007bff;
  
  text-align: center;
  margin-bottom: 25px;
  font-size: 2rem;
  font-weight: 600;
  border-bottom: 1px solid #eee;
  
  padding-bottom: 10px;
}

h2 {
  
  font-size: 1.5rem;
  margin-top: 25px;
  
  margin-bottom: 15px;
  color: #007bff;
  border-bottom: 1px solid #e9ecef;
  
  padding-bottom: 8px;
}



.status-message {
  padding: 12px;
  border-radius: 5px;
  margin-bottom: 15px;
  
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.95rem;
  font-weight: 500;
  box-sizing: border-box;
  max-width: 100%;
  
}

.loading-message {
  background-color: #e9f7ef;
  
  color: #28a745;
  
  border: 1px solid #28a745;
}

.error-message {
  background-color: #f8d7da;
  
  color: #721c24;
  
  border: 1px solid #f5c6cb;
  
  flex-direction: column;
  
  align-items: flex-start;
  
  gap: 8px;
}

.error-message .error-icon {
  font-size: 1.2em;
  
  flex-shrink: 0;
  
}

.error-message .error-text {
  flex-grow: 1;
  
}


.error-message .close-error-button {
  background: none;
  border: none;
  font-size: 1.5em;
  
  line-height: 1;
  cursor: pointer;
  color: inherit;
  
  padding: 0;
  margin-left: auto;
  
  align-self: flex-end;
  
}


.error-message .button {
  
  align-self: center;
  
  margin-top: 10px;
}



.loader {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007bff;
  
  border-radius: 50%;
  width: 18px;
  height: 18px;
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


.material-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
  
}


.form-grid {
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

.form-group-full-width {
  flex-basis: 100%;
  min-width: auto;
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


.readonly-field.form-control {
  
  background-color: #e9ecef;
  
  opacity: 1;
  
  cursor: default;
  
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



.form-group.required-group label::after {
  content: ' *';
  color: #dc3545;
  
  margin-left: 4px;
}


.material-form .form-control.invalid-field {
  border-color: #dc3545 !important;
  box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
}


.material-form .validation-error {
  
  
  
  width: 100%;
  margin-top: 0.25rem;
  
  font-size: 0.875em;
  
  color: #dc3545;
  
}






.select-loading-info.validation-error {
  
  color: #6c757d;
  
  font-size: 0.875em;
  margin-top: 5px;
}
















 .form-actions {
  margin-top: 25px;
  padding-top: 15px;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #007bff;
}

.btn {
  font-weight: 600;
  padding: 8px 16px;
  font-size: 0.95rem;
  white-space: nowrap;
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease, opacity 0.2s ease;
  text-decoration: none;
  display: inline-block;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex-shrink: 0;
}
.btn:disabled { opacity: 0.65; cursor: not-allowed; }
.btn-primary { background-color: #007bff; color: white; border-color: #007bff; }
.btn-primary:hover:not(:disabled) { background-color: #0056b3; border-color: #0056b3; }



@media (max-width: 768px) {

  
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

  
  .form-grid {
    gap: 15px;
    
  }

  
  .form-group-half,
  .form-group-one-third {
    
    flex-basis: 100%;
    
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

  .error-message .btn {
    
    padding: 6px 12px;
    font-size: 0.9rem;
  }


  
  .form-actions {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  
  .form-actions .btn {
    width: 100%;
    text-align: center;
    padding: 10px 20px;
    font-size: 1rem;
  }

  .form-actions .btn:last-child {
    margin-bottom: 0;
    
  }


  


}

@media (max-width: 480px) {

  
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

  
  .form-grid {
    gap: 10px;
    
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
    
    padding: 5px 10px;
    font-size: 0.8rem;
  }


  
  .form-actions {
    gap: 6px;
  }

  
  .form-actions .button {
    padding: 8px 15px;
    font-size: 0.9rem;
  }

}
</style>
