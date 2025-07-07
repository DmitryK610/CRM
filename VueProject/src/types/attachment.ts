// types/attachment.ts
export interface Attachment {
  id: number
  order?: number
  calculation?: number
  file: string | null
  description?: string | null
  uploaded_at: string

  file_name?: string | null
  file_size?: number | null
  mime_type?: string | null
}
