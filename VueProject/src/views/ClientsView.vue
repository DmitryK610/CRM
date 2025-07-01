<template>
  <div class="client-list-view">
    <h1>Список клиентов</h1>
    <div class="controls-panel">
      <input type="text" v-model="searchInputValue" placeholder="Поиск клиентов..."
        @input="handleSearch(searchInputValue)" class="search-input" />
      <router-link to="/clients/add" class="button add-button">Добавить клиента</router-link>
    </div>
    <div v-if="clientStore.error" class="error-message">Ошибка загрузки клиентов: {{ clientStore.error }}</div>
    <template v-else>
      <div v-if="clientStore.getClients && clientStore.getClients.length > 0">
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th class="col-id">№</th>
                <th class="col-name">Имя</th>
                <th class="col-email">Email</th>
                <th class="col-phone">Телефон</th>
                <th class="col-address">Адрес</th>
                <th class="col-actions">Действия</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="client in clientStore.getClients" :key="client.id">
                <td>{{ client.id }}</td>
                <td>{{ client.full_name }}</td>
                <td>{{ client.email }}</td>
                <td>{{ client.contact_phone }}</td>
                <td>{{ client.address }}</td>
                <td class="actions-cell">
                  <router-link :to="`/clients/${client.id}/edit`" class="button edit-button"
                    title="Редактировать">Редактировать</router-link>
                  <router-link :to="`/clients/${client.id}`" class="button view-button"
                    title="Подробнее">Подробнее</router-link>
                  <button @click="openDeleteConfirmation(client.id)" class="button delete-button"
                    title="Удалить">Удалить</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <app-modal :is-open="isDeleteConfirmationOpen" @close="closeDeleteConfirmation">
          <template #header>
            <h2>Подтверждение удаления</h2>
          </template>
          <template #body>
            <p>Вы уверены, что хотите удалить клиента с ID {{ clientToDelete }}?</p>
          </template>
          <template #footer>
            <button @click="deleteClient" class="button delete-confirm-button">Удалить</button>
            <button @click="closeDeleteConfirmation" class="button cancel-button">Отмена</button>
          </template>
        </app-modal>
      </div>
      <div v-else class="no-results-message">
        Нет доступных клиентов.
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useClientStore } from '@/stores';
import AppModal from '@/components/ui/AppModal.vue';

const clientStore = useClientStore();

const isDeleteConfirmationOpen = ref(false);
const clientToDelete = ref<number | null>(null);

const searchQuery = ref('');
const searchInputValue = ref('');

const handleSearch = (query: string) => {
  searchQuery.value = query;
  fetchClients();
};

const fetchClients = async () => {
  await clientStore.fetchClients(searchQuery.value);
};

const openDeleteConfirmation = (id: number) => {
  clientToDelete.value = id;
  isDeleteConfirmationOpen.value = true;
};

const closeDeleteConfirmation = () => {
  isDeleteConfirmationOpen.value = false;
  clientToDelete.value = null;
};

const deleteClient = async () => {
  if (clientToDelete.value) {
    await clientStore.deleteClient(clientToDelete.value);
    closeDeleteConfirmation();
    fetchClients();
  }
};

onMounted(() => {
  fetchClients();
});
</script>

<style scoped>
.client-list-view {
  padding: 24px;
  max-width: 1400px;
  margin: 20px auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
  box-sizing: border-box;
  background-color: white;
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

.error-message {
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
  background-color: #ffebee;
  color: #d32f2f;
  border: 1px solid #ef9a9a;
}

.no-results-message {
  padding: 24px;
  text-align: center;
  color: #666;
  font-style: italic;
  margin-top: 20px;
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
  min-width: 800px;
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

tbody tr:last-child {
  border-bottom: none;
}

tbody tr:hover {
  background-color: #f9f9f9;
}

th.col-id,
td:nth-child(1) {
  text-align: center;
  width: 60px;
  min-width: 60px;
}

th.col-name,
td:nth-child(2) {
  min-width: 150px;
}

th.col-email,
td:nth-child(3) {
  min-width: 180px;
  word-break: break-all;
}

th.col-phone,
td:nth-child(4) {
  min-width: 120px;
}

th.col-address,
td:nth-child(5) {
  min-width: 200px;
  word-break: break-word;
}

th.col-actions {
  text-align: center;
  min-width: 140px;
  width: auto;
}

td.actions-cell {
  text-align: center;
  vertical-align: middle;
  padding-top: 8px;
  padding-bottom: 8px;
}

td {
  white-space: normal;
  word-break: break-word;
}

.actions-cell {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
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

.add-button {
  background-color: #4CAF50;
  color: white;
  padding: 8px 16px;
  font-size: 14px;
  white-space: nowrap;
  flex-shrink: 0;
}

.add-button:hover {
  background-color: #45a049;
}

.view-button {
  background-color: #1976d2;
  color: white;
}

.edit-button {
  background-color: #ffc107;
  color: #333;
}

.delete-button {
  background-color: #f44336;
  color: white;
}

.actions-cell .button {
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

.actions-cell .button::before {
  content: '?';
  font-size: 16px;
  font-family: sans-serif;
  line-height: 1;
  display: inline-block;
  vertical-align: middle;
  color: inherit;
}

.actions-cell .view-button::before {
  content: '\2139';
  color: white;
}

.actions-cell .edit-button::before {
  content: '\270E';
  color: #333;
}

.actions-cell .delete-button::before {
  content: '\1F5D1';
  color: white;
}

.delete-confirm-button {
  background-color: #f44336;
  color: white;
  border-color: #f44336;
}

.delete-confirm-button:hover {
  background-color: #d32f2f;
  border-color: #d32f2f;
}

.cancel-button {
  background-color: #e0e0e0;
  color: #333;
  border-color: #e0e0e0;
}

.cancel-button:hover {
  background-color: #d5d5d5;
  border-color: #d5d5d5;
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
  background-color: #f8f9fa;
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
</style>
