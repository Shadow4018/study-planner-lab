import { useCallback, useEffect, useId, useRef, useState } from 'react'
import type { SyntheticEvent } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { getErrorMessage, normalizeError } from '../api/errors'
import { priorityLabels, priorityOptions } from '../data/labels'
import { DEFAULT_CATEGORY } from '../constants'
import { taskSchema } from '../schemas/taskSchema'
import type { TaskFormData } from '../schemas/taskSchema'
import type { Task } from '../types/task'
import { toFormValues } from '../utils/taskForm'
import './TaskFormDialog.scss'

export interface TaskFormDialogProps {
  open: boolean
  /** create — порожня форма; edit — поля заповнюються з `task`. */
  mode: 'create' | 'edit'
  task?: Task
  onClose: () => void
  /** Має кинути виняток, якщо збереження не вдалося (форма покаже помилку й лишиться відкритою). */
  onSubmit: (data: TaskFormData) => Promise<void>
}

interface FormContentProps extends Omit<TaskFormDialogProps, 'open'> {
  titleId: string
  onPendingChange: (pending: boolean) => void
}

/** Сама форма. Монтується щоразу при відкритті діалогу → defaultValues завжди свіжі. */
function TaskFormContent({
  mode,
  task,
  onClose,
  onSubmit,
  titleId,
  onPendingChange,
}: FormContentProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: toFormValues(mode === 'edit' ? task : undefined),
  })
  const [submitError, setSubmitError] = useState<string | null>(null)
  const uid = useId()

  // Повідомляємо діалогу про pending: поки йде запит, Escape/Cancel не закривають його.
  useEffect(() => {
    onPendingChange(isSubmitting)
  }, [isSubmitting, onPendingChange])

  const submit = async (data: TaskFormData) => {
    setSubmitError(null)
    try {
      await onSubmit(data)
      onClose() // успіх → закриваємо діалог
    } catch (cause) {
      setSubmitError(getErrorMessage(normalizeError(cause)))
    }
  }

  const field = (name: keyof TaskFormData) => `${uid}-${name}`
  const inputClass = (name: keyof TaskFormData, extra = '') =>
    ['task-form-dialog__input', extra, errors[name] ? 'task-form-dialog__input--invalid' : '']
      .filter(Boolean)
      .join(' ')

  return (
    <form className="task-form-dialog__form" onSubmit={handleSubmit(submit)} noValidate>
      <h2 className="task-form-dialog__title" id={titleId}>
        {mode === 'create' ? 'Нове завдання' : 'Редагування завдання'}
      </h2>

      <div className="task-form-dialog__field">
        <label className="task-form-dialog__label" htmlFor={field('title')}>
          Назва *
        </label>
        <input
          id={field('title')}
          className={inputClass('title')}
          type="text"
          placeholder="Наприклад, Вивчити React Router"
          disabled={isSubmitting}
          aria-invalid={errors.title ? true : undefined}
          aria-describedby={errors.title ? `${field('title')}-error` : undefined}
          {...register('title')}
        />
        {errors.title && (
          <p className="task-form-dialog__error" id={`${field('title')}-error`} role="alert">
            {errors.title.message}
          </p>
        )}
      </div>

      <div className="task-form-dialog__field">
        <label className="task-form-dialog__label" htmlFor={field('description')}>
          Опис
        </label>
        <textarea
          id={field('description')}
          className={inputClass('description', 'task-form-dialog__input--textarea')}
          rows={3}
          placeholder="Короткий опис завдання"
          disabled={isSubmitting}
          aria-invalid={errors.description ? true : undefined}
          aria-describedby={errors.description ? `${field('description')}-error` : undefined}
          {...register('description')}
        />
        {errors.description && (
          <p className="task-form-dialog__error" id={`${field('description')}-error`} role="alert">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="task-form-dialog__row">
        <div className="task-form-dialog__field">
          <label className="task-form-dialog__label" htmlFor={field('category')}>
            Категорія
          </label>
          <input
            id={field('category')}
            className={inputClass('category')}
            type="text"
            placeholder={DEFAULT_CATEGORY}
            disabled={isSubmitting}
            aria-invalid={errors.category ? true : undefined}
            aria-describedby={errors.category ? `${field('category')}-error` : undefined}
            {...register('category')}
          />
          {errors.category && (
            <p className="task-form-dialog__error" id={`${field('category')}-error`} role="alert">
              {errors.category.message}
            </p>
          )}
        </div>

        <div className="task-form-dialog__field">
          <label className="task-form-dialog__label" htmlFor={field('priority')}>
            Пріоритет
          </label>
          <select
            id={field('priority')}
            className={inputClass('priority')}
            disabled={isSubmitting}
            {...register('priority')}
          >
            {priorityOptions.map((option) => (
              <option key={option} value={option}>
                {priorityLabels[option]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {submitError && (
        <p className="task-form-dialog__error task-form-dialog__error--form" role="alert">
          {submitError}
        </p>
      )}

      <div className="task-form-dialog__actions">
        <button
          className="task-form-dialog__button"
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Скасувати
        </button>
        <button
          className="task-form-dialog__button task-form-dialog__button--primary"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Збереження…' : mode === 'create' ? 'Додати' : 'Зберегти'}
        </button>
      </div>
    </form>
  )
}

/**
 * Одна форма для create та edit (режим і початкові дані — через props).
 * Базується на нативному <dialog>: showModal() дає модальність, фокус у діалозі
 * (focus trap), повернення фокуса на кнопку-тригер і закриття по Escape.
 */
function TaskFormDialog({ open, mode, task, onClose, onSubmit }: TaskFormDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const [pending, setPending] = useState(false)
  const handlePendingChange = useCallback((value: boolean) => setPending(value), [])

  // Синхронізація стану React з DOM-елементом <dialog> (зовнішня система).
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  // Escape: під час збереження діалог не закриваємо.
  const handleCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
    if (pending) event.preventDefault()
  }

  return (
    <dialog
      ref={dialogRef}
      className="task-form-dialog"
      aria-labelledby={titleId}
      onCancel={handleCancel}
      onClose={onClose} // подія close: Escape або dialog.close()
    >
      {open && (
        <TaskFormContent
          mode={mode}
          task={task}
          onClose={onClose}
          onSubmit={onSubmit}
          titleId={titleId}
          onPendingChange={handlePendingChange}
        />
      )}
    </dialog>
  )
}

export default TaskFormDialog
