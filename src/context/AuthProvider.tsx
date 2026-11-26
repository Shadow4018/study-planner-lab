import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { isAbortError } from '../api/errors'
import { AUTH_STORAGE_KEY } from '../constants'
import { authRepository } from '../repositories/authRepository'
import type { AuthUser, Credentials } from '../types/auth'
import { readStorage, removeStorage, writeStorage } from '../utils/storage'
import { AuthContext } from './AuthContext'
import type { AuthContextValue } from './AuthContext'

interface Session {
  user: AuthUser
  accessToken: string
}

const isString = (value: unknown): value is string =>
  typeof value === 'string' && value !== ''

const readStoredToken = (): string | null =>
  readStorage<string | null>(AUTH_STORAGE_KEY, null, isString)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [isRestoring, setIsRestoring] = useState(() => readStoredToken() !== null)

  useEffect(() => {
    const token = readStoredToken()
    if (token === null) return

    const controller = new AbortController()
    authRepository
      .getCurrentUser(token, controller.signal)
      .then((user) => {
        if (controller.signal.aborted) return
        setSession({ user, accessToken: token })
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted || isAbortError(cause)) return
        removeStorage(AUTH_STORAGE_KEY)
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsRestoring(false)
      })

    return () => controller.abort()
  }, [])

  const login = useCallback(async (credentials: Credentials) => {
    const { user, accessToken } = await authRepository.login(credentials)
    writeStorage(AUTH_STORAGE_KEY, accessToken)
    setSession({ user, accessToken })
  }, [])

  const logout = useCallback(() => {
    removeStorage(AUTH_STORAGE_KEY)
    setSession(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      accessToken: session?.accessToken ?? null,
      isAuthenticated: session !== null,
      isRestoring,
      login,
      logout,
    }),
    [session, isRestoring, login, logout],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
