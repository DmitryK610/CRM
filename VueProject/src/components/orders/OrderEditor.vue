<template>
  <div class="order-editor">
    <h1>{{ isEditing ? 'Редактировать заказ' : 'Создать новый заказ' }}</h1>

    <div v-if="hasError" class="status-message error-message">
      ⚠️ Ошибка: {{ errorMessage }}
    </div>
    <form v-else @submit.prevent="saveOrder" class="order-form-container" novalidate>
      <div class="form-row">
        <div class="form-group form-group-half">
          <label for="order_number">Номер заказа</label>
          <input type="text" id="order_number" v-model="orderData.order_number" class="form-control"
            :readonly="isEditing || !isOrderNumberManual" placeholder="Генерируется автоматически" />
          <div v-if="!isEditing">
            <input type="checkbox" v-model="isOrderNumberManual" /> Ввести вручную
          </div>
        </div>
        <div class="form-group form-group-half required-field">
          <label for="order_date">Дата заказа</label>
          <input type="date" id="order_date" v-model="orderData.order_date" class="form-control" required
            :class="{ 'invalid-field': formAttemptedSubmit && !isOrderDateValid }" />
          <div v-if="formAttemptedSubmit && !isOrderDateValid" class="invalid-feedback">
            Поле "Дата заказа" обязательно.
          </div>
        </div>
      </div>
      <div class="form-group required-field">
        <label for="client_id">Клиент</label>
        <select id="client_id" v-model="orderData.client" class="form-control" required
          :class="{ 'invalid-field': formAttemptedSubmit && !isClientValid }">
          <option :value="null" disabled>-- Выберите клиента --</option>
          <option v-for="client in availableClients" :key="client.id" :value="client.id">
            {{ client.full_name || `Клиент ${client.id}` }}
          </option>
        </select>
        <div v-if="formAttemptedSubmit && !isClientValid" class="invalid-feedback">
          Поле "Клиент" обязательно.
        </div>
      </div>
      <div class="form-row">
        <div class="form-group form-group-half required-field">
          <label for="material_id">Материал</label>
          <select id="material_id" v-model="orderData.material" class="form-control" required
            :class="{ 'invalid-field': formAttemptedSubmit && !isMaterialValid }">
            <option :value="null" disabled>-- Выберите материал --</option>
            <option v-for="material in availableMaterials" :key="material.id" :value="material.id">
              {{ material.material_name }} ({{ material.color_code }})
            </option>
          </select>
          <div v-if="formAttemptedSubmit && !isMaterialValid" class="invalid-feedback">
            Поле "Материал" обязательно.
          </div>
        </div>
        <div class="form-group form-group-half required-field">
          <label for="material_quantity">Количество материала</label>
          <input type="number" id="material_quantity" v-model.number="orderData.material_quantity" class="form-control"
            step="0.001" min="0.001" required
            :class="{ 'invalid-field': formAttemptedSubmit && !isMaterialQuantityValid }" />
          <div v-if="formAttemptedSubmit && !isMaterialQuantityValid" class="invalid-feedback">
            Поле "Количество материала" обязательно и должно быть больше 0.
          </div>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group form-group-half required-field">
          <label for="total_amount">Сумма заказа</label>
          <input type="number" id="total_amount" v-model.number="orderData.total_amount" class="form-control"
            step="0.01" min="0.01" required :class="{ 'invalid-field': formAttemptedSubmit && !isTotalAmountValid }" />
          <div v-if="formAttemptedSubmit && !isTotalAmountValid" class="invalid-feedback">
            Поле "Сумма заказа" обязательно и должно быть больше 0.
          </div>
        </div>
        <div class="form-group form-group-half required-field">
          <label for="status">Статус заказа</label>
          <select id="status" v-model="orderData.status" class="form-control" required
            :class="{ 'invalid-field': formAttemptedSubmit && !isStatusValid }">
            <option :value="null" disabled>-- Выберите статус --</option>
            <option v-for="statusOption in availableStatuses" :key="statusOption" :value="statusOption">
              {{ statusOption }}
            </option>
          </select>
          <div v-if="formAttemptedSubmit && !isStatusValid" class="invalid-feedback">
            Поле "Статус заказа" обязательно.
          </div>
        </div>
      </div>

      <div class="form-group required-field">
        <label for="note">Заметки</label>
        <textarea id="note" v-model="orderData.note" class="form-control" rows="4" required
          :class="{ 'invalid-field': formAttemptedSubmit && !isNoteValid }"></textarea>
        <div v-if="formAttemptedSubmit && !isNoteValid" class="invalid-feedback">
          Поле "Заметки" обязательно.
        </div>
      </div>

      <div class="form-row">
        <div class="form-group form-group-one-third">
          <label for="advance_amount">Сумма аванса</label>
          <input type="number" id="advance_amount" v-model.number="orderData.advance_payment_amount"
            class="form-control" step="0.01" min="0"
            :class="{ 'invalid-field': formAttemptedSubmit && (orderData.advance_payment_amount !== null && orderData.advance_payment_amount < 0) }" />
          <div
            v-if="formAttemptedSubmit && orderData.advance_payment_amount !== null && orderData.advance_payment_amount < 0"
            class="invalid-feedback">
            Сумма аванса не может быть отрицательной.
          </div>
        </div>
        <div class="form-group form-group-one-third"
          :class="{ 'required-field': hasAdvancePayment, 'invalid-field': formAttemptedSubmit && !isAdvanceTypeValid && hasAdvancePayment }">
          <label for="advance_payment_type">Тип аванса</label>
          <select id="advance_payment_type" v-model="orderData.advance_payment_type" class="form-control"
            :required="hasAdvancePayment"
            :class="{ 'invalid-field': formAttemptedSubmit && !isAdvanceTypeValid && hasAdvancePayment }">
            <option :value="null" disabled>-- Выберите тип --</option>
            <option v-for="paymentType in paymentTypes" :key="paymentType.value" :value="paymentType.value">
              {{ paymentType.text }}
            </option>
          </select>
          <div v-if="formAttemptedSubmit && !isAdvanceTypeValid && hasAdvancePayment" class="invalid-feedback">
            Поле "Тип аванса" обязательно при наличии суммы аванса.
          </div>
        </div>
        <div class="form-group form-group-one-third"
          :class="{ 'required-field': hasAdvancePayment, 'invalid-field': formAttemptedSubmit && !isAdvanceDateValid && hasAdvancePayment }">
          <label for="advance_payment_date">Дата аванса</label>
          <input type="date" id="advance_payment_date" v-model="orderData.advance_payment_date" class="form-control"
            :required="hasAdvancePayment"
            :class="{ 'invalid-field': formAttemptedSubmit && !isAdvanceDateValid && hasAdvancePayment }" />
          <div v-if="formAttemptedSubmit && !isAdvanceDateValid && hasAdvancePayment" class="invalid-feedback">
            Поле "Дата аванса" обязательно при наличии суммы аванса.
          </div>
        </div>
      </div>
      <div class="order-items-section" :class="{ 'section-invalid': formAttemptedSubmit && !isItemsListValid }">
        <h2>Позиции заказа</h2>
        <div v-if="formAttemptedSubmit && !isItemsListValid" class="invalid-feedback text-center">
          Добавьте хотя бы одну валидную позицию заказа.
        </div>
        <div v-if="showItemForm">
          <OrderItemForm :item="currentItem || undefined"
            :isEditing="!!currentItem && (currentItem.id !== null && currentItem.id !== undefined)"
            :formAttemptedSubmit="formAttemptedSubmit" @save="handleItemSave" @cancel="handleItemCancel">
          </OrderItemForm>
        </div>
        <div v-else>
          <button type="button" @click="addOrderItem" class="btn btn-success btn-sm">
            Добавить позицию
          </button>
          <div v-if="orderData.order_items.length === 0" class="text-muted mt-2">
            Позиции заказа еще не добавлены.
          </div>
          <div v-else class="order-items-list mt-2">
            <div v-for="(item, index) in orderData.order_items" :key="item._tempId ?? item.id ?? `temp-${index}`"
              class="order-item-row">
              <span>
                {{ item.product_name }} - {{ item.quantity }} шт. × {{ item.unit_price }} руб. = {{ item.total_price !==
                  null ? (item.total_price ?? 0).toFixed(2) : 'N/A' }} руб.
                <span v-if="formAttemptedSubmit && !isOrderItemValid(item)" class="text-danger">
                  (Невалидная позиция)
                </span>
              </span>
              <button type="button" @click="editOrderItem(index)" class="btn btn-sm btn-outline-secondary">
                ✏️
              </button>
              <button type="button" @click="removeOrderItem(index)" class="btn btn-sm btn-outline-danger">
                ❌
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="form-actions">
        <button type="submit" class="btn btn-primary" :disabled="!isFormValid || showItemForm">
          {{ isEditing ? 'Сохранить изменения' : 'Создать заказ' }}
        </button>
        <button type="button" class="btn btn-secondary" @click="cancelEdit">
          Отмена
        </button>
      </div>
    </form>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useOrderStore } from '@/stores/orderStore';
