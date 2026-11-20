import { useTaskContext } from '../hooks/useTaskContext'
import './TaskStats.scss'

function TaskStats() {
  const { tasks, total, status } = useTaskContext()

  // «Всього» — з відповіді сервера (total); виконані/невиконані — для
  // завантаженої сторінки (derived data, без окремого state).
  const completed = tasks.filter((task) => task.completed).length
  const active = tasks.length - completed
  const isReady = status === 'success'

  return (
    <section className="task-stats" aria-label="Статистика завдань">
      <dl className="task-stats__list">
        <div className="task-stats__item">
          <dt className="task-stats__label">Всього</dt>
          <dd className="task-stats__value">{total}</dd>
        </div>
        <div className="task-stats__item task-stats__item--completed">
          <dt className="task-stats__label">Виконано на сторінці</dt>
          <dd className="task-stats__value">{isReady ? completed : '—'}</dd>
        </div>
        <div className="task-stats__item task-stats__item--active">
          <dt className="task-stats__label">Не виконано на сторінці</dt>
          <dd className="task-stats__value">{isReady ? active : '—'}</dd>
        </div>
      </dl>
    </section>
  )
}

export default TaskStats
