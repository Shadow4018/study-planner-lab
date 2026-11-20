import Pagination from '../components/Pagination'
import TaskDetails from '../components/TaskDetails'
import TaskFilters from '../components/TaskFilters'
import TaskForm from '../components/TaskForm'
import TaskList from '../components/TaskList'
import TaskStats from '../components/TaskStats'

/** Головна сторінка: форма, статистика, фільтри, список, пагінація та деталі. */
function TasksPage() {
  return (
    <main className="app__main">
      <TaskForm />
      <TaskStats />
      <TaskFilters />
      <TaskList />
      <Pagination />
      <TaskDetails />
    </main>
  )
}

export default TasksPage
