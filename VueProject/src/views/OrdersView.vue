<template>
  <div class="order-list-container">
    <div class="header-actions">
      <h1>Заказы</h1>
      <button type="button" class="btn add-button" @click="openCreateModal" title="Добавить заказ">
        <span class="material-symbols-outlined">add</span>
      </button>
    </div>
    <div class="order-filters-row">
      <select v-model="filters.status" class="search-input order-status-select">
        <option value="">Все статусы</option>
        <option v-for="(label, key) in orderStatusOptions" :key="key" :value="label">{{ label }}</option>
      </select>
      <input
        type="text"
        v-model="filters.query"
        placeholder="Поиск по клиенту, материалу или сумме..."
        @input="applyFiltersDebounced"
        class="search-input full-width-search order-search-input"
      />
    </div>

    <div v-if="error || attachmentStore.attachmentError" class="status-message error-message">
      ⚠️ Ошибка загрузки данных: {{ error || attachmentStore.attachmentError }}
    </div>
    
    <div v-else-if="paginatedOrders.length > 0" class="table-container">
      <table>
        <thead>
          <tr>
            <th @click="sortBy('id')" :class="['col-id', getSortClass('id')]">№</th>
            <th @click="sortBy('order_date')" :class="['col-order-date', getSortClass('order_date')]">Дата</th>
            <th @click="sortBy('clientName')" :class="['col-client', getSortClass('clientName')]">Клиент</th>
            <th @click="sortBy('material_name')" :class="['col-material', getSortClass('material_name')]">Материал</th>
            <th @click="sortBy('total_amount')" :class="['col-amount', getSortClass('total_amount')]">Сумма</th>
            <th class="col-calculation">Расчет</th>
            <th @click="sortBy('status')" :class="['col-status', getSortClass('status')]">Статус</th>
            <th class="col-actions">Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="orderWithDetails in paginatedOrders" :key="orderWithDetails.id">
            <td>{{ orderWithDetails.id }}</td>
            <td>{{ formatDate(orderWithDetails.order_date) }}</td>
            <td>{{ orderWithDetails.clientName || 'N/A' }}</td>
            <td>{{ orderWithDetails.material_name || 'N/A' }}</td>
            <td>{{ formatCurrency(Number(orderWithDetails.total_amount)) }}</td>
            <td>
              <span v-if="orderWithDetails.calculation" class="calculation-link">
                <router-link :to="`/calculations/${orderWithDetails.calculation}`" class="btn btn-sm btn-outline-primary">
                  Расчет #{{ orderWithDetails.calculation }}
                </router-link>
              </span>
              <span v-else class="text-muted">—</span>
            </td>
            <td>
              <StatusBadge :status="orderWithDetails.status as any" :label="orderWithDetails.status" />
            </td>
            <td class="actions-cell">
              <div class="action-links-container">
                <button @click="openAttachmentModal(orderWithDetails.id!)" class="btn btn-info" title="Вложения" aria-label="Вложения заказа">
                  <span class="material-symbols-outlined">attach_file</span>
                  <span class="btn-text">Вложения ({{ attachmentStore.getAttachmentsForOrder(orderWithDetails.id).length }})</span>
                </button>
                <button @click="openDetailsModal(orderWithDetails.id!)" class="btn btn-primary" title="Подробнее" aria-label="Подробнее о заказе">
                  <span class="material-symbols-outlined">visibility</span>
                  <span class="btn-text">Подробнее</span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <AppPagination
        v-if="totalPages > 1 && sortedAndFilteredOrders.length > 0"
        :total-items="sortedAndFilteredOrders.length"
        :current-page="currentPage"
        :page-size="pageSize"
        @page-changed="handlePageChanged"
      />
    </div>
    <div
      v-else-if="sortedAndFilteredOrders.length === 0 && filters.query.length > 0 && !isLoading"
      class="status-message no-results-message"
    >
      Нет заказов, соответствующих вашим критериям поиска.
    </div>
    <div
      v-else-if="orderStore.getOrders.length === 0 && filters.query.length === 0 && !isLoading && !error"
      class="status-message no-orders-available"
    >
      Нет доступных заказов.
    </div>

    <!-- Модальное окно вложений -->
    <div v-if="isAttachmentModalOpen" class="modal-overlay" @click.self="closeAttachmentModal">
      <div class="modal-content">
        <h2 class="modal-title">Вложения для заказа #{{ currentOrderIdForAttachments }}</h2>
        <div v-if="attachmentStore.attachmentError" class="status-message error-message modal-error">
          ⚠️ Ошибка: {{ attachmentStore.attachmentError }}
          <button @click="attachmentStore.clearAttachmentError()">Закрыть</button>
        </div>
        <div v-else-if="attachmentStore.isLoadingAttachments" class="status-message">
          Загрузка вложений...
        </div>
        <div class="attachments-list" v-else>
          <h3>Существующие вложения:</h3>
          <div v-if="attachmentsForCurrentOrder.length === 0" class="status-message no-results-message no-results-message-small">
            Нет вложений для этого заказа.
          </div>
          <ul v-else>
            <li v-for="attachment in attachmentsForCurrentOrder" :key="attachment.id" class="attachment-item">
              <a :href="attachment.file || '#'" target="_blank" :download="attachment.file_name || 'attachment'">
                {{ attachment.file_name || 'Файл ID: ' + attachment.id }}
              </a>
              <span v-if="attachment.description"> - {{ attachment.description }}</span>
              <span class="file-info" v-if="attachment.file_size !== undefined && attachment.file_size !== null">
                ({{ formatFileSize(attachment.file_size) }})
              </span>
              <button
                @click="handleAttachmentDelete(attachment.id!)"
                class="btn btn-danger btn-sm delete-attachment-button"
                :disabled="attachmentStore.isDeletingAttachment"
              >
                Удалить
              </button>
            </li>
          </ul>
        </div>
        <hr class="modal-divider" />
        <div class="upload-attachment-form">
          <h3>Загрузить новое вложение:</h3>
          <div class="form-group">
            <label for="attachmentFile">Файл:</label>
            <input type="file" id="attachmentFile" @change="handleFileSelect" ref="fileInput" required />
          </div>
          <div class="form-group">
            <label for="attachmentDescription">Описание (опционально):</label>
            <input type="text" id="attachmentDescription" v-model="newAttachmentDescription" />
          </div>
          <button
            @click="handleUploadAttachment"
            class="btn btn-primary"
            :disabled="!selectedFile || attachmentStore.isUploadingAttachment"
          >
            Загрузить файл
          </button>
        </div>
        <div class="modal-actions">
          <button type="button" @click="closeAttachmentModal" class="btn btn-secondary">Закрыть</button>
        </div>
      </div>
    </div>

    <!-- Create Order Modal -->
    <AppModal :is-open="isCreateModalOpen" title="Создать заказ" @close="closeCreateModal">
      <OrderEditor :isModal="true" :modalOrderId="null" @close="closeCreateModal" @saved="closeCreateModal" />
    </AppModal>

    <!-- Order Details Modal -->
  <AppModal :is-open="isDetailsModalOpen" title="Детали заказа" @close="closeDetailsModal" :maxWidth="1100">
      <OrderDetailView :isModal="true" :modalOrderId="selectedOrderIdForDetails" @close="closeDetailsModal" @edit="handleEditFromDetails" />
    </AppModal>

    <!-- Edit Order Modal -->
    <AppModal :is-open="isEditModalOpen" title="Редактировать заказ" @close="closeEditModal" :maxWidth="1000">
      <OrderEditor :isModal="true" :modalOrderId="selectedOrderIdForEdit" @close="closeEditModal" @saved="closeEditModal" />
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { OrderStatus } from '@/types/order';
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useOrderStore } from '@/stores/orderStore';
import { useClientStore } from '@/stores/clientStore';
import { useMaterialStore } from '@/stores/materialStore';
import { useAttachmentStore } from '@/stores/attachmentStore';
import AppModal from '@/components/ui/AppModal.vue';
import OrderEditor from '@/components/orders/OrderEditor.vue';
import OrderDetailView from '@/components/orders/OrderDetailView.vue';
import AppPagination from '@/components/ui/AppPagination.vue';
import StatusBadge from '@/components/ui/StatusBadge.vue';
import { useRouter } from 'vue-router';

