<template>
  <div class="dashboard-container">
    <h1>Заказы в производстве</h1>
    <div class="dashboard-content">
      <div v-if="authStore.isAuthenticated">
        <div v-if="orderStore.error" class="status-message error-message">
          ⚠️ Ошибка загрузки: {{ orderStore.error }}
          <button @click="reloadData" class="btn btn-danger btn-sm retry-button">Повторить попытку</button>
        </div>
        <div v-else>
          <div class="controls">
            <div class="stats">
              Всего заказов в работе: {{ activeOrders.length }}
            </div>
          </div>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th class="col-id">№</th>
                  <th class="col-client">Клиент</th>
                  <th class="col-order-date">Дата заказа</th>
                  <th class="col-deadline">Дата установки</th>
                  <th class="col-amount">Сумма</th>
                  <th class="col-status">Статус</th>
                  <th class="col-actions">Действия</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="activeOrders.length === 0">
                  <td colspan="7" style="text-align: center;">
                    Нет заказов в производстве.
                  </td>
                </tr>
                <tr v-for="order in activeOrders" :key="order.id">
                  <td>{{ order.order_number || `№${order.id}` }}</td>
                  <td>{{ getClientName(order.client) }}</td>
                  <td>{{ formatDate(order.order_date) }}</td>
                  <td class="deadline-cell">{{ formatDate(order.installation_date) }}</td>
                  <td>{{ order.total_amount ?? '---' }}</td>
                  <td>
                    <span class="status-badge" :class="statusClass(order.status)">
                      {{ order.status || 'Статус не указан' }}
                    </span>
                  </td>
                  <td class="actions-cell">
                    <router-link :to="`/orders/${order.id}`" class="btn btn-primary btn-sm btn-icon details-button"
                      title="Подробнее"></router-link>
                    <button v-if="order.status === OrderStatus.IN_PRODUCTION" @click="completeOrder(order.id!)"
                      class="btn btn-success btn-sm btn-icon complete-button" :disabled="orderStore.isLoading"
                      title="Завершить"></button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div v-else class="auth-message">
        <p>Для просмотра панели управления необходимо авторизоваться</p>
        <router-link to="/login" class="btn btn-primary login-button">Войти в систему</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useOrderStore } from '@/stores/orderStore';
import type { Client } from '@/types/client';
import { OrderStatus } from '@/types/order';

const authStore = useAuthStore();
const orderStore = useOrderStore();

const activeOrders = computed(() => {
  const orders = orderStore.getOrders;
  if (!Array.isArray(orders)) return [];
  return orders
    .filter(order => order.status === OrderStatus.IN_PRODUCTION)
    .sort((a, b) => {
      const dateA = a.installation_date;
      const dateB = b.installation_date;
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      const timeA = new Date(dateA).getTime();
      const timeB = new Date(dateB).getTime();
      if (isNaN(timeA) && isNaN(timeB)) return 0;
      if (isNaN(timeA)) return 1;
      if (isNaN(timeB)) return -1;
      return timeA - timeB;
    });
});

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'не указана';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'некорректная дата';
    return date.toLocaleDateString('ru-RU');
  } catch {
    return 'некорректная дата';
  }
};

