<template>
  <header class="app-header">
    <div class="container">
      <router-link to="/" class="logo">
        <span>Мое Приложение</span>
      </router-link>

      <nav>
        <router-link to="/dashboard" active-class="active">Панель управления</router-link>
        <router-link to="/orders" active-class="active">Заказы</router-link>
        <router-link to="/clients" active-class="active">Клиенты</router-link>
        <router-link to="/calculations" active-class="active">Расчеты</router-link>
        <router-link to="/suppliers" active-class="active">Поставщики</router-link>
        <router-link to="/employees" active-class="active">Сотрудники</router-link>
        <router-link to="/materials" active-class="active">Материалы</router-link>
        <!-- <router-link to="/financial" active-class="active">Финансы</router-link> -->
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
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores';

const router = useRouter();
const authStore = useAuthStore();

const logout = async () => {
  await authStore.logout();
  router.push('/login');
};
</script>


<style scoped>
/* --- Базовые стили хедера --- */
.app-header {
  background-color: #343a40;
  /* Темный фон для контраста (темно-серый) */
  border-bottom: 1px solid #495057;
  /* Граница темнее, соответствующая фону */
  padding: 12px 0;
  /* Вертикальные отступы */
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
  /* Более выраженная тень на темном фоне */
}

/* --- Контейнер для центрирования контента --- */
.container {
  max-width: 1400px;
  /* Та же ширина, что и у client-list-view */
  margin: 0 auto;
  padding: 0 24px;
  /* Горизонтальные отступы, как у client-list-view */
  display: flex;
  align-items: center;
  justify-content: space-between;
  /* Распределяем элементы */
  flex-wrap: wrap;
  /* Разрешаем перенос на маленьких экранах */
  gap: 16px;
  /* Пространство между лого/нав/аутентификацией */
}

/* --- Логотип --- */
.logo {
  text-decoration: none;
  color: #f8f9fa;
  /* Светлый цвет текста для темного фона */
  font-size: 22px;
  /* Увеличенный размер шрифта */
  font-weight: 700;
  /* Сделаем чуть жирнее */
  flex-shrink: 0;
  /* Не сжимать логотип */
}

.logo span {
  vertical-align: middle;
}

/* --- Навигация --- */
nav {
  display: flex;
  gap: 12px;
  /* Увеличиваем пространство между ссылками */
  align-items: center;
  flex-grow: 1;
  /* Позволяем навигации занимать место */
  flex-wrap: wrap;
  /* Позволяем ссылкам переноситься */
  justify-content: center;
  /* Центрируем ссылки, если они переносятся */
}

nav a {
  text-decoration: none;
  color: #ced4da;
  /* Светлый цвет ссылок, не чисто белый */
  padding: 10px 14px;
  /* Увеличиваем кликабельную область и отступы */
  border-radius: 4px;
  font-size: 16px;
  /* Увеличенный размер шрифта */
  font-weight: 500;
  transition: background-color 0.2s, color 0.2s;
  border-bottom: 2px solid transparent;
  /* Место для активного индикатора */
  white-space: nowrap;
  /* Предотвращаем перенос текста в ссылке */
}

nav a:hover {
  background-color: #495057;
  /* Легкий фон при наведении (темнее текущего фона) */
  color: #ffffff;
  /* Чисто белый цвет при наведении */
}

/* Стиль активной ссылки */
nav a.active {
  color: #89cff0;
  /* Ярко-синий цвет для активной ссылки */
  font-weight: 600;
  border-bottom-color: #89cff0;
  /* Подчеркивание активной ссылки */
  /* background-color: #495057; */
  /* Альтернатива: фон */
}

/* --- Секция аутентификации --- */
.auth-section {
  display: flex;
  align-items: center;
  gap: 16px;
  /* Увеличиваем пространство между элементами */
  flex-shrink: 0;
  /* Не сжимать секцию */
}

.auth-section span {
  font-size: 16px;
  /* Увеличенный размер шрифта */
  color: #ced4da;
  /* Светлый цвет текста */
  white-space: nowrap;
  /* Избегаем переноса приветствия */
}

/* --- Кнопки входа/выхода --- */
.login-button,
.logout-button {
  /* Заимствуем стили базовой кнопки, но делаем чуть компактнее */
  padding: 8px 16px;
  /* Увеличиваем отступы */
  border: none;
  border-radius: 4px;
  font-size: 14px;
  /* Увеличенный размер шрифта */
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-block;
  text-align: center;
  box-sizing: border-box;
  white-space: nowrap;
}

