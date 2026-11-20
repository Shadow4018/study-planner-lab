import { TOAST_DURATION_MS } from '../constants'
import { useTaskContext } from '../hooks/useTaskContext'
import Toast from './Toast'
import './ToastContainer.scss'

function ToastContainer() {
  const { toast, dismissToast } = useTaskContext()

  return (
    <div className="toast-container" aria-live="polite">
      {toast && (
        // key: новий toast перезапускає таймер автозакриття.
        <Toast
          key={toast.id}
          variant={toast.variant}
          message={toast.message}
          autoCloseMs={TOAST_DURATION_MS}
          onClose={dismissToast}
        />
      )}
    </div>
  )
}

export default ToastContainer
