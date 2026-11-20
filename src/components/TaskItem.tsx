import { useState } from 'react'
import type { FormEvent } from 'react'
import { priorityLabels } from '../data/labels'
import { useTaskContext } from '../hooks/useTaskContext'
import type { Task } from '../types/task'
import './TaskItem.scss'

interface TaskItemProps {
  task: Task
}

function TaskItem({ task }: TaskItemProps) {
  const { selectedId, busyIds, selectTask, toggleTask, renameTask, deleteTask } =
    useTaskContext()

  const { id, title, description, category, priority, completed } = task

  // Локальний UI state елемента: режим редагування та підтвердження видалення.
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(title)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)

  const isBusy = busyIds.includes(id)
  const isSelected = selectedId === id

  const classNames = ['task-item']
  if (completed) classNames.push('task-item--completed')
  if (isSelected) classNames.push('task-item--selected')
  if (isBusy) classNames.push('task-item--busy')

  const startEditing = () => {
    setDraft(title)
    setIsEditing(true)
  }

  const handleRename = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmed = draft.trim()
    if (trimmed === '') return
    if (trimmed === title) {
      setIsEditing(false)
      return
    }

    const ok = await renameTask(id, trimmed)
    if (ok) setIsEditing(false)
  }

  const handleDelete = async () => {
    const ok = await deleteTask(id)
    // Якщо видалення не вдалося, елемент лишається — ховаємо лише підтвердження.
    if (!ok) setIsConfirmingDelete(false)
  }

  return (
    <li className={classNames.join(' ')}>
      <div className="task-item__body">
        {isEditing ? (
          <form className="task-item__edit" onSubmit={handleRename}>
            <input
              className="task-item__edit-input"
              type="text"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              aria-label="Нова назва завдання"
              autoFocus
            />
            <button
              className="task-item__button task-item__button--primary"
              type="submit"
              disabled={isBusy || draft.trim() === ''}
            >
              {isBusy ? 'Збереження…' : 'Зберегти'}
            </button>
            <button
              className="task-item__button"
              type="button"
              onClick={() => setIsEditing(false)}
              disabled={isBusy}
            >
              Скасувати
            </button>
          </form>
        ) : (
          <h3 className="task-item__title">{title}</h3>
        )}

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
          <button
            type="button"
            className="task-item__button"
            onClick={() => selectTask(id)}
            aria-pressed={isSelected}
          >
            Деталі
          </button>
          <button
            type="button"
            className="task-item__button task-item__button--toggle"
            onClick={() => toggleTask(id)}
            disabled={isBusy}
          >
            {completed ? 'Повернути' : 'Виконано'}
          </button>
          <button
            type="button"
            className="task-item__button task-item__button--edit"
            onClick={startEditing}
            disabled={isBusy || isEditing}
            aria-label={`Редагувати завдання «${title}»`}
          >
            Редагувати
          </button>
          <button
            type="button"
            className="task-item__button task-item__button--delete"
            onClick={() => setIsConfirmingDelete(true)}
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
