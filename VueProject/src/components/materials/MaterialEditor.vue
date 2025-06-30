<template>
  <div class="material-editor-view">
    <h1>{{ materialId ? 'Редактировать материал' : 'Добавить материал' }}</h1>



    <form v-if="true" @submit.prevent="handleSubmit" class="editor-form">
      <div class="form-group">
        <label for="material_name">Название:</label>
        <input type="text" id="material_name" v-model="formData.material_name" required>
      </div>
      <div class="form-group">
        <label for="color_code">Артикул цвета:</label>
        <input type="text" id="color_code" v-model="formData.color_code">
      </div>
      <div class="form-group">
        <label for="note">Примечание:</label>
        <textarea id="note" v-model="formData.note"></textarea>
      </div>
      <div class="form-group">
        <label for="cost">Стоимость материала (₽):</label>
        <input type="number" id="cost" v-model.number="formData.cost" required min="0" step="0.01">
      </div>

      <div class="form-group">
        <label for="cost_per_sqm">Стоимость за м² изделия (₽):</label>
        <input type="number" id="cost_per_sqm" v-model.number="formData.cost_per_sqm" required min="0" step="0.01">
      </div>

      <div class="form-group">
        <label for="supplierSelect">Поставщик:</label>
        <select id="supplierSelect" v-model.number="formData.supplierId" required
          :disabled="!!(supplierStore.isLoading || supplierStore.error || availableSuppliers.length === 0)">
          <option :value="null" disabled selected>-- Выберите поставщика --</option>
          <option v-for="supplier in availableSuppliers" :key="supplier.id" :value="supplier.id">
            {{ supplier.company_name }}
          </option>
        </select>
        <div v-if="supplierStore.isLoading" class="loading-message-small">Загрузка поставщиков...</div>
        <div v-else-if="supplierStore.error" class="error-message-small">Ошибка загрузки поставщиков.</div>
        <div v-else-if="availableSuppliers.length === 0 && !supplierStore.isLoading && !supplierStore.error"
          class="no-results-message-small">Нет доступных поставщиков.</div>
      </div>

      <div v-if="saveError" class="status-message error-message">
        ⚠️ Ошибка сохранения: {{ saveError }}
      </div>

      <div class="form-actions">
        <button type="button" @click="handleCancel" class="btn btn-secondary" :disabled="isSaving">Отмена</button>
        <button type="submit" class="btn btn-primary"
          :disabled="!!(isSaving || supplierStore.isLoading || supplierStore.error || availableSuppliers.length === 0)">
          <span v-if="isSaving" class="loader-small"></span>
          {{ isSaving ? 'Сохранение...' : 'Сохранить' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMaterialStore } from '@/stores/materialStore';
import { useSupplierStore } from '@/stores/supplierStore';
import type { Material } from '@/types/material';
import type { Supplier } from '@/types/supplier';

const route = useRoute();
const router = useRouter();
const materialStore = useMaterialStore();
const supplierStore = useSupplierStore();


const materialId = computed(() => route.params.id ? Number(route.params.id) : null);

// Состояние формы
const DEFAULT_MATERIAL: Partial<Material> = {
  material_name: '',
  color_code: '',
  note: '',
  cost: 0,
  cost_per_sqm: 0,
};
const formData = reactive({
  ...DEFAULT_MATERIAL,
  supplierId: undefined as number | undefined,
});

// Состояние загрузки/ошибок для редактора (при загрузке данных материала)
const isLoadingEditor = ref(false);
const editorError = ref<string | null>(null);

// Состояние сохранения (при отправке формы)
const isSaving = ref(false);
const saveError = ref<string | null>(null);

// Вычисляемое свойство для доступных поставщиков
const availableSuppliers = computed<Supplier[]>(() => {
  const suppliers = Array.isArray(supplierStore.suppliers) ? supplierStore.suppliers : [];
  return suppliers;
});


// Функция загрузки данных материала для редактирования
const fetchMaterial = async (id: number) => {
  isLoadingEditor.value = true;
  editorError.value = null;
  try {

    const material = await materialStore.fetchMaterialById(id);
    if (material) {

      Object.assign(formData, {
        ...material,
        supplierId: typeof material.supplier_details?.id === 'number' ? material.supplier_details.id : null,
      });
    } else {
      editorError.value = `Материал с ID ${id} не найден.`;
    }
  } catch (err: unknown) {
    editorError.value = (err as Error).message || 'Не удалось загрузить данные материала.';
  } finally {
    isLoadingEditor.value = false;
  }
};

// Функция загрузки поставщиков
const fetchSuppliers = async () => {

  await supplierStore.fetchSuppliers();
};


// Обработчик отправки формы
const handleSubmit = async () => {
  isSaving.value = true;
  saveError.value = null;

  try {
    // Проверка обязательных полей перед отправкой
    if (!formData.material_name || formData.cost === undefined || formData.cost === null || formData.cost_per_sqm === undefined || formData.cost_per_sqm === null || formData.supplierId === undefined) {
      saveError.value = "Не заполнены обязательные поля (Название, Стоимость материала, Стоимость за м², Поставщик).";
      return;
    }
    if (typeof formData.supplierId !== 'number' || formData.supplierId <= 0) {
      saveError.value = "Поставщик выбран некорректно.";
      return;
    }

    // Подготовка данных для отправки на бэкенд
    const materialData = {
      material_name: formData.material_name,
      color_code: formData.color_code || '',
      note: formData.note || '',
      cost: Number(formData.cost),
      cost_per_sqm: Number(formData.cost_per_sqm),
      supplier: formData.supplierId,
    };

    if (materialId.value) {
      // Режим редактирования
      await materialStore.updateMaterial(materialId.value, materialData);
    } else {
      // Режим добавления
      await materialStore.createMaterial(materialData);
    }

    // После успешного сохранения, перенаправляем обратно на список
    router.push('/materials');
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'response' in err) {
      const apiError = err as { response?: { data?: { supplier?: string[]; detail?: string } } }
      if (apiError.response?.data?.supplier?.[0]) {
        saveError.value = `Поставщик: ${apiError.response.data.supplier[0]}`;
      } else if (apiError.response?.data?.detail) {
        saveError.value = `Ошибка API: ${apiError.response.data.detail}`;
      } else {
        saveError.value = 'Не удалось сохранить материал.';
      }
    } else {
      saveError.value = (err as Error).message || 'Не удалось сохранить материал.';
    }
  } finally {
    isSaving.value = false;
  }
};

