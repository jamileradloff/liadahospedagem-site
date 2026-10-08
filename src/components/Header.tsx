import { Link } from './Link'

export function Header() {
  return (
    <header className="site-header">
      <Link className="brand" to="/">
        <span className="notebook-icon" aria-hidden="true" />
        o Caderninho da Lia
      </Link>
    </header>
  )
}