const debounce = (fn: (...args: any[]) => void, wait = 300) => {
  let t: any
  return (...args: any[]) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...args), wait)
  }
}

const orderStore = useOrderStore();
const clientStore = useClientStore();
const materialStore = useMaterialStore();
const attachmentStore = useAttachmentStore();
const router = useRouter();

const filters = ref({
  query: '',
  status: '',
});

const orderStatusOptions = {
  [OrderStatus.NEW]: 'Новый',
  [OrderStatus.CALCULATION_CONFIRMED]: 'Расчет подтвержден',
  [OrderStatus.AWAITING_ADVANCE]: 'Ожидает аванса',
  [OrderStatus.IN_PRODUCTION]: 'В производстве',
  [OrderStatus.READY_FOR_INSTALLATION]: 'Готов к установке',
  [OrderStatus.AWAITING_INSTALLATION]: 'Ожидает установки',
  [OrderStatus.INSTALLATION]: 'Установка',
  [OrderStatus.COMPLETED]: 'Выполнен',
  [OrderStatus.CANCELLED]: 'Отменен',
};
const currentPage = ref(1);
const pageSize = ref(10);
const sortKey = ref('');
const sortOrder = ref<'asc' | 'desc'>('asc');
const error = ref<string | null>(null);
const isLoading = ref(false);

