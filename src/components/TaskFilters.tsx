import {
  filterLabels,
  filterOptions,
  priorityFilterLabels,
  priorityFilterOptions,
} from '../data/labels'
import { useTaskContext } from '../hooks/useTaskContext'
import { useTaskQuery } from '../hooks/useTaskQuery'
import type { Task, TaskFilter } from '../types/task'
import './TaskFilters.scss'

function countByFilter(tasks: Task[], filter: TaskFilter): number {
  if (filter === 'completed') return tasks.filter((task) => task.completed).length
  if (filter === 'active') return tasks.filter((task) => !task.completed).length
  return tasks.length
}

const buttonClass = (isActive: boolean) =>
  isActive
    ? 'task-filters__button task-filters__button--active'
    : 'task-filters__button'

function TaskFilters() {
  const { tasks } = useTaskContext()
  const { status, priority, setStatus, setPriority } = useTaskQuery()

  return (
    <div className="task-filters">
      <div className="task-filters__group" role="group" aria-label="Фільтр за статусом">
        {filterOptions.map((filter) => {
          const isActive = filter === status
          return (
            <button
              key={filter}
              type="button"
              className={buttonClass(isActive)}
              aria-pressed={isActive}
              onClick={() => setStatus(filter)}
            >
              {filterLabels[filter]}
              <span className="task-filters__count">
                {countByFilter(tasks, filter)}
              </span>
            </button>
          )
        })}
      </div>

      <div className="task-filters__group" role="group" aria-label="Фільтр за пріоритетом">
        {priorityFilterOptions.map((option) => {
          const isActive = option === priority
          return (
            <button
              key={option}
              type="button"
              className={buttonClass(isActive)}
              aria-pressed={isActive}
              onClick={() => setPriority(option)}
            >
              {priorityFilterLabels[option]}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default TaskFilters
