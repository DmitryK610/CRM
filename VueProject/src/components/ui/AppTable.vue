<template>
  <div class="app-table-container">
    <table class="app-table">
      <thead>
        <tr>
          <th v-for="column in columns" :key="column.key">
            {{ column.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="data.length === 0">
          <td :colspan="columns.length">Нет данных для отображения.</td>
        </tr>
        <tr v-else v-for="item in data" :key="item.id || item.name || item.title || Math.random()">
          <td v-for="column in columns" :key="column.key">
            {{ item[column.key] }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

interface Column {
  key: string;
  label: string;
}

defineProps({
  data: {
    type: Array as () => any[],
    required: true,
  },
  columns: {
    type: Array as () => Column[],
    required: true,
  },
});
</script>

<style scoped>
.app-table-container {
  overflow-x: auto; /* Добавляем горизонтальную прокрутку для больших таблиц */
}

.app-table {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
  margin-bottom: 15px;
  background-color: #fff;
  border: 1px solid #ddd;
}

.app-table th,
.app-table td {
  padding: 10px 15px;
  border-bottom: 1px solid #eee;
  text-align: left;
}

.app-table th {
  background-color: #f8f9fa;
  font-weight: bold;
}

.app-table tbody tr:last-child td {
  border-bottom: none;
}

.app-table tbody tr:nth-child(even) {
  background-color: #f9f9f9;
}

/* Дополнительные стили могут быть добавлены здесь */
</style>