const ordersWithDetails = computed(() => {
  const orders = orderStore.getOrders as any[];
  const clients = clientStore.getClients as any[];
  const materials = materialStore.getMaterials as any[];
  if (!Array.isArray(orders) || !Array.isArray(clients) || !Array.isArray(materials)) return [] as any[];
  const clientsMap = new Map(clients.map(c => [c.id, c]));
  const materialsMap = new Map(materials.map(m => [m.id, m]));
  return orders.map(order => {
    const clientId = order.client as number | null | undefined;
    const materialId = order.material as number | null | undefined;
    const client = clientId != null ? clientsMap.get(clientId) : undefined;
    const material = materialId != null ? materialsMap.get(materialId) : undefined;
    return {
      ...order,
      clientName: client ? client.full_name : (clientId != null ? `Клиент ID: ${clientId}` : 'Неизвестный клиент'),
      material_name: material ? `${material.material_name} (${material.color_code})` : (materialId != null ? `Материал ID: ${materialId}` : 'Материал не указан'),
    };
  });
});

const sortedAndFilteredOrders = computed(() => {
  let orders = [...ordersWithDetails.value] as any[];
  if (filters.value.status) {
    orders = orders.filter(order => order.status === filters.value.status);
  }
  if (filters.value.query) {
    const query = filters.value.query.toLowerCase().trim();
    orders = orders.filter(order =>
      (order.clientName?.toLowerCase().includes(query) ||
       order.material_name?.toLowerCase().includes(query) ||
       (order.total_amount != null && String(order.total_amount).toLowerCase().includes(query)) ||
       String(order.id).includes(query) ||
       (order.status && String(order.status).toLowerCase().includes(query)))
    );
  }
  if (sortKey.value) {
    orders.sort((a, b) => {
      const aValue = a[sortKey.value] ?? '';
      const bValue = b[sortKey.value] ?? '';
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder.value === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder.value === 'asc' ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });
  }
  return orders;
});


const totalPages = computed(() => {
  return Math.ceil(sortedAndFilteredOrders.value.length / pageSize.value);
});

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return sortedAndFilteredOrders.value.slice(start, end);
});

const getSortClass = (key: string) => {
  if (sortKey.value === key) {
    return sortOrder.value === 'asc' ? 'sorted-asc' : 'sorted-desc';
  }
  return '';
};



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

const formatCurrency = (amount: number): string => {
  if (isNaN(amount)) return '---';
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(amount);
};

const formatFileSize = (size: number): string => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const sortBy = (key: string) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
};

const applyFiltersDebounced = debounce(() => {
  currentPage.value = 1;
}, 300);

const handlePageChanged = (page: number) => {
  currentPage.value = page;
};

