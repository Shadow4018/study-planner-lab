import { useTaskContext } from '../hooks/useTaskContext'
import { useTaskQuery } from '../hooks/useTaskQuery'
import StatusMessage from './StatusMessage'
import TaskItem from './TaskItem'
import './TaskList.scss'

function TaskList() {
  const { tasks, status, errorMessage, retry } = useTaskContext()
  const { status: statusFilter, priority } = useTaskQuery()

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

  const visibleTasks = tasks.filter((task) => {
    if (statusFilter === 'completed' && !task.completed) return false
    if (statusFilter === 'active' && task.completed) return false
    if (priority !== 'all' && task.priority !== priority) return false
    return true
  })

  if (visibleTasks.length === 0) {
    return (
      <StatusMessage
        variant="empty"
        message="Завдань не знайдено."
        details={
          tasks.length > 0 ? 'За цими фільтрами на цій сторінці завдань немає.' : null
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
