<template>
  <div class="material-list-view">
    <div class="header-actions">
      <h1>Материалы</h1>
      <button type="button" class="btn add-button" title="Добавить материал" @click="openCreateMaterialModal">
        <span class="material-symbols-outlined">add</span>
      </button>
    </div>
   
    <div class="rate-inline dollar-rate-section">
      <h4>Курс $:</h4>
      <input class="dollarRate-input" type="number" v-model="materialStore.dollarRate" placeholder="Курс $" min="0" step="0.01" aria-label="Текущий курс доллара" />
    </div>
 <input
      type="text"
      v-model="searchQuery"
      placeholder="Поиск материалов..."
      class="search-input full-width-search"
      aria-label="Поиск по материалам и поставщикам"
    />
    

    <div v-if="materialStore.isLoading" class="status-message loading-message">
      <div class="loader"></div> Загрузка материалов из каталога...
    </div>
    <div v-else-if="materialStore.error" class="status-message error-message">
      <span class="error-icon">⚠️</span>
      <span class="error-text">Ошибка загрузки материалов: {{ materialStore.error }}</span>
      <button @click="materialStore.clearError()" class="close-error-button" title="Закрыть">×</button>
    </div>
    <div v-else-if="searchQuery.trim() === ''">
      <div class="status-message no-results-message">Введите запрос для поиска материалов в каталоге.</div>
    </div>
    <div v-else-if="filteredMaterials.length > 0">
      <div class="table-container card">
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th class="col-id">№</th>
                <th class="col-name">Название</th>
                <th class="col-color-code">Артикул</th>
                <th class="col-note">Примечание</th>
                <th class="col-cost">Стоимость ($)</th>
                <th class="col-cost-rub">Стоимость (руб)</th>
                <th class="col-supplier">Поставщик</th>
                <th class="col-actions">Действия</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="material in filteredMaterials" :key="material.id">
                <td class="col-id">{{ material.id }}</td>
                <td class="col-name">{{ material.material_name || '---' }}</td>
                <td class="col-color-code">{{ material.color_code || '---' }}</td>
                <td class="col-note">{{ material.note || '---' }}</td>
                <td class="col-cost">{{ formatCost(material.cost) }}</td>
                <td class="col-cost-rub">{{ formatCostRub(material.cost) }}</td>
                <td class="col-supplier">{{ material.supplier_details?.company_name || '---' }}</td>
                <td class="actions-cell">
                  <div class="action-links-container">
                    <button @click="openEditMaterialModal(material.id)" class="btn btn-warning" title="Редактировать материал" aria-label="Редактировать материал">
                      <span class="material-symbols-outlined">edit</span>
                      <span class="btn-text">Редактировать</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <div v-else>
      <div class="status-message no-results-message">Нет доступных материалов по вашему запросу.</div>
    </div>

    <hr class="divider section-divider">

    <div class="header-actions">
      <h1>Закуп</h1>
      <button type="button" class="btn add-button" title="Добавить закупку" @click="openCreatePurchaseModal">
        <span class="material-symbols-outlined">add</span>
      </button>
    </div>
    <input type="text" v-model="purchaseSearchQuery" placeholder="Поиск закупок..." class="search-input full-width-search" aria-label="Поиск по закупкам" />

    <div v-if="isPurchaseListLoading && !procurements.length && !purchaseListError"
      class="status-message loading-message">
      <div class="loader"></div> Загрузка списка закупок...
    </div>

    <div v-else-if="purchaseListError" class="status-message error-message">
      <span class="error-icon">⚠️</span>
      <span class="error-text">Ошибка загрузки списка закупок: {{ purchaseListError }}</span>
      <button @click="purchaseStore.clearError()" class="close-error-button" title="Закрыть">×</button>
    </div>

    <div v-else class="table-container material-purchase-table-container card">
      <div class="table-wrapper">
        <table class="purchase-table">
          <thead>
            <tr>
              <th>№</th>
              <th>Материал</th>
              <th>Артикул</th>
              <th>Кол-во</th>
              <th>Общая ст-ть</th>
              <th>Оплата</th>
              <th>Дата заказа</th>
              <th>Статус</th>
              <th>Дата получ.</th>
              <th>Заказ</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!isPurchaseListLoading && filteredPurchases.length === 0 && !purchaseListError">
              <td :colspan="11" class="table-info-cell">
                <span v-if="purchaseSearchQuery.trim() === ''">Нет данных о закупках. Добавьте первую запись.</span>
                <span v-else>Нет закупок, соответствующих вашему запросу.</span>
              </td>
            </tr>
            <tr v-else v-for="proc in filteredPurchases" :key="proc.id" :class="`status-${proc.status}`">
              <td>{{ proc.id }}</td>
              <td class="material-cell">
                <span class="material-name" :title="getMaterialDisplay(proc.material)">
                  {{ proc.material_details?.material_name || getMaterialNameOnly(proc.material) }}
                </span>
              </td>
              <td>{{ proc.material_details?.color_code || '---' }}</td>
              <td class="number-cell">{{ proc.quantity }}</td>
              <td class="currency-cell">{{ formatCurrency(proc.total_cost) }}</td>
              <td>{{ getPaymentMethodText(proc.payment_method) }}</td>
              <td class="date-cell">{{ formatDate(proc.purchase_order_date) }}</td>
              <td><span :class="['status-badge', `status-badge-${proc.status}`]">{{ getStatusText(proc.status) }}</span>
              </td>
              <td class="date-cell">{{ proc.status === 'received' ? formatDate(proc.received_date) : '---' }}</td>
              <td class="order-cell" :title="getOrderFullDisplay(proc.order)">
                {{ proc.order_details?.order_number ? `№${proc.order_details.order_number}` : (proc.order ? `ID:
                ${proc.order}` : '---') }}
              </td>
              <td class="actions-cell">
                <div class="action-links-container">
                  <button @click="openPurchaseDetailsModal(proc.id)" class="btn btn-primary" title="Подробно о закупке" :disabled="purchaseStore.isDeleting">
                    <span class="material-symbols-outlined">visibility</span>
                    <span class="btn-text">Подробнее</span>
                  </button>
                  <button @click="openEditPurchaseModal(proc.id)" class="btn btn-warning" title="Редактировать закупку" :disabled="purchaseStore.isDeleting">
                    <span class="material-symbols-outlined">edit</span>
                    <span class="btn-text">Редактировать</span>
                  </button>
                </div>
              </td>

            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Material create/edit modal -->
  <AppModal :is-open="isMaterialFormOpen" @close="closeMaterialFormModal" :title="materialFormId ? 'Редактировать материал' : 'Добавить материал'">
    <MaterialEditor :isModal="true" :modalMaterialId="materialFormId" @close="closeMaterialFormModal" @saved="onMaterialSaved" />
  </AppModal>

  <!-- Purchase details modal -->
  <AppModal :is-open="isPurchaseDetailsOpen" @close="closePurchaseDetailsModal" title="Детали закупки">
    <MaterialPurchaseDetails :isModal="true" :modalPurchaseId="purchaseDetailsId" @close="closePurchaseDetailsModal" />
  </AppModal>

  <!-- Purchase create/edit modal -->
  <AppModal :is-open="isPurchaseFormOpen" @close="closePurchaseFormModal" :title="purchaseFormId ? 'Редактировать закупку' : 'Добавить закупку'">
    <MaterialStock :isModal="true" :modalPurchaseId="purchaseFormId" @close="closePurchaseFormModal" @saved="onPurchaseSaved" />
  </AppModal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useMaterialStore } from '@/stores/materialStore';
