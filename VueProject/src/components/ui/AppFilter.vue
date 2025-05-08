
<template>
  <div class="app-filter">
    <h3>Фильтры</h3>
    <div v-for="option in filterOptions" :key="option.key" class="filter-item">
      <label :for="option.key">{{ option.label }}</label>
      <input
        type="text"
        :id="option.key"
        :name="option.key"
        v-model="filters[option.key]"
        class="filter-input"
        :placeholder="option.placeholder || ''"
      />
    </div>
    <button @click="clearFilters" class="clear-button">Сбросить фильтры</button>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, watch } from 'vue';

interface FilterOption {
  key: string;
  label: string;
  type?: 'text' | 'select' | 'date' | 'number'; // Дополнительные типы фильтров
  options?: { value: any; label: string }[]; // Для select
  placeholder?: string;
}

const props = defineProps({
  filterOptions: {
    type: Array as () => FilterOption[],
    required: true,
  },
});

const emit = defineEmits(['filter-changed']);

const filters = ref<{ [key: string]: any }>({});

// Инициализация фильтров пустыми значениями
props.filterOptions.forEach(option => {
  filters.value[option.key] = '';
});

watch(filters, (newFilters) => {
  emit('filter-changed', newFilters);
}, { deep: true });

const clearFilters = () => {
  props.filterOptions.forEach(option => {
    filters.value[option.key] = '';
  });
};
</script>

<style scoped>
.app-filter {
  background-color: #f8f9fa;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  margin-bottom: 20px;
}

.app-filter h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 1.2em;
}

.filter-item {
  margin-bottom: 10px;
}

.filter-item label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  font-size: 0.9em;
  color: #333;
}

.filter-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 0.9em;
}

.clear-button {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9em;
  margin-top: 15px;
}

.clear-button:hover {
  background-color: #d32f2f;
}
</style>
