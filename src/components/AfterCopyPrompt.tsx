import type { DeliveryPage } from '../analytics'
import { WaitlistCta } from './WaitlistCta'

/** Shown once per visit, next to the first message copied successfully. */
export function AfterCopyPrompt({ page }: { page: DeliveryPage }) {
  return (
    <WaitlistCta page={page} placement="after-copy" className="waitlist-cta--after-copy">
      Copiou <span aria-hidden="true">✓</span> Essa é 1 de 12 mensagens.
      <br />
      Quer as outras 9 e o assistente da Lia?
    </WaitlistCta>
  )
}
