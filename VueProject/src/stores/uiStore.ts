// src/stores/uiStore.ts

import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  /**
   * Состояние для отображения/скрытия модального окна.
   */
  const isModalOpen = ref(false)

  /**
   * Состояние для хранения названия текущего отображаемого модального окна (если их несколько).
   */
  const currentModal = ref<string | null>(null)

  /**
   * Состояние для отображения/скрытия боковой панели (например, навигации).
   */
  const isSidebarOpen = ref(false)

  /**
   * Состояние для отображения/скрытия индикатора загрузки.
   */
  const isLoading = ref(false)

  /**
   * Состояние для хранения текста сообщения уведомления.
   */
  const notificationMessage = ref<string | null>(null)

  /**
   * Состояние для определения типа уведомления (success, error, warning, info).
   */
  const notificationType = ref<'success' | 'error' | 'warning' | 'info' | null>(null)

  /**
   * Действие для открытия модального окна.
   * @param modalName Название модального окна для отображения (опционально).
   */
  function openModal(modalName?: string) {
    isModalOpen.value = true
    if (modalName) {
      currentModal.value = modalName
    }
  }

  /**
   * Действие для закрытия модального окна.
   */
  function closeModal() {
    isModalOpen.value = false
    currentModal.value = null
  }

  /**
   * Действие для открытия боковой панели.
   */
  function openSidebar() {
    isSidebarOpen.value = true
  }

  /**
   * Действие для закрытия боковой панели.
   */
  function closeSidebar() {
    isSidebarOpen.value = false
  }

  /**
   * Действие для переключения состояния боковой панели.
   */
  function toggleSidebar() {
    isSidebarOpen.value = !isSidebarOpen.value
  }

  /**
   * Действие для отображения индикатора загрузки.
   */
  function showLoading() {
    isLoading.value = true
  }

  /**
   * Действие для скрытия индикатора загрузки.
   */
  function hideLoading() {
    isLoading.value = false
  }

  /**
   * Действие для показа уведомления.
   * @param message Текст уведомления.
   * @param type Тип уведомления ('success', 'error', 'warning', 'info').
   */
  function showNotification(message: string, type: 'success' | 'error' | 'warning' | 'info') {
    notificationMessage.value = message
    notificationType.value = type
    // Можно добавить логику автоматического скрытия уведомления через некоторое время
    setTimeout(() => {
      notificationMessage.value = null
      notificationType.value = null
    }, 3000) // Например, скрыть через 3 секунды
  }

  /**
   * Действие для скрытия уведомления вручную.
   */
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
