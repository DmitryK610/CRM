<template>
  <div class="material-purchase-details-view">
    <h1 class="page-title">Детали закупки материала</h1>

    <div v-if="purchaseStore.isFetchingDetails" class="status-message loading-message">
      <div class="loader"></div> Загрузка деталей закупки...
    </div>
    <div v-else-if="purchaseStore.fetchDetailsError" class="status-message error-message">
      <span class="error-icon">⚠️</span>
      <span class="error-text">Ошибка загрузки деталей закупки: {{ purchaseStore.fetchDetailsError }}</span>
      <button @click="purchaseStore.clearFetchDetailsError()" class="close-error-button" title="Закрыть">×</button>
    </div>
    <div v-else-if="!purchaseDetails" class="status-message no-results-message">
      Детали закупки не найдены.
    </div>
    <div v-else class="details-container card">
      <div class="details-section">
        <h2>Основная информация о закупке</h2>
        <div class="details-grid">
          <div class="detail-item">
            <span class="detail-label">ID:</span>
            <span class="detail-value">{{ purchaseDetails.id }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Материал:</span>
            <span class="detail-value">{{ materialDisplay }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Артикул:</span>
            <span class="detail-value">{{ purchaseDetails.material_details?.color_code || '---' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Поставщик:</span>
            <span class="detail-value">{{ purchaseDetails.material_details?.supplier_details?.company_name || '---'
            }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Количество:</span>
            <span class="detail-value">{{ purchaseDetails.quantity }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Общая стоимость:</span>
            <span class="detail-value">{{ formatCurrencyRub(purchaseDetails.total_cost) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Метод оплаты:</span>
            <span class="detail-value">{{ getPaymentMethodText(purchaseDetails.payment_method) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Дата заказа:</span>
            <span class="detail-value">{{ formatDate(purchaseDetails.purchase_order_date) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Статус:</span>
            <span class="detail-value">
              <span :class="['status-badge', `status-badge-${purchaseDetails.status}`]">{{
                getStatusText(purchaseDetails.status) }}</span>
            </span>
          </div>
          <div class="detail-item" v-if="purchaseDetails.status === 'received'">
            <span class="detail-label">Дата получения:</span>
            <span class="detail-value">{{ formatDate(purchaseDetails.received_date) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Связанный заказ:</span>
            <span class="detail-value">{{ orderDisplay }}</span>
          </div>
          <div class="detail-item full-width" v-if="purchaseDetails.notes">
            <span class="detail-label">Примечание:</span>
            <span class="detail-value note-value-span">{{ purchaseDetails.notes }}</span>
          </div>
        </div>
      </div>


      <div class="actions-panel">
        <router-link :to="{ name: 'MaterialsView' }" class="btn secondary-button">
          К списку закупок
        </router-link>
        <router-link :to="{ name: 'EditMaterialPurchaseView', params: { id: purchaseDetails.id } }"
          class="btn primary-button">
          Редактировать
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useMaterialPurchaseStore } from '@/stores/materialPurchaseStore';
import { useMaterialStore } from '@/stores/materialStore';
import type { MaterialPurchase } from '@/types/materialPurchase';

const route = useRoute();
const purchaseStore = useMaterialPurchaseStore();
const materialStore = useMaterialStore();

const purchaseId = computed(() => Number(route.params.id));

const purchaseDetails = computed<MaterialPurchase | null>(() => {
  if (isNaN(purchaseId.value)) return null;
  return purchaseStore.getPurchaseById(purchaseId.value);
});

const fetchPurchaseDetailsData = async (id: number) => {
  if (isNaN(id)) {
    console.error('Неверный ID закупки для загрузки:', route.params.id);
    purchaseStore.setError('Неверный ID закупки.');
    return;
  }

  if (!purchaseStore.getPurchaseById(id)) {
    await purchaseStore.fetchMaterialPurchase(id);
  } else {
    purchaseStore.clearError();
  }

  if (materialStore.materials.length === 0 && !materialStore.isLoading) {
    await materialStore.fetchMaterials();
  }
};

onMounted(async () => {
  await fetchPurchaseDetailsData(purchaseId.value);
});

watch(purchaseId, async (newId, oldId) => {
  if (newId && newId !== oldId && !isNaN(newId)) {
    await fetchPurchaseDetailsData(newId);
  }
});

const materialDisplay = computed(() => {
  if (!purchaseDetails.value?.material) return '---';
  if (purchaseDetails.value.material_details?.material_name) {
    return purchaseDetails.value.material_details.material_name;
  }
  const material = materialStore.materials.find(m => m.id === purchaseDetails.value?.material);
  return material ? material.material_name || 'Материал без названия' : `ID материала: ${purchaseDetails.value.material}`;
});

const orderDisplay = computed(() => {
  if (!purchaseDetails.value?.order) return '---';
  if (purchaseDetails.value.order_details?.order_number) {
    return `Заказ №${purchaseDetails.value.order_details.order_number}`;
  }
  return `ID заказа: ${purchaseDetails.value.order}`;
});

const formatCurrencyRub = (value: number | string | undefined | null): string => {
  if (value === undefined || value === null || value === '') return '---';
  const numValue = Number(value);
  if (isNaN(numValue)) {
    console.warn("Attempted to format a non-numeric value as currency:", value);
    return '---';
  }

  try {
    return numValue.toLocaleString('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  } catch (e) {
    console.error("Error formatting currency:", value, e);
    return `${numValue.toFixed(2)} ₽`;
  }
};

const getPaymentMethodText = (method: string | null | undefined): string => {
  if (!method) return '---';
  switch (method) {
    case 'cash': return 'Наличные';
    case 'cashless': return 'Безналичные';
    default: return method;
  }
};

const getStatusText = (status: string | null | undefined): string => {
  if (!status) return '---';
  switch (status) {
    case 'not-received': return 'Ожидается';
    case 'received': return 'Получен';
    case 'cancelled': return 'Отменен';
    default: return status;
  }
};

const formatDate = (dateInput: string | Date | null | undefined): string => {
  if (!dateInput) return '---';
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) { return 'Неверная дата'; }
    return date.toLocaleDateString('ru-RU');
  } catch {
    return 'Ошибка форматирования даты';
  }
};

</script>

<style scoped>
.material-purchase-details-view {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin: 20px auto;
  max-width: 960px;
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


.details-grid {
  margin-bottom: 20px;
}


.detail-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  line-height: 1.5;
  font-size: 1rem;
  width: 100%;
  margin-bottom: 10px;
  flex-wrap: wrap;
}


.detail-label {
  font-weight: bold;
  width: 200px;
  flex-shrink: 0;
  margin-right: 15px;
  text-align: left;
}


.detail-value {
  flex-grow: 1;
  word-break: break-word;
}


.detail-item.full-width {
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  margin-bottom: 10px;
}


.detail-item.full-width .detail-label {
  width: auto;
  margin-right: 0;
  margin-bottom: 8px;
}


.detail-item.full-width .detail-value.note-value-span {
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



.actions-panel {
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

.btn.primary-button {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.btn.primary-button:hover {
  background-color: #0056b3;
  border-color: #0056b3;
}

.btn.secondary-button {
  background-color: #6c757d;
  color: white;
  border-color: #6c757d;
}

.btn.secondary-button:hover {
  background-color: #5a6268;
  border-color: #545b62;
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



.status-message {
  padding: 16px;
  border-radius: 8px;
  margin: 20px auto;
  max-width: 960px;
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


.error-message .error-icon {
  font-size: 1.5em;
  flex-shrink: 0;
}

.error-message .error-text {
  flex-grow: 1;
}

.error-message .close-error-button {
  background: none;
  border: none;
  color: inherit;
  font-size: 1.2em;
  cursor: pointer;
  margin-left: 10px;
  padding: 0 5px;
  flex-shrink: 0;
}


.back-button-container {
  text-align: center;
  margin-top: 30px;
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


.status-badge-not-received {

  background-color: transparent;
  color: #333;
}

.status-badge-received {

  background-color: transparent;
  color: #388e3c;
}

.status-badge-cancelled {

  background-color: transparent;
  color: #c62828;
}



.status-badge-status-unknown {

  background-color: transparent;
  color: #424242;
}


@media (max-width: 768px) {


  .material-purchase-details-view {
    padding: 15px;
    margin: 15px auto;
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




  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 8px;
    width: 100%;
  }


  .detail-label {
    width: auto;
    margin-right: 0;
    margin-bottom: 4px;
  }


  .detail-value {
    width: 100%;
  }


  .detail-item.full-width {
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 8px;
    width: 100%;
  }


  .detail-item.full-width .detail-value.note-value-span {
    padding: 8px;
    font-size: 0.9rem;
  }



  .order-items-list-detail th,
  .order-items-list-detail td {
    padding: 8px;
    font-size: 0.9rem;
  }


  .actions-panel {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .actions-panel .btn {
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


  .material-purchase-details-view {
    padding: 10px;
    margin: 10px auto;
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


  .detail-item {
    font-size: 0.9rem;
    margin-bottom: 6px;
  }


  .detail-label {
    margin-bottom: 3px;
  }


  .detail-item.full-width .detail-value.note-value-span {
    padding: 6px;
    font-size: 0.85rem;
  }


  .order-items-list-detail th,
  .order-items-list-detail td {
    padding: 6px;
    font-size: 0.85rem;
  }


  .actions-panel {
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
</style>
