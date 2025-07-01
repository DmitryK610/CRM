// types/attachment.ts
export interface Attachment {
  id: number
  order?: number
  calculation?: number
  file: string
  description?: string | null
  uploaded_at: string

  file_name: string
  file_size: number
  mime_type: string
}
