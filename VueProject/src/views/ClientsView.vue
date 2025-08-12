<template>
  <div class="client-list-view">
    <div class="header-actions">
      <h1>Клиенты</h1>
      <button type="button" class="btn add-button" @click="openCreateClientModal" title="Добавить клиента">
        <span class="material-symbols-outlined">add</span>
      </button>
    </div>
    <input
      type="text"
      v-model="searchInputValue"
      placeholder="Поиск клиентов..."
      @input="handleSearch(searchInputValue)"
      class="search-input full-width-search"
    />
    <div v-if="clientStore.error" class="error-message">Ошибка загрузки клиентов: {{ clientStore.error }}</div>
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
          <tr v-if="(!clientStore.getClients || clientStore.getClients.length === 0)">
            <td colspan="6" style="text-align:center;">
              <template v-if="clientStore.isLoading">
                <span class="loader-small"></span> Загрузка клиентов...
              </template>
              <template v-else>
                Нет доступных клиентов.
              </template>
            </td>
          </tr>
          <tr v-for="client in clientStore.getClients" :key="client.id">
            <td>{{ client.id }}</td>
            <td>{{ client.full_name }}</td>
            <td>{{ client.email }}</td>
            <td>{{ client.contact_phone }}</td>
            <td>{{ client.address }}</td>
            <td class="actions-cell">
              <div class="action-links-container">
                <button @click="openEditClientModal(client.id)" class="btn btn-warning" title="Редактировать" aria-label="Редактировать данные клиента">
                  <span class="material-symbols-outlined">edit</span>
                  <span class="btn-text">Редактировать</span>
                </button>
                <button @click="openClientDetailModal(client.id)" class="btn btn-primary" title="Подробнее" aria-label="Подробнее о клиенте">
                  <span class="material-symbols-outlined">visibility</span>
                  <span class="btn-text">Подробнее</span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Client create/edit modal -->
    <app-modal :is-open="isClientFormOpen" @close="closeClientFormModal" :title="clientFormTitle">
      <ClientForm :isModal="true" :modalClientId="clientFormClientId" @close="closeClientFormModal" @saved="handleClientSaved" />
    </app-modal>

    <!-- Client detail modal -->
    <app-modal :is-open="isClientDetailOpen" @close="closeClientDetailModal" title="Детали клиента">
      <ClientDetailView :isModal="true" :modalClientId="clientDetailId" @close="closeClientDetailModal" />
    </app-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useClientStore } from '@/stores';
import AppModal from '@/components/ui/AppModal.vue';
import ClientForm from '@/components/clients/ClientForm.vue';
import ClientDetailView from '@/components/clients/ClientDetailView.vue';

const clientStore = useClientStore();


const isClientFormOpen = ref(false);
const clientFormClientId = ref<number | null>(null);
const isClientDetailOpen = ref(false);
const clientDetailId = ref<number | null>(null);
const clientFormTitle = computed(() => clientFormClientId.value ? 'Редактировать данные клиента' : 'Добавить клиента');

const openCreateClientModal = () => { clientFormClientId.value = null; isClientFormOpen.value = true; };
const openEditClientModal = (id: number) => { clientFormClientId.value = id; isClientFormOpen.value = true; };
const closeClientFormModal = () => { isClientFormOpen.value = false; };
const handleClientSaved = async () => { isClientFormOpen.value = false; await fetchClients(); };

const openClientDetailModal = async (id: number) => {

  try { await clientStore.fetchClientById(id); } catch {}
  clientDetailId.value = id; isClientDetailOpen.value = true;
};
const closeClientDetailModal = () => { isClientDetailOpen.value = false; clientDetailId.value = null; };

const searchQuery = ref('');
const searchInputValue = ref('');

const handleSearch = (query: string) => {
  searchQuery.value = query;
  fetchClients();
};

const fetchClients = async () => {
  await clientStore.fetchClients(searchQuery.value);
};

onMounted(async () => {
  if (!clientStore.getClients || clientStore.getClients.length === 0) {
    await clientStore.fetchClients();
  } else {
    clientStore.fetchClients({ keepCache: true }).catch(() => {});
  }
});
</script>

<style scoped>
.client-list-view {
  padding: 20px 24px;
  max-width: var(--max-container-width);
  margin: 20px auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
  box-sizing: border-box;
  background-color: white;
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

.full-width-search {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  margin-bottom: 20px;
  box-sizing: border-box;
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
  box-sizing: border-box;
  vertical-align: middle;
  min-height: 30px;
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

th.col-id,
td:nth-child(1) {
  text-align: left;
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

th.col-actions,
td.actions-cell {
  text-align: center;
  min-width: 140px;
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
  gap: 4px; /* reduced spacing */
  flex-wrap: wrap;
}

.btn {
  padding: 7px 13px;
  border: 1px solid transparent;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 30px;
  gap: 8px;
}

.btn:hover {
  opacity: 0.85;
}

.btn-primary {
  background-color: #1976d2;
  color: white;
}

.btn-warning {
  background-color: #ffc107;
  color: #333;
}


.header-actions .add-button { margin-left: 16px; }

@media (max-width: 768px) {
  .client-list-view {
    padding: 0 15px; /* unified padding */
  }

  .header-actions h1 {
    font-size: 1.6rem;
    text-align: center;
  }

  
  .header-actions { gap: 12px; }
  .header-actions .add-button { margin: 8px auto 0; }

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