// src/stores/notificationStore.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useNotificationStore = defineStore('notification', () => {
  const isVisible = ref(false);
  const message = ref('');
  const type = ref<'success' | 'error' | 'warning' | 'info'>('info');
  const duration = ref(3000);

  const showNotification = (
    newMessage: string,
    newType: 'success' | 'error' | 'warning' | 'info' = 'info',
    newDuration: number = 3000
  ) => {
    message.value = newMessage;
    type.value = newType;
    duration.value = newDuration;
    isVisible.value = true;
    setTimeout(() => {
      isVisible.value = false;
    }, duration.value);
  };

  const hideNotification = () => {
    isVisible.value = false;
  };

  return { isVisible, message, type, showNotification, hideNotification };
});
