import { filterLabels, filterOptions } from '../data/labels'
import { useTaskContext } from '../hooks/useTaskContext'
import type { Task, TaskFilter } from '../types/task'
import './TaskFilters.scss'

function countByFilter(tasks: Task[], filter: TaskFilter): number {
  if (filter === 'completed') return tasks.filter((task) => task.completed).length
  if (filter === 'active') return tasks.filter((task) => !task.completed).length
  return tasks.length
}

function TaskFilters() {
  const { tasks, filter: activeFilter, setFilter } = useTaskContext()

  return (
    <div className="task-filters" role="group" aria-label="Фільтр завдань">
      {filterOptions.map((filter) => {
        const isActive = filter === activeFilter
        return (
          <button
            key={filter}
            type="button"
            className={
              isActive
                ? 'task-filters__button task-filters__button--active'
                : 'task-filters__button'
            }
            aria-pressed={isActive}
            onClick={() => setFilter(filter)}
          >
            {filterLabels[filter]}
            <span className="task-filters__count">
              {countByFilter(tasks, filter)}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default TaskFilters
