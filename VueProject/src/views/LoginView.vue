<template>
  <div class="login-view">
    <div class="login-container">
      <h1>Вход в приложение</h1>

      <div v-if="showError" class="error-message">
        Неверные данные для входа. Проверьте логин и пароль.
      </div>

      <form @submit.prevent="submitLogin" class="login-form">
        <div class="form-group">
          <label for="username">Имя пользователя</label>
          <input type="text" id="username" v-model="username" class="form-control" required
            placeholder="Введите ваше имя">
        </div>

        <div class="form-group">
          <label for="password">Пароль</label>
          <input type="password" id="password" v-model="password" class="form-control" required
            placeholder="Введите ваш пароль">
        </div>

        <button type="submit" class="btn btn-primary">
          Войти
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores';

const username = ref('');
const password = ref('');
const showError = ref(false);
const router = useRouter();
const authStore = useAuthStore();

const submitLogin = async () => {
  showError.value = false;
  try {
    await authStore.login(username.value, password.value);
    router.push('/');
  } catch {
    showError.value = true;
  }
};
</script>

<style scoped>
.login-view {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: linear-gradient(135deg, #8d9baa 0%, #5c6a77 100%);
  padding: 20px;
  box-sizing: border-box;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  overflow: hidden;
}

.login-container {
  background: rgba(255, 255, 255, 0.88);
  padding: 35px 45px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 400px;
  max-width: 400px;
  min-width: 400px;
  text-align: center;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(0, 0, 0, 0.05);
  position: relative;
}

h1 {
  margin-bottom: 30px;
  color: #2c3e50;
  font-weight: 600;
  font-size: 22px;
}

.login-form {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.form-group {
  margin-bottom: 20px;
  text-align: left;
}

label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  color: #555;
  font-size: 14px;
}

.form-control {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  box-sizing: border-box;
  font-size: 1rem;
  color: #333;
  background-color: #fff;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-control::placeholder {
  color: #aaa;
}

.form-control:focus {
  border-color: #1976d2;
  outline: 0;
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.2);
}

.btn-primary {
  background: linear-gradient(145deg, #298bcd, #1976d2);
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  width: 100%;
  font-size: 1rem;
  font-weight: 500;
  margin-top: 15px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
  transition: all 0.25s cubic-bezier(.25, .8, .25, 1);
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(145deg, #1f7cb4, #1565c0);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.25), 0 5px 5px rgba(0, 0, 0, 0.22);
  transform: translateY(-2px);
}

.btn-primary:active:not(:disabled) {
  background: linear-gradient(145deg, #1a6a99, #135a9e);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  transform: translateY(1px) scale(0.99);
  transition-duration: 0.1s;
}

.btn-primary:disabled {
  background: #adb5bd;
  box-shadow: none;
  transform: none;
  cursor: not-allowed;
  opacity: 0.65;
}

.btn-primary span {
  display: inline-block;
}

.error-message {
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  width: calc(100% - 32px);
  box-sizing: border-box;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #d32f2f;
  background-color: #ffebee;
  border: 1px solid #f5c6cb;
  position: relative;
  top: -70px;
  left: 50%;
  transform: translateX(-50%);
  min-height: 40px;
}

/* Адаптивность для мобильных устройств */
@media (max-width: 480px) {
  .login-view {
    padding: 10px;
  }
  
  .login-container {
    width: 100%;
    max-width: 350px;
    min-width: 280px;
    padding: 25px 30px;
  }
  
  .error-message {
    width: calc(100% - 20px);
    font-size: 13px;
    top: -60px;
  }
}
</style>
