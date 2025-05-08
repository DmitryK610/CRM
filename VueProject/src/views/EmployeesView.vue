<template>
  <div class="employees-container">
    <h1>Список сотрудников</h1>
    <div v-if="employeeStore.error" class="status-message error-message">
      ⚠️ Ошибка загрузки сотрудников: {{ employeeStore.error }}
    </div>
    <div v-else>
      <div v-if="employeeStore.getEmployees && employeeStore.getEmployees.length > 0" class="employees-list-table">
        <div class="table-header">
          <div class="header-cell col-id">ID</div>
          <div class="header-cell col-name">Имя</div>
          <div class="header-cell col-phone">Телефон</div>
          <div class="header-cell col-position">Должность</div>
          <div class="header-cell col-hired-date">Дата приема</div>
        </div>
        <div v-for="employee in employeeStore.getEmployees" :key="employee.id" class="table-row">
          <div class="table-cell col-id">{{ employee.id }}</div>
          <div class="table-cell col-name">{{ employee.full_name || '---' }}</div>
          <div class="table-cell col-phone">{{ employee.phone || '---' }}</div>
          <div class="table-cell col-position">{{ employee.position || '---' }}</div>
          <div class="table-cell col-hired-date">{{ formatDate(employee.hired_date) || '---' }}</div>
        </div>
      </div>
      <div v-else class="status-message no-results-message">
        Нет доступных сотрудников.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useEmployeeStore } from '@/stores/employeeStore';
import { formatDate } from '@/utils/date';

const employeeStore = useEmployeeStore();

onMounted(async () => {
  try {
    await employeeStore.fetchEmployees();
  } catch (err) {
    console.error('Ошибка при загрузке сотрудников:', err);
  }
});
</script>

<style scoped>
.employees-container {
  padding: 20px;
  max-width: 1200px;
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
  font-size: 2rem;
  font-weight: 600;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
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

.employees-list-table {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  margin: 20px auto;
  max-width: 100%;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
}

.table-header,
.table-row {
  display: grid;
  grid-template-columns: 60px minmax(150px, 1.5fr) 150px 150px 120px;
  min-width: 680px;
}

.table-header {
  background-color: #f5f5f5;
  font-weight: 600;
  color: #333;
  font-size: 14px;
  border-bottom: 1px solid #e0e0e0;
}

.header-cell,
.table-cell {
  padding: 10px 12px;
  border-right: 1px solid #e0e0e0;
  box-sizing: border-box;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: flex;
  align-items: center;
}

.header-cell:last-child,
.table-cell:last-child {
  border-right: none;
}

.table-row {
  border-bottom: 1px solid #eee;
  transition: background-color 0.2s;
}

.table-row:hover {
  background-color: #f9f9f9;
}

.col-id {
  justify-content: center;
}

@media (max-width: 992px) {
  .employees-container {
    padding: 15px;
    margin: 15px auto;
  }

  h1 {
    font-size: 1.8rem;
    margin-bottom: 20px;
  }

  .employees-list-table {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .table-header,
  .table-row {
    grid-template-columns: 60px minmax(150px, 1.5fr) 150px 150px 120px;
    min-width: 660px;
  }

  .header-cell,
  .table-cell {
    padding: 10px 12px;
    font-size: 13px;
  }
}

@media (max-width: 768px) {
  .employees-container {
    padding: 10px;
    margin: 10px auto;
  }

  h1 {
    font-size: 1.6rem;
    margin-bottom: 15px;
  }

  .status-message {
    padding: 10px;
    font-size: 0.9rem;
    flex-direction: column;
    align-items: flex-start;
  }

  .status-message:not(.error-message) {
    justify-content: center;
    align-items: center;
    text-align: center;
  }

  .table-header,
  .table-row {
    grid-template-columns: 50px 150px 120px 120px 100px;
    min-width: 540px;
  }

  .header-cell,
  .table-cell {
    padding: 8px 10px;
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .employees-container {
    padding: 8px;
    margin: 8px auto;
  }

  h1 {
    font-size: 1.4rem;
    margin-bottom: 12px;
  }

  .status-message {
    padding: 8px;
    font-size: 0.85rem;
    gap: 6px;
  }

  .table-header,
  .table-row {
    grid-template-columns: 40px 120px 100px 100px 90px;
    min-width: 450px;
  }

  .header-cell,
  .table-cell {
    padding: 6px 8px;
    font-size: 11px;
  }
}
</style>
