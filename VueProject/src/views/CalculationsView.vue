<template>
  <div class="order-list-container">
    <h1>Список расчетов</h1>

    <div class="controls-panel">
      <input v-model="searchQuery" type="text" placeholder="Поиск по клиенту, материалу, сумме или дате..."
        class="search-input" />
      <div class="button-group">
        <router-link to="/calculations/new" class="button add-button">
          Добавить новый расчет
        </router-link>
        <router-link to="/price-list" class="button price-list-button" title="Редактировать прайс-лист">
          ⚙️ Прайс-лист
        </router-link>
      </div>
    </div>

    <div v-if="calculationStore.isLoading" class="status-message loading-message">
      <div class="loader"></div> Загрузка расчетов...
    </div>

    <div v-else-if="validCalculations.length === 0 && searchQuery.trim()" class="status-message no-results-message">
      <p>По запросу "{{ searchQuery }}" ничего не найдено.</p>
      <button @click="searchQuery = ''" class="btn btn-secondary btn-sm">Очистить поиск</button>
    </div>

    <div v-else-if="validCalculations.length === 0" class="status-message no-orders-available">
      <p class="text-lg mb-4">Пока нет ни одного расчета.</p>
      <router-link to="/calculations/new" class="button add-button">
        Создать первый расчет
      </router-link>
    </div>

    <div v-else class="table-container">
      <table>
        <thead>
          <tr>
            <th scope="col" class="col-id">№</th>
            <th scope="col" class="col-client">Клиент</th>
            <th scope="col" class="col-material">Материал</th>
            <th scope="col" class="col-amount">Сумма расчета</th>
            <th scope="col" class="col-order">Заказ</th>
            <th scope="col" class="col-order-date">Дата расчета</th>
            <th scope="col" class="col-actions">Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="calculation in validCalculations" :key="calculation.id || calculation.calculationId">
            <td class="text-center">
              {{ calculation.id || calculation.calculationId }}
            </td>
            <td>
              {{ getClientName(calculation) }}
            </td>
            <td>
              {{ getMaterialInfo(calculation) }}
            </td>
            <td class="text-right font-medium">
              {{ formatCurrency(getTotalCost(calculation)) }}
            </td>
            <td class="text-center">
              <span v-if="calculation.orderId" class="order-link">
                <router-link :to="`/orders/${calculation.orderId}`" class="btn btn-sm btn-outline-success">
                  Заказ #{{ calculation.orderId }}
                </router-link>
              </span>
              <span v-else class="text-muted">—</span>
            </td>
            <td>
              {{ formatDate(calculation.createdAt) }}
            </td>
            <td class="actions-cell">
              <div class="action-links-container">
                <router-link :to="`/calculations/${calculation.id || calculation.calculationId}`"
                  class="btn btn-primary btn-sm" title="Просмотр">
                  Просмотр
                </router-link>
                <button @click="openAttachmentModal(calculation.id || calculation.calculationId)"
                  class="btn btn-info btn-sm" title="Вложения">
                  Вложения ({{
                    (calculation.id || calculation.calculationId) ?
                      attachmentStore.getAttachmentsForCalculation(Number(calculation.id ||
                        calculation.calculationId)).length : 0 }})
                </button>
                <button @click="deleteCalculation(calculation.id || calculation.calculationId)"
                  class="btn btn-danger btn-sm" title="Удалить">
                  Удалить
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Модальное окно для вложений -->
    <div v-if="isAttachmentModalOpen" class="modal-overlay" @click.self="closeAttachmentModal">
      <div class="modal-content">
        <h2>Вложения для расчета #{{ currentCalculationIdForAttachments }}</h2>

        <div v-if="attachmentStore.attachmentError" class="status-message error-message modal-error">
          ⚠️ Ошибка: {{ attachmentStore.attachmentError }}
          <button @click="attachmentStore.clearAttachmentError()">Закрыть</button>
        </div>

        <div v-else-if="attachmentStore.isLoadingAttachments" class="status-message">
          Загрузка вложений...
        </div>

        <div class="attachments-list" v-else>
          <h3>Существующие вложения:</h3>
          <div v-if="attachmentsForCurrentCalculation.length === 0"
            class="status-message no-results-message no-results-message-small">
            Нет вложений для этого расчета.
          </div>
          <ul v-else>
            <li v-for="attachment in attachmentsForCurrentCalculation" :key="attachment.id" class="attachment-item">
              <a :href="attachment.file || '#'" target="_blank" :download="attachment.file_name || 'attachment'">
                {{ attachment.file_name || 'Файл ID: ' + attachment.id }}
              </a>
              <span v-if="attachment.description"> - {{ attachment.description }}</span>
              <span class="file-info" v-if="attachment.file_size !== undefined && attachment.file_size !== null">
                ({{ formatFileSize(attachment.file_size) }})
              </span>
              <button @click="handleAttachmentDelete(attachment.id!)"
                class="btn btn-danger btn-sm delete-attachment-button" :disabled="attachmentStore.isDeletingAttachment">
                Удалить
              </button>
            </li>
          </ul>
        </div>

        <hr class="modal-divider">

        <div class="upload-attachment-form">
          <h3>Загрузить новое вложение:</h3>
          <div class="form-group">
            <label for="attachmentFile">Файл:</label>
            <input type="file" id="attachmentFile" @change="handleFileSelect" ref="fileInput" required>
          </div>
          <div class="form-group">
            <label for="attachmentDescription">Описание (опционально):</label>
            <input type="text" id="attachmentDescription" v-model="newAttachmentDescription">
          </div>
          <button @click="handleUploadAttachment" class="btn btn-primary"
            :disabled="!selectedFile || attachmentStore.isUploadingAttachment">
            Загрузить файл
          </button>
        </div>

        <div class="modal-actions">
          <button type="button" @click="closeAttachmentModal" class="btn btn-secondary">Закрыть</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useCalculationStore } from '@/stores/calculationStore';