const isCreateModalOpen = ref(false);
const isDetailsModalOpen = ref(false);
const selectedOrderIdForDetails = ref<number | null>(null);
const isEditModalOpen = ref(false);
const selectedOrderIdForEdit = ref<number | null>(null);

const openCreateModal = () => {
  isCreateModalOpen.value = true;
};

const closeCreateModal = () => {
  isCreateModalOpen.value = false;
};

const openDetailsModal = async (id: number) => {

  try {
    await orderStore.fetchOrderById(id);
  } catch {}
  selectedOrderIdForDetails.value = id;
  isDetailsModalOpen.value = true;
};

const closeDetailsModal = () => {
  isDetailsModalOpen.value = false;
  selectedOrderIdForDetails.value = null;
};

const openEditModal = (id: number) => {
  selectedOrderIdForEdit.value = id;
  isEditModalOpen.value = true;
};

const closeEditModal = () => {
  isEditModalOpen.value = false;
  selectedOrderIdForEdit.value = null;
};

const handleEditFromDetails = async (orderId: number) => {

  closeDetailsModal();
  await nextTick();
  openEditModal(orderId);
};

const isAttachmentModalOpen = ref(false);
const currentOrderIdForAttachments = ref<number | null>(null);
const selectedFile = ref<File | null>(null);
const newAttachmentDescription = ref('');

const attachmentsForCurrentOrder = computed(() => {
  return attachmentStore.getAttachmentsForOrder(currentOrderIdForAttachments.value || 0);
});

const openAttachmentModal = (orderId: number) => {
  currentOrderIdForAttachments.value = orderId;
  isAttachmentModalOpen.value = true;
  attachmentStore.fetchAttachmentsForOrder(orderId);
};

const closeAttachmentModal = () => {
  isAttachmentModalOpen.value = false;
  currentOrderIdForAttachments.value = null;
  selectedFile.value = null;
  newAttachmentDescription.value = '';
  attachmentStore.clearAttachmentError();
};

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement;
  selectedFile.value = input.files ? input.files[0] : null;
};

const handleUploadAttachment = async () => {
  if (!selectedFile.value || !currentOrderIdForAttachments.value) return;
  try {
    await attachmentStore.uploadAttachment(
      currentOrderIdForAttachments.value,
      selectedFile.value,
      newAttachmentDescription.value
    );
    selectedFile.value = null;
    newAttachmentDescription.value = '';
  attachmentStore.fetchAttachmentsForOrder(currentOrderIdForAttachments.value);
  } catch {

  }
};

const handleAttachmentDelete = async (attachmentId: number) => {
  if (!currentOrderIdForAttachments.value) return;
  try {
    await attachmentStore.deleteAttachment(attachmentId);
  attachmentStore.fetchAttachmentsForOrder(currentOrderIdForAttachments.value);
  } catch {

  }
};

onMounted(async () => {
  orderStore.clearError();
  clientStore.clearError();
  materialStore.clearError();
  attachmentStore.clearAttachmentError();

  try {
    await Promise.allSettled([
  orderStore.fetchOrders({ keepCache: true }),
  clientStore.fetchClients({ keepCache: true }),
  materialStore.fetchMaterials({ keepCache: true })
    ]);
  } catch {
    error.value = 'Не удалось загрузить данные';
  }
});

watch(sortedAndFilteredOrders, () => {
  currentPage.value = 1;
});


</script>

<style scoped>
.order-filters-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  margin-bottom: 0px;
}
.order-search-input,
.order-status-select {
  height: 32px;
  font-size: 14px;
  padding: 4px 10px;
  border-radius: 4px;
  box-sizing: border-box;
}
.order-status-select {
  max-width: 180px;
  min-width: 120px;
}
.order-list-container {
  padding: 20px 24px;
  max-width: var(--max-container-width);
  margin: 20px auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 16px;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 12px;
}

.header-actions h1 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
  color: #007bff;
  flex-grow: 1;
  text-align: left;
}

.header-actions .add-button { margin-left: 16px; }



.full-width-search {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  margin-bottom: 20px;
  box-sizing: border-box;
}

