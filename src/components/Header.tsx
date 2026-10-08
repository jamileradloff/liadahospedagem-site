import { navigate } from '../router'

export function Header() {
  return (
    <header className="site-header">
      <a
        className="brand"
        href="/"
        onClick={(e) => {
          e.preventDefault()
          navigate('/')
        }}
      >
        <span className="notebook-icon" aria-hidden="true" />
        o Caderninho da Lia
      </a>
    </header>
  )
}
