<template>
  <div class="app-file-upload">
    <label :for="inputId" class="file-upload-label">
      <span v-if="!selectedFiles.length">
        <slot name="label">Выберите файлы</slot>
      </span>
      <span v-else>
        Выбрано файлов: {{ selectedFiles.length }}
      </span>
    </label>
    <input
      type="file"
      :id="inputId"
      :name="name"
      @change="handleFileChange"
      :multiple="multiple"
      class="file-upload-input"
    >
    <div v-if="selectedFiles.length" class="selected-files">
      <ul>
        <li v-for="(file, index) in selectedFiles" :key="index">
          {{ file.name }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface FileUploadProps {
  name?: string;
  multiple?: boolean;
  id?: string;
}

const props = withDefaults(defineProps<FileUploadProps>(), {
  name: 'files',
  multiple: false,
  id: `file-upload-${Math.random().toString(36).substring(2, 9)}`,
});

const emit = defineEmits(['files-changed']);

const selectedFiles = ref<File[]>([]);

const inputId = computed(() => props.id);

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    selectedFiles.value = Array.from(target.files);
    emit('files-changed', selectedFiles.value);
  } else {
    selectedFiles.value = [];
    emit('files-changed', []);
  }
};
</script>

<style scoped>
.app-file-upload {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 15px;
}

.file-upload-label {
  display: inline-block;
  padding: 10px 15px;
  background-color: #007bff;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  text-align: center;
}

.file-upload-label:hover {
  background-color: #0056b3;
}

.file-upload-input {
  display: none; /* Скрываем стандартный input file */
}

.selected-files {
  margin-top: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 10px;
  background-color: #f8f9fa;
}

.selected-files ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.selected-files li {
  padding: 5px 0;
  border-bottom: 1px solid #eee;
}

.selected-files li:last-child {
  border-bottom: none;
}
</style>
