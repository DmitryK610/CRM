

import { API_BASE_URL } from './api'


export function getFileUrl(fileUrl: string | null | undefined): string | null {
  if (!fileUrl) return null


  if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
    return fileUrl
  }


  if (fileUrl.startsWith('/')) {
    return `${API_BASE_URL}${fileUrl}`
  }


  return `${API_BASE_URL}/${fileUrl}`
}


export function formatFileSize(bytes: number | null | undefined, decimals = 2): string {
  if (bytes == null || bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}


export function getFileExtension(fileName: string | null | undefined): string {
  if (!fileName) return ''

  const parts = fileName.split('.')
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
}


export function isImageFile(mimeType: string | null | undefined): boolean {
  if (!mimeType) return false
  return mimeType.startsWith('image/')
}


export function isDocumentFile(mimeType: string | null | undefined): boolean {
  if (!mimeType) return false

  const documentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ]

  return documentTypes.includes(mimeType)
}
