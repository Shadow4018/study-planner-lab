/** Розмір сторінки списку (параметр limit у запиті). */
export const PAGE_SIZE = 10

/** Як довго (мс) показується Toast. */
export const TOAST_DURATION_MS = 3000

/**
 * Ключ localStorage для access token (відновлення сесії після перезавантаження).
 * Це компроміс: токен у localStorage доступний будь-якому скрипту сторінки (XSS).
 * Для навчальної роботи це прийнятно; у production краще httpOnly-cookie.
 */
export const AUTH_STORAGE_KEY = 'study-planner:access-token'

/** Категорія за замовчуванням, якщо поле у формі порожнє. */
export const DEFAULT_CATEGORY = 'General'