const statusClass = (status: OrderStatus | null): string => {
  if (status === null) return 'status-unknown';
  const statusClasses: Record<OrderStatus, string> = {
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

const getClient = (clientId: number | null | undefined): Client | undefined => {
  if (clientId === null || clientId === undefined) return undefined;
  const clients = orderStore.getClients;
  if (!Array.isArray(clients)) return undefined;
  return clients.find(c => c.id === clientId);
};

const getClientName = (clientId: number | null | undefined): string => {
  const client = getClient(clientId);
  return client ? (client.full_name || `Клиент ${client.id}`) : 'Неизвестный клиент';
};

const reloadData = async () => {
  orderStore.clearError();
  await Promise.all([
    orderStore.fetchOrders(),
    orderStore.fetchClients()
  ]).catch(err => {
    console.error("reloadData failed:", err);
  });
};

const completeOrder = async (orderId: number) => {
  if (orderId === null || orderId === undefined) return;
  try {
    const updatedOrder = await orderStore.updateOrder(orderId, { status: OrderStatus.COMPLETED });
    if (updatedOrder) {
      // Успешно завершено
    }
  } catch (error) {
    console.error(`Ошибка при завершении заказа с ID ${orderId}:`, error);
  }
};

onMounted(async () => {
  if (authStore.isAuthenticated) {
    await reloadData();
  }
});
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
  max-width: 1400px;
  margin: 20px auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
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

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.table-container+.status-message {
  background-color: #fff3cd;
  color: #856404;
  border: 1px solid #ffeeba;
  text-align: center;
  justify-content: center;
  margin-top: 20px;
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
  flex-wrap: wrap;
  gap: 12px;
}

.stats {
  font-size: 1rem;
  color: #555;
  font-weight: 500;
}

.filters {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.filters label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  cursor: pointer;
}

.table-container {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
  background-color: #fff;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1050px;
}

thead {
  background-color: #f5f5f5;
}

th,
td {
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  text-align: left;
  font-size: 14px;
  vertical-align: middle;
  word-break: break-word;
  white-space: normal;
}

th {
  border-top: none;
}

tr td:first-child,
tr th:first-child {
  border-left: none;
}

tr td:last-child,
tr th:last-child {
  border-right: none;
}

tbody tr:last-child {
  border-bottom: none;
}

tbody tr {
  transition: background-color 0.2s;
}

tbody tr:hover {
  background-color: #f9f9f9;
}

th.col-id,
td:nth-child(1) {
  text-align: center;
  width: 80px;
  min-width: 80px;
}

th.col-client,
td:nth-child(2) {
  min-width: 180px;
}

th.col-order-date,
td:nth-child(3) {
  min-width: 120px;
}

th.col-deadline,
td:nth-child(4) {
  min-width: 120px;
  font-weight: 500;
}

th.col-amount,
td:nth-child(5) {
  min-width: 100px;
}

th.col-status,
td:nth-child(6) {
  min-width: 140px;
}

th.col-actions,
td.actions-cell {
  width: auto;
  min-width: 200px;
  text-align: center;
  vertical-align: middle;
}

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  flex-shrink: 0;
  min-width: 60px;
  text-align: center;
}

.status-new {
  background-color: #bbdefb;
  color: #0d47a1;
}

.status-confirmed {
  background-color: #c8e6c9;
  color: #1b5e20;
}

.status-pending {
  background-color: #fff9c4;
  color: #f57f17;
}

.status-in-progress {
  background-color: #d1c4e9;
  color: #4a148c;
}

.status-ready {
  background-color: #b3e5fc;
  color: #01579b;
}

.status-waiting {
  background-color: #ffccbc;
  color: #bf360c;
}

.status-installation {
  background-color: #f8bbd0;
  color: #880e4f;
}

.status-completed {
  background-color: #a5d6a7;
  color: #1b5e20;
}

.status-cancelled {
  background-color: #cfd8dc;
  color: #37474f;
}

.status-unknown {
  background-color: #e0e0e0;
  color: #666;
}

.actions-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  flex-wrap: wrap;
  text-align: center;
}

.btn {
  padding: 10px 20px;
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  transition: background-color 0.2s ease, border-color 0.2s ease;
  text-decoration: none;
  display: inline-block;
  text-align: center;
  flex-shrink: 0;
}

.btn:hover:not(:disabled) {
  opacity: 0.85;
}

.btn-primary {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.btn-success {
  background-color: #28a745;
  color: white;
  border-color: #28a745;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
  border-color: #dc3545;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
  border-color: #6c757d;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 500;
}

.btn-icon::before {
  content: '?';
  font-size: 16px;
  font-family: 'Arial', sans-serif;
  line-height: 1;
  display: inline-block;
  vertical-align: middle;
  color: inherit;
}

.btn-icon {
  width: 32px;
  height: 32px;
  padding: 0;
  font-size: 0;
  line-height: 32px;
  text-align: center;
  overflow: hidden;
  position: relative;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  margin: 0;
  min-width: auto;
  border-radius: 4px;
}

.details-button.btn-icon::before {
  content: '\2139';
  color: white;
}

.complete-button.btn-icon::before {
  content: '\2714';
}

.btn:disabled,
.btn-icon:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.retry-button {
  margin-left: 12px;
  padding: 4px 8px;
  font-size: 0.8rem;
  flex-shrink: 0;
}

.auth-message {
  text-align: center;
  padding: 40px;
  background-color: #f5f5f5;
  border-radius: 8px;
  max-width: 500px;
  margin: 40px auto;
}

.login-button {
  margin-top: 16px;
  padding: 10px 20px;
  font-size: 14px;
}
</style>
