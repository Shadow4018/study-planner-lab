import { Outlet } from 'react-router'
import { TaskProvider } from '../context/TaskProvider'

/**
 * Layout-маршрут для /tasks та /tasks/:taskId: один TaskProvider на обидві
 * сторінки.
 */
function TasksLayout() {
  return (
    <TaskProvider>
      <Outlet />
    </TaskProvider>
  )
}

export default TasksLayout
