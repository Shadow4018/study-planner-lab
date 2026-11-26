import { NavLink, useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import './Header.scss'

const navClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? 'header__link header__link--active' : 'header__link'

function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    showToast('Ви вийшли з акаунта', 'info')
    navigate('/tasks')
  }

  return (
    <header className="header">
      <div className="header__top">
        <h1 className="header__title">Study Planner</h1>

        <nav className="header__nav" aria-label="Основна навігація">
          <NavLink className={navClass} to="/tasks">
            Tasks
          </NavLink>
          <NavLink className={navClass} to="/profile">
            Profile
          </NavLink>
          {isAuthenticated ? (
            <>
              <span className="header__user">{user?.username}</span>
              <button className="header__logout" type="button" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <NavLink className={navClass} to="/login">
              Login
            </NavLink>
          )}
        </nav>
      </div>
      <p className="header__subtitle">
        Завдання з REST API (DummyJSON). Це навчальний сервіс: зміни не зберігаються на
        сервері та зникають після оновлення сторінки.
      </p>
    </header>
  )
}

export default Header
