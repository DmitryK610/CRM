<template>
  <header class="app-header">
    <div class="container">
      <router-link to="/" class="logo">
        <img src="/crm logo.png" alt="CRM Логотип" class="logo-image" />
      </router-link>

      <button
        class="menu-toggle"
        @click="toggleMenu"
        :aria-expanded="isMenuOpen"
        aria-label="Открыть/закрыть меню навигации"
      >
        <span class="material-symbols-outlined menu-icon">{{
          isMenuOpen ? 'close' : 'menu'
        }}</span>
      </button>

      <nav :class="{ 'nav-open': isMenuOpen }">
        <router-link to="/dashboard" active-class="active" @click="onNavClick">Заказы в работе</router-link>
        <router-link to="/orders" active-class="active" @click="onNavClick">Заказы</router-link>
        <router-link to="/clients" active-class="active" @click="onNavClick">Клиенты</router-link>
        <router-link to="/calculations" active-class="active" @click="onNavClick">Расчеты</router-link>
        <router-link to="/suppliers" active-class="active" @click="onNavClick">Поставщики</router-link>
        <router-link to="/materials" active-class="active" @click="onNavClick">Материалы</router-link>
      </nav>

      <div class="auth-section">
        <span v-if="authStore.isAuthenticated">
          {{ authStore.user?.ФИО || 'пользователь' }}
        </span>
        <router-link v-if="!authStore.isAuthenticated" to="/login" class="login-button">
          Войти
        </router-link>
        <button v-if="authStore.isAuthenticated" @click="logout" class="logout-button">
          Выйти
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores';

const router = useRouter();
const authStore = useAuthStore();
const isMenuOpen = ref(false);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const onNavClick = () => {
  isMenuOpen.value = false;
};

const logout = async () => {
  await authStore.logout();
  router.push('/login');
};
</script>

<style scoped>
.app-header {
  background-color: #343a40;
  border-bottom: 1px solid #495057;
  padding: 12px 0;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.logo {
  text-decoration: none;
  color: #f8f9fa;
  font-size: 22px;
  font-weight: 700;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  transition: opacity 0.2s ease;
}

.logo:hover {
  opacity: 0.8;
}

.logo-image {
  height: 56px;
  width: auto;
  max-width: 280px;
  object-fit: contain;
  filter: brightness(1.1);
  border-radius: 5px;
}

nav {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-grow: 1;
  flex-wrap: wrap;
  justify-content: center;
}

nav a {
  text-decoration: none;
  color: #ced4da;
  padding: 10px 14px;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  transition: background-color 0.2s, color 0.2s;
  border-bottom: 2px solid transparent;
  white-space: nowrap;
}

nav a:hover {
  background-color: #495057;
  color: #ffffff;
}

nav a.active {
  color: #89cff0;
  font-weight: 600;
  border-bottom-color: #89cff0;
}

.auth-section {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

.auth-section span {
  font-size: 16px;
  color: #ced4da;
  white-space: nowrap;
}

.login-button,
.logout-button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-block;
  text-align: center;
  box-sizing: border-box;
  white-space: nowrap;
}


.menu-toggle {
  display: none;
}

.login-button:hover,
.logout-button:hover {
  opacity: 0.9;
}

.login-button {
  background-color: #007bff;
  color: white;
}

.logout-button {
  background-color: #dc3545;
  color: white;
}


@media (max-width: 992px) {
  .container {
    padding: 0 20px;
    gap: 12px;
  }

  nav {
    gap: 8px;
    justify-content: flex-start;
  }

  nav a {
    padding: 8px 12px;
    font-size: 15px;
  }

  .logo {
    font-size: 20px;
  }

  .logo-image {
    height: 48px;
    max-width: 240px;
  }

  .auth-section span {
    font-size: 15px;
  }

  .login-button,
  .logout-button {
    padding: 6px 14px;
    font-size: 13px;
  }
}


@media (max-width: 768px) {
  .app-header {
    padding: 10px 0;
    width: 100%;
  }

  .container {
    padding: 0 12px;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .logo {
    justify-content: flex-start;
    flex-grow: 1;
  }

  .logo-image {
    height: 40px;
    max-width: 160px;
  }

  .menu-toggle {
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ced4da;
  }

  .menu-icon {
    font-size: 24px;
    line-height: 1;
  }

  nav {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: #3a3f44;
    flex-direction: column;
    align-items: stretch;
    gap: 6px;
    padding: 12px;
    border-bottom: 1px solid #495057;
    z-index: 1000;
    transition: transform 0.3s ease, opacity 0.3s ease;
    transform: translateY(-10px);
    opacity: 0;
  }

  nav.nav-open {
    display: flex;
    transform: translateY(0);
    opacity: 1;
  }

  nav a {
    display: block;
    width: 100%;
    text-align: center;
    padding: 12px 0;
    font-size: 16px;
    background-color: #43494f;
    border-radius: 4px;
  }

  nav a.active {
    background-color: #495057;
    color: #89cff0;
  }

  .auth-section {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .auth-section span {
    display: none;
  }

  .login-button,
  .logout-button {
    font-size: 14px;
    padding: 8px 16px;
    width: auto;
  }

  
  .menu-toggle {
    display: flex;
  }
}


@media (max-width: 480px) {
  .container {
    padding: 0 8px;
    gap: 6px;
  }

  .logo-image {
    height: 36px;
    max-width: 140px;
  }

  .menu-toggle {
    padding: 6px;
  }

  .menu-icon {
    font-size: 22px;
  }

  nav a {
    font-size: 15px;
    padding: 10px 0;
  }

  .login-button,
  .logout-button {
    padding: 6px 12px;
    font-size: 13px;
  }
}
</style>