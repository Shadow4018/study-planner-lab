import { useTaskContext } from '../hooks/useTaskContext'
import StatusMessage from './StatusMessage'
import TaskItem from './TaskItem'
import './TaskList.scss'

function TaskList() {
  const { tasks, status, errorMessage, retry, filter } = useTaskContext()

  // Три асинхронні стани: loading → error (з повтором) → success.
  if (status === 'loading') {
    return <StatusMessage variant="loading" message="Loading..." />
  }

  if (status === 'error') {
    return (
      <StatusMessage
        variant="error"
        message="Помилка завантаження."
        details={errorMessage}
        actionLabel="Спробувати ще"
        onAction={retry}
      />
    )
  }

  // Фільтр — client/UI state: застосовується до завантаженої сторінки.
  const visibleTasks = tasks.filter((task) => {
    if (filter === 'completed') return task.completed
    if (filter === 'active') return !task.completed
    return true
  })

  // Empty state: порожній результат не виглядає як зламаний інтерфейс.
  if (visibleTasks.length === 0) {
    return (
      <StatusMessage
        variant="empty"
        message="Завдань не знайдено."
        details={
          tasks.length > 0 ? 'За цим фільтром на цій сторінці завдань немає.' : null
        }
      />
    )
  }

  return (
    <ul className="task-list">
      {visibleTasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </ul>
  )
}

export default TaskList
