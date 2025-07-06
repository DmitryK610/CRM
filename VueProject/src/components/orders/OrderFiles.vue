<template>
  <div class="order-files">
    <h3>Файлы заказа № {{ order.order_number }}</h3>

    <div v-if="isLoading">
      Загрузка файлов...
    </div>

    <div v-else-if="error">
      Ошибка загрузки файлов: {{ error }}
    </div>

    <div v-else-if="files && files.length > 0">
      <ul class="file-list">
        <li v-for="file in files" :key="file.id" class="file-item">
          <a :href="file.url" target="_blank" rel="noopener noreferrer">
            {{ file.name }}
          </a>
          <span class="file-size" v-if="file.size">({{ formatFileSize(file.size) }})</span>
          <button class="btn btn-danger btn-sm" @click="deleteFile(file.id)" title="Удалить файл" v-if="canDelete">
            Удалить
          </button>
        </li>
      </ul>
    </div>

    <div v-else>
      <p>Нет прикрепленных файлов.</p>
    </div>

    <div class="upload-section" v-if="canUpload">
      <h4>Загрузить новый файл</h4>
      <input type="file" @change="handleFileUpload">
      <button class="btn btn-primary btn-sm" @click="uploadFile" :disabled="!selectedFile">
        Загрузить
      </button>
      <div v-if="uploadProgress > 0" class="progress-bar">
        {{ uploadProgress }}%
      </div>
      <div v-if="uploadError" class="error-message">
        Ошибка загрузки файла: {{ uploadError }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
// Removed unused import
import { api } from '@/api'; // Предполагаем наличие api
import type { Order } from '@/types/order'; // Предполагаем наличие Order типа

interface OrderFile {
  id: number;
  name: string;
  url: string;
  size?: number;
  // Другие свойства файла, если есть
}

// Removed unused ApiResponse interface


const props = defineProps<{
  order: Order;
}>();

const order = props.order;
const files = ref<OrderFile[] | null>(null);
const isLoading = ref(false);
const error = ref<string | null>(null);

// Управление загрузкой файлов (опционально)
const canUpload = ref(true); // Определите свою логику прав доступа
const selectedFile = ref<File | null>(null);
const uploadProgress = ref(0);
const uploadError = ref<string | null>(null);

// Управление удалением файлов (опционально)
const canDelete = ref(true); // Определите свою логику прав доступа

onMounted(async () => {
  await fetchOrderFiles();
});

const fetchOrderFiles = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    // Замените '/api/orders/{orderId}/files/' на фактический URL вашего API для получения файлов заказа
    const response = await api.get<OrderFile[]>(`/api/orders/${order.id}/files/`);
    files.value = response;
  } catch (err) {
    error.value = (err as Error).message || 'Не удалось загрузить файлы заказа.';
  } finally {
    isLoading.value = false;
  }
};

const formatFileSize = (size: number): string => {
  if (size === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(size) / Math.log(k));
  return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0];
  } else {
    selectedFile.value = null;
  }
};

const uploadFile = async () => {
  if (!selectedFile.value) {
    return;
  }

  uploadProgress.value = 0;
  uploadError.value = null;
  isLoading.value = true; // Можно использовать отдельный флаг загрузки для загрузки файлов

  try {
    const formData = new FormData();
    formData.append('file', selectedFile.value);
    formData.append('order_id', String(order.id)); // Передача ID заказа на сервер

    // Замените '/api/orders/{orderId}/files/upload/' на фактический URL вашего API для загрузки файлов
    const response = await api.post<FormData, OrderFile>(`/api/orders/${order.id}/files/upload/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      } as Record<string, string>,
      onUploadProgress: (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
        uploadProgress.value = progress;
      },
    });

    if (response) {
      files.value = [...(files.value || []), response]; // Добавить загруженный файл в список
      selectedFile.value = null;
      // Сбросить поле выбора файла
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (input) {
        input.value = '';
      }
    }
  } catch (err: unknown) {
    uploadError.value = (err as Error).message || 'Ошибка при загрузке файла.';
  } finally {
    isLoading.value = false; // Сбросить флаг загрузки
  }
};

const deleteFile = async (fileId: number) => {
  if (!canDelete.value || !confirm('Вы уверены, что хотите удалить этот файл?')) {
    return;
  }

  isLoading.value = true; // Можно использовать отдельный флаг загрузки для удаления файлов
  error.value = null;

  try {
    // Замените '/api/orders/files/{fileId}/' на фактический URL вашего API для удаления файлов
    await api.delete(`/api/orders/files/${fileId}/`);
    files.value = files.value?.filter(file => file.id !== fileId) || [];
  } catch (err: unknown) {
    error.value = (err as Error).message || 'Не удалось удалить файл.';
  } finally {
    isLoading.value = false; // Сбросить флаг загрузки
  }
};
</script>

<style scoped>
.order-files {
  padding: 20px;
}

h3 {
  margin-bottom: 15px;
}

.file-list {
  list-style: none;
  padding: 0;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.file-item:last-child {
  border-bottom: none;
}

.file-item a {
  text-decoration: none;
  color: #007bff;
}

.file-item a:hover {
  text-decoration: underline;
}

.file-size {
  font-size: 0.8em;
  color: #777;
  margin-left: 10px;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.8em;
  margin-left: 10px;
}

.btn-danger:hover {
  background-color: #c82333;
}

.upload-section {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.upload-section h4 {
  margin-bottom: 10px;
}

.btn-primary {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9em;
  margin-top: 10px;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.progress-bar {
  margin-top: 10px;
  font-size: 0.9em;
  color: #555;
}

.error-message {
  color: red;
  margin-top: 10px;
  font-size: 0.9em;
}
</style>
