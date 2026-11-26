import { useCallback, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ToastContext } from './ToastContext'
import type { ToastContextValue, ToastData, ToastVariant } from './ToastContext'

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastData | null>(null)
  const seq = useRef(0)

  const showToast = useCallback(
    (message: string, variant: ToastVariant = 'success') => {
      seq.current += 1
      setToast({ id: seq.current, message, variant })
    },
    [],
  )
  const dismissToast = useCallback(() => setToast(null), [])

  const value = useMemo<ToastContextValue>(
    () => ({ toast, showToast, dismissToast }),
    [toast, showToast, dismissToast],
  )

  return <ToastContext value={value}>{children}</ToastContext>
}