// Обработчик кнопки "Отмена"
const handleCancel = () => {
  router.push('/materials');
};


// При монтировании компонента, загружаем поставщиков и, если нужно, данные материала
onMounted(async () => {
  await fetchSuppliers();

  if (materialId.value) {

    await fetchMaterial(materialId.value);
  } else {

    Object.assign(formData, { ...DEFAULT_MATERIAL, supplierId: null });
  }
});

// Watcher для сброса ошибки сохранения при изменении данных формы (опционально)
watch(formData, () => {
  saveError.value = null;
}, { deep: true });

</script>

<style scoped>
.material-editor-view {
  padding: 20px;
  max-width: 800px;
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


.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  font-size: 0.95rem;
  color: #555;
}

.form-group input[type="text"],
.form-group input[type="number"],
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  border-color: #007bff;
  outline: none;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}


.form-group textarea {
  min-height: 100px;
  resize: vertical;

}


.loading-message-small,
.error-message-small,
.no-results-message-small {
  font-size: 0.85rem;
  padding: 5px 8px;
  margin: 5px 0 0;
  border-radius: 3px;
  text-align: center;
}

.loading-message-small {
  background-color: #e9f7ef;
  color: #28a745;
  border: 1px solid #d1ecdd;
}

.error-message-small {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.no-results-message-small {
  background-color: #fff3cd;
  color: #856404;
  border: 1px solid #ffeeba;
}


.form-actions {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 15px;
}


.btn {
  font-weight: 500;
  padding: 8px 16px;
  font-size: 15px;
  white-space: nowrap;
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease, opacity 0.2s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex-shrink: 0;
}

.btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #4CAF50;
  color: white;
  border-color: #4CAF50;
}

.btn-primary:hover:not(:disabled) {
  background-color: #45A049;
  border-color: #45A049;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
  border-color: #6c757d;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #5a6268;
  border-color: #545b62;
}



.status-message {
  padding: 12px 15px;
  border-radius: 5px;
  margin: 20px auto;
  max-width: 100%;

  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.95rem;
  font-weight: 500;
}

.loading-message {
  background-color: #e9f7ef;
  color: #28a745;
  border: 1px solid #d1ecdd;
  justify-content: center;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
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

.loader-small {
  display: inline-block;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  width: 12px;
  height: 12px;
  animation: spin 0.8s linear infinite;
  margin-right: 5px;
  vertical-align: middle;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.retry-button {
  margin-left: auto;
  padding: 6px 12px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 14px;
  flex-shrink: 0;
}

.retry-button:hover {
  background-color: #c82333;
}


@media (max-width: 768px) {
  .material-editor-view {
    padding: 15px;
  }

  h1 {
    font-size: 1.6rem;
  }

  .form-group input,
  .form-group textarea,
  .form-group select {
    font-size: 0.95rem;
    padding: 8px 10px;
  }

  .btn {
    padding: 7px 14px;
    font-size: 14px;
  }

  .form-actions {
    gap: 10px;
  }
}

@media (max-width: 480px) {
  .material-editor-view {
    padding: 10px;
  }

  h1 {
    font-size: 1.4rem;
    margin-bottom: 20px;
  }

  .form-group label {
    font-size: 0.9rem;
  }

  .form-group input,
  .form-group textarea,
  .form-group select {
    font-size: 0.9rem;
    padding: 6px 8px;
  }

  .btn {
    padding: 6px 12px;
    font-size: 13px;
  }

  .form-actions {
    flex-direction: column-reverse;
    gap: 10px;
  }

  .form-actions .btn {
    width: 100%;
    text-align: center;
  }
}
</style>
