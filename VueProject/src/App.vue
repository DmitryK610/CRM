<template>
  <div id="app">
    <template v-if="isAppReady">
      <app-header v-if="!$route.meta.hideHeader" />
      <div class="container">
        <router-view />
      </div>
  <app-footer v-if="!$route.meta.hideHeader" />
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

  if (route.path === '/login') {
    isAppReady.value = true;
    return;
  }


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
  
  padding: 0 24px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  flex-grow: 1;
}

@media (max-width: 768px) {
  .container {
    
    padding: 0 12px;
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 12px;
  }
}
</style>
