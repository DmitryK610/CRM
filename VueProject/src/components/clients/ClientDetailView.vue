<template>
  <div class="client-detail-container" :class="{ 'in-modal': !!isModal }">
    <div v-if="clientStore.getError" class="status-message error-message">
      ⚠️ Ошибка: {{ clientStore.getError }}
    </div>
    <div v-else-if="client" class="client-details-content">
      <!-- When opened in a modal, render details directly without inner block -->
      <div v-if="!isModal" class="details-section">
        <div class="details-grid">
          <div class="detail-line">
            <strong>ФИО:</strong>
            <span>{{ client.full_name || '—' }}</span>
          </div>
          <div class="detail-line">
            <strong>Email:</strong>
            <span>{{ client.email || '—' }}</span>
          </div>
          <div class="detail-line">
            <strong>Телефон:</strong>
            <span>{{ client.contact_phone || '—' }}</span>
          </div>
          <div class="detail-line">
            <strong>Адрес:</strong>
            <span>{{ client.address || '—' }}</span>
          </div>
        </div>
      </div>
      <div v-else class="details-grid">
        <div class="detail-line">
          <strong>ФИО:</strong>
          <span>{{ client.full_name || '—' }}</span>
        </div>
        <div class="detail-line">
          <strong>Email:</strong>
          <span>{{ client.email || '—' }}</span>
        </div>
        <div class="detail-line">
          <strong>Телефон:</strong>
          <span>{{ client.contact_phone || '—' }}</span>
        </div>
        <div class="detail-line">
          <strong>Адрес:</strong>
          <span>{{ client.address || '—' }}</span>
        </div>
        <div class="detail-line note-line">
          <strong>Примечание:</strong>
          <span class="note-value-span">{{ client.note || 'Нет примечаний' }}</span>
        </div>
      </div>
    </div>
    <div v-else class="status-message no-results-message">
      Клиент не найден.
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useClientStore } from '@/stores/clientStore';

const props = defineProps<{ isModal?: boolean; modalClientId?: number | null }>();
const route = useRoute();
const clientStore = useClientStore();

const clientId = computed(() => {
  if (props.modalClientId !== undefined) {
    return props.modalClientId === null ? null : Number(props.modalClientId);
  }
  return route.params.id ? Number(route.params.id) : null;
});

const client = computed(() => clientStore.getSelectedClient);

onMounted(async () => {
  const id = clientId.value;
  if (id !== null) {
    if (!clientStore.getSelectedClient || clientStore.getSelectedClient.id !== id) {
      await clientStore.fetchClientById(id);
    }
  }
});
</script>

<style scoped>
.client-detail-container {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin: 20px auto;
  max-width: 800px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
  box-sizing: border-box;
}

.client-detail-container.in-modal {
  padding: 0;
  margin: 0;
  max-width: 100%;
  border: none;
  box-shadow: none;
}

.details-section {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 6px;
  background-color: #fff;
}

.details-section h2 {
  color: #555;
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 1.4rem;
  border-bottom: 1px solid #ddd;
  padding-bottom: 8px;
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px 24px;
}

.detail-line {
  display: flex;
  margin-bottom: 0;
  line-height: 1.5;
  font-size: 1rem;
  align-items: baseline;
  flex-wrap: nowrap; 
  white-space: nowrap; 
  overflow: hidden; 
  text-overflow: ellipsis; 
}

.detail-line strong {
  font-weight: bold;
  width: 350px; 
  flex-shrink: 0;
  margin-right: 10px; 
  text-align: left;
}

.detail-line span { flex-grow: 1; min-width: 0; text-align: center; }

.status-message {
  padding: 16px;
  border-radius: 8px;
  margin: 20px auto;
  max-width: 800px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1rem;
  font-weight: 500;
  box-sizing: border-box;
}

.error-message { background-color: #ffebee; color: #d32f2f; }
.no-results-message { background-color: #fff3cd; color: #856404; justify-content: center; }

@media (max-width: 768px) {
  .client-detail-container { padding: 15px; margin: 15px; }
  .client-detail-container.in-modal { padding: 0; margin: 0; }
  .details-section { padding: 12px; }
  .details-section h2 { font-size: 1.3rem; }
  .detail-line { flex-direction: column; align-items: flex-start; }
  .detail-line strong { width: auto; margin-right: 0; margin-bottom: 4px; }
  
}

@media (max-width: 480px) {
  .client-detail-container { padding: 10px; margin: 10px; }
  .details-section { padding: 10px; }
  .detail-line { font-size: 0.9rem; }
}


.client-detail-container.in-modal .detail-line {
  position: static;
  align-items: center;
}
.client-detail-container.in-modal .detail-line::after {
  content: '';
  flex: 0 1 180px;
  max-width: 220px;
  border-bottom: 1px dotted #e9ecef;
  order: 1;
  margin: 0 8px;
}
.client-detail-container.in-modal .detail-line strong { order: 0; background: transparent; padding: 0; }
.client-detail-container.in-modal .detail-line > span { order: 2; text-align: left; background: transparent; padding: 0; flex: 0 0 50%; min-width: 0; }
.client-detail-container.in-modal .detail-line.note-line::after { display: none; }

@media (max-width: 768px) {
  .client-detail-container.in-modal .detail-line::after { display: none; }
  .client-detail-container.in-modal .detail-line > span { flex: initial; width: 100%; }
}


.detail-line.note-line {
  flex-direction: column;
  align-items: flex-start;
}
.detail-line.note-line strong {
  width: auto;
  margin-right: 0;
  margin-bottom: 8px;
}
.note-value-span {
  display: block;
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #fff;
  white-space: pre-wrap;
  font-size: 0.95rem;
  color: #495057;
  box-sizing: border-box;
  overflow-x: auto;
  text-align: left;
}
</style>
