// stores/attachmentStore.ts
import { defineStore } from 'pinia'
import axios from 'axios'
import type { Attachment } from '@/types/attachment'
import { API_BASE_URL } from '@/utils/api'

// Настройка базового URL для axios
const api = axios.create({
  baseURL: API_BASE_URL
})

export const useAttachmentStore = defineStore('attachmentStore', {
  state: () => ({
    orderAttachments: new Map<number, Attachment[]>(),
    calculationAttachments: new Map<number, Attachment[]>(),
    isLoadingAttachments: false,
    isUploadingAttachment: false,
    isDeletingAttachment: false,
    attachmentError: null as string | null,
  }),

  actions: {
    clearAttachmentError() {
      this.attachmentError = null
    },

    async fetchAttachmentsForOrder(orderId: number) {
      this.isLoadingAttachments = true
      this.attachmentError = null
      try {
        const response = await api.get<Attachment[]>(`/api/attachments/?order=${orderId}`)

        if (Array.isArray(response.data)) {
          this.orderAttachments.set(orderId, response.data)
        } else {
          const err = new Error(`Неверный формат данных от API вложений для заказа ${orderId}.`)
          this.attachmentError = err.message
          this.orderAttachments.set(orderId, [])
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Не удалось загрузить вложения.'
        this.attachmentError = errorMessage
        this.orderAttachments.set(orderId, [])
      } finally {
        this.isLoadingAttachments = false
      }
    },

    async fetchAttachmentsForCalculation(calculationId: number) {
      this.isLoadingAttachments = true
      this.attachmentError = null
      try {
        const response = await api.get<Attachment[]>(
          `/api/attachments/?calculation=${calculationId}`,
        )

        if (Array.isArray(response.data)) {
          this.calculationAttachments.set(calculationId, response.data)
        } else {
          const err = new Error(
            `Неверный формат данных от API вложений для расчета ${calculationId}.`,
          )
          this.attachmentError = err.message
          this.calculationAttachments.set(calculationId, [])
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Не удалось загрузить вложения.'
        this.attachmentError = errorMessage
        this.calculationAttachments.set(calculationId, [])
      } finally {
        this.isLoadingAttachments = false
      }
    },

    async uploadAttachment(
      id: number,
      file: File,
      description?: string | null,
      type: 'order' | 'calculation' = 'order',
    ): Promise<Attachment | null> {
      this.isUploadingAttachment = true
      this.attachmentError = null
      try {
        const formData = new FormData()
        formData.append(type, String(id))
        formData.append('file', file)
        if (description !== undefined && description !== null) {
          formData.append('description', description)
        }

        const response = await api.post<Attachment>('/api/attachments/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })

        const newAttachment: Attachment = response.data
        const attachmentMap = type === 'order' ? this.orderAttachments : this.calculationAttachments
        const currentAttachments = attachmentMap.get(id) || []
        attachmentMap.set(id, [...currentAttachments, newAttachment])

        return newAttachment
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Не удалось загрузить файл.'
        this.attachmentError = errorMessage
        return null
      } finally {
        this.isUploadingAttachment = false
      }
    },

    async deleteAttachment(attachmentId: number): Promise<boolean> {
      this.isDeletingAttachment = true
      this.attachmentError = null
      try {
        await api.delete(`/api/attachments/${attachmentId}/`)

        // Удаляем из обеих карт (заказы и расчеты)
        for (const attachments of this.orderAttachments.values()) {
          const index = attachments.findIndex((att) => att.id === attachmentId)
          if (index !== -1) {
            attachments.splice(index, 1)
            break
          }
        }

        for (const attachments of this.calculationAttachments.values()) {
          const index = attachments.findIndex((att) => att.id === attachmentId)
          if (index !== -1) {
            attachments.splice(index, 1)
            break
          }
        }

        return true
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Не удалось удалить файл.'
        this.attachmentError = errorMessage
        return false
      } finally {
        this.isDeletingAttachment = false
      }
    },

    clearAttachmentsForOrder(orderId: number) {
      this.orderAttachments.delete(orderId)
    },

    clearAttachmentsForCalculation(calculationId: number) {
      this.calculationAttachments.delete(calculationId)
    },
  },

  getters: {
    getAttachmentsForOrder: (state) => (orderId: number) => {
      return state.orderAttachments.get(orderId) || []
    },
    getAttachmentsForCalculation: (state) => (calculationId: number) => {
      return state.calculationAttachments.get(calculationId) || []
    },
    getIsLoadingAttachments: (state) => state.isLoadingAttachments,
    getIsUploadingAttachment: (state) => state.isUploadingAttachment,
    getIsDeletingAttachment: (state) => state.isDeletingAttachment,
    getAttachmentError: (state) => state.attachmentError,
  },
})
