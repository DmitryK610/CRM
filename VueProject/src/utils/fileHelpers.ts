// src/utils/fileHelpers.ts

import { API_BASE_URL } from './api'

/**
 * Формирует правильный URL для файла
 * @param fileUrl - URL файла из API
 * @returns Полный URL для доступа к файлу
 */
export function getFileUrl(fileUrl: string | null | undefined): string | null {
  if (!fileUrl) return null

  // Если URL уже абсолютный, возвращаем как есть
  if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
    return fileUrl
  }

  // Если URL относительный, добавляем базовый URL
  if (fileUrl.startsWith('/')) {
    return `${API_BASE_URL}${fileUrl}`
  }

  // Если URL не начинается с /, добавляем /
  return `${API_BASE_URL}/${fileUrl}`
}

/**
 * Форматирует размер файла в читаемом виде
 * @param bytes - размер файла в байтах
 * @param decimals - количество знаков после запятой
 * @returns Отформатированный размер файла
 */
export function formatFileSize(bytes: number | null | undefined, decimals = 2): string {
  if (bytes == null || bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * Получает расширение файла из имени
 * @param fileName - имя файла
 * @returns расширение файла
 */
export function getFileExtension(fileName: string | null | undefined): string {
  if (!fileName) return ''

  const parts = fileName.split('.')
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
}

/**
 * Проверяет, является ли файл изображением
 * @param mimeType - MIME тип файла
 * @returns true если файл является изображением
 */
export function isImageFile(mimeType: string | null | undefined): boolean {
  if (!mimeType) return false
  return mimeType.startsWith('image/')
}

/**
 * Проверяет, является ли файл документом
 * @param mimeType - MIME тип файла
 * @returns true если файл является документом
 */
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
