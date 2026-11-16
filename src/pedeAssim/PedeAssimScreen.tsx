import { useEffect } from 'react'
import { INSTAGRAM_URL } from '../content'
import { landOn, type Location } from '../router'
import { findInstruction } from './instructions'
import { IndexView } from './IndexView'
import { InstructionView } from './InstructionView'
import mark from './assets/caderninho-v5.png'
import './pede-assim.css'

const TITLE = 'Pede assim pra IA'

/** The paid guide's companion: its own masthead and footer, without the free page's header, waitlist or PDF. */
export function PedeAssimScreen({ location }: { location: Location }) {
  const instruction = findInstruction(location.instruction)

  useEffect(() => {
    const robots = document.createElement('meta')
    robots.name = 'robots'
    robots.content = 'noindex'
    document.head.append(robots)
    const previousTitle = document.title
    return () => {
      robots.remove()
      document.title = previousTitle
    }
  }, [])

  useEffect(() => {
    document.title = instruction ? `${instruction.title} · ${TITLE}` : `${TITLE} · Índice`
  }, [instruction])

  useEffect(() => {
    landOn(location)
  }, [location])

  return (
    <div className="pede-assim">
      <header className="pede-assim-masthead">
        <div className="pede-assim-masthead-inner">
          <div>
            <p className="eyebrow">Lia da Hospedagem</p>
            <h1>{TITLE}</h1>
          </div>
          <img src={mark} width={64} height={74} alt="Marca Caderninho da Lia: caderno terracota com balão de conversa." />
        </div>
      </header>
      <main className="pede-assim-main">
        {instruction ? <InstructionView key={instruction.slug} instruction={instruction} /> : <IndexView />}
      </main>
      <footer className="pede-assim-footer">
        <a className="footer-link" href={INSTAGRAM_URL} aria-label="@liadahospedagem no Instagram">
          @liadahospedagem
        </a>
      </footer>
    </div>
  )
}
