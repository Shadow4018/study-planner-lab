/**
 * Безпечна робота з localStorage.
 * Доступ до сховища може кинути виняток (приватний режим, переповнення квоти,
 * заборонені cookies), а збережений JSON може бути пошкоджений — застосунок
 * не повинен через це ламатися.
 */

export function readStorage<T>(
  key: string,
  fallback: T,
  validate?: (value: unknown) => value is T,
): T {
  try {
    const raw = window.localStorage.getItem(key)
    if (raw === null) return fallback

    const parsed: unknown = JSON.parse(raw)
    if (validate && !validate(parsed)) return fallback

    return parsed as T
  } catch {
    // JSON.parse або доступ до сховища не вдався — використовуємо запасне значення.
    return fallback
  }
}

/** Повертає true, якщо запис вдався. */
export function writeStorage(key: string, value: unknown): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}
