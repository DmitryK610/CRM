<template>
  <div class="app-pagination">
    <button
      :disabled="currentPage === 1"
      @click="emit('page-changed', currentPage - 1)"
      class="pagination-button"
    >
      Предыдущая
    </button>
    <span class="page-info">
      Страница {{ currentPage }} из {{ totalPages }}
    </span>
    <button
      :disabled="currentPage === totalPages"
      @click="emit('page-changed', currentPage + 1)"
      class="pagination-button"
    >
      Следующая
    </button>
    </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, computed, ref } from 'vue';

const props = defineProps({
  totalItems: {
    type: Number,
    required: true,
  },
  currentPage: {
    type: Number,
    required: true,
  },
  pageSize: {
    type: Number,
    default: 10,
  },
});

const emit = defineEmits(['page-changed']);

const totalPages = computed(() => Math.ceil(props.totalItems / props.pageSize) || 1);

// const goToPage = ref(props.currentPage);
// const goToSpecificPage = () => {
//   if (goToPage.value >= 1 && goToPage.value <= totalPages.value) {
//     emit('page-changed', goToPage.value);
//   }
// };
</script>

<style scoped>
.app-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 5px;
  border: 1px solid #ddd;
}

.pagination-button {
  padding: 8px 15px;
  margin: 0 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: white;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.pagination-button:hover {
  background-color: #eee;
}

.pagination-button:disabled {
  background-color: #ddd;
  color: #777;
  cursor: not-allowed;
}

.page-info {
  font-size: 0.9em;
  color: #555;
}

.page-number-input {
  display: flex;
  align-items: center;
  margin-left: 20px;
}

.page-number-input input[type="number"] {
  width: 50px;
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 3px;
  margin-right: 5px;
  text-align: center;
}

.page-number-input button {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: white;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.page-number-input button:hover {
  background-color: #eee;
}

.page-number-input button:disabled {
  background-color: #ddd;
  color: #777;
  cursor: not-allowed;
}
</style>
