<template>
  <div class="dashboard-container">
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
                    <template v-if="orderStore.isLoading">
                      <span class="loader-small"></span> Загрузка заказов...
                    </template>
                    <template v-else>
                      Нет заказов в производстве.
                    </template>
                  </td>
                </tr>
                <tr v-for="order in activeOrders" :key="order.id">
                  <td>{{ order.order_number || `№${order.id}` }}</td>
                  <td>{{ getClientName(order.client) }}</td>
                  <td>{{ formatDate(order.order_date) }}</td>
                  <td class="deadline-cell">{{ formatDate(order.installation_date) }}</td>
                  <td>{{ order.total_amount ?? '---' }}</td>
                  <td>
                    <StatusBadge :status="order.status as any" :label="order.status || 'Статус не указан'" />
                  </td>
                  <td class="actions-cell">
                    <div class="action-links-container">
                      <button @click="openDetailsModal(order.id!)" class="btn btn-primary" title="Подробнее">
                        <span class="material-symbols-outlined">visibility</span>
                        <span class="btn-text">Подробнее</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- Modals -->
          <AppModal :is-open="isDetailsModalOpen" title="Детали заказа" @close="closeDetailsModal" :maxWidth="1100">
            <OrderDetailView :isModal="true" :modalOrderId="selectedOrderIdForDetails" @close="closeDetailsModal" @edit="handleEditFromDetails" />
          </AppModal>

          <AppModal :is-open="isEditModalOpen" title="Редактировать заказ" @close="closeEditModal" :maxWidth="1100">
            <OrderEditor :isModal="true" :modalOrderId="selectedOrderIdForEdit" @close="closeEditModal" @saved="closeEditModal" />
          </AppModal>
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
import { computed, onMounted, ref, nextTick } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useOrderStore } from '@/stores/orderStore';
import type { Client } from '@/types/client';
import { OrderStatus } from '@/types/order';
import StatusBadge from '@/components/ui/StatusBadge.vue';
import AppModal from '@/components/ui/AppModal.vue';
import OrderDetailView from '@/components/orders/OrderDetailView.vue';
import OrderEditor from '@/components/orders/OrderEditor.vue';

const authStore = useAuthStore();
const orderStore = useOrderStore();

const activeOrders = computed(() => {
  const orders = orderStore.getOrders;
  if (!Array.isArray(orders)) return [];
  return orders
    .filter(order => order.status !== OrderStatus.COMPLETED && order.status !== OrderStatus.CANCELLED)
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
  const hasOrdersCache = Array.isArray(orderStore.getOrders) && orderStore.getOrders.length > 0;
  const hasClientsCache = Array.isArray(orderStore.getClients) && orderStore.getClients.length > 0;

  const ordersPromise = hasOrdersCache
    ? orderStore.fetchOrders({ keepCache: true })
    : orderStore.fetchOrders({ keepCache: false });

  const clientsPromise = hasClientsCache
    ? orderStore.fetchClients({ keepCache: true })
    : orderStore.fetchClients({ keepCache: false });

  await Promise.all([ordersPromise, clientsPromise]).catch(err => {
    console.error("reloadData failed:", err);
  });
};


onMounted(async () => {
  if (authStore.isAuthenticated) {
    await reloadData();
  }
});


const isDetailsModalOpen = ref(false);
const selectedOrderIdForDetails = ref<number | null>(null);
const isEditModalOpen = ref(false);
const selectedOrderIdForEdit = ref<number | null>(null);

const openDetailsModal = async (id: number) => {
  try { await orderStore.fetchOrderById(id); } catch {}
  selectedOrderIdForDetails.value = id;
  isDetailsModalOpen.value = true;
};
const closeDetailsModal = () => { isDetailsModalOpen.value = false; selectedOrderIdForDetails.value = null; };

const openEditModal = (id: number) => { selectedOrderIdForEdit.value = id; isEditModalOpen.value = true; };
const closeEditModal = () => { isEditModalOpen.value = false; selectedOrderIdForEdit.value = null; };
const handleEditFromDetails = async (id: number) => {
  closeDetailsModal();
  await nextTick();
  openEditModal(id);
};
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

.loader-small {
  display: inline-block;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-top-color: #007bff;
  border-radius: 50%;
  width: 14px;
  height: 14px;
  animation: spin 0.8s linear infinite;
  vertical-align: middle;
  margin-right: 6px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.stats {
  font-size: 1rem;
  color: #555;
  font-weight: 500;
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
  min-height: 30px;
}

th {
  font-weight: 600;
  color: #333;
  cursor: pointer;
  position: relative;
  border-top: none;
}

th:hover {
  background-color: #ebebeb;
}

th.sorted-asc::after {
  content: ' ▲';
  font-size: 0.8em;
  position: absolute;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
}

th.sorted-desc::after {
  content: ' ▼';
  font-size: 0.8em;
  position: absolute;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
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
  text-align: left;
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
}


td :is(.btn, .btn-sm, .btn-primary, .btn-secondary, .btn-outline-primary, .btn-info, .btn-warning, .btn-danger) {
  display: inline-flex;
  margin-left: auto;
  margin-right: auto;
}

td.actions-cell {
  padding: 10px 12px;
  border-left: none;
  border-right: none;
}

.action-links-container {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}



.btn {
  padding: 6px 12px;
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: background-color 0.2s ease, border-color 0.2s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 30px;
  gap: 8px;
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

.btn-sm {
  padding: 4px 8px;
  font-size: 10px;
  font-weight: 500;
}

.btn:disabled {
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

@media (max-width: 768px) {
  .dashboard-container {
    padding: 0 12px;
  }

  .table-container {
    margin-left: 0;
    margin-right: 0;
  }

  .action-links-container {
    flex-direction: row;
    flex-wrap: nowrap;
    gap: 4px; /* unified tighter gap */
    justify-content: flex-start; /* align left for consistency */
  }

  .actions-cell .btn { width: 32px; height: 32px; padding: 0; font-size: 0; min-height: 32px; border-radius: 4px; }

  .actions-cell .btn .material-symbols-outlined {
    font-size: 20px;
  }

  .actions-cell .btn .btn-text {
    display: none;
  }
}
</style>