import { useClientStore } from '@/stores/clientStore';
import { useAttachmentStore } from '@/stores/attachmentStore';
import { useNotificationStore } from '@/stores/notificationStore';
import type { CalculationHistory } from '@/types/calculation';
import type { Client } from '@/types/client';

const calculationStore = useCalculationStore();
const clientStore = useClientStore();
const attachmentStore = useAttachmentStore();
const notificationStore = useNotificationStore();

// Поисковый запрос
const searchQuery = ref('');

// Модальное окно для вложений
const isAttachmentModalOpen = ref(false);
const currentCalculationIdForAttachments = ref<number | null>(null);
const selectedFile = ref<File | null>(null);
const newAttachmentDescription = ref('');
const fileInput = ref<HTMLInputElement | null>(null);

const calculations = computed(() => calculationStore.history);

const attachmentsForCurrentCalculation = computed(() => {
  if (currentCalculationIdForAttachments.value === null) {
    return [];
  }
  return attachmentStore.getAttachmentsForCalculation(currentCalculationIdForAttachments.value);
});

const validCalculations = computed(() => {
  const filtered = calculations.value.filter(calculation => calculation && (calculation.id || calculation.calculationId));

  // Если есть поисковый запрос, фильтруем результаты
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    return filtered.filter(calculation => {
      // Поиск по имени клиента
      const clientName = getClientName(calculation).toLowerCase();
      if (clientName.includes(query)) return true;

      // Поиск по материалу
      const materialInfo = getMaterialInfo(calculation).toLowerCase();
      if (materialInfo.includes(query)) return true;

      // Поиск по сумме
      const totalCost = getTotalCost(calculation).toString();
      if (totalCost.includes(query)) return true;

      // Поиск по дате
      const dateString = formatDate(calculation.createdAt).toLowerCase();
      if (dateString.includes(query)) return true;

      // Поиск по ID расчета
      const calculationId = (calculation.id || calculation.calculationId)?.toString();
      if (calculationId?.includes(query)) return true;

      return false;
    });
  }

  return filtered;
});

