import { useState } from 'react'
import Pagination from '../components/Pagination'
import TaskFilters from '../components/TaskFilters'
import TaskFormDialog from '../components/TaskFormDialog'
import TaskList from '../components/TaskList'
import TaskStats from '../components/TaskStats'
import { useAuthGuard } from '../hooks/useAuthGuard'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useTaskContext } from '../hooks/useTaskContext'
import type { TaskFormData } from '../schemas/taskSchema'
import { toTaskInput } from '../utils/taskForm'
import './TasksPage.scss'

function TasksPage() {
  const { page, totalPages, createTask } = useTaskContext()
  const requireAuth = useAuthGuard()
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  useDocumentTitle(`Study Planner — сторінка ${page} з ${totalPages}`)

  const openCreate = () => {
    if (requireAuth()) setIsCreateOpen(true)
  }

  const handleCreate = (data: TaskFormData) => createTask(toTaskInput(data))

  return (
    <>
      <div className="tasks-page__toolbar">
        <h2 className="tasks-page__title">Завдання</h2>
        <button
          className="tasks-page__add"
          type="button"
          onClick={openCreate}
          aria-label="Додати завдання"
          title="Додати завдання"
        >
          +
        </button>
      </div>

      <TaskStats />
      <TaskFilters />
      <TaskList />
      <Pagination />

      <TaskFormDialog
        open={isCreateOpen}
        mode="create"
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreate}
      />
    </>
  )
}

export default TasksPage
