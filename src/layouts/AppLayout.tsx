import { Outlet } from 'react-router'
import Header from '../components/Header'
import ToastContainer from '../components/ToastContainer'
import './AppLayout.scss'

function AppLayout() {
  return (
    <div className="app">
      <Header />
      <main className="app__main">
        <Outlet />
      </main>
      <ToastContainer />
    </div>
  )
}

export default AppLayout
