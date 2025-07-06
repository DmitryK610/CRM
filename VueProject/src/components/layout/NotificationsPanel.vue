<!-- Простая панель уведомлений -->
<template>
  <div class="notifications-panel">
    <h3>Уведомления</h3>
    <div class="notification-item">
      <p>Новый заказ #1234</p>
      <span class="time">2 минуты назад</span>
    </div>
    <div class="notification-item">
      <p>Обновление клиента</p>
      <span class="time">1 час назад</span>
    </div>
  </div>
</template>

<script setup lang="ts">
// Простая панель уведомлений
</script>

<style scoped>
.notifications-panel {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-width: 300px;
}

.notification-item {
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.notification-item:last-child {
  border-bottom: none;
}

.time {
  font-size: 0.8em;
  color: #666;
}
</style>
