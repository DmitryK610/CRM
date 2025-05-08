<template>
  <header class="app-header">
    <div class="container">
      <RouterLink to="/" class="logo">
        <StoneIcon class="logo-icon" />
        <span class="logo-text">StoneTop</span>
      </RouterLink>

      <nav class="main-nav">
        <RouterLink to="/orders" class="nav-link">
          <OrderIcon class="nav-icon" />
          <span>Заказы</span>
        </RouterLink>
        <RouterLink to="/clients" class="nav-link">
          <ClientIcon class="nav-icon" />
          <span>Клиенты</span>
        </RouterLink>
        <RouterLink to="/materials" class="nav-link">
          <MaterialIcon class="nav-icon" />
          <span>Материалы</span>
        </RouterLink>
      </nav>

      <div class="user-panel">
        <button class="notifications-btn" @click="toggleNotifications">
          <NotificationIcon />
          <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>
        </button>

        <div class="user-menu" @click="toggleUserMenu">
          <div class="user-avatar">
            <span>{{ userInitials }}</span>
          </div>
          <span class="user-name">{{ userName }}</span>
          <ChevronDownIcon class="chevron" :class="{ 'rotate-180': showMenu }" />

          <Transition name="fade">
            <div v-if="showMenu" class="dropdown-menu">
              <RouterLink to="/profile" class="dropdown-item">
                <UserIcon class="dropdown-icon" />
                Профиль
              </RouterLink>
              <button class="dropdown-item" @click="logout">
                <LogoutIcon class="dropdown-icon" />
                Выйти
              </button>
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <NotificationsPanel v-if="showNotifications" @close="showNotifications = false" />
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'
import StoneIcon from '@/components/icons/StoneIcon.vue'
import OrderIcon from '@/components/icons/OrderIcon.vue'
import ClientIcon from '@/components/icons/ClientIcon.vue'
import MaterialIcon from '@/components/icons/MaterialIcon.vue'
import NotificationIcon from '@/components/icons/NotificationIcon.vue'
import ChevronDownIcon from '@/components/icons/ChevronDownIcon.vue'
import UserIcon from '@/components/icons/UserIcon.vue'
import LogoutIcon from '@/components/icons/LogoutIcon.vue'
import NotificationsPanel from '@/components/layout/NotificationsPanel.vue'

const authStore = useAuthStore()
const router = useRouter()
const showMenu = ref(false)
const showNotifications = ref(false)
const unreadCount = ref(3)

const userName = computed(() => authStore.user?.ФИО || 'Пользователь')
const userInitials = computed(() => {
  if (!authStore.user?.ФИО) return 'П'
  const parts = authStore.user.ФИО.split(' ')
  return parts
    .map((p) => p[0])
    .join('')
    .toUpperCase()
})

const toggleUserMenu = () => {
  showMenu.value = !showMenu.value
}

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
  if (showNotifications.value) {

    unreadCount.value = 0
  }
}

const logout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.app-header {
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 60px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: #333;
  font-weight: 600;
  font-size: 1.2rem;
}

.logo-icon {
  width: 24px;
  height: 24px;
  color: #4caf50;
}

.main-nav {
  display: flex;
  gap: 20px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  color: #555;
  font-size: 0.95rem;
  padding: 8px 12px;
  border-radius: 4px;
  transition: all 0.2s;
}

.nav-link:hover {
  background-color: #f5f5f5;
}

.nav-link.router-link-exact-active {
  color: #4caf50;
  font-weight: 500;
}

.nav-icon {
  width: 18px;
  height: 18px;
}

.user-panel {
  display: flex;
  align-items: center;
  gap: 16px;
}

.notifications-btn {
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  color: #555;
}

.badge {
  position: absolute;
  top: 0;
  right: 0;
  background-color: #f44336;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 20px;
  transition: all 0.2s;
}

.user-menu:hover {
  background-color: #f5f5f5;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #4caf50;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 500;
}

.user-name {
  font-size: 0.9rem;
  font-weight: 500;
}

.chevron {
  width: 16px;
  height: 16px;
  transition: transform 0.2s;
}

.chevron.rotate-180 {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: white;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 180px;
  padding: 8px 0;
  margin-top: 8px;
  z-index: 10;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 16px;
  text-decoration: none;
  color: #333;
  font-size: 0.9rem;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
}

.dropdown-item:hover {
  background-color: #f5f5f5;
}

.dropdown-icon {
  width: 16px;
  height: 16px;
  color: #666;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