import { useMaterialStore } from '@/stores/materialStore';
import { type Order, OrderStatus, AdvancePaymentType } from '@/types/order';
import OrderItemForm from './OrderItem.vue';

const router = useRouter();
const route = useRoute();
const orderStore = useOrderStore();
const materialStore = useMaterialStore();
const orderId = route.params.id ? Number(route.params.id) : null;
const isEditing = computed(() => !!orderId);
const isLoading = ref(false);
const hasError = ref(false);
const errorMessage = ref<string | null>(null);
const isOrderNumberManual = ref(false);
const showItemForm = ref(false);
const formAttemptedSubmit = ref(false);


interface LocalOrderItemState {
  _tempId?: number;
  id?: number | null;
  product_name: string;
  quantity: number | null;
  unit_price: number | null;
  total_price?: number | null | undefined;
  description?: string | null;
}

interface OrderFormData {
  id?: number | null;
  order_number: string | null;
  order_date: string | null;
  total_amount: number | null;
  status: OrderStatus | null;
  material_quantity: number | null;
  installation_date: string | null;
  advance_payment_amount: number | null;
  advance_payment_date: string | null;
  note: string | null;
  advance_payment_type: AdvancePaymentType | null;
  client: number | null;
  material: number | null;
  order_items: LocalOrderItemState[];

}

