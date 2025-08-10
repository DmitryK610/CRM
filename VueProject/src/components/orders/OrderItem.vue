<template>
  <div class="order-item-form">
   
    <div v-if="validationError" class="alert alert-danger">
      {{ validationError }}
    </div>

    <div class="form-group">
      <label for="product_name">Название продукта/Описание</label>
      <input
        type="text"
        id="product_name"
        v-model.trim="localItemData.product_name"
        class="form-control"
        :class="{ 'invalid-field': (formAttemptedSubmit || itemFormAttemptedSubmit) && !isProductNameValid }"
        required
      >
      <div v-if="(formAttemptedSubmit || itemFormAttemptedSubmit) && !isProductNameValid" class="invalid-feedback">
        Введите название продукта или описание.
      </div>
    </div>

    <div class="form-row">
      <div class="form-group form-group-half">
        <label for="quantity">Количество</label>
        <input
          type="number"
          id="quantity"
          v-model.number="localItemData.quantity"
          class="form-control"
          :class="{ 'invalid-field': (formAttemptedSubmit || itemFormAttemptedSubmit) && !isQuantityValid }"
          required
          step="0.001"
          min="0.001"
        >
        <div v-if="(formAttemptedSubmit || itemFormAttemptedSubmit) && !isQuantityValid" class="invalid-feedback">
          Количество должно быть положительным числом (не менее 0.001).
        </div>
      </div>
      <div class="form-group form-group-half">
        <label for="unit_price">Цена за единицу</label>
        <input
          type="number"
          id="unit_price"
          v-model.number="localItemData.unit_price"
          class="form-control"
          :class="{ 'invalid-field': (formAttemptedSubmit || itemFormAttemptedSubmit) && !isUnitPriceValid }"
          required
          step="0.01"
          min="0"
        >
         <div v-if="(formAttemptedSubmit || itemFormAttemptedSubmit) && !isUnitPriceValid" class="invalid-feedback">
          Цена за единицу должна быть неотрицательным числом.
        </div>
      </div>
    </div>

    <div class="form-group">
      <label>Общая стоимость</label>
      <p class="form-control-static">{{ calculatedTotalPrice.toFixed(2) }} руб.</p>
    </div>

    <div class="form-actions">
      <button type="button" class="btn btn-primary" @click="saveItem">
        {{ isEditing ? 'Сохранить' : 'Добавить' }}
      </button>
      <button type="button" class="btn btn-secondary" @click="cancel">
        Отмена
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { OrderItem } from '@/types/order';

const props = defineProps<{
  item?: OrderItem;
  isEditing: boolean;
  formAttemptedSubmit: boolean;
}>();

const emit = defineEmits<{
  (event: 'save', item: OrderItem): void;
  (event: 'cancel'): void;
}>();

interface OrderItemFormData {
  id?: number;
  _tempId?: number;
  product_name: string;
  quantity: number | null;
  unit_price: number | null;
}

const localItemData = ref<OrderItemFormData>({
  id: props.item?.id || undefined,
  _tempId: (props.item as { _tempId?: number })?._tempId,
  product_name: props.item?.product_name || '',
  quantity: props.item?.quantity ?? null,
  unit_price: props.item?.unit_price ?? null,
});

const validationError = ref<string | null>(null);
const itemFormAttemptedSubmit = ref(false);

const calculatedTotalPrice = computed(() => {
  const quantity = localItemData.value.quantity ?? 0;
  const unitPrice = localItemData.value.unit_price ?? 0;

  if (typeof quantity !== 'number' || isNaN(quantity) || !isFinite(quantity) ||
      typeof unitPrice !== 'number' || isNaN(unitPrice) || !isFinite(unitPrice)) {
    return 0;
  }

  const safeQuantity = Math.max(0, quantity);
  const safeUnitPrice = Math.max(0, unitPrice);

  const total = safeQuantity * safeUnitPrice;

  return total;
});

const isProductNameValid = computed(() => !!localItemData.value.product_name.trim());
const isQuantityValid = computed(() => localItemData.value.quantity !== null && typeof localItemData.value.quantity === 'number' && !isNaN(localItemData.value.quantity) && localItemData.value.quantity > 0);
const isUnitPriceValid = computed(() => localItemData.value.unit_price !== null && typeof localItemData.value.unit_price === 'number' && !isNaN(localItemData.value.unit_price) && localItemData.value.unit_price >= 0);


const validateForm = (): boolean => {
  validationError.value = null;

  if (!isProductNameValid.value) {
    validationError.value = 'Название продукта/Описание обязательно.';
    return false;
  }

  if (!isQuantityValid.value) {
    validationError.value = 'Количество должно быть положительным числом (не менее 0.001).';
    return false;
  }

  if (!isUnitPriceValid.value) {
    validationError.value = 'Цена за единицу должна быть неотрицательным числом.';
    return false;
  }

  itemFormAttemptedSubmit.value = false;
  return true;
};

const saveItem = () => {
   itemFormAttemptedSubmit.value = true;

  if (!validateForm()) {
    return;
  }

  const itemToSave: OrderItem = {
    id: localItemData.value.id,
     ...(localItemData.value._tempId !== undefined ? { _tempId: localItemData.value._tempId } : {}),
    product_name: localItemData.value.product_name.trim(),
    quantity: localItemData.value.quantity as number,
    unit_price: localItemData.value.unit_price as number,
  };

  emit('save', itemToSave);
};

const cancel = () => {
  itemFormAttemptedSubmit.value = false;
  validationError.value = null;
  emit('cancel');
};

watch(() => props.item, (newItem) => {
  localItemData.value = {
    id: newItem?.id || undefined,
    _tempId: (newItem as { _tempId?: number })?._tempId,
    product_name: newItem?.product_name || '',
    quantity: newItem?.quantity ?? null,
    unit_price: newItem?.unit_price ?? null,
  };
  validationError.value = null;
  itemFormAttemptedSubmit.value = false;
}, { deep: true });


watch(() => props.formAttemptedSubmit, () => {


});

</script>

<style scoped>
.order-item-form {
  padding: 20px;
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 20px;
  font-family: 'Arial', sans-serif;
  color: #333;
}



.form-row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  align-items: flex-start;
}

.form-group {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  margin-bottom: 15px !important;
}

.form-row .form-group {
    margin-bottom: 0 !important;
}


.form-group-half {
  flex-basis: calc(50% - 10px);
  min-width: 120px;
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

.form-control-static {
  display: block;
  width: 100%;
  padding: 8px 10px;
  border-radius: 4px;
  font-size: 0.95rem;
  color: #495057;
  background-color: #e9ecef;
}


.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

.btn {
  padding: 10px 20px;
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  transition: background-color 0.2s ease, border-color 0.2s ease;
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

.btn-secondary {
  background-color: #6c757d;
  color: white;
  border-color: #6c757d;
}

.btn-secondary:hover {
  background-color: #5a6268;
  border-color: #545b62;
}

.alert.alert-danger {
  padding: 10px;
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 5px;
  margin-bottom: 15px;
  font-size: 0.9rem;
}

.invalid-field {
  border-color: #dc3545 !important;
}

.invalid-feedback {
  display: block;
  width: 100%;
  margin-top: 0.25rem;
  font-size: 0.875em;
  color: #dc3545;
}

@media (max-width: 576px) {
  .form-row {
    flex-direction: column;
    gap: 10px;
  }
  .form-group-half {
    flex-basis: auto;
    min-width: auto;
    width: 100%;
  }
  .form-actions {
    flex-direction: column;
    gap: 10px;
  }
  .btn {
    width: 100%;
  }
}
</style>
