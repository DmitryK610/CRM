

import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  
  const isModalOpen = ref(false)

  
  const currentModal = ref<string | null>(null)

  
  const isSidebarOpen = ref(false)

  
  const isLoading = ref(false)

  
  const notificationMessage = ref<string | null>(null)

  
  const notificationType = ref<'success' | 'error' | 'warning' | 'info' | null>(null)

  
  function openModal(modalName?: string) {
    isModalOpen.value = true
    if (modalName) {
      currentModal.value = modalName
    }
  }

  
  function closeModal() {
    isModalOpen.value = false
    currentModal.value = null
  }

  
  function openSidebar() {
    isSidebarOpen.value = true
  }

  
  function closeSidebar() {
    isSidebarOpen.value = false
  }

  
  function toggleSidebar() {
    isSidebarOpen.value = !isSidebarOpen.value
  }

  
  function showLoading() {
    isLoading.value = true
  }

  
  function hideLoading() {
    isLoading.value = false
  }

  
  function showNotification(message: string, type: 'success' | 'error' | 'warning' | 'info') {
    notificationMessage.value = message
    notificationType.value = type

    setTimeout(() => {
      notificationMessage.value = null
      notificationType.value = null
    }, 3000) // Например, скрыть через 3 секунды
  }

  
  function hideNotification() {
    notificationMessage.value = null
    notificationType.value = null
  }

  return {
    isModalOpen,
    currentModal,
    isSidebarOpen,
    isLoading,
    notificationMessage,
    notificationType,
    openModal,
    closeModal,
    openSidebar,
    closeSidebar,
    toggleSidebar,
    showLoading,
    hideLoading,
    showNotification,
    hideNotification,
  }
})
