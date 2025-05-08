<template>
  <div class="not-found">
    <h1>Страница не найдена</h1>
    <p>К сожалению, запрошенная вами страница не существует.</p>
    <router-link to="/">Вернуться на главную страницу</router-link>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
}

h1 {
  font-size: 3em;
  margin-bottom: 20px;
  color: #333;
}

p {
  font-size: 1.2em;
  margin-bottom: 30px;
  color: #666;
}

.router-link {
  display: inline-block;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 5px;
  font-weight: bold;
}

.router-link:hover {
  background-color: #0056b3;
}
</style>
