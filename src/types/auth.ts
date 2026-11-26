/** Поточний користувач (доменна модель, не DTO DummyJSON). */
export interface AuthUser {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  image: string
}

/** Дані для входу з форми Login. */
export interface Credentials {
  username: string
  password: string
}

/**
 * Хто виконує дію: токен для заголовка Authorization та ім'я автора.
 * `null` означає гостя — repository не виконає захищену операцію.
 */
export interface AuthActor {
  token: string
  username: string
}