const currentItem = ref<LocalOrderItemState | null>(null);
let nextNewItemId = -1;

const orderData = ref<OrderFormData>({
  id: undefined,
  order_number: null,
  order_date: new Date().toISOString().split('T')[0],
  total_amount: null,
  status: null,
  material_quantity: null,
  installation_date: null,
  advance_payment_amount: null,
  advance_payment_date: null,
  note: '',
  advance_payment_type: null,
  client: null,
  material: null,
  order_items: [],
});

const availableClients = computed(() => orderStore.getClients);
const availableMaterials = computed(() => materialStore.getMaterials);
const availableStatuses: OrderStatus[] = Object.values(OrderStatus);
const hasAdvancePayment = computed(() => !!orderData.value.advance_payment_amount && orderData.value.advance_payment_amount > 0);
const paymentTypes = [
  { value: AdvancePaymentType.CASH, text: 'Наличные' },
  { value: AdvancePaymentType.CASHLESS, text: 'Безналичные' },
];

onMounted(async () => {
  isLoading.value = true;
  errorMessage.value = null;

  try {
    await Promise.all([
      orderStore.fetchClients(),
      materialStore.fetchMaterials(),
    ]);

    if (isEditing.value && orderId !== null) {
      await orderStore.fetchOrderById(orderId);
      if (orderStore.selectedOrder) {
        const selected = orderStore.selectedOrder;
        orderData.value = {
          ...selected,
          order_items: selected.order_items.map(item => ({
            ...item,
            quantity: item.quantity !== null ? Number(item.quantity) : null,
            unit_price: item.unit_price !== null ? Number(item.unit_price) : null,
            total_price: item.total_price !== null ? Number(item.total_price) : null,
          })),
          order_date: selected.order_date ? new Date(selected.order_date).toISOString().split('T')[0] : null,
          advance_payment_date: selected.advance_payment_date ? new Date(selected.advance_payment_date).toISOString().split('T')[0] : null,
          installation_date: selected.installation_date ? new Date(selected.installation_date).toISOString().split('T')[0] : null,
          total_amount: selected.total_amount !== null ? Number(selected.total_amount) : null,
          material_quantity: selected.material_quantity !== null ? Number(selected.material_quantity) : null,
          advance_payment_amount: selected.advance_payment_amount !== null ? Number(selected.advance_payment_amount) : null,
          note: selected.note ?? '',
          client: selected.client ?? null,
          material: selected.material ?? null,
          status: selected.status ?? null,
          order_number: selected.order_number ?? null,
        };

        if (orderData.value.order_number) {
          isOrderNumberManual.value = false;
        }
      } else {
        errorMessage.value = 'Заказ не найден.';
      }
    }
  } catch (err: any) {
    errorMessage.value = 'Произошла ошибка при загрузке данных.';
  } finally {
    isLoading.value = false;
  }
});

const isOrderNumberValid = computed(() => {
  return isEditing.value || !isOrderNumberManual.value || (isOrderNumberManual.value && !!orderData.value.order_number);
});

const isClientValid = computed(() => orderData.value.client !== null);
const isOrderDateValid = computed(() => !!orderData.value.order_date);
const isMaterialValid = computed(() => orderData.value.material !== null);
const isMaterialQuantityValid = computed(() =>
  orderData.value.material_quantity !== null && orderData.value.material_quantity > 0
);
const isTotalAmountValid = computed(() =>
  orderData.value.total_amount !== null && orderData.value.total_amount > 0
);
const isStatusValid = computed(() => orderData.value.status !== null);

const isAdvanceTypeValid = computed(() => !hasAdvancePayment.value || orderData.value.advance_payment_type !== null);
const isAdvanceDateValid = computed(() => !hasAdvancePayment.value || !!orderData.value.advance_payment_date);

const isNoteValid = computed(() => {
  return orderData.value.note !== null && orderData.value.note.trim() !== '';
});

const isOrderItemValid = (item: LocalOrderItemState) => {
  return !!item.product_name &&
    item.quantity !== null && item.quantity > 0 &&
    item.unit_price !== null && item.unit_price >= 0 &&
    item.total_price !== undefined && item.total_price !== null && item.total_price >= 0;
};

const isItemsListValid = computed(() => {
  return orderData.value.order_items.length > 0 &&
    orderData.value.order_items.every(item => isOrderItemValid(item));
});

const isFormValid = computed(() => {
  return isOrderNumberValid.value &&
    isClientValid.value &&
    isOrderDateValid.value &&
    isMaterialValid.value &&
    isMaterialQuantityValid.value &&
    isTotalAmountValid.value &&
    isStatusValid.value &&
    isAdvanceTypeValid.value &&
    isAdvanceDateValid.value &&
    isNoteValid.value &&
    isItemsListValid.value;

});

