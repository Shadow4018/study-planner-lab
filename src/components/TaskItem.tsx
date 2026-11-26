import { useState } from 'react'
import { Link, useLocation } from 'react-router'
import { priorityLabels } from '../data/labels'
import { useAuthGuard } from '../hooks/useAuthGuard'
import { useTaskContext } from '../hooks/useTaskContext'
import type { Task } from '../types/task'
import './TaskItem.scss'

interface TaskItemProps {
  task: Task
}

function TaskItem({ task }: TaskItemProps) {
  const { busyIds, toggleTask, deleteTask } = useTaskContext()
  const requireAuth = useAuthGuard()
  const { search } = useLocation()

  const { id, title, description, category, priority, completed } = task

  // Локальний UI state елемента: підтвердження видалення.
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)

  const isBusy = busyIds.includes(id)

  const classNames = ['task-item']
  if (completed) classNames.push('task-item--completed')
  if (isBusy) classNames.push('task-item--busy')

  const handleToggle = () => {
    // Гість → перенаправлення на Login; сама операція ще раз перевіряється в repository.
    if (!requireAuth()) return
    void toggleTask(id)
  }

  const handleDelete = async () => {
    if (!requireAuth()) return
    const ok = await deleteTask(id)
    // Якщо видалення не вдалося, елемент лишається — ховаємо лише підтвердження.
    if (!ok) setIsConfirmingDelete(false)
  }

  return (
    <li className={classNames.join(' ')}>
      <div className="task-item__body">
        <h3 className="task-item__title">{title}</h3>

        {description && <p className="task-item__description">{description}</p>}

        <div className="task-item__meta">
          <span className="task-item__badge task-item__badge--category">
            {category}
          </span>
          <span
            className={`task-item__badge task-item__badge--priority-${priority}`}
          >
            {priorityLabels[priority]}
          </span>
          <span
            className={
              completed
                ? 'task-item__status task-item__status--done'
                : 'task-item__status'
            }
          >
            {completed ? '✓ Виконано' : 'У процесі'}
          </span>
        </div>
      </div>

      {isConfirmingDelete ? (
        <div className="task-item__confirm" role="alertdialog" aria-label="Підтвердження видалення">
          <span className="task-item__confirm-text">Видалити це завдання?</span>
          <button
            className="task-item__button task-item__button--delete"
            type="button"
            onClick={handleDelete}
            disabled={isBusy}
          >
            {isBusy ? 'Видалення…' : 'Так, видалити'}
          </button>
          <button
            className="task-item__button"
            type="button"
            onClick={() => setIsConfirmingDelete(false)}
            disabled={isBusy}
          >
            Скасувати
          </button>
        </div>
      ) : (
        <div className="task-item__actions">
          {/* Параметри списку (?page, ?status…) переносимо в адресу деталей —
              так «Назад до списку» повертає на ту саму сторінку з тими ж фільтрами. */}
          <Link
            className="task-item__button"
            to={{ pathname: `/tasks/${id}`, search }}
            aria-label={`Деталі завдання «${title}»`}
          >
            Деталі
          </Link>
          <button
            type="button"
            className="task-item__button task-item__button--toggle"
            onClick={handleToggle}
            disabled={isBusy}
          >
            {completed ? 'Повернути' : 'Виконано'}
          </button>
          <button
            type="button"
            className="task-item__button task-item__button--delete"
            onClick={() => (requireAuth() ? setIsConfirmingDelete(true) : undefined)}
            disabled={isBusy}
            aria-label={`Видалити завдання «${title}»`}
          >
            Видалити
          </button>
        </div>
      )}
    </li>
  )
}

export default TaskItem
