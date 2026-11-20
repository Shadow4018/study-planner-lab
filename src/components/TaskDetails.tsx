import { priorityLabels } from '../data/labels'
import { useTaskContext } from '../hooks/useTaskContext'
import { useTaskDetails } from '../hooks/useTaskDetails'
import { getErrorMessage } from '../api/errors'
import StatusMessage from './StatusMessage'
import './TaskDetails.scss'

interface TaskDetailsContentProps {
  id: number
}

/** Завантажує деталі через taskRepository.getById (з можливістю скасування). */
function TaskDetailsContent({ id }: TaskDetailsContentProps) {
  const { tasks } = useTaskContext()
  const { status, data, error, retry } = useTaskDetails(id)

  if (status === 'loading') {
    return <StatusMessage variant="loading" message="Loading..." />
  }

  if (status === 'error' || data === null) {
    return (
      <StatusMessage
        variant="error"
        message="Не вдалося завантажити деталі."
        details={error ? getErrorMessage(error) : null}
        actionLabel="Спробувати ще"
        onAction={retry}
      />
    )
  }

  // DummyJSON не зберігає зміни, тому для полів, які користувач уже змінив у
  // списку, показуємо актуальне клієнтське значення (з реальним API тут був би
  // просто повторний запит).
  const live = tasks.find((task) => task.id === id)
  const title = live?.title ?? data.title
  const completed = live?.completed ?? data.completed

  return (
    <dl className="task-details__list">
      <div className="task-details__row">
        <dt className="task-details__label">Назва</dt>
        <dd className="task-details__value">{title}</dd>
      </div>
      <div className="task-details__row">
        <dt className="task-details__label">Опис</dt>
        <dd className="task-details__value">
          {data.description || <span className="task-details__muted">Опис не вказано</span>}
        </dd>
      </div>
      <div className="task-details__row">
        <dt className="task-details__label">Категорія</dt>
        <dd className="task-details__value">{data.category}</dd>
      </div>
      <div className="task-details__row">
        <dt className="task-details__label">Пріоритет</dt>
        <dd className="task-details__value">{priorityLabels[data.priority]}</dd>
      </div>
      <div className="task-details__row">
        <dt className="task-details__label">Статус</dt>
        <dd className="task-details__value">
          {completed ? '✓ Виконано' : 'Не виконано'}
        </dd>
      </div>
    </dl>
  )
}

function TaskDetails() {
  const { selectedId, closeDetails } = useTaskContext()

  if (selectedId === null) return null

  return (
    <section className="task-details" aria-label="Деталі завдання">
      <header className="task-details__header">
        <h2 className="task-details__title">Деталі завдання</h2>
        <button
          className="task-details__close"
          type="button"
          onClick={closeDetails}
          aria-label="Закрити деталі"
        >
          ×
        </button>
      </header>

      {/* key: для іншого завдання компонент створюється заново й скасовує попередній запит */}
      <TaskDetailsContent key={selectedId} id={selectedId} />
    </section>
  )
}

export default TaskDetails
