<template>
  <div id="app">
    <template v-if="isAppReady">
      <app-header v-if="!$route.meta.hideHeader" />
      <div class="container">
        <router-view />
      </div>
      <app-footer />
      <app-notification :show="notificationStore.isVisible" :message="notificationStore.message"
        :type="notificationStore.type" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import AppHeader from './components/ui/AppHeader.vue';
import AppFooter from './components/ui/AppFooter.vue';
import AppNotification from './components/ui/AppNotification.vue';
import { useAuthStore } from './stores/authStore';
import { useNotificationStore } from './stores/notificationStore';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const notificationStore = useNotificationStore();
const isAppReady = ref(false);

onMounted(async () => {
  // Если на странице авторизации - сразу готово к отображению
  if (route.path === '/login') {
    isAppReady.value = true;
    return;
  }

  // Проверка аутентификации для других страниц
  if (!authStore.isAuthenticated) {
    await router.push('/login');
  }

  isAppReady.value = true;
});
</script>

<style>
html,
body {
  height: 100%;
  margin: 0;
}

body {
  display: flex;
  flex-direction: column;
}

#app {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  flex-grow: 1;
}

@media (max-width: 768px) {
  .container {
    padding: 15px;
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 10px;
  }
}
</style>
