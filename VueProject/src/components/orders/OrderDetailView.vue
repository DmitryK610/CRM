<template>
  <div class="order-detail-container">
    <div v-if="orderStore.error" class="status-message error-message">
      ⚠️ Ошибка загрузки данных заказа: {{ orderStore.error }}
    </div>
    <div v-else-if="order" class="order-details-content">
      <div class="details-section">
        <h2>Информация о заказе №{{ order.order_number || order.id }}</h2>

        <div class="detail-line">
          <strong>Дата заказа:</strong>
          <span>{{ formatDate(order.order_date) }}</span>
        </div>

        <div class="detail-line">
          <strong>Клиент:</strong>
          <span>
            <span v-if="order.client_info">
              {{ order.client_info.full_name }} (тел: {{ order.client_info.contact_phone }})
            </span>
            <span v-else-if="order.client">Клиент ID: {{ order.client }} (данные не загружены)</span>
            <span v-else>Не указан</span>
          </span>
        </div>

        <div class="detail-line">
          <strong>Основной материал:</strong>
          <span>
            <span v-if="order.material_info">
              {{ order.material_info.material_name }} ({{ order.material_info.color_code }})
            </span>
            <span v-else-if="order.material">Материал ID: {{ order.material }} (данные не загружены)</span>
            <span v-else>Не указан</span>
          </span>
        </div>

        <div class="detail-line">
          <strong>Количество материала:</strong>
          <span>{{ order.material_quantity ?? 'Не указано' }}</span>
        </div>

        <div class="detail-line">
          <strong>Сумма заказа:</strong>
          <span>{{ formatCurrency(order.total_amount) }}</span>
        </div>

        <div class="detail-line">
          <strong>Статус:</strong>
          <span>
            <span :class="['status-badge', getStatusClass(order.status)]">
              {{ order.status || 'Не указан' }}
            </span>
          </span>
        </div>

        <div class="detail-line">
          <strong>Дата установки:</strong>
          <span>{{ order.installation_date ? formatDate(order.installation_date) : 'Не указана' }}</span>
        </div>

        <div class="detail-line">
          <strong>Сумма аванса:</strong>
          <span>{{ order.advance_payment_amount ? formatCurrency(order.advance_payment_amount) : 'Не указана' }}</span>
        </div>

        <div class="detail-line">
          <strong>Тип аванса:</strong>
          <span>
            {{ order.advance_payment_type ? getAdvancePaymentTypeText(order.advance_payment_type) : 'Не указан' }}
          </span>
        </div>

        <div class="detail-line">
          <strong>Дата аванса:</strong>
          <span>
            {{ order.advance_payment_date ? formatDate(order.advance_payment_date) : 'Не указана' }}
          </span>
        </div>

        <div class="detail-line note-line">
          <strong>Примечание:</strong>
          <span class="note-value-span">{{ order.note || 'Нет примечаний' }}</span>
        </div>

        <div class="action-buttons mt-4">
          <router-link :to="`/orders/${order.id}/edit`" class="btn btn-warning">Редактировать заказ</router-link>
        </div>
      </div>

      <div class="details-section order-items-detail-section mt-4">
        <h2>Позиции заказа</h2>
        <div v-if="order.order_items && order.order_items.length > 0" class="order-items-list-detail">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Наименование</th>
                <th>Количество</th>
                <th>Цена за ед.</th>
                <th>Общая стоимость</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in order.order_items" :key="item.id || index">
                <td>{{ index + 1 }}</td>
                <td>{{ item.product_name || 'Без названия' }}</td>
                <td>{{ item.quantity ?? 0 }}</td>
                <td>{{ formatCurrency(item.unit_price) }}</td>
                <td>{{ formatCurrency(item.total_price) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="text-muted">
          Позиции заказа отсутствуют.
        </div>
      </div>
    </div>
    <div v-else-if="!orderStore.isLoading && !orderStore.error" class="status-message no-results-message">
      Заказ с ID {{ orderId }} не найден.
    </div>

    <div class="back-button-container mt-4">
      <router-link to="/orders" class="btn btn-secondary">Вернуться к списку заказов</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">

import { onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useOrderStore } from '@/stores/orderStore';
import { OrderStatus, AdvancePaymentType, type Order } from '@/types/order';

const route = useRoute();
const orderStore = useOrderStore();

const orderId = computed(() => route.params.id ? Number(route.params.id) : null);

onMounted(async () => {
  orderStore.clearError(); // Используем экшен для сброса ошибки, если он есть
  if (orderId.value !== null) {
    await orderStore.fetchOrderById(orderId.value);
  } else {
    console.error("Order ID is missing from route parameters.");
    orderStore.setError("Не удалось загрузить заказ: отсутствует ID в маршруте.");
  }
});

const order = computed<Order | null>(() => orderStore.selectedOrder);

/** Форматирует дату в локализованный вид (ДД.ММ.ГГГГ или ДД.ММ.ГГГГ ЧЧ:ММ). */
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'не указана';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'некорректная дата';
    }
    // Если в строке есть время (обычно обозначается 'T'), отображаем его
    if (dateString.includes('T') || dateString.includes(':')) { // Добавил проверку на ':' для форматов без 'T'
      return date.toLocaleDateString('ru-RU') + ' ' + date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('ru-RU');
  } catch {
    return 'некорректная дата';
  }
};