import { useMaterialPurchaseStore } from '@/stores/materialPurchaseStore';
import { useOrderStore } from '@/stores/orderStore';
import AppModal from '@/components/ui/AppModal.vue';
import MaterialEditor from '@/components/materials/MaterialEditor.vue';
import MaterialPurchaseDetails from '@/components/materials/MaterialPurchaseDetails.vue';
import MaterialStock from '@/components/materials/MaterialStock.vue';

const materialStore = useMaterialStore();
const purchaseStore = useMaterialPurchaseStore();
const orderStore = useOrderStore();

const searchQuery = ref('');
const filteredMaterials = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  if (!query) return [];

  return materialStore.getMaterials.filter(material => {
    return [
      material.id?.toString().includes(query),
      material.material_name?.toLowerCase().includes(query),
      material.color_code?.toLowerCase().includes(query),
      material.note?.toLowerCase().includes(query),
      material.supplier_details?.company_name?.toLowerCase().includes(query)
    ].some(Boolean);
  });
});

const purchaseSearchQuery = ref('');
const procurements = computed(() => purchaseStore.procurements || []);
const isPurchaseListLoading = computed(() => purchaseStore.isLoading);
const purchaseListError = computed(() => purchaseStore.error);

const isMaterialFormOpen = ref(false);
const materialFormId = ref<number | null>(null);
const isPurchaseDetailsOpen = ref(false);
const purchaseDetailsId = ref<number | null>(null);
const isPurchaseFormOpen = ref(false);
const purchaseFormId = ref<number | null>(null);

