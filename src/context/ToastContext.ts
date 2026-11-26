import { createContext } from 'react'

export type ToastVariant = 'success' | 'error' | 'info'

export interface ToastData {
  id: number
  message: string
  variant: ToastVariant
}

export interface ToastContextValue {
  toast: ToastData | null
  showToast: (message: string, variant?: ToastVariant) => void
  dismissToast: () => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)
