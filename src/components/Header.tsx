import './Header.scss'

function Header() {
  return (
    <header className="header">
      <h1 className="header__title">Study Planner</h1>
      <p className="header__subtitle">Завдання з REST API (DummyJSON). Це навчальний сервіс: зміни не зберігаються на сервері та зникають після оновлення сторінки.</p>
    </header>
  )
}

export default Header
