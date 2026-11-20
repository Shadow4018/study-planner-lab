import { useEffect } from 'react'
import type { ToastVariant } from '../context/TaskContext'
import './Toast.scss'

interface ToastProps {
  message: string
  variant?: ToastVariant
  /** Toast сам зникає через цей час (викликає onClose). */
  autoCloseMs: number
  onClose: () => void
}

function Toast({ message, variant = 'success', autoCloseMs, onClose }: ToastProps) {
  // Автозакриття — побічний ефект із таймером, тому cleanup обов'язковий.
  useEffect(() => {
    const timerId = setTimeout(onClose, autoCloseMs)
    return () => clearTimeout(timerId)
  }, [autoCloseMs, onClose])

  return (
    <div
      className={`toast toast--${variant}`}
      role={variant === 'error' ? 'alert' : undefined}
    >
      <p className="toast__message">{message}</p>
      <button
        className="toast__close"
        type="button"
        aria-label="Закрити повідомлення"
        onClick={onClose}
      >
        ×
      </button>
    </div>
  )
}

export default Toast
