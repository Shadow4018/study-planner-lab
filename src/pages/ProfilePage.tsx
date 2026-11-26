import { useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useToast } from '../hooks/useToast'
import './ProfilePage.scss'

function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  useDocumentTitle('Study Planner — профіль')

  const handleLogout = () => {
    logout()
    showToast('Ви вийшли з акаунта', 'info')
    navigate('/tasks')
  }

  return (
    <section className="profile" aria-label="Профіль">
      <h2 className="profile__title">Профіль</h2>

      <dl className="profile__list">
        <div className="profile__row">
          <dt className="profile__label">Логін</dt>
          <dd className="profile__value">{user?.username}</dd>
        </div>
        <div className="profile__row">
          <dt className="profile__label">Email</dt>
          <dd className="profile__value">{user?.email}</dd>
        </div>
        <div className="profile__row">
          <dt className="profile__label">Ім’я</dt>
          <dd className="profile__value">
            {user?.firstName} {user?.lastName}
          </dd>
        </div>
        <div className="profile__row">
          <dt className="profile__label">Статус</dt>
          <dd className="profile__value profile__value--ok">
            {isAuthenticated ? 'Авторизовано' : 'Гість'}
          </dd>
        </div>
      </dl>

      <button className="profile__logout" type="button" onClick={handleLogout}>
        Logout
      </button>
    </section>
  )
}

export default ProfilePage