const getTotalCost = (calculation: CalculationHistory): number => {
  // Ваш код для getTotalCost остается без изменений
  if (calculation.totalCost !== undefined && calculation.totalCost !== null) {
    const cost = typeof calculation.totalCost === 'string' ? parseFloat(calculation.totalCost) : Number(calculation.totalCost);
    return isNaN(cost) ? 0 : cost;
  }
  // Обработка breakdown, если totalCost не задан
  if (calculation.breakdown) {
    let total = 0;
    Object.values(calculation.breakdown).forEach((item: unknown) => {
      if (item && typeof item === 'object' && 'totalPrice' in item) {
        const itemObj = item as { totalPrice?: string | number };
        if (itemObj.totalPrice) {
          const price = typeof itemObj.totalPrice === 'string' ? parseFloat(itemObj.totalPrice) : Number(itemObj.totalPrice);
          if (!isNaN(price)) {
            total += price;
          }
        }
      }
    });
    if (total > 0) return total;
  }
  return 0;
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB'
  }).format(amount);
};

const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return 'Дата не указана'
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Функция для получения имени клиента
const getClientName = (calculation: CalculationHistory): string => {
  // 1. Проверяем selectedClient в форме (локально созданные расчеты)
  if (calculation.form?.selectedClient) {
    return calculation.form.selectedClient.full_name
  }

  // 2. Проверяем client_info от Django API (корневой уровень)
  if (calculation.client_info && typeof calculation.client_info === 'object') {
    const clientInfo = calculation.client_info as Client
    if (clientInfo.full_name) {
      return clientInfo.full_name
    }
  }

  // 3. Проверяем поле client (если это ID клиента)
  if (calculation.client && typeof calculation.client === 'number') {
    const foundClient = clientStore.clients.find(c => c.id === calculation.client)
    if (foundClient) {
      return foundClient.full_name
    }
  }

  // 4. Проверяем clientNameForDisplay (если есть)
  if (calculation.clientNameForDisplay && calculation.clientNameForDisplay !== 'Анонимный расчет') {
    return calculation.clientNameForDisplay
  }

  // 5. Если ничего не найдено - расчет анонимный
  return 'Анонимный расчет'
}


const getMaterialInfo = (calculation: CalculationHistory): string => {
  const materialFromForm = calculation.form?.selectedMaterial;
  if (materialFromForm) {
    return `${materialFromForm.color_code || materialFromForm.material_name} (${materialFromForm.material_name})`;
  }
  if (calculation.stoneName) {
    return calculation.stoneName;
  }
  if (calculation.form?.stoneName) { // Fallback к stoneName из формы
    return calculation.form.stoneName;
  }
  return 'Материал не указан';
};

const deleteCalculation = async (calculationId: string | number | undefined) => {
  if (!calculationId) return;

  // Найдем расчет в локальном списке для дополнительной информации
  const calculationToDelete = validCalculations.value.find(
    calc => (calc.id || calc.calculationId) === calculationId
  );

  if (!calculationToDelete) {
    notificationStore.showNotification('Расчет не найден в списке', 'error');
    return;
  }

  const clientName = getClientName(calculationToDelete);
  const confirmMessage = `Вы уверены, что хотите удалить расчет №${calculationId}${clientName !== 'Анонимный расчет' ? ` для клиента ${clientName}` : ''}?`;

  if (confirm(confirmMessage)) {
    try {
      await calculationStore.deleteCalculation(calculationId);
      notificationStore.showNotification('Расчет успешно удален', 'success');
    } catch (error: unknown) {
      console.error('Error deleting calculation:', error);

      // Обработка разных типов ошибок
      const errorMessage = (error as Error).message || 'Неизвестная ошибка';

      if (errorMessage.includes('404')) {
        // Если расчет не найден на сервере, удаляем его из локального списка
        calculationStore.history = calculationStore.history.filter(
          calc => (calc.id || calc.calculationId) !== calculationId
        );
        notificationStore.showNotification(
          'Расчет не найден на сервере, но удален из локального списка',
          'warning'
        );
      } else if (errorMessage.includes('403')) {
        notificationStore.showNotification('Нет прав для удаления этого расчета', 'error');
      } else if (errorMessage.includes('500')) {
        notificationStore.showNotification('Ошибка сервера при удалении расчета', 'error');
      } else {
        notificationStore.showNotification(
          `Ошибка при удалении расчета: ${errorMessage}`,
          'error'
        );
      }
    }
  }
};

