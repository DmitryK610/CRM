<template>
  <div class="client-card">
    <h3>{{ client.full_name }}</h3>
    <p><strong>Email:</strong> {{ client.email }}</p>
    <p><strong>Телефон:</strong> {{ client.contact_phone }}</p>
    <div class="actions">
      <router-link :to="`/clients/${client.id}`" class="btn btn-primary btn-sm">
        Подробнее
      </router-link>
      </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import type { Client } from '@/types/client';
const props = defineProps<{
  client: Client;
}>();

const client = props.client;
</script>

<style scoped>
.client-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.client-card h3 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #333;
}

.client-card p {
  margin-bottom: 5px;
  color: #555;
  font-size: 0.9em;
}

.client-card strong {
  font-weight: bold;
}

.actions {
  margin-top: 10px;
}

.btn {
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.8em;
  text-decoration: none;
}

.btn-primary {
  background-color: #007bff;
  color: white;
  border: none;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-sm {
  padding: 5px 8px;
  font-size: 0.75em;
}
</style>
