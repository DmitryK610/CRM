<template>
  <div class="client-form" :class="{ 'in-modal': !!isModal }">
  





    <form @submit.prevent="saveClient">
      <div class="form-group">
        <label for="name">Имя</label>
        <input type="text" id="name" v-model="clientData.full_name" class="form-control" required>
      </div>

      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" v-model="clientData.email" class="form-control" required>
      </div>

      <div class="form-group">
        <label for="phone">Телефон</label>
        <input type="tel" id="phone" v-model="clientData.contact_phone" class="form-control" required>
      </div>

      <div class="form-group">
        <label for="address">Адрес (необязательно)</label>
        <textarea id="address" v-model="clientData.address" class="form-control"></textarea>
      </div>

      <div class="form-group">
        <label for="note">Примечание (необязательно)</label>
        <textarea id="note" v-model="clientData.note" class="form-control" placeholder="Дополнительные комментарии о клиенте"></textarea>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn btn-primary">{{ isEditing ? 'Сохранить изменения' : 'Добавить клиента' }}</button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, defineProps, defineEmits } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useClientStore } from '@/stores'; // Предполагаем наличие clientStore
import type { Client } from '@/types/client';

const router = useRouter();
const route = useRoute();
const props = defineProps<{ isModal?: boolean; modalClientId?: number | null }>();
const emit = defineEmits(['close', 'saved']);
const clientStore = useClientStore();

const clientId = computed<number | null>(() => {
  if (props.modalClientId !== undefined) {
    return props.modalClientId === null ? null : Number(props.modalClientId);
  }
  return route.params.id ? Number(route.params.id) : null;
});
const isEditing = computed(() => !!clientId.value);

const clientData = ref<Partial<Client>>({
  full_name: '',
  email: '',
  contact_phone: '',
  address: '',
  note: ''
});

onMounted(async () => {
  if (isEditing.value && clientId.value) {
    await clientStore.fetchClientById(clientId.value);
    if (clientStore.selectedClient) {
      clientData.value = { ...clientStore.selectedClient };
    }
  }
});

const saveClient = async () => {
  if (isEditing.value && clientId.value && clientStore.selectedClient) {
    try {
      await clientStore.updateClient(clientId.value, clientData.value as Client);
      if (props.isModal) {
        emit('saved');
        emit('close');
      } else {
        router.push('/clients');
      }
    } catch (error) {
      console.error('Ошибка при обновлении клиента:', error);

    }
  } else {
    try {
      await clientStore.createClient(clientData.value as Omit<Client, 'id'>);
      if (props.isModal) {
        emit('saved');
        emit('close');
      } else {
        router.push('/clients');
      }
    } catch (error) {
      console.error('Ошибка при создании клиента:', error);

    }
  }
};
const cancelEdit = () => {
  if (props.isModal) {
    emit('close');
  } else {
    router.push('/clients');
  }
};
</script>

<style scoped>

.client-form {

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

.client-form.in-modal {
  padding: 0;
  margin: 0;
  max-width: 100%;
  box-shadow: none;
  border-radius: 0;
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


label {

  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  font-size: 0.95rem;
  color: #555;
}


.form-control {

  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 1rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  background-color: #fff;
}


.form-control:focus {
  border-color: #007bff;
  outline: none;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}


textarea.form-control {
  min-height: 100px;
  resize: vertical;
}



.btn {
  padding: 10px 20px;
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  transition: background-color 0.2s ease, border-color 0.2s ease, opacity 0.2s ease;
  text-decoration: none;
  display: inline-block;
  text-align: center;
  flex-shrink: 0;
  box-sizing: border-box;
  white-space: nowrap;

}


.btn:not(:last-child) {
  margin-right: 10px;
}


.client-form.in-modal .form-actions {
  
  margin-top: 25px;
  padding-top: 15px;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #007bff;
}





.btn-primary { background-color: #007bff; color: white; border-color: #007bff; }
.btn-primary:hover { background-color: #0056b3; border-color: #0056b3; }

.btn-secondary { background-color: #6c757d; color: white; border-color: #6c757d; }
.btn-secondary:hover { background-color: #5a6268; border-color: #545b62; }


@media (max-width: 768px) {
  .client-form {
    padding: 15px;
    margin: 15px auto;
    max-width: 95%;
  }
  h1 {
    font-size: 1.6rem;
    margin-bottom: 20px;
  }
  label {
    font-size: 0.9rem;
  }
  .form-control {
    padding: 8px;
    font-size: 0.9rem;
  }
  .btn {
    padding: 8px 16px;
    font-size: 0.9rem;
  }

  .btn:not(:last-child) {
    margin-right: 8px;
  }
}

@media (max-width: 480px) {
  .client-form {
    padding: 10px;
    margin: 10px auto;
  }
  h1 {
    font-size: 1.4rem;
    margin-bottom: 15px;
  }
  label {
    font-size: 0.85rem;
  }
  .form-control {
    padding: 6px;
    font-size: 0.85rem;
  }
  .btn {
    padding: 6px 12px;
    font-size: 0.85rem;
  }

  .btn:not(:last-child) {
    margin-right: 6px;
  }
}
</style>
