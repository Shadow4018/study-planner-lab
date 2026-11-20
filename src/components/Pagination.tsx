import { useTaskContext } from '../hooks/useTaskContext'
import './Pagination.scss'

function Pagination() {
  const { page, totalPages, total, goToPage } = useTaskContext()

  return (
    <nav className="pagination" aria-label="Сторінки списку">
      <button
        className="pagination__button"
        type="button"
        onClick={() => goToPage(page - 1)}
        disabled={page <= 1}
      >
        ← Назад
      </button>

      <p className="pagination__info">
        Сторінка <strong>{page}</strong> з {totalPages}
        {total > 0 && <span className="pagination__total"> · всього {total}</span>}
      </p>

      <button
        className="pagination__button"
        type="button"
        onClick={() => goToPage(page + 1)}
        disabled={page >= totalPages}
      >
        Вперед →
      </button>
    </nav>
  )
}

export default Pagination
