import './StatusMessage.scss'

interface StatusMessageProps {
  variant: 'loading' | 'error' | 'empty'
  message: string
  /** Додаткове пояснення (наприклад, причина помилки). */
  details?: string | null
  actionLabel?: string
  onAction?: () => void
}

/** Єдиний вигляд для станів loading / error / empty. */
function StatusMessage({
  variant,
  message,
  details,
  actionLabel,
  onAction,
}: StatusMessageProps) {
  return (
    <div
      className={`status-message status-message--${variant}`}
      role={variant === 'error' ? 'alert' : 'status'}
    >
      {variant === 'loading' && (
        <span className="status-message__spinner" aria-hidden="true" />
      )}
      <p className="status-message__text">{message}</p>
      {details && <p className="status-message__details">{details}</p>}
      {actionLabel && onAction && (
        <button className="status-message__action" type="button" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export default StatusMessage
