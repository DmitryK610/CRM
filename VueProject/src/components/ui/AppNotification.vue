<template>
  <div v-if="show" class="app-notification" :class="notificationTypeClass">
    <div class="icon" v-if="icon">
      <slot name="icon">{{ icon }}</slot>
    </div>
    <div class="message">
      <slot>{{ message }}</slot>
    </div>
    <button type="button" class="close-button" @click="closeNotification">&times;</button>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, watch, onMounted, computed } from 'vue'; // Added import for computed

interface NotificationProps {
  show: boolean;
  type?: 'success' | 'error' | 'warning' | 'info';
  message?: string;
  duration?: number; // in milliseconds, default to 3000
  icon?: string; // Optional icon (can be overridden by slot)
}

const props = withDefaults(defineProps<NotificationProps>(), {
  show: false,
  type: 'info',
  message: '',
  duration: 3000,
  icon: '',
});

const emit = defineEmits(['close']);

const notificationTypeClass = computed(() => `notification-${props.type}`);

const isVisible = ref(props.show);

watch(() => props.show, (newValue) => {
  isVisible.value = newValue;
  if (newValue && props.duration > 0) {
    setTimeout(() => {
      isVisible.value = false;
      emit('close');
    }, props.duration);
  }
});

const closeNotification = () => {
  isVisible.value = false;
  emit('close');
};
</script>

<style scoped>
.app-notification {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  margin-bottom: 10px;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  opacity: 1;
  transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
  transform: translateY(0);
}

.app-notification.notification-success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.app-notification.notification-error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.app-notification.notification-warning {
  background-color: #fff3cd;
  color: #85640a;
  border: 1px solid #ffeeba;
}

.app-notification.notification-info {
  background-color: #e7f3fe;
  color: #0c5460;
  border: 1px solid #b8daff;
}

.icon {
  margin-right: 15px;
  display: flex;
  align-items: center;
}

.message {
  flex-grow: 1;
  font-size: 0.9em;
}

.close-button {
  background: none;
  border: none;
  color: #777;
  font-size: 1.2em;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s ease;
  margin-left: 15px;
}

.close-button:hover {
  opacity: 1;
}
</style>