.status-message {
  padding: 12px;
  border-radius: 5px;
  margin: 20px auto;
  max-width: 800px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.95rem;
  font-weight: 500;
  text-align: center;
}

.error-message,
.modal-error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.status-message:not(.error-message):not(.modal-error) {
  background-color: #fff3cd;
  color: #856404;
  border: 1px solid #ffeeba;
}

.table-container {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow-x: auto;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
  background-color: #fff;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 900px;
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

tbody tr:hover {
  background-color: #f9f9f9;
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



.action-links-container {
  display: flex;
  justify-content: center;
  gap: 4px; /* reduced spacing */
  flex-wrap: wrap;
}

.btn {
  padding: 6px 12px;
  border: 1px solid transparent;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  text-align: center;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 30px;
  gap: 8px;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 10px;
}

.btn-warning { background-color: #ffc107; color: #212529; border-color: #ffc107; }
.btn-info { background-color: #17a2b8; color: white; border-color: #17a2b8; }
.btn-primary { background-color: #007bff; color: white; border-color: #007bff; }
.btn-danger { background-color: #dc3545; color: white; border-color: #dc3545; }
.btn-secondary { background-color: #6c757d; color: white; border-color: #6c757d; }
.btn-outline-primary { border-color: #007bff; color: #007bff; background-color: transparent; }

.btn-warning:hover { background-color: #e0a800; }
.btn-info:hover { background-color: #138496; }
.btn-primary:hover { background-color: #0056b3; }
.btn-danger:hover { background-color: #c82333; }
.btn-secondary:hover { background-color: #5a6268; }
.btn-outline-primary:hover { background-color: #e7f1ff; }

th.col-id, td:nth-child(1) { min-width: 50px; text-align: left; }
th.col-order-date, td:nth-child(2) { min-width: 100px; text-align: left; }
th.col-client, td:nth-child(3) { min-width: 140px; text-align: left; }
th.col-material, td:nth-child(4) { min-width: 140px; text-align: left; }
th.col-amount, td:nth-child(5) { min-width: 100px; text-align: left; }
th.col-calculation, td:nth-child(6) { min-width: 120px; text-align: left; }
th.col-status, td:nth-child(7) { min-width: 120px; text-align: left; }
th.col-actions { min-width: 150px; text-align: center; }
td.actions-cell { min-width: 150px; text-align: center; }


td :is(.btn, .btn-sm, .btn-primary, .btn-secondary, .btn-outline-primary, .btn-info, .btn-warning, .btn-danger) {
  display: inline-flex;
  margin-left: auto;
  margin-right: auto;
}

.order-list-container td:nth-child(6) .btn-sm,
.order-list-container td.actions-cell .btn {
  font-size: 12px;
  padding: 6px 12px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 15px;
  box-sizing: border-box;
}

.modal-content {
  background-color: #fff;
  padding: 25px 30px;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-title {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #007bff;
  margin: 0 0 10px 0;
}

@media (max-width: 768px) {
  .order-list-container {
    padding: 0 15px; /* unified padding */
  }

  .header-actions h1 {
    font-size: 1.6rem;
    text-align: center;
  }

  
  .header-actions { gap: 12px; }
  .header-actions .add-button { margin: 8px auto 0; }

  .full-width-search {
    font-size: 14px;
    padding: 10px;
  }

  .table-container {
    margin-left: 0;
    margin-right: 0;
  }

  table {
    min-width: auto;
  }

  th, td {
    font-size: 12px;
    padding: 8px;
  }

  th.col-actions,
  td.actions-cell {
    min-width: 100px;
  }

  .action-links-container {
    flex-direction: row;
    flex-wrap: nowrap; /* single row */
    gap: 4px; /* tighter */
    justify-content: flex-start;
  }

  .actions-cell .btn {
    width: 32px;
    height: 32px;
    padding: 0;
    font-size: 0; /* hide text */
    min-height: 32px;
    border-radius: 4px;
  }

  .actions-cell .btn .material-symbols-outlined {
    font-size: 20px;
  }

  .actions-cell .btn .btn-text {
    display: none;
  }
}
</style>