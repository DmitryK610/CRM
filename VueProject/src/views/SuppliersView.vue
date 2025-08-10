<template>
  <div class="supplier-list-view">
    <h1>Поставщики</h1>

    <div class="controls-panel">
    </div>

    <div v-if="supplierStore.getError" class="status-message error-message">
      ⚠️ Ошибка загрузки поставщиков: {{ supplierStore.getError }}
    </div>

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th class="col-id">№</th>
            <th class="col-name">Название</th>
            <th class="col-contact-person">Контактное лицо</th>
            <th class="col-email">Email</th>
            <th class="col-phone">Телефон</th>
            <th class="col-address">Адрес</th>
            <th class="col-material">Материал</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="supplier in supplierStore.getSuppliers" :key="supplier.id">
            <td>{{ supplier.id }}</td>
            <td>{{ supplier.company_name }}</td>
            <td>{{ supplier.contact_person }}</td>
            <td>{{ supplier.email }}</td>
            <td>{{ supplier.phone }}</td>
            <td>{{ supplier.supplier_address }}</td>
            <td>{{ supplier.note }}</td>
          </tr>
          <tr v-if="!supplierStore.getIsLoading && supplierStore.getSuppliers.length === 0">
            <td colspan="7" style="text-align:center; color:#856404; background:#fff3cd;">
              Нет доступных поставщиков.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useSupplierStore } from '@/stores/supplierStore';

const supplierStore = useSupplierStore();

onMounted(() => {
  supplierStore.clearError();

  if (supplierStore.getSuppliers.length > 0) {
    supplierStore.fetchSuppliers({ keepCache: true }).catch(() => {});
  }
});
</script>

<style scoped>
.supplier-list-view {
  padding: 20px;
  max-width: 1400px;
  margin: 20px auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
}

h1 {
  color: #007bff;
  text-align: center;
  margin-bottom: 25px;
  font-size: 1.8rem;
  font-weight: 600;
text-align: left;
margin: 0;
}

.controls-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
  flex-wrap: wrap;
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
  box-sizing: border-box;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.no-results-message {
  background-color: #fff3cd;
  color: #856404;
  border: 1px solid #ffeeba;
  text-align: center;
  justify-content: center;
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
  word-break: break-word;
  white-space: normal;
}

thead tr:first-child th {
  border-top: none;
}

tr th:first-child,
tr td:first-child {
  border-left: none;
}

tr th:last-child,
tr td:last-child {
  border-right: none;
}

th {
  font-weight: 600;
  color: #333;
  transition: background-color 0.2s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  position: relative;
}

th:hover {
  background-color: #ebebeb;
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
  min-width: 60px;
}

th.col-name,
td:nth-child(2) {
  min-width: 150px;
}

th.col-contact-person,
td:nth-child(3) {
  min-width: 120px;
}

th.col-email,
td:nth-child(4) {
  min-width: 150px;
  word-break: break-all;
}

th.col-phone,
td:nth-child(5) {
  min-width: 120px;
}

th.col-address,
td:nth-child(6) {
  min-width: 150px;
  word-break: break-word;
}

th.col-material,
td:nth-child(7) {
  min-width: 120px;
  word-break: break-word;
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  flex-shrink: 0;
  box-sizing: border-box;
  white-space: nowrap;
}


td :is(.btn, .btn-sm, .btn-primary, .btn-secondary, .btn-outline-primary, .btn-info, .btn-warning, .btn-danger) {
  display: inline-flex;
  margin-left: auto;
  margin-right: auto;
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
  border-color: #218838;
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

.btn-sm {
  padding: 5px 10px;
  font-size: 0.85rem;
  font-weight: 500;
}

@media (max-width: 1200px) {
  .supplier-list-view {
    padding: 15px;
  }

  h1 {
    font-size: 1.8rem;
    margin-bottom: 20px;
  }

  th,
  td {
    padding: 8px 10px;
    font-size: 13px;
  }

  th.col-id,
  td:nth-child(1) {
    min-width: 50px;
  }

  th.col-name,
  td:nth-child(2) {
    min-width: 120px;
  }

  th.col-contact-person,
  td:nth-child(3) {
    min-width: 100px;
  }

  th.col-email,
  td:nth-child(4) {
    min-width: 120px;
  }

  th.col-phone,
  td:nth-child(5) {
    min-width: 100px;
  }

  th.col-address,
  td:nth-child(6) {
    min-width: 120px;
  }

  th.col-material,
  td:nth-child(7) {
    min-width: 100px;
  }
}

@media (max-width: 992px) {
  .supplier-list-view {
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

  th,
  td {
    padding: 6px 8px;
    font-size: 12px;
  }

  th.col-id,
  td:nth-child(1) {
    min-width: 40px;
  }

  th.col-name,
  td:nth-child(2) {
    min-width: 100px;
  }

  th.col-contact-person,
  td:nth-child(3) {
    min-width: 90px;
  }

  th.col-email,
  td:nth-child(4) {
    min-width: 100px;
  }

  th.col-phone,
  td:nth-child(5) {
    min-width: 90px;
  }

  th.col-address,
  td:nth-child(6) {
    min-width: 100px;
  }

  th.col-material,
  td:nth-child(7) {
    min-width: 90px;
  }
}

@media (max-width: 768px) {
  .supplier-list-view {
    padding: 10px;
  }

  h1 {
    font-size: 1.6rem;
    margin-bottom: 15px;
  }

  th,
  td {
    padding: 5px 6px;
    font-size: 11px;
  }

  th.col-id,
  td:nth-child(1) {
    min-width: 30px;
  }

  th.col-name,
  td:nth-child(2) {
    min-width: 80px;
  }

  th.col-contact-person,
  td:nth-child(3) {
    min-width: 70px;
  }

  th.col-email,
  td:nth-child(4) {
    min-width: 80px;
  }

  th.col-phone,
  td:nth-child(5) {
    min-width: 70px;
  }

  th.col-address,
  td:nth-child(6) {
    min-width: 80px;
  }

  th.col-material,
  td:nth-child(7) {
    min-width: 70px;
  }
}

@media (max-width: 480px) {
  .supplier-list-view {
    padding: 8px;
  }

  h1 {
    font-size: 1.5rem;
    margin-bottom: 12px;
  }

  th,
  td {
    padding: 4px 5px;
    font-size: 10px;
  }

  th.col-id,
  td:nth-child(1) {
    min-width: 25px;
  }

  th.col-name,
  td:nth-child(2) {
    min-width: 70px;
  }

  th.col-contact-person,
  td:nth-child(3) {
    min-width: 60px;
  }

  th.col-email,
  td:nth-child(4) {
    min-width: 70px;
  }

  th.col-phone,
  td:nth-child(5) {
    min-width: 60px;
  }

  th.col-address,
  td:nth-child(6) {
    min-width: 70px;
  }

  th.col-material,
  td:nth-child(7) {
    min-width: 60px;
  }
}
</style>