/** Форматирует числовое значение как валюту (RUB). */
const formatCurrency = (value: number | string | undefined | null): string => {
  if (value === undefined || value === null || value === '') return '---';
  const numValue = Number(value);
  if (isNaN(numValue)) return String(value); // Если не число, вернуть как есть

  try {
    return numValue.toLocaleString('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 2, // Всегда показывать копейки
      maximumFractionDigits: 2
    });
  } catch (e) {
    console.error("Error formatting currency:", value, e);
    return `${numValue.toFixed(2)} ₽`;
  }
};

/** Возвращает текстовое представление типа авансового платежа. */
const getAdvancePaymentTypeText = (type: AdvancePaymentType | null | undefined): string => {
  if (!type) return 'Не указан';
  switch (type) {
    case AdvancePaymentType.CASH:
      return 'Наличные';
    case AdvancePaymentType.CASHLESS:
      return 'Безналичные';
    default:
      // Обработка случая, когда type может быть строкой, не соответствующей enum
      const knownTypes: Record<string, string> = {
        [AdvancePaymentType.CASH]: 'Наличные',
        [AdvancePaymentType.CASHLESS]: 'Безналичные',
      };
      return knownTypes[type as string] || 'Неизвестный тип';
  }
};

/** Возвращает CSS класс для стилизации статуса заказа. */
const getStatusClass = (status: OrderStatus | null | undefined): string => {
  if (!status) return 'status-unknown';

  const statusClasses: Partial<Record<OrderStatus, string>> = {
    [OrderStatus.NEW]: 'status-new',
    [OrderStatus.CALCULATION_CONFIRMED]: 'status-confirmed',
    [OrderStatus.AWAITING_ADVANCE]: 'status-pending',
    [OrderStatus.IN_PRODUCTION]: 'status-in-progress',
    [OrderStatus.READY_FOR_INSTALLATION]: 'status-ready',
    [OrderStatus.AWAITING_INSTALLATION]: 'status-waiting',
    [OrderStatus.INSTALLATION]: 'status-installation',
    [OrderStatus.COMPLETED]: 'status-completed',
    [OrderStatus.CANCELLED]: 'status-cancelled'
  };
  return statusClasses[status] || 'status-unknown';
};

</script>
<style scoped>
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

.page-title {
  color: #2c3e50;
  text-align: center;
  margin-top: 0;
  margin-bottom: 24px;
  font-size: 24px;
  font-weight: 600;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

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

.detail-line.note-line {
  flex-direction: column;
  align-items: flex-start;
}

.detail-line.note-line strong {
  width: auto;
  margin-right: 0;
  margin-bottom: 8px;
}

.note-value-span {
  display: block;
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #fff;
  white-space: pre-wrap;
  font-size: 0.95rem;
  color: #495057;
  box-sizing: border-box;
  overflow-x: auto;
}

.order-items-list-detail table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
  font-size: 0.95rem;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  overflow: hidden;
}

.order-items-list-detail th,
.order-items-list-detail td {
  border: 1px solid #eee;
  padding: 10px;
  text-align: left;
  word-break: break-word;
}

.order-items-list-detail th {
  background-color: #e9ecef;
  font-weight: 600;
  font-size: 0.9rem;
  color: #495057;
}

.order-items-list-detail tbody tr:nth-child(even) {
  background-color: #f8f9fa;
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
  margin-top: 20px;
  justify-content: center;
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

.btn-warning {
  background-color: #ffc107;
  color: #212529;
  border-color: #ffc107;
}

.btn-warning:hover {
  background-color: #e0a800;
  border-color: #d39e00;
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

  .note-value-span {
    margin-top: 0;
    padding: 8px;
    font-size: 0.9rem;
  }

  .order-items-list-detail th,
  .order-items-list-detail td {
    padding: 8px;
    font-size: 0.9rem;
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

  .note-value-span {
    padding: 6px;
    font-size: 0.85rem;
  }

  .order-items-list-detail th,
  .order-items-list-detail td {
    padding: 6px;
    font-size: 0.85rem;
  }

  .action-buttons {
    gap: 8px;
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

.status-badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: bold;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
}

.status-badge-Новый,
.status-badge-status-new {
  background-color: #e0e0e0;
  color: #333;
}

.status-badge-Расчет-подтвержден,
.status-badge-status-confirmed {
  background-color: #c8e6c9;
  color: #388e3c;
}

.status-badge-Ожидает-аванса,
.status-badge-status-pending {
  background-color: #fff9c4;
  color: #fbc02d;
}

.status-badge-В-производстве,
.status-badge-status-in-progress {
  background-color: #bbdefb;
  color: #1976d2;
}

.status-badge-Готов-к-установке,
.status-badge-status-ready {
  background-color: #ffecb3;
  color: #f57f17;
}

.status-badge-Ожидает-установки,
.status-badge-status-waiting {
  background-color: #e1bee7;
  color: #7b1fa2;
}

.status-badge-Установка,
.status-badge-status-installation {
  background-color: #b2ebf2;
  color: #0097a7;
}

.status-badge-Выполнен,
.status-badge-status-completed {
  background-color: #a5d6a7;
  color: #2e7d32;
}

.status-badge-Отменен,
.status-badge-status-cancelled {
  background-color: #ffcdd2;
  color: #c62828;
}

.status-badge-status-unknown {
  background-color: #bdbdbd;
  color: #424242;
}
</style>
