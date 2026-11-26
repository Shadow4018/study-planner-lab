
export type ApiErrorKind = 'network' | 'http' | 'parse' | 'config' | 'auth'

export class ApiError extends Error {
  readonly kind: ApiErrorKind
  readonly status: number | null

  constructor(kind: ApiErrorKind, message: string, status: number | null = null) {
    super(message)
    this.name = 'ApiError'
    this.kind = kind
    this.status = status
  }
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

export function normalizeError(error: unknown): ApiError {
  if (error instanceof ApiError) return error
  return new ApiError(
    'network',
    error instanceof Error ? error.message : 'Невідома помилка',
  )
}

export function getErrorMessage(error: ApiError): string {
  switch (error.kind) {
    case 'network':
      return 'Немає зв’язку з сервером. Перевірте інтернет-з’єднання.'
    case 'config':
      return 'Застосунок неправильно налаштований: не задано адресу API.'
    case 'parse':
      return 'Сервер повернув відповідь у неочікуваному форматі.'
    case 'auth':
      return 'Щоб виконати цю дію, увійдіть в акаунт.'
    case 'http':
      if (error.status === 401) return 'Сесія завершилась. Увійдіть знову.'
      if (error.status === 404) return 'Запис не знайдено.'
      if (error.status !== null && error.status >= 500) {
        return `Помилка на боці сервера (${error.status}). Спробуйте пізніше.`
      }
      return `Сервер відхилив запит (${error.status ?? '—'}).`
  }
}
