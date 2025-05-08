import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './assets/main.css'

import { useAuthStore } from './stores/authStore'

import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'

// --- Инициализация приложения ---
const app = createApp(App)
const pinia = createPinia()

// Используем Pinia
app.use(pinia)

// Получаем экземпляр Auth Store
const authStore = useAuthStore()

authStore.checkAuthOnLoad() // <-- Вызовите ваш метод здесь!

// Используем настроенный Vue Router
app.use(router)

// --- Глобальная регистрация компонента v-select ---

app.component('v-select', vSelect)

// Монтируем приложение
app.mount('#app')
