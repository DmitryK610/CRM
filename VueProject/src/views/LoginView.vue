<template>
  <div class="login-page">
    <div class="login-background">
      <div class="login-container card">
        <h1>Вход</h1>
        <form class="login-form" @submit.prevent="onSubmit">
          <div v-if="authError" class="status-message error">
            <span class="error-text">Неверные данные. Проверьте логин и пароль.</span>
          </div>

          <div class="form-group">
            <label for="username">Логин</label>
            <input
              id="username"
              type="text"
              v-model.trim="username"
              placeholder="Введите логин"
              autocomplete="username"
              required
            />
          </div>

          <div class="form-group">
            <label for="password">Пароль</label>
            <div class="password-field">
              <input
                v-show="!showPassword"
                type="password"
                id="password"
                v-model="password"
                placeholder="Введите пароль"
                autocomplete="current-password"
                required
                ref="passwordInput"
                aria-hidden="false"
              />
              <input
                v-show="showPassword"
                type="text"
                aria-hidden="false"
                v-model="password"
                placeholder="Введите пароль"
                autocomplete="off"
                required
              />
              <button
                type="button"
                class="toggle-eye"
                @mousedown.prevent
                @touchstart.prevent
                @click="togglePassword"
                :aria-label="showPassword ? 'Скрыть пароль' : 'Показать пароль'"
              >
                <svg class="eye-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path v-if="!showPassword" fill="currentColor" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5C21.27 7.61 17 4.5 12 4.5Zm0 12a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9Zm0-7.5a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"/>
                  <path v-else fill="currentColor" d="M2.81 2.81 1.39 4.22l3.02 3.02C2.92 8.41 1.53 10.04 1 12c1.73 4.39 6 7.5 11 7.5 2.05 0 3.97-.5 5.66-1.39l3.12 3.12 1.41-1.41L2.81 2.81ZM12 17.5c-3.5 0-6.73-2.02-8.44-5.5.64-1.29 1.64-2.44 2.84-3.28l2.05 2.05A4.5 4.5 0 0 0 12 16a4.4 4.4 0 0 0 2.23-.61l1.68 1.68c-.97.28-2 .43-3.91.43Zm0-9c.33 0 .65.05.95.14l-3.32-3.32c.75-.13 1.5-.2 2.37-.2 3.5 0 6.73 2.02 8.44 5.5-.62 1.26-1.58 2.4-2.72 3.23l-2.14-2.14A4.5 4.5 0 0 0 12 8.5Z"/>
                </svg>
              </button>
            </div>
          </div>

          <button class="btn-primary" type="submit" :disabled="isLoading || !username || !password">
            <span v-if="isLoading">Входим…</span>
            <span v-else>Войти</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores';

export default {
  name: 'LoginView',
  data() {
    return {
      username: '',
      password: '',
      showPassword: false,
      authError: false,
      isLoading: false,
    };
  },
  methods: {
    async onSubmit() {
      this.authError = false;
      this.isLoading = true;
      const auth = useAuthStore();
      try {
        await auth.login(this.username, this.password);
        if (auth.isAuthenticated) {
          await this.$router.replace({ name: 'Dashboard' });
        } else {
          this.authError = true;
        }
      } catch (e) {
        this.authError = true;
      } finally {
        this.isLoading = false;
      }
    },
    togglePassword() {
      this.showPassword = !this.showPassword;
      this.$nextTick(() => {
        const el = this.$refs.passwordInput;
        if (el && typeof el.focus === 'function') {
          try { el.focus({ preventScroll: true }); } catch { el.focus(); }
        }
      });
    }
  }
};
</script>

<style scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh; 
  overflow: hidden; 
  padding: 20px;
  box-sizing: border-box;
  background: #f5f5f5;
}

.login-background {
  background-color: #343a40;
  padding: 40px 30px;
  border-radius: 15px;
  width: 100%;
  max-width: 520px; 
  height: calc(100vh - 40px); 
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.login-container {
  background: rgba(255, 255, 255, 0.92);
  padding: 24px 28px;
  border-radius: 10px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  width: 90%;
  backdrop-filter: blur(6px);
  contain: layout paint;
  margin: 0 auto;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.login-container h1 {
  margin: 0 0 10px;
  font-size: 1.6rem;
  color: #333;
  text-align: center;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

label {
  font-weight: 600;
  color: #444;
}

input {
  width: 100%;
  padding: 10px 12px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 6px;
  transition: border 0.2s;
  background: #fff;
  height: 44px;
  line-height: 22px;
  box-sizing: border-box;
  -webkit-appearance: none;
  appearance: none;
}

input:focus {
  border-color: #4ca1af;
  outline: none;
}

.status-message.error {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 12px;
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 6px;
  font-size: 14px;
}

.status-message .error-text {
  font-weight: 600;
}

.password-field {
  position: relative;
  height: 44px;
}

.password-field input {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 44px;
  padding: 10px 44px 10px 12px;
}

.toggle-eye {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 0;
  border-radius: 50%;
  cursor: pointer;
  padding: 0;
  color: #6c757d;
  line-height: 0;
}

.toggle-eye:hover {
  background: rgba(0, 0, 0, 0.04);
}

.toggle-eye:active {
  background: rgba(0, 0, 0, 0.06);
}

.eye-icon {
  width: 20px;
  height: 20px;
  display: block;
}

input::-ms-reveal,
input::-ms-clear {
  display: none;
}

.btn-primary {
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 15px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0056b3;
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>