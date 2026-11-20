import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { priorityLabels, priorityOptions } from '../data/labels'
import { useTaskContext } from '../hooks/useTaskContext'
import type { Priority } from '../types/task'
import './TaskForm.scss'

const DEFAULT_CATEGORY = 'General'

function TaskForm() {
  const { createTask } = useTaskContext()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value)
    if (error) setError('')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedTitle = title.trim()
    if (trimmedTitle === '') {
      setError('Вкажіть назву завдання.')
      return
    }

    setIsSubmitting(true)
    const ok = await createTask({
      title: trimmedTitle,
      description: description.trim(),
      category: category.trim() || DEFAULT_CATEGORY,
      priority,
    })
    setIsSubmitting(false)

    // Форму очищаємо лише після успіху: при помилці дані лишаються для повтору.
    if (ok) {
      setTitle('')
      setDescription('')
      setCategory('')
      setPriority('medium')
      setError('')
    }
  }

  return (
    <form className="task-form" onSubmit={handleSubmit} noValidate>
      <h2 className="task-form__title">Нове завдання</h2>

      <div className="task-form__field">
        <label className="task-form__label" htmlFor="task-title">
          Назва *
        </label>
        <input
          id="task-title"
          className={
            error
              ? 'task-form__input task-form__input--invalid'
              : 'task-form__input'
          }
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Наприклад, Вивчити fetch та AbortController"
          disabled={isSubmitting}
          aria-invalid={error !== ''}
          aria-describedby={error ? 'task-title-error' : undefined}
        />
        {error && (
          <p className="task-form__error" id="task-title-error" role="alert">
            {error}
          </p>
        )}
      </div>

      <div className="task-form__field">
        <label className="task-form__label" htmlFor="task-description">
          Опис
        </label>
        <textarea
          id="task-description"
          className="task-form__input task-form__input--textarea"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Короткий опис завдання"
          rows={2}
          disabled={isSubmitting}
        />
      </div>

      <div className="task-form__row">
        <div className="task-form__field">
          <label className="task-form__label" htmlFor="task-category">
            Категорія
          </label>
          <input
            id="task-category"
            className="task-form__input"
            type="text"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            placeholder={DEFAULT_CATEGORY}
            disabled={isSubmitting}
          />
        </div>

        <div className="task-form__field">
          <label className="task-form__label" htmlFor="task-priority">
            Пріоритет
          </label>
          <select
            id="task-priority"
            className="task-form__input"
            value={priority}
            onChange={(event) => setPriority(event.target.value as Priority)}
            disabled={isSubmitting}
          >
            {priorityOptions.map((option) => (
              <option key={option} value={option}>
                {priorityLabels[option]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        className="task-form__submit"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Збереження…' : 'Додати'}
      </button>
    </form>
  )
}

export default TaskForm
