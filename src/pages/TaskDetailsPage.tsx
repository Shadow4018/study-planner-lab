import { useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import { ApiError, getErrorMessage, normalizeError } from '../api/errors'
import StatusMessage from '../components/StatusMessage'
import TaskFormDialog from '../components/TaskFormDialog'
import { priorityLabels } from '../data/labels'
import { useAuthGuard } from '../hooks/useAuthGuard'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useTaskContext } from '../hooks/useTaskContext'
import { useTaskDetails } from '../hooks/useTaskDetails'
import { useToast } from '../hooks/useToast'
import type { TaskFormData } from '../schemas/taskSchema'
import { formatDateTime } from '../utils/format'
import { toTaskInput } from '../utils/taskForm'
import NotFoundPage from './NotFoundPage'
import './TaskDetailsPage.scss'

interface TaskDetailsViewProps {
  id: number
}

function TaskDetailsView({ id }: TaskDetailsViewProps) {
  // Деталі — окремий запит через repository (GET /todos/:id) зі скасуванням.
  const { status, data: task, error, retry, mutate } = useTaskDetails(id)
  const { updateTask, deleteTask, busyIds } = useTaskContext()
  const { showToast } = useToast()
  const requireAuth = useAuthGuard()
  const navigate = useNavigate()
  const { search } = useLocation()

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)

  useDocumentTitle(task ? `Study Planner — ${task.title}` : 'Study Planner — завдання')

  const listLink = { pathname: '/tasks', search }
  const isBusy = busyIds.includes(id)

  if (status === 'loading' && task === null) {
    return <StatusMessage variant="loading" message="Loading..." />
  }

  if (status === 'error' || task === null) {
    const notFound = error instanceof ApiError && error.status === 404
    return (
      <>
        <StatusMessage
          variant="error"
          message={notFound ? 'Завдання не знайдено.' : 'Не вдалося завантажити деталі.'}
          details={error ? getErrorMessage(error) : null}
          actionLabel={notFound ? undefined : 'Спробувати ще'}
          onAction={notFound ? undefined : retry}
        />
        <Link className="task-details__back" to={listLink}>
          ← До списку
        </Link>
      </>
    )
  }

  const handleEditClick = () => {
    if (requireAuth()) setIsEditOpen(true)
  }

  const handleEditSubmit = async (data: TaskFormData) => {
    const updated = await updateTask(id, toTaskInput(data))
  }

  const handleToggle = async () => {
    if (!requireAuth()) return
    try {
      const updated = await updateTask(id, { completed: !task.completed })
      mutate(() => updated)
    } catch (cause) {
      showToast(getErrorMessage(normalizeError(cause)), 'error')
    }
  }

  const handleDelete = async () => {
    if (!requireAuth()) return
    if (await deleteTask(id)) navigate(listLink, { replace: true })
    else setIsConfirmingDelete(false)
  }

  return (
    <article className="task-details" aria-labelledby="task-details-title">
      <Link className="task-details__back" to={listLink}>
        ← До списку
      </Link>

      <header className="task-details__header">
        <h2 className="task-details__title" id="task-details-title">
          {task.title}
        </h2>
      </header>

      <dl className="task-details__list">
        <div className="task-details__row">
          <dt className="task-details__label">Опис</dt>
          <dd className="task-details__value">
            {task.description || (
              <span className="task-details__muted">Опис не вказано</span>
            )}
          </dd>
        </div>
        <div className="task-details__row">
          <dt className="task-details__label">Категорія</dt>
          <dd className="task-details__value">{task.category}</dd>
        </div>
        <div className="task-details__row">
          <dt className="task-details__label">Пріоритет</dt>
          <dd className="task-details__value">{priorityLabels[task.priority]}</dd>
        </div>
        <div className="task-details__row">
          <dt className="task-details__label">Статус</dt>
          <dd className="task-details__value">
            {task.completed ? '✓ Виконано' : 'Не виконано'}
          </dd>
        </div>
        <div className="task-details__row">
          <dt className="task-details__label">Автор</dt>
          <dd className="task-details__value">
            {task.createdBy ?? <span className="task-details__muted">невідомо</span>}
          </dd>
        </div>
        <div className="task-details__row">
          <dt className="task-details__label">Створено</dt>
          <dd className="task-details__value">{formatDateTime(task.createdAt)}</dd>
        </div>
      </dl>

      <div className="task-details__actions">
        <button className="task-details__button task-details__button--primary" type="button" onClick={handleEditClick} disabled={isBusy}>
          Редагувати
        </button>
        <button className="task-details__button" type="button" onClick={handleToggle} disabled={isBusy}>
          {task.completed ? 'Повернути в роботу' : 'Позначити виконаним'}
        </button>
        {isConfirmingDelete ? (
          <span className="task-details__confirm" role="alertdialog" aria-label="Підтвердження видалення">
            Видалити?
            <button className="task-details__button task-details__button--delete" type="button" onClick={handleDelete} disabled={isBusy}>
              {isBusy ? 'Видалення…' : 'Так, видалити'}
            </button>
            <button className="task-details__button" type="button" onClick={() => setIsConfirmingDelete(false)} disabled={isBusy}>
              Скасувати
            </button>
          </span>
        ) : (
          <button
            className="task-details__button task-details__button--delete"
            type="button"
            onClick={() => (requireAuth() ? setIsConfirmingDelete(true) : undefined)}
            disabled={isBusy}
          >
            Видалити
          </button>
        )}
      </div>

      <TaskFormDialog
        open={isEditOpen}
        mode="edit"
        task={task}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleEditSubmit}
      />
    </article>
  )
}

function TaskDetailsPage() {
  const { taskId } = useParams()
  const id = Number(taskId)

  if (!Number.isInteger(id) || id < 1) return <NotFoundPage />

  return <TaskDetailsView key={id} id={id} />
}

export default TaskDetailsPage