const preparePayload = () => {
  const payload: any = {
    ...orderData.value,
    order_items: orderData.value.order_items.map(item => {
      const { ...rest } = item;
      return rest;
    }),

    client: orderData.value.client,
    material: orderData.value.material,
    order_number: isEditing.value || isOrderNumberManual.value ? orderData.value.order_number : null,

    order_date: orderData.value.order_date,
    advance_payment_date: orderData.value.advance_payment_date,
    installation_date: orderData.value.installation_date,
    total_amount: orderData.value.total_amount ?? null,
    material_quantity: orderData.value.material_quantity ?? null,
    advance_payment_amount: orderData.value.advance_payment_amount ?? null,
    note: orderData.value.note,
  };
  if (!isEditing.value && payload.id === undefined) {
    delete payload.id;
  }

  return payload;
};


const saveOrder = async () => {
  formAttemptedSubmit.value = true;

  if (!isFormValid.value) {
    return;
  }

  if (showItemForm.value) {
    return;
  }

  isLoading.value = true;
  errorMessage.value = null;

  try {
    const payload = preparePayload();

    let result: Order | null = null;

    if (isEditing.value && orderId !== null) {
      result = await orderStore.updateOrder(orderId, payload);
    } else {
      result = await orderStore.createOrder(payload);
    }

    if (result) {
      orderStore.clearSelectedOrder();
      router.push('/orders');
    } else {
      errorMessage.value = 'Не удалось получить данные сохраненного заказа.';
    }
  } catch (err: any) {
    errorMessage.value = `Произошла ошибка при сохранении заказа: ${err.message || 'Неизвестная ошибка'}`;
  } finally {
    isLoading.value = false;
  }
};

const cancelEdit = () => {
  orderStore.clearSelectedOrder();
  router.push('/orders');
};

const addOrderItem = () => {
  if (showItemForm.value) return;

  currentItem.value = {
    _tempId: nextNewItemId--,
    id: null,
    product_name: '',
    quantity: null,
    unit_price: null,
    total_price: null,
    description: null,
  };

  showItemForm.value = true;
};

const editOrderItem = (index: number) => {
  if (showItemForm.value) return;

  const itemToEdit = orderData.value.order_items[index];
  currentItem.value = {
    ...itemToEdit,
    quantity: itemToEdit.quantity !== null ? Number(itemToEdit.quantity) : null,
    unit_price: itemToEdit.unit_price !== null ? Number(itemToEdit.unit_price) : null,
    total_price: itemToEdit.total_price !== null ? Number(itemToEdit.total_price) : null,
  };
  showItemForm.value = true;
};

const removeOrderItem = (index: number) => {
  const item = orderData.value.order_items[index];
  if (confirm(`Вы уверены, что хотите удалить позицию "${item.product_name}"?`)) {
    orderData.value.order_items.splice(index, 1);
  }
};

const handleItemSave = (savedItem: LocalOrderItemState) => {
  const index = orderData.value.order_items.findIndex(item =>
    item._tempId === savedItem._tempId || (item.id !== null && savedItem.id !== null && item.id === savedItem.id)
  );

  const quantity = savedItem.quantity !== null ? Number(savedItem.quantity) : null;
  const unitPrice = savedItem.unit_price !== null ? Number(savedItem.unit_price) : null;

  const newItem: LocalOrderItemState = {
    ...savedItem,
    quantity: quantity,
    unit_price: unitPrice,
    total_price: (quantity !== null && unitPrice !== null && !isNaN(quantity) && !isNaN(unitPrice)) ? quantity * unitPrice : null,
  };

  if (newItem.quantity !== null && newItem.unit_price !== null && !isNaN(newItem.quantity) && !isNaN(newItem.unit_price)) {
    newItem.total_price = newItem.quantity * newItem.unit_price;
  } else {
    newItem.total_price = null;
  }


  if (index !== -1) {
    orderData.value.order_items[index] = newItem;
  } else {
    orderData.value.order_items.push(newItem);
  }

  currentItem.value = null;
  showItemForm.value = false;
};

