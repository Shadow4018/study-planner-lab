import { Navigate, Route, Routes } from 'react-router'
import AppLayout from '../layouts/AppLayout'
import TasksLayout from '../layouts/TasksLayout'
import LoginPage from '../pages/LoginPage'
import NotFoundPage from '../pages/NotFoundPage'
import ProfilePage from '../pages/ProfilePage'
import TaskDetailsPage from '../pages/TaskDetailsPage'
import TasksPage from '../pages/TasksPage'
import ProtectedRoute from './ProtectedRoute'

/**
 * Дерево маршрутів (Declarative Mode): <Routes> + <Route>.
 *
 *  /                -> редирект на /tasks
 *  /tasks           -> список            (відкритий для всіх)
 *  /tasks/:taskId   -> деталі            (відкритий для всіх)
 *  /login           -> форма входу
 *  /profile         -> профіль           (ProtectedRoute: лише авторизованим)
 *  *                -> 404
 */
function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/tasks" replace />} />

        <Route element={<TasksLayout />}>
          <Route path="tasks" element={<TasksPage />} />
          <Route path="tasks/:taskId" element={<TaskDetailsPage />} />
        </Route>

        <Route path="login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default AppRoutes