const openCreateMaterialModal = () => { materialFormId.value = null; isMaterialFormOpen.value = true; };
const openEditMaterialModal = (id: number) => { materialFormId.value = id; isMaterialFormOpen.value = true; };
const closeMaterialFormModal = () => { isMaterialFormOpen.value = false; };
const onMaterialSaved = async () => { isMaterialFormOpen.value = false; await materialStore.fetchMaterials({ keepCache: false }); };

const openPurchaseDetailsModal = (id: number) => { purchaseDetailsId.value = id; isPurchaseDetailsOpen.value = true; };
const closePurchaseDetailsModal = () => { isPurchaseDetailsOpen.value = false; purchaseDetailsId.value = null; };

const openCreatePurchaseModal = () => { purchaseFormId.value = null; isPurchaseFormOpen.value = true; };
const openEditPurchaseModal = (id: number) => { purchaseFormId.value = id; isPurchaseFormOpen.value = true; };
const closePurchaseFormModal = () => { isPurchaseFormOpen.value = false; };
const onPurchaseSaved = async () => {
  isPurchaseFormOpen.value = false;
  await purchaseStore.fetchMaterialPurchases();
};

const filteredPurchases = computed(() => {
  const query = purchaseSearchQuery.value.toLowerCase().trim();
  if (!query) return procurements.value;

  return procurements.value.filter(proc => {
    return [
      proc.id?.toString().includes(query),
      proc.material_details?.material_name?.toLowerCase().includes(query),
      proc.material_details?.color_code?.toLowerCase().includes(query),
      proc.notes?.toLowerCase().includes(query),
      proc.order_details?.order_number?.toString().includes(query),
      false
    ].some(Boolean);
  });
});

const formatCost = (cost: unknown): string => {
  if (cost == null) return '---';
  const num = Number(cost);
  return isNaN(num) ? 'Неверная стоимость' : `$${num.toFixed(2)}`;
};

const formatCostRub = (cost: unknown): string => {
  if (cost == null) return '---';
  const num = Number(cost);
  if (isNaN(num)) return 'Неверная стоимость';

  const rate = Number(materialStore.dollarRate);
  return isNaN(rate) || rate <= 0
    ? 'Нет курса'
    : `${(num * rate).toFixed(2)}`;
};

const formatCurrency = (value: unknown): string => {
  if (value == null) return '---';
  const num = Number(value);
  if (isNaN(num)) return 'Не число';

  try {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(num);
  } catch {
    return `${num.toFixed(2)} ₽`;
  }
};

const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return '---';
  try {
    const d = new Date(date);
    return isNaN(d.getTime())
      ? 'Неверная дата'
      : d.toLocaleDateString('ru-RU');
  } catch {
    return 'Ошибка даты';
  }
};

const getMaterialDisplay = (id: number | null | undefined): string => {
  if (!id) return '---';
  const material = materialStore.getMaterials.find(m => m.id === id);
  return material
    ? `${material.material_name} (${material.color_code || 'Артикул ?'})`
    : `ID: ${id}`;
};

const getMaterialNameOnly = (id: number | null | undefined): string => {
  return getMaterialDisplay(id).split(' (')[0];
};

const getOrderFullDisplay = (id: number | null | undefined): string => {
  if (!id) return 'Не связано';
  const order = orderStore.orders.find(o => o.id === id);
  return order
    ? `Заказ №${order.order_number || order.id} от ${formatDate(order.order_date)} (Клиент: ${order.client_info?.full_name || 'Неизвестно'})`
    : `Заказ с ID: ${id}`;
};