// Функции для работы с вложениями
const formatFileSize = (bytes: number | null | undefined, decimalPoint = 2) => {
  if (bytes == null || bytes === 0) return '0 Bytes';
  const k = 1000;
  const dm = decimalPoint < 0 ? 0 : decimalPoint;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const openAttachmentModal = (calculationId: string | number | undefined) => {
  if (!calculationId) return;
  const numericId = typeof calculationId === 'string' ? parseInt(calculationId) : calculationId;
  currentCalculationIdForAttachments.value = numericId;
  isAttachmentModalOpen.value = true;
  attachmentStore.clearAttachmentError();
  attachmentStore.fetchAttachmentsForCalculation(numericId);
};

const closeAttachmentModal = () => {
  isAttachmentModalOpen.value = false;
  currentCalculationIdForAttachments.value = null;
  selectedFile.value = null;
  newAttachmentDescription.value = '';
  if (fileInput.value) {
    fileInput.value.value = '';
  }
  attachmentStore.clearAttachmentError();
};

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0];
  } else {
    selectedFile.value = null;
  }
};

const handleUploadAttachment = async () => {
  if (!selectedFile.value || currentCalculationIdForAttachments.value === null) {
    attachmentStore.attachmentError = 'Выберите файл для загрузки.';
    return;
  }
  attachmentStore.clearAttachmentError();
  try {
    await attachmentStore.uploadAttachment(
      currentCalculationIdForAttachments.value,
      selectedFile.value,
      newAttachmentDescription.value || null,
      'calculation'
    );
    selectedFile.value = null;
    newAttachmentDescription.value = '';
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  } catch {
    // Ошибка уже обрабатывается в store
  }
};

const handleAttachmentDelete = async (attachmentId: number) => {
  if (!confirm('Вы уверены, что хотите удалить это вложение?')) {
    return;
  }
  attachmentStore.attachmentError = null;
  try {
    await attachmentStore.deleteAttachment(attachmentId);
  } catch {
    // Ошибка уже обрабатывается в store
  }
};

onMounted(async () => {
  try {
    // Очищаем поиск при загрузке страницы
    searchQuery.value = '';

    // Загружаем клиентов сначала для возможности поиска по ID
    if (clientStore.clients.length === 0) {
      await clientStore.fetchClients();
    }

    await calculationStore.loadHistory();
  } catch (error) {
    console.error('Error loading history:', error);
    notificationStore.showNotification('Ошибка при загрузке расчетов', 'error');
  }
});
</script>


