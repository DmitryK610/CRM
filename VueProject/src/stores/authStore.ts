// src/stores/authStore.ts

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User } from '@/types/user';
import * as authApi from '@/api/auth';
import type { LoginResponse } from '@/api/auth';

export const useAuthStore = defineStore('auth', () => {
  // Состояния
  const isAuthenticated = ref(false);
  const authToken = ref<string | null>(null);
  const user = ref<User | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Геттеры
  const getUser = computed(() => user.value);
  const getIsLoading = computed(() => isLoading.value);
  const getError = computed(() => error.value);

  /**
   * Сбрасывает состояние аутентификации
   */
  function resetAuthState() {
    isAuthenticated.value = false;
    authToken.value = null;
    user.value = null;
    error.value = null;
    isLoading.value = false;
  }

  /**
   * Действие для входа пользователя
   */
  async function login(username: string, password: string) {
    isLoading.value = true;
    error.value = null;

    try {
      const loginResponse = await authApi.login({ username, password }) as LoginResponse;

      if (loginResponse.token) {
        isAuthenticated.value = true;
        authToken.value = loginResponse.token;
        user.value = loginResponse.user || null;

        localStorage.setItem('authToken', loginResponse.token);
        if (loginResponse.user) {
          localStorage.setItem('user', JSON.stringify(loginResponse.user));
        }
      } else {
        error.value = 'Неверный логин или пароль.';
        resetAuthState();
      }
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Ошибка при выполнении входа.';
      resetAuthState();
      throw err; // Пробрасываем ошибку для обработки в компоненте при необходимости
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Действие для выхода пользователя
   */
  function logout() {
    resetAuthState();
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  /**
   * Проверка аутентификации при загрузке
   */
  function checkAuthOnLoad() {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');

    if (storedToken) {
      isAuthenticated.value = true;
      authToken.value = storedToken;

      if (storedUser) {
        try {
          user.value = JSON.parse(storedUser) as User;
        } catch (e) {
          console.error('Ошибка парсинга пользователя:', e);
          logout();
        }
      }
    }
  }

  return {
    isAuthenticated,
    authToken,
    user,
    isLoading,
    error,
    getUser,
    getIsLoading,
    getError,
    login,
    logout,
    checkAuthOnLoad,
    resetAuthState // Экспортируем resetAuthState, если нужно использовать в компонентах
  };
});
