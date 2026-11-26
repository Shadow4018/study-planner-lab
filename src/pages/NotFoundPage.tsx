import { Link } from 'react-router'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import './NotFoundPage.scss'

function NotFoundPage() {
  useDocumentTitle('Study Planner — сторінку не знайдено')

  return (
    <section className="not-found">
      <p className="not-found__code">404</p>
      <h2 className="not-found__title">Сторінку не знайдено</h2>
      <p className="not-found__text">Такої адреси немає в застосунку.</p>
      <Link className="not-found__link" to="/tasks">
        До списку завдань
      </Link>
    </section>
  )
}

export default NotFoundPage