<style scoped>
/*
  Все стили из OrdersView.vue скопированы сюда.
  Некоторые классы были адаптированы в шаблоне, чтобы соответствовать
  новой структуре и именам из OrdersView.
*/
.order-list-container {
  padding: 20px;
  max-width: 1400px;
  margin: 20px auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  box-sizing: border-box;
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

.controls-panel {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
  flex-wrap: wrap;
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
}

.add-button {
  background-color: #4CAF50;
  color: white;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-block;
  text-align: center;
  box-sizing: border-box;
  line-height: 1.4;
  white-space: nowrap;
  flex-shrink: 0;
}

.add-button:hover {
  background-color: #45a049;
}

/* Группа кнопок */
.button-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

/* Кнопка прайс-листа - менее заметная */
.price-list-button {
  background-color: #6c757d;
  color: white;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-block;
  text-align: center;
  box-sizing: border-box;
  line-height: 1.4;
  white-space: nowrap;
  flex-shrink: 0;
  opacity: 0.8;
  border-radius: 4px;
}

.price-list-button:hover {
  background-color: #5a6268;
  opacity: 1;
}

.btn {
  padding: 6px 12px;
  border: 1px solid transparent;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-block;
  text-align: center;
  vertical-align: middle;
  box-sizing: border-box;
  line-height: 1.4;
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

.btn-success {
  background-color: #28a745;
  color: white;
  border-color: #28a745;
}

.btn-success:hover {
  background-color: #218838;
  border-color: #1e7e34;
}

.btn-outline-success {
  background-color: transparent;
  color: #28a745;
  border-color: #28a745;
}

.btn-outline-success:hover {
  background-color: #28a745;
  color: white;
  border-color: #28a745;
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

.btn-danger {
  background-color: #dc3545;
  color: white;
  border-color: #dc3545;
}

.btn-danger:hover {
  background-color: #c82333;
  border-color: #bd2130;
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

.btn-info {
  background-color: #17a2b8;
  color: white;
  border-color: #17a2b8;
}

.btn-info:hover {
  background-color: #138496;
  border-color: #117a8b;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 10px;
  font-weight: 500;
  line-height: 1.2;
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
}

.status-message.loading-message-small,
.status-message.error-message-small,
.status-message.no-results-message-small {
  font-size: 0.85rem;
  padding: 5px 8px;
  margin: 5px auto 15px auto;
  max-width: 95%;
  border-radius: 3px;
  text-align: center;
  justify-content: center;
}

.loading-message-small .loader-small {
  margin-right: 5px;
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
  text-align: center;
  justify-content: center;
}

.no-results-message {
  background-color: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
  text-align: center;
  justify-content: center;
  flex-direction: column;
  gap: 10px;
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

.loader-small {
  display: inline-block;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  width: 12px;
  height: 12px;
  animation: spin 0.8s linear infinite;
  vertical-align: middle;
  margin-right: 4px;
}

.btn-danger .loader-small {
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
}

.status-message .loader-small {
  border: 2px solid rgba(133, 100, 4, 0.3);
  border-top-color: #856404;
}

.table-container {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
  background-color: #fff;
  margin-left: auto;
  margin-right: auto;
  max-width: 100%;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1000px;
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
  box-sizing: border-box;
  vertical-align: middle;
  word-break: break-word;
  white-space: normal;
}

th {
  font-weight: 600;
  color: #333;
  cursor: pointer;
  transition: background-color 0.2s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  position: relative;
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

tbody tr {
  border-bottom: 1px solid #eee;
  transition: background-color 0.2s;
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

th {
  border-top: none;
}

th.col-id,
td:nth-child(1) {
  text-align: center;
  width: 60px;
  min-width: 60px;
}

th.col-order-date,
td:nth-child(2) {
  min-width: 120px;
}

th.col-client,
td:nth-child(3) {
  min-width: 150px;
}

th.col-material,
td:nth-child(3) {
  min-width: 150px;
}

th.col-amount,
td:nth-child(4) {
  min-width: 100px;
  text-align: right;
}

th.col-order,
td:nth-child(5) {
  min-width: 100px;
  text-align: center;
}

th.col-order-date,
td:nth-child(6) {
  min-width: 120px;
}

th.col-actions,
td.actions-cell {
  width: auto;
  min-width: 150px;
  text-align: center;
  vertical-align: middle;
  padding-top: 8px;
  padding-bottom: 8px;
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

.order-link .btn {
  padding: 2px 6px;
  font-size: 11px;
  border-radius: 3px;
}

.text-muted {
  color: #6c757d !important;
}

.actions-cell {
  text-align: center;
}

.action-links-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.action-links-container .btn {
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
}

.action-links-container .btn::before {
  content: '?';
  font-size: 16px;
  font-family: sans-serif;
  line-height: 1;
  display: inline-block;
  vertical-align: middle;
  font-size: 16px !important;
}

.action-links-container .btn-warning::before {
  content: '\270E';
  color: #212529;
}

.action-links-container .btn-info::before {
  content: '\1F4CE';
  color: white;
}

.action-links-container .btn-primary::before {
  content: '\2139';
  color: white;
}

.action-links-container .btn-danger::before {
  content: '\1F5D1';
  color: white;
}

.action-links-container .btn.btn-sm {
  padding: 0 !important;
  font-size: 0 !important;
}

.delete-attachment-button {
  margin-left: auto;
  flex-shrink: 0;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  padding: 10px 0;
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
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.modal-content h2 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
  font-size: 1.5rem;
  text-align: center;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
  flex-shrink: 0;
}

.modal-divider {
  border: none;
  border-top: 1px solid #eee;
  margin: 20px 0;
  flex-shrink: 0;
}

.attachments-list {
  margin-bottom: 20px;
  flex-grow: 1;
  overflow-y: auto;
  min-height: 50px;
}

.attachments-list h3 {
  font-size: 1.1rem;
  margin-top: 0;
  margin-bottom: 15px;
  color: #555;
  position: sticky;
  top: 0;
  background: #fff;
  padding-bottom: 5px;
}

.attachments-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.attachments-list li.attachment-item {
  display: flex;
  align-items: center;
  padding: 8px 5px;
  border-bottom: 1px dashed #eee;
  font-size: 0.95rem;
  color: #333;
  gap: 10px;
  flex-wrap: wrap;
}

.attachment-item:last-child {
  border-bottom: none;
}

.attachment-item a {
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
  word-break: break-all;
  flex-grow: 1;
  margin-right: 10px;
}

.attachment-item a:hover {
  text-decoration: underline;
}

.attachment-item>span:not(.file-info) {
  color: #555;
  font-size: 0.9em;
  flex-basis: 100%;
  order: 2;
}

.attachment-item .file-info {
  font-size: 0.85rem;
  color: #666;
  flex-shrink: 0;
  white-space: nowrap;
  order: 1;
  margin-left: auto;
}

.attachment-item .delete-attachment-button {
  flex-shrink: 0;
  order: 3;
}

.upload-attachment-form {
  flex-shrink: 0;
}

.upload-attachment-form h3 {
  font-size: 1.1rem;
  margin-top: 0;
  margin-bottom: 15px;
  color: #555;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  font-size: 0.9rem;
  color: #555;
}

.form-group input[type="text"],
.form-group input[type="number"],
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
  transition: border-color 0.2s;
  background-color: #fff;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  border-color: #007bff;
  outline: none;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.form-group input[type="file"] {
  padding: 6px 10px;
  font-size: 0.9rem;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  width: 100%;
  box-sizing: border-box;
  cursor: pointer;
}

.form-group input[type="file"]::file-selector-button {
  padding: 6px 12px;
  margin-right: 10px;
  border: none;
  background-color: #007bff;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 0.85rem;
}

.form-group input[type="file"]::file-selector-button:hover {
  background-color: #0056b3;
}

.form-group textarea {
  min-height: 80px;
  resize: vertical;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 25px;
  padding-top: 15px;
  border-top: 1px solid #eee;
  flex-shrink: 0;
}

@media (max-width: 1200px) {
  .order-list-container {
    padding: 15px;
  }

  h1 {
    font-size: 1.8rem;
    margin-bottom: 20px;
  }

  .controls-panel {
    gap: 15px;
  }

  .add-button {
    padding: 8px 16px;
    font-size: 0.9rem;
  }

  .price-list-button {
    padding: 6px 10px;
    font-size: 11px;
  }

  .button {
    padding: 5px 10px;
    font-size: 11px;
  }

  .btn-sm {
    padding: 3px 7px;
    font-size: 10px;
  }

  th,
  td {
    padding: 8px 10px;
    font-size: 13px;
  }

  table {
    min-width: 800px;
  }

  th.col-id,
  td:nth-child(1) {
    width: 50px;
    min-width: 50px;
  }

  th.col-client,
  td:nth-child(2) {
    min-width: 140px;
  }

  th.col-material,
  td:nth-child(3) {
    min-width: 140px;
  }

  th.col-amount,
  td:nth-child(4) {
    min-width: 90px;
  }

  th.col-order,
  td:nth-child(5) {
    min-width: 90px;
  }

  th.col-order-date,
  td:nth-child(6) {
    min-width: 110px;
  }

  th.col-actions,
  td.actions-cell {
    min-width: 140px;
  }

  .action-links-container .btn {
    width: 30px;
    height: 30px;
    line-height: 30px;
  }

  .action-links-container .btn::before {
    font-size: 15px !important;
  }

  .status-badge {
    min-width: 50px;
    padding: 3px 7px;
    font-size: 11px;
  }

  .table-info-cell {
    padding: 14px;
    font-size: 14px;
  }

  .modal-content {
    max-width: 550px;
    padding: 20px;
  }

  .attachments-list li.attachment-item {
    gap: 8px;
    font-size: 0.9rem;
  }

  .attachment-item .file-info {
    font-size: 0.8rem;
  }

  .upload-attachment-form input[type="file"] {
    font-size: 0.85rem;
    padding: 5px 8px;
  }

  .upload-attachment-form input[type="file"]::file-selector-button {
    padding: 5px 10px;
    margin-right: 8px;
  }

  .form-group input[type="text"],
  .form-group textarea,
  .form-group select {
    font-size: 0.9rem;
    padding: 8px;
  }

}

@media (max-width: 992px) {
  .order-list-container {
    padding: 12px;
  }

  h1 {
    font-size: 1.7rem;
    margin-bottom: 20px;
  }

  .controls-panel {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .search-input {
    width: 100%;
    min-width: unset;
  }

  .add-button {
    width: 100%;
    text-align: center;
    padding: 10px 20px;
    font-size: 1rem;
  }

  .price-list-button {
    width: 100%;
    text-align: center;
    padding: 8px 16px;
    font-size: 0.9rem;
  }

  .button-group {
    flex-direction: column;
    width: 100%;
    gap: 8px;
  }

  .status-message {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .status-message:not(.error-message):not(.modal-error) {
    align-items: center;
    text-align: center;
  }

  th,
  td {
    padding: 8px 10px;
    font-size: 13px;
  }

  table {
    min-width: 750px;
  }

  th.col-id,
  td:nth-child(1) {
    width: 45px;
    min-width: 45px;
  }

  th.col-client,
  td:nth-child(2) {
    min-width: 130px;
  }

  th.col-material,
  td:nth-child(3) {
    min-width: 130px;
  }

  th.col-amount,
  td:nth-child(4) {
    min-width: 80px;
  }

  th.col-order,
  td:nth-child(5) {
    min-width: 80px;
  }

  th.col-order-date,
  td:nth-child(6) {
    min-width: 100px;
  }

  th.col-actions,
  td.actions-cell {
    min-width: 130px;
  }

  .status-badge {
    min-width: 45px;
    padding: 3px 6px;
    font-size: 11px;
  }

  .btn {
    padding: 5px 10px;
    font-size: 0.85rem;
  }

  .btn-sm {
    padding: 2px 6px;
    font-size: 9px;
  }

  .modal-content {
    max-width: 500px;
    padding: 15px;
  }

  .attachments-list li.attachment-item {
    gap: 6px;
    font-size: 0.85rem;
  }

  .attachment-item .file-info {
    font-size: 0.75rem;
  }

  .upload-attachment-form input[type="file"] {
    font-size: 0.8rem;
    padding: 4px 6px;
  }

  .upload-attachment-form input[type="file"]::file-selector-button {
    padding: 4px 8px;
    margin-right: 6px;
  }

  .form-group input[type="text"],
  .form-group textarea,
  .form-group select {
    font-size: 0.9rem;
    padding: 8px;
  }

}

@media (max-width: 768px) {
  .order-list-container {
    padding: 10px;
  }

  h1 {
    font-size: 1.6rem;
    margin-bottom: 15px;
  }

  .controls-panel {
    gap: 10px;
  }

  .status-message {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .status-message:not(.error-message):not(.modal-error) {
    align-items: center;
    text-align: center;
  }

  th,
  td {
    padding: 8px 10px;
    font-size: 12px;
  }

  table {
    min-width: 650px;
  }

  th.col-id,
  td:nth-child(1) {
    width: 40px;
    min-width: 40px;
  }

  th.col-client,
  td:nth-child(2) {
    min-width: 110px;
  }

  th.col-material,
  td:nth-child(3) {
    min-width: 110px;
  }

  th.col-amount,
  td:nth-child(4) {
    min-width: 75px;
  }

  th.col-order,
  td:nth-child(5) {
    min-width: 75px;
  }

  th.col-order-date,
  td:nth-child(6) {
    min-width: 90px;
  }

  th.col-actions,
  td.actions-cell {
    min-width: 120px;
    gap: 6px;
  }

  .action-links-container .btn {
    width: 28px;
    height: 28px;
    line-height: 28px;
  }

  .action-links-container .btn::before {
    font-size: 14px !important;
  }

  .status-badge {
    min-width: 40px;
    padding: 3px 6px;
    font-size: 10px;
  }

  .modal-content {
    max-width: 95%;
    padding: 15px;
  }

  .attachments-list li.attachment-item {
    flex-direction: row;
    align-items: center;
    gap: 6px;
    font-size: 0.8rem;
  }

  .attachment-item a {
    order: 0;
  }

  .attachment-item>span:not(.file-info) {
    order: 0;
    flex-basis: auto;
  }

  .attachment-item .file-info {
    order: 0;
    margin-left: 0;
  }

  .delete-attachment-button {
    order: 0;
    margin-left: auto;
  }

  .upload-attachment-form input[type="file"] {
    font-size: 0.75rem;
    padding: 3px 5px;
  }

  .upload-attachment-form input[type="file"]::file-selector-button {
    padding: 3px 6px;
    margin-right: 5px;
    font-size: 0.7rem;
  }

  .form-group input[type="text"],
  .form-group textarea,
  .form-group select {
    font-size: 0.8rem;
    padding: 6px;
  }

}

@media (max-width: 480px) {
  .order-list-container {
    padding: 8px;
  }

  h1 {
    font-size: 1.4rem;
    margin-bottom: 12px;
  }

  .controls-panel {
    gap: 8px;
  }

  .status-message {
    gap: 6px;
  }

  th,
  td {
    padding: 6px 8px;
    font-size: 11px;
  }

  table {
    min-width: 500px;
  }

  th.col-id,
  td:nth-child(1) {
    width: 35px;
    min-width: 35px;
  }

  th.col-client,
  td:nth-child(2) {
    min-width: 90px;
  }

  th.col-material,
  td:nth-child(3) {
    min-width: 90px;
  }

  th.col-amount,
  td:nth-child(4) {
    min-width: 65px;
  }

  th.col-order,
  td:nth-child(5) {
    min-width: 65px;
  }

  th.col-order-date,
  td:nth-child(6) {
    min-width: 75px;
  }

  th.col-actions,
  td.actions-cell {
    min-width: 110px;
    gap: 5px;
  }

  .action-links-container .btn {
    width: 26px;
    height: 26px;
    line-height: 26px;
  }

  .action-links-container .btn::before {
    font-size: 13px !important;
  }

  .status-badge {
    min-width: 35px;
    padding: 2px 4px;
    font-size: 9px;
  }

  .modal-content {
    padding: 10px;
  }

  .modal-content h2 {
    font-size: 1.3rem;
    margin-bottom: 15px;
    padding-bottom: 8px;
  }

  .attachments-list h3,
  .upload-attachment-form h3 {
    font-size: 1rem;
    margin-bottom: 10px;
  }

  .attachments-list li.attachment-item {
    padding: 6px 0;
    font-size: 0.75rem;
    gap: 4px;
  }

  .attachment-item .file-info {
    font-size: 0.7rem;
  }

  .attachment-item .delete-attachment-button {
    padding: 1px 4px;
    font-size: 8px;
  }

  .upload-attachment-form input[type="file"] {
    font-size: 0.7rem;
    padding: 2px 4px;
  }

  .upload-attachment-form input[type="file"]::file-selector-button {
    padding: 2px 5px;
    margin-right: 4px;
    font-size: 0.65rem;
  }

  .form-group input[type="text"],
  .form-group textarea,
  .form-group select {
    font-size: 0.75rem;
    padding: 5px;
  }

  .modal-actions {
    margin-top: 15px;
    padding-top: 10px;
  }

  .modal-actions .btn {
    padding: 4px 8px;
    font-size: 0.8rem;
  }
}
</style>