.login-button:hover,
.logout-button:hover {
  opacity: 0.9;
  /* Небольшое изменение прозрачности при наведении */
}

.login-button {
  background-color: #007bff;
  /* Синий, более яркий для темного фона */
  color: white;
}

.logout-button {
  background-color: #dc3545;
  /* Красный, более яркий для темного фона */
  color: white;
  /* Альтернатива: нейтральный цвет */
  /* background-color: #6c757d; */
  /* color: white; */
}


/* --- Медиазапросы для адаптивности --- */

/* Планшеты */
@media (max-width: 992px) {
  .container {
    padding: 0 20px;
    /* Уменьшаем горизонтальные отступы */
    gap: 12px;
  }

  nav {
    gap: 8px;
    /* Уменьшаем отступы в навигации */
    justify-content: flex-start;
    /* Начинаем слева, если переносится */
  }

  nav a {
    padding: 8px 12px;
    font-size: 15px;
    /* Корректируем размер шрифта */
  }

  .logo {
    font-size: 20px;
    /* Корректируем размер лого */
  }

  .auth-section span {
    font-size: 15px;
    /* Корректируем размер шрифта */
  }

  .login-button,
  .logout-button {
    padding: 6px 14px;
    font-size: 13px;
    /* Корректируем размер шрифта */
  }
}

/* Мобильные телефоны */
@media (max-width: 768px) {
  .app-header {
    padding: 10px 0;
  }

  .container {
    padding: 0 16px;
    /* Лого и Аутентификация могут остаться сверху, навигация уйдет ниже */
    justify-content: space-between;
  }

  /* Прячем основную навигацию или делаем ее скроллящейся */
  nav {
    /* Вариант 1: Горизонтальный скролл */
    order: 3;
    /* Помещаем навигацию под лого и аутентификацией */
    width: 100%;
    /* Занимаем всю ширину */
    overflow-x: auto;
    /* Включаем горизонтальный скролл */
    overflow-y: hidden;
    /* Скрываем вертикальный скролл */
    justify-content: flex-start;
    /* Начинаем слева */
    padding-bottom: 8px;
    /* Отступ снизу для скроллбара */
    gap: 0;
    /* Убираем gap, т.к. padding уже есть */
    scrollbar-width: thin;
    /* Тонкий скроллбар для Firefox */
    scrollbar-color: #6c757d #343a40;
    /* Цвет скроллбара под темный фон */
  }

  /* Стилизация скроллбара для WebKit (Chrome, Safari) */
  nav::-webkit-scrollbar {
    height: 5px;
    /* Высота скроллбара */
  }

  nav::-webkit-scrollbar-track {
    background: #343a40;
    /* Фон трека под темный фон */
    border-radius: 4px;
  }

  nav::-webkit-scrollbar-thumb {
    background-color: #6c757d;
    /* Цвет ползунка под темный фон */
    border-radius: 4px;
    /* Скругление */
  }

  nav::-webkit-scrollbar-thumb:hover {
    background-color: #868e96;
    /* Цвет при наведении */
  }


  nav a {
    flex-shrink: 0;
    /* Предотвращаем сжатие ссылок в скролле */
    border-bottom-width: 0;
    /* Убираем нижнюю границу для экономии места */
    padding: 8px 12px;
    /* Уменьшаем отступы для компактности */
    font-size: 14px;
    /* Корректируем размер шрифта */
  }

  nav a.active {
    /* Возвращаем цвет и фон для активного элемента в скролле */
    background-color: #495057;
    /* Фон для активной ссылки */
    color: #89cff0;
    /* Цвет текста активной ссылки */
    border-bottom-width: 0;
  }

  /* Скрываем приветствие на маленьких экранах, оставляем кнопки */
  .auth-section span {
    display: none;
  }

  .auth-section {
    gap: 8px;
  }

  .login-button,
  .logout-button {
    padding: 5px 12px;
    font-size: 12px;
    /* Корректируем размер шрифта */
  }
}

/* Очень маленькие экраны */
@media (max-width: 480px) {
  .container {
    padding: 0 12px;
    gap: 10px;
  }

  .logo {
    font-size: 18px;
    /* Еще меньше лого */
  }

  .login-button,
  .logout-button {
    padding: 4px 10px;
    font-size: 11px;
  }

  nav a {
    padding: 6px 8px;
    font-size: 13px;
    /* Корректируем размер шрифта */
  }
}
</style>
