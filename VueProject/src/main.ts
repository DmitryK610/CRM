import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './assets/main.css'

import { useAuthStore } from './stores/authStore'

import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'


const app = createApp(App)
const pinia = createPinia()


app.use(pinia)


const authStore = useAuthStore()

authStore.checkAuthOnLoad() // <-- Вызовите ваш метод здесь!


app.use(router)



app.component('v-select', vSelect)


app.mount('#app')
