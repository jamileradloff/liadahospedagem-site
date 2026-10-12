import { TALLY_URL } from '../content'
import { track, waitlistUrl, type Page } from '../analytics'

/** Compact launch-waitlist prompt. The same copy and link behavior are reused on both screens. */
export function WaitlistCta({ page }: { page: Page }) {
  return (
    <div className="waitlist-cta">
      <p>Quer as 12 mensagens e o assistente da Lia?</p>
      <a
        className="button button--outline"
        href={waitlistUrl(TALLY_URL, page)}
        target="_blank"
        rel="noopener"
        onClick={() => track('clicked_waitlist', { page })}
      >
        Quero entrar na lista de lançamento
      </a>
    </div>
  )
}
