import { Link } from '../components/Link'
import { PEDE_ASSIM_PATH } from '../router'
import { GROUPS } from './instructions'

export function IndexView() {
  return (
    <nav className="pede-assim-index" aria-labelledby="indice-titulo">
      <h2 id="indice-titulo" tabIndex={-1}>
        Índice de situações
      </h2>
      <p>Escolha a situação pra abrir o texto para copiar.</p>
      {GROUPS.map((group) => (
        <section key={group.title}>
          <h3>{group.title}</h3>
          <ul>
            {group.items.map((item) => (
              <li key={item.slug}>
                <Link to={`${PEDE_ASSIM_PATH}/${item.slug}`}>{item.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </nav>
  )
}
