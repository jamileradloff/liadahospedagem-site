import type { ReactNode } from 'react'
import { TALLY_URL } from '../content'
import { track, waitlistUrl, type DeliveryPage, type WaitlistPlacement } from '../analytics'

type Props = { page: DeliveryPage; placement: WaitlistPlacement; className?: string; children?: ReactNode }

/** Compact launch-waitlist prompt. The same link behavior is reused on both screens. */
export function WaitlistCta({ page, placement, className, children }: Props) {
  return (
    <div className={className ? `waitlist-cta ${className}` : 'waitlist-cta'}>
      <p>{children ?? 'Quer as 12 mensagens e o assistente da Lia?'}</p>
      <a
        className="button button--outline"
        href={waitlistUrl(TALLY_URL, page)}
        target="_blank"
        rel="noopener"
        onClick={() => track('clicked_waitlist', { page, placement })}
      >
        Quero entrar na lista de lançamento
      </a>
    </div>
  )
}