const handleItemCancel = () => {
  currentItem.value = null;
  showItemForm.value = false;
};

</script>
<style scoped>
/* Общие стили контейнера */
.order-editor {
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
}

h1 {
  color: #007bff;
  /* Основной синий цвет */
  text-align: center;
  margin-bottom: 25px;
  font-size: 2rem;
  font-weight: 600;
}

/* Сообщения состояния */
.status-message {
  padding: 12px;
  border-radius: 5px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.95rem;
  font-weight: 500;
}

.loading-message {
  background-color: #e9f7ef;
  color: #28a745;
  border: 1px solid #28a745;
}

.error-message {
  background-color: #f8d7da;
  /* Светло-красный фон */
  color: #721c24;
  /* Темно-красный текст */
  border: 1px solid #f5c6cb;
  /* Красная рамка */
}

/* Спиннер */
.loader {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007bff;
  /* Цвет спиннера */
  border-radius: 50%;
  width: 18px;
  height: 18px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* Стили формы */
.order-form-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
  /* Расстояние между группами полей */
}

.form-row {
  display: flex;
  gap: 20px;
  /* Расстояние между колонками */
  flex-wrap: wrap;
  /* Перенос на новую строку на узких экранах */
}

.form-group {
  flex-grow: 1;
  /* Группа полей может растягиваться */
  display: flex;
  flex-direction: column;
}

.form-group-half {
  flex-basis: calc(50% - 10px);
  /* 50% ширины минус половина gap */
  min-width: 150px;
  /* Минимальная ширина, чтобы избежать слишком сильного сжатия */
}

.form-group-one-third {
  flex-basis: calc(33.333% - 13.333px);
  /* ~33% ширины минус часть gap */
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
  /* Более стандартный радиус */
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

/* Чекбокс для ручного номера заказа */
.form-check {
  display: flex;
  align-items: center;
  margin-top: 5px;
  font-size: 0.9rem;
}

.form-check-input {
  margin-right: 5px;
}

.form-check-label {
  margin-bottom: 0;
  font-weight: 400;
}


/* Стили для подсветки обязательных полей */
.required-field label::after {
  content: ' *';
  color: #dc3545;
  margin-left: 4px;
}

/* Стили для невалидных полей при попытке отправки */
.form-group .form-control.invalid-field {
  border-color: #dc3545 !important;
  box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
}

.invalid-feedback {
  display: none;
  /* Скрываем по умолчанию */
  width: 100%;
  margin-top: 0.25rem;
  font-size: 0.875em;
  color: #dc3545;
  /* Красный цвет текста */
}

/* Показываем сообщение при попытке отправки и невалидности */
.form-attempted-submit .invalid-feedback {
  display: block;
}


/* Стили для секции позиций, если есть невалидные позиции или их нет */
.order-items-section.section-invalid {
  border: 1px dashed #dc3545;
  /* Пунктирная красная рамка вокруг секции */
  padding: 15px;
  /* Добавляем padding, чтобы рамка не прилипала к контенту */
  border-radius: 8px;
  margin-top: 15px;
  /* Корректируем верхний отступ */
}

/* Убираем стандартную верхнюю границу, если показываем рамку */
/* .order-items-section.section-invalid {
border-top: 1px dashed #dc3545;
} */
/* Стандартная верхняя граница секции */
.order-items-section {
  margin-top: 25px;
  padding-top: 15px;
  border-top: 1px solid #e9ecef;
}


/* Секция позиций заказа */
.order-items-section h2 {
  font-size: 1.5rem;
  margin-bottom: 15px;
  color: #007bff;
}

/* Контейнер для списка позиций и кнопки "Добавить" */
.order-items-panel {
  width: 100%;
  box-sizing: border-box;
}

.order-items-list {
  border: 1px solid #ced4da;
  border-radius: 4px;
  padding: 10px;
  background-color: #f8f9fa;
  /* Светло-серый фон для списка */
  margin-bottom: 15px;
}

.order-item-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #e9ecef;
  font-size: 0.95rem;
  flex-wrap: wrap;
  /* Позволяет элементам переноситься */
}

