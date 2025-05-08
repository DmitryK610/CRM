<template>
  <div class="client-details-view">
    <h1>Детали клиента</h1>
    <div v-if="clientStore.getSelectedClient">
      <div class="client-details-block">
        <p v-if="clientStore.getSelectedClient.id"><strong>ID клиента:</strong> {{ clientStore.getSelectedClient.id }}
        </p>
        <p v-if="clientStore.getSelectedClient.full_name"><strong>Имя:</strong> {{
          clientStore.getSelectedClient.full_name }}</p>
        <p v-if="clientStore.getSelectedClient.email"><strong>Email:</strong> {{ clientStore.getSelectedClient.email }}
        </p>
        <p v-if="clientStore.getSelectedClient.contact_phone"><strong>Телефон:</strong> {{
          clientStore.getSelectedClient.contact_phone }}</p>
        <p v-if="clientStore.getSelectedClient.address"><strong>Адрес:</strong> {{ clientStore.getSelectedClient.address
          }}</p>
      </div>
      <router-link to="/clients" class="back-link">Вернуться к списку клиентов</router-link>
    </div>
    <div v-else class="status-message no-results-message">Клиент не найден.</div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useClientStore } from '@/stores';
import { useRoute } from 'vue-router';

const clientStore = useClientStore();
const route = useRoute();
const clientId = route.params.id ? Number(route.params.id) : null;

onMounted(async () => {
  if (clientId) {
    await clientStore.fetchClientById(clientId);
  } else {
    console.error('ID клиента отсутствует в параметрах маршрута.');
  }
});
</script>

<style scoped>
.client-details-view {
  padding: 20px;
  max-width: 700px;
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
  max-width: 95%;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.95rem;
  font-weight: 500;
  box-sizing: border-box;
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

.no-results-message {
  background-color: #fff3cd;
  color: #856404;
  border: 1px solid #ffeeba;
  text-align: center;
  justify-content: center;
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

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.client-details-block {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.client-details-block p {
  margin-bottom: 10px;
  font-size: 1rem;
  line-height: 1.5;
}

.client-details-block p:last-child {
  margin-bottom: 0;
}

strong {
  font-weight: 600;
  margin-right: 5px;
  color: #555;
}

.back-link {
  display: inline-block;
  margin-top: 25px;
  color: #007bff;
  text-decoration: none;
  font-size: 1rem;
  transition: color 0.2s ease, text-decoration 0.2s ease;
}

.back-link:hover {
  color: #0056b3;
  text-decoration: underline;
}

@media (max-width: 768px) {
  .client-details-view {
    padding: 15px;
    margin: 15px auto;
    max-width: 95%;
  }

  h1 {
    font-size: 1.8rem;
    margin-bottom: 20px;
  }

  .status-message {
    padding: 10px;
    font-size: 0.9rem;
    gap: 8px;
    flex-direction: column;
    align-items: flex-start;
    max-width: 95%;
  }

  .status-message.loading-message,
  .status-message.no-results-message {
    align-items: center;
    text-align: center;
  }

  .client-details-block {
    margin-top: 15px;
    padding-top: 15px;
  }

  .client-details-block p {
    font-size: 0.95rem;
    margin-bottom: 8px;
  }

  strong {
    font-weight: 600;
  }

  .back-link {
    margin-top: 20px;
    font-size: 0.95rem;
  }
}

@media (max-width: 480px) {
  .client-details-view {
    padding: 10px;
    margin: 10px auto;
  }

  h1 {
    font-size: 1.6rem;
    margin-bottom: 15px;
  }

  .status-message {
    padding: 8px;
    font-size: 0.85rem;
    gap: 6px;
    max-width: 95%;
  }

  .client-details-block {
    margin-top: 12px;
    padding-top: 12px;
  }

  .client-details-block p {
    font-size: 0.9rem;
    margin-bottom: 6px;
  }

  strong {
    font-weight: 600;
  }

  .back-link {
    margin-top: 15px;
    font-size: 0.9rem;
  }
}
</style>
