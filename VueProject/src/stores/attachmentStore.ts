// stores/attachmentStore.ts
import { defineStore } from 'pinia'
import axios from 'axios'
import type { Attachment } from '@/types/attachment'

export const useAttachmentStore = defineStore('attachmentStore', {
  state: () => ({
    attachments: new Map<number, Attachment[]>(),
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
        const response = await axios.get<Attachment[]>(`/api/attachments/?order=${orderId}`)

        if (Array.isArray(response.data)) {
          this.attachments.set(orderId, response.data)
        } else {
          const err = new Error(`Неверный формат данных от API вложений для заказа ${orderId}.`)
          this.attachmentError = err.message
          this.attachments.set(orderId, [])
        }
      } catch (error: any) {
        this.attachmentError =
          error.response?.data?.detail || error.message || 'Не удалось загрузить вложения.'
        this.attachments.set(orderId, [])
      } finally {
        this.isLoadingAttachments = false
      }
    },

    async uploadAttachment(
      orderId: number,
      file: File,
      description?: string | null,
    ): Promise<Attachment | null> {
      this.isUploadingAttachment = true
      this.attachmentError = null
      try {
        const formData = new FormData()
        formData.append('order', String(orderId))
        formData.append('file', file)
        if (description !== undefined && description !== null) {
          formData.append('description', description)
        }

        const response = await axios.post<Attachment>('/api/attachments/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })

        const newAttachment: Attachment = response.data
        const currentAttachments = this.attachments.get(orderId) || []
        this.attachments.set(orderId, [...currentAttachments, newAttachment])

        return newAttachment
      } catch (error: any) {
        this.attachmentError =
          error.response?.data?.detail || error.message || 'Не удалось загрузить файл.'
        return null
      } finally {
        this.isUploadingAttachment = false
      }
    },

    async deleteAttachment(attachmentId: number): Promise<boolean> {
      this.isDeletingAttachment = true
      this.attachmentError = null
      try {
        await axios.delete(`/api/attachments/${attachmentId}/`)

        for (const attachments of this.attachments.values()) {
          const index = attachments.findIndex((att) => att.id === attachmentId)
          if (index !== -1) {
            attachments.splice(index, 1)
            break
          }
        }

        return true
      } catch (error: any) {
        this.attachmentError =
          error.response?.data?.detail || error.message || 'Не удалось удалить файл.'
        return false
      } finally {
        this.isDeletingAttachment = false
      }
    },

    clearAttachmentsForOrder(orderId: number) {
      this.attachments.delete(orderId)
    },
  },

  getters: {
    getAttachmentsForOrder: (state) => (orderId: number) => {
      return state.attachments.get(orderId) || []
    },
    getIsLoadingAttachments: (state) => state.isLoadingAttachments,
    getIsUploadingAttachment: (state) => state.isUploadingAttachment,
    getIsDeletingAttachment: (state) => state.isDeletingAttachment,
    getAttachmentError: (state) => state.attachmentError,
  },
})