.order-item-row:last-child {
  border-bottom: none;
}

.order-item-row span {
  flex-grow: 1;
  margin-right: 10px;
  word-break: break-word;
}

.order-item-row button {
  flex-shrink: 0;
  margin-left: 5px;
  padding: 4px 8px;
  /* Меньше padding для кнопок в списке */
  font-size: 0.75rem;
  /* Меньше шрифт */
}

.order-item-row button:first-of-type {
  margin-left: auto;
  /* Прижимает кнопки к правому краю */
}

.order-item-row span.text-danger {
  font-size: 0.8em;
  /* Меньший шрифт для индикатора ошибки */
  margin-left: 8px;
}


/* Стили для формы позиции заказа (OrderItemForm) */
.order-item-form-panel {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #ced4da;
  border-radius: 4px;
  padding: 15px;
  background-color: #f8f9fa;
  /* Светло-серый фон */
  margin-bottom: 15px;
  /* Отступ после формы */
}

/* Стили внутри OrderItemForm должны быть определены в самом компоненте OrderItemForm.vue */
/* Но родительские стили формы (form-group, form-control, invalid-field/feedback) применятся к элементам внутри благодаря class="form-control" и т.п. */


/* Контейнер кнопок формы */
.form-actions {
  margin-top: 25px;
  padding-top: 15px;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn {
  padding: 10px 20px;
  font-size: 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
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

.btn-success {
  background-color: #28a745;
  color: white;
  border: 1px solid #28a745;
}

.btn-success:hover {
  background-color: #218838;
  border-color: #1e7e34;
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

/* Состояния disabled для кнопок */
.btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}


/* --- Адаптивность --- */
@media (max-width: 768px) {
  .order-editor {
    padding: 15px;
    margin: 15px auto;
  }

  h1 {
    font-size: 1.7rem;
    margin-bottom: 20px;
  }

  .form-row {
    gap: 15px;
    /* Уменьшаем gap в рядах */
  }

  .form-group-half,
  .form-group-one-third {
    flex-basis: 100%;
    /* Элементы в рядах становятся в колонку */
    min-width: auto;
  }

  .form-control {
    padding: 8px 10px;
    font-size: 0.95rem;
  }

  .order-item-row span {
    font-size: 0.9rem;
  }

  .order-item-row button {
    padding: 3px 6px;
    font-size: 0.7rem;
  }

  .order-item-row button:first-of-type {
    margin-left: auto;
    /* Прижимает кнопки к правому краю */
  }

  .form-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .form-actions .btn {
    width: 100%;
    margin-bottom: 8px;
    /* Отступ между кнопками в колонке */
    text-align: center;
  }

  .form-actions .btn:last-child {
    margin-bottom: 0;
  }

  /* Адаптация иконки валидации */
  .form-control.invalid-field {
    background-position: right calc(0.2em + 0.1875rem) center;
    padding-right: calc(1.5em + 0.6rem);
  }

}

@media (max-width: 480px) {
  .order-editor {
    padding: 10px;
    margin: 10px auto;
  }

  h1 {
    font-size: 1.5rem;
    margin-bottom: 15px;
  }

  .form-row {
    gap: 10px;
    /* Еще уменьшаем gap */
  }

  .form-control {
    padding: 6px 8px;
    font-size: 0.9rem;
  }

  label {
    margin-bottom: 6px;
  }

  .order-item-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .order-item-row span {
    margin-right: 0;
    margin-bottom: 5px;
  }

  .order-item-row button {
    margin: 2px;
    padding: 2px 5px;
    font-size: 0.6rem;
  }

  .order-item-row button:first-of-type {
    margin-left: 2px;
  }

}
</style>
