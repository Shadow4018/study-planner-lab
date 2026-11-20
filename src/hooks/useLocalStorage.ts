import { useEffect, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { readStorage, writeStorage } from '../utils/storage'

/**
 * Як useState, але значення зберігається в localStorage.
 *
 * - початкове значення читається зі сховища (лише один раз, ліниво);
 * - пошкоджені або невалідні дані замінюються на `initialValue`;
 * - після кожної зміни значення Effect синхронізує його зі сховищем.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  validate?: (value: unknown) => value is T,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() =>
    readStorage(key, initialValue, validate),
  )

  useEffect(() => {
    writeStorage(key, value)
  }, [key, value])

  return [value, setValue]
}