const getPaymentMethodText = (method: string | null | undefined): string => {
  switch (method) {
    case 'cash': return 'Наличные';
    case 'cashless': return 'Безнал.';
    default: return method || '?';
  }
};

const getStatusText = (status: string | null | undefined): string => {
  switch (status) {
    case 'received':
      return 'Получен';
    case 'not-received':
      return 'Ожидается';
    case 'cancelled':
      return 'Отменен';
    default:
      return status || '?';
  }
};

const refreshPurchaseList = async () => {
  await purchaseStore.fetchMaterialPurchases();
};

onMounted(async () => {
  try {
    await Promise.allSettled([
    materialStore.fetchMaterials({ keepCache: true }),
      purchaseStore.fetchMaterialPurchases(),
      orderStore.fetchOrders()
    ]);
  } catch {
  }
});

defineExpose({ refreshPurchaseList });
</script>

<style scoped>
.material-list-view {
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

.controls-panel {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
  flex-wrap: wrap;
}

.purchase-controls-panel {
  justify-content: flex-start;
}

.controls-flex-column {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  flex-grow: 1;
}

.controls-left {
  flex-grow: 1;
}

.controls-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-input {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
  flex-grow: 1;
  min-width: 200px;
}

.dollar-rate-section {
  display: flex;
  align-items: baseline;

  gap: 8px;
}

.dollar-rate-section h4 {
  margin: 0;
  color: #555;
  font-size: 14px;
  font-weight: normal;
}

.dollarRate-input {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 80px;
  height:40px;
  text-align: center;
  font-size: 14px;
  box-sizing: border-box;
}

.divider {
  margin: 20px 0;
  border: none;
  border-top: 1px solid #eee;
}

.section-divider {
  margin: 40px 0;
  border-top: 1px solid #ccc;
}

.status-message {
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
  text-align: center;
  justify-content: center;
}

.status-message:not(.error-message):not(.loading-indicator):not(.table-info-cell) {
  background-color: #fff3cd;
  color: #856404;
  border: 1px solid #ffeeba;
}


.action-links-container { display: flex; justify-content: center; gap: 8px; flex-wrap: wrap; }
.btn { padding: 7px 13px; border: 1px solid transparent; border-radius: 4px; font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.2s; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; text-align: center; min-height: 30px; gap: 8px; }
.btn:hover { opacity: 0.85; }
.btn-primary { background-color: #1976d2; color: white; }
.btn-warning { background-color: #ffc107; color: #333; }

.header-actions .add-button { margin-left: 16px; }

.error-message {
  background-color: #ffebee;
  color: #d32f2f;
  border: 1px solid #ef9a9a;
  position: relative;
  justify-content: flex-start;
}

.error-message .error-icon {
  font-size: 1.5em;
}

.error-message .error-text {
  flex-grow: 1;
  text-align: left;
}

.error-message .close-error-button {
  background: none;
  border: none;
  font-size: 1.2em;
  cursor: pointer;
  color: #d32f2f;
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px;
  line-height: 1;
}



.table-info-cell {
  padding: 16px;
  border-radius: 8px;
  background-color: #fff3cd;
  color: #856404;
  border: 1px solid #ffeeba;
  font-style: italic;
  text-align: center;
}

.table-container {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  -webkit-overflow-scrolling: touch;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
  background-color: #fff;
  overflow-x: auto;
}

.table-wrapper {
  min-width: 800px;
}

.material-purchase-table-container .table-wrapper {
  min-width: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
}

thead {
  background-color: #f5f5f5;
}

th,
td {
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  text-align: left;
  font-size: 14px;
  box-sizing: border-box;
  vertical-align: middle;
}

th {
  border-top: none;
  font-weight: 600;
  color: #333;
  transition: background-color 0.2s;
}

tr td:first-child,
tr th:first-child {
  border-left: none;
}

tr td:last-child,
tr th:last-child {
  border-right: none;
}

th:hover {
  background-color: #ebebeb;
}

tbody tr {
  border-bottom: 1px solid #eee;
  transition: background-color 0.2s;
}

tbody tr:last-child {
  border-bottom: none;
}

tbody tr:hover {
  background-color: #f9f9f9;
}

th {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  position: relative;
}

.table-container:not(.material-purchase-table-container) th.col-id,
.table-container:not(.material-purchase-table-container) td.col-id {
  text-align: left;
  width: 60px;
  min-width: 60px;
}

.table-container:not(.material-purchase-table-container) th.col-name,
.table-container:not(.material-purchase-table-container) td.col-name {
  min-width: 180px;
  word-break: break-word;
}

.table-container:not(.material-purchase-table-container) th.col-color-code,
.table-container:not(.material-purchase-table-container) td.col-color-code {
  min-width: 100px;
  word-break: break-word;
}

.table-container:not(.material-purchase-table-container) th.col-note,
.table-container:not(.material-purchase-table-container) td.col-note {
  min-width: 200px;
  word-break: break-word;
}

.table-container:not(.material-purchase-table-container) th.col-cost,
.table-container:not(.material-purchase-table-container) td.col-cost {
  min-width: 80px;
  text-align: left;
}

.table-container:not(.material-purchase-table-container) th.col-cost-rub,
.table-container:not(.material-purchase-table-container) td.col-cost-rub {
  min-width: 100px;
  text-align: left;
}

.table-container:not(.material-purchase-table-container) th.col-supplier,
.table-container:not(.material-purchase-table-container) td.col-supplier {
  min-width: 150px;
  word-break: break-word;
}

.table-container:not(.material-purchase-table-container) th.col-actions,
.table-container:not(.material-purchase-table-container) td.col-actions {
  text-align: center;
  min-width: 60px;
  width: auto;
  padding: 4px !important;
  min-height: 40px;
}

.purchase-table th:nth-child(1),
.purchase-table td:nth-child(1) {
  text-align: left;
  width: 30px;
  min-width: 20px;
}

.purchase-table th:nth-child(2),
.purchase-table td.material-cell {
  min-width: 80px;
}

.purchase-table th:nth-child(3),
.purchase-table td:nth-child(3) {
  min-width: 50px;
}

.purchase-table th:nth-child(4),
.purchase-table td.number-cell {
  text-align: left;
  min-width: 50px;
}

.purchase-table th:nth-child(5),
.purchase-table td.currency-cell {
  text-align: left;
  min-width: 70px;
}

.purchase-table th:nth-child(6),
.purchase-table td:nth-child(6) {
  min-width: 70px;
}

.purchase-table th:nth-child(7),
.purchase-table td.date-cell:nth-child(7) {
  min-width: 70px;
}

.purchase-table th:nth-child(8),
.purchase-table td:nth-child(8) {
  min-width: 70px;
}

.purchase-table th:nth-child(9),
.purchase-table td.date-cell:nth-child(9) {
  min-width: 70px;
}

.purchase-table th:nth-child(10),
.purchase-table td.order-cell {
  min-width: 80px;
}

.purchase-table th:nth-child(11),
.purchase-table td:nth-child(11) {
  text-align: center;
  width: 60px;
  min-width: 60px;
  padding: 4px !important;
}

.purchase-table td.actions-cell {
  text-align: center;
  min-height: 40px;
  background-color: inherit;
}

.purchase-table td.material-cell .material-name,
.purchase-table td.supplier-cell,
.purchase-table td.order-cell {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.actions-cell .action-button {
  width: 28px;
  height: 28px;
  margin: 0 3px;
  padding: 0;
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.actions-cell .action-button::before {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.actions-cell .edit-button {
  background-color: #ffc107;
}

.actions-cell .edit-button::before {
  content: '\270E';
  font-size: 16px;
  color: #333;
}

.actions-cell .details-button {
  background-color: #007bff;
}

.actions-cell .details-button::before {
  content: 'i';
  font-size: 18px;
  font-weight: bold;
  color: white;
  font-style: normal;
}

.actions-cell .action-button:hover {
  opacity: 0.9;
  transform: scale(1.05);
}

.actions-cell .action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.button {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-block;
  text-align: center;
  box-sizing: border-box;
  line-height: 1.4;
  vertical-align: middle;
}

.button:hover {
  opacity: 0.85;
}

.button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}



.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: bold;
  text-transform: uppercase;
  min-width: 60px;
  text-align: center;
}

.status-badge-received {
  background-color: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #a5d6a7;
}

.status-badge-not-received {
  background-color: #fff3cd;
  color: #f9a825;
  border: 1px solid #ffecb3;
}

.status-badge-cancelled {
  background-color: #ffebee;
  color: #c62828;
  border: 1px solid #ef9a9a;
}

@media (max-width: 1200px) {
  .material-list-view {
    padding: 20px;
  }

  h1 {
    font-size: 1.8rem;
    margin-bottom: 20px;
  }

  h2 {
    font-size: 1.6rem;
    margin-top: 20px;
    margin-bottom: 20px;
  }

  .controls-panel,
  .purchase-controls-panel {
    gap: 15px;
  }

  .controls-left {
    gap: 10px;
  }

  

  .table-wrapper {
    min-width: 900px;
  }

  .material-purchase-table-container .table-wrapper {
    min-width: auto;
  }

  th,
  td {
    padding: 10px 14px;
    font-size: 13px;
  }

  .table-container:not(.material-purchase-table-container) th.col-id,
  .table-container:not(.material-purchase-table-container) td.col-id {
    width: 45px;
    min-width: 45px;
  }

  .table-container:not(.material-purchase-table-container) th.col-name,
  .table-container:not(.material-purchase-table-container) td.col-name {
    min-width: 140px;
  }

  .table-container:not(.material-purchase-table-container) th.col-color-code,
  .table-container:not(.material-purchase-table-container) td.col-color-code {
    min-width: 90px;
  }

  .table-container:not(.material-purchase-table-container) th.col-note,
  .table-container:not(.material-purchase-table-container) td.col-note {
    min-width: 160px;
  }

  .table-container:not(.material-purchase-table-container) th.col-cost,
  .table-container:not(.material-purchase-table-container) td.col-cost {
    min-width: 70px;
  }

  .table-container:not(.material-purchase-table-container) th.col-cost-rub,
  .table-container:not(.material-purchase-table-container) td.col-cost-rub {
    min-width: 90px;
  }

  .table-container:not(.material-purchase-table-container) th.col-supplier,
  .table-container:not(.material-purchase-table-container) td.col-supplier {
    min-width: 130px;
  }

  .table-container:not(.material-purchase-table-container) th.col-actions,
  .table-container:not(.material-purchase-table-container) td.col-actions {
    min-width: 60px;
    padding: 4px !important;
    min-height: 40px;
  }

  .purchase-table th:nth-child(1),
  .purchase-table td:nth-child(1) {
    width: 30px;
    min-width: 20px;
  }

  .purchase-table th:nth-child(2),
  .purchase-table td.material-cell {
    min-width: 80px;
  }

  .purchase-table th:nth-child(3),
  .purchase-table td:nth-child(3) {
    min-width: 50px;
  }

  .purchase-table th:nth-child(4),
  .purchase-table td.number-cell {
    min-width: 50px;
  }

  .purchase-table th:nth-child(5),
  .purchase-table td.currency-cell {
    min-width: 70px;
  }

  .purchase-table th:nth-child(6),
  .purchase-table td:nth-child(6) {
    min-width: 70px;
  }

  .purchase-table th:nth-child(7),
  .purchase-table td.date-cell:nth-child(7) {
    min-width: 70px;
  }

  .purchase-table th:nth-child(8),
  .purchase-table td:nth-child(8) {
    min-width: 70px;
  }

  .purchase-table th:nth-child(9),
  .purchase-table td.date-cell:nth-child(9) {
    min-width: 70px;
  }

  .purchase-table th:nth-child(10),
  .purchase-table td.order-cell {
    min-width: 80px;
  }

  .purchase-table th:nth-child(11),
  .purchase-table td:nth-child(11) {
    width: 60px;
    min-width: 60px;
    padding: 4px !important;
  }

  .purchase-table td.actions-cell {
    text-align: center;
    min-height: 40px;
    background-color: inherit;
  }

  .actions-cell .action-button {
    width: 26px;
    height: 26px;
    margin: 0 3px;
  }

  .actions-cell .edit-button::before {
    font-size: 15px;
  }

  .actions-cell .details-button::before {
    font-size: 16px;
  }

  .status-badge {
    padding: 3px 6px;
    font-size: 9px;
    min-width: 55px;
  }

  .table-info-cell {
    padding: 14px;
    font-size: 14px;
  }
}

@media (max-width: 768px) {
  .material-list-view {
    padding: 10px;
  }

  h1 {
    font-size: 1.6rem;
    margin-bottom: 15px;
  }

  h2 {
    font-size: 1.4rem;
    margin-top: 15px;
    margin-bottom: 15px;
  }

  .controls-panel,
  .purchase-controls-panel {
    gap: 10px;
  }

  .controls-left {
    gap: 8px;
  }

  .controls-right {
    gap: 6px;
  }

  .dollarRate-input {
    width: 70px;
  }

  .table-wrapper {
    min-width: 650px;
  }

  .material-purchase-table-container .table-wrapper {
    min-width: auto;
  }

  th,
  td {
    padding: 6px 10px;
    font-size: 11px;
  }

  .table-container:not(.material-purchase-table-container) th.col-id,
  .table-container:not(.material-purchase-table-container) td.col-id {
    width: 30px;
    min-width: 30px;
  }

  .table-container:not(.material-purchase-table-container) th.col-name,
  .table-container:not(.material-purchase-table-container) td.col-name {
    min-width: 100px;
  }

  .table-container:not(.material-purchase-table-container) th.col-color-code,
  .table-container:not(.material-purchase-table-container) td.col-color-code {
    min-width: 60px;
  }

  .table-container:not(.material-purchase-table-container) th.col-note,
  .table-container:not(.material-purchase-table-container) td.col-note {
    min-width: 100px;
  }

  .table-container:not(.material-purchase-table-container) th.col-cost,
  .table-container:not(.material-purchase-table-container) td.col-cost {
    min-width: 55px;
  }

  .table-container:not(.material-purchase-table-container) th.col-cost-rub,
  .table-container:not(.material-purchase-table-container) td.col-cost-rub {
    min-width: 75px;
  }

  .table-container:not(.material-purchase-table-container) th.col-supplier,
  .table-container:not(.material-purchase-table-container) td.col-supplier {
    min-width: 90px;
  }

  .table-container:not(.material-purchase-table-container) th.col-actions,
  .table-container:not(.material-purchase-table-container) td.col-actions {
    min-width: 55px;
    padding: 4px !important;
    min-height: 32px;
  }

  .purchase-table th:nth-child(1),
  .purchase-table td:nth-child(1) {
    width: 25px;
    min-width: 15px;
  }

  .purchase-table th:nth-child(2),
  .purchase-table td.material-cell {
    min-width: 70px;
  }

  .purchase-table th:nth-child(3),
  .purchase-table td:nth-child(3) {
    min-width: 40px;
  }

  .purchase-table th:nth-child(4),
  .purchase-table td.number-cell {
    min-width: 40px;
  }

  .purchase-table th:nth-child(5),
  .purchase-table td.currency-cell {
    min-width: 60px;
  }

  .purchase-table th:nth-child(6),
  .purchase-table td:nth-child(6) {
    min-width: 60px;
  }

  .purchase-table th:nth-child(7),
  .purchase-table td.date-cell:nth-child(7) {
    min-width: 60px;
  }

  .purchase-table th:nth-child(8),
  .purchase-table td:nth-child(8) {
    min-width: 60px;
  }

  .purchase-table th:nth-child(9),
  .purchase-table td.date-cell:nth-child(9) {
    min-width: 60px;
  }

  .purchase-table th:nth-child(10),
  .purchase-table td.order-cell {
    min-width: 70px;
  }

  .purchase-table th:nth-child(11),
  .purchase-table td:nth-child(11) {
    width: 50px;
    min-width: 50px;
    padding: 4px !important;
  }

  .purchase-table td.actions-cell {
    text-align: center;
    min-height: 32px;
    background-color: inherit;
  }

  .actions-cell .action-button {
    width: 24px;
    height: 24px;
    margin: 0 2px;
  }

  .actions-cell .edit-button::before {
    font-size: 14px;
  }

  .actions-cell .details-button::before {
    font-size: 16px;
  }

  .status-badge {
    padding: 2px 4px;
    font-size: 7px;
    min-width: 45px;
  }

  .table-info-cell {
    padding: 10px;
    font-size: 12px;
  }
}
</style>
