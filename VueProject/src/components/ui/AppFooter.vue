<template>
  <footer class="app-footer">
    <div class="container">
      <p>&copy; {{ currentYear }} Все права защищены. Мое Приложение</p>
      <nav>
        <router-link to="/privacy" class="footer-link">Политика конфиденциальности</router-link>
        <router-link to="/terms" class="footer-link">Условия использования</router-link>
      </nav>
    </div>
  </footer>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';

const currentYear = ref(new Date().getFullYear());
</script>

<style scoped>
.app-footer {
  background-color: #f8f9fa;
  color: #555;
  padding: 20px 0;
  border-top: 1px solid #eee;
  font-size: 0.9em;
}

.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.container p {
  margin: 0;
}

nav {
  display: flex;
  gap: 20px;
}

.footer-link {
  color: #555;
  text-decoration: none;
}

.footer-link:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .container {
    flex-direction: column;
    align-items: flex-start;
  }

  nav {
    flex-direction: column;
    gap: 10px;
    margin-top: 10px;
  }
}

@media (max-width: 480px) {
  .container p {
    font-size: 0.85em;
  }

  nav {
    font-size: 0.9em;
  }
}
</style>
