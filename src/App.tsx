import Header from './components/Header'
import ToastContainer from './components/ToastContainer'
import { useDocumentTitle } from './hooks/useDocumentTitle'
import { useTaskContext } from './hooks/useTaskContext'
import TasksPage from './pages/TasksPage'
import './App.scss'

function App() {
  const { page, totalPages } = useTaskContext()

  // Effect: заголовок вкладки показує поточну сторінку списку.
  useDocumentTitle(`Study Planner — сторінка ${page} з ${totalPages}`)

  return (
    <div className="app">
      <Header />
      <TasksPage />
      <ToastContainer />
    </div>
  )
}

export default App
