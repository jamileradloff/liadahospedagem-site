import { useState } from 'react'
import { MESSAGES_PATH } from '../router'
import { Link } from '../components/Link'
import { PdfDownloadButton, PDF_TIP } from '../components/PdfButton'

const EMAIL_NOTE = 'Te aviso por e-mail quando o caderninho completo sair.'
const NO_LIST_NOTE = 'Bom uso! 🧡 Se mudar de ideia, a lista fica no fim da página de mensagens.'

/** Tally sends the consent answer as `lista`. Display only: not stored or sent to PostHog. */
function consentedToLaunchEmails(lista: string | null): boolean {
  return /^\s*sim\b/i.test(lista ?? '')
}

export function ThanksScreen() {
  const [showTip, setShowTip] = useState(false)
  const lista = new URLSearchParams(window.location.search).get('lista')
  const consented = consentedToLaunchEmails(lista)

  return (
    <main>
      <section className="thanks">
        <p className="handwritten">pronto</p>
        <h1 tabIndex={-1}>Pronto! Seu Caderninho está aqui. 🧡</h1>
        <PdfDownloadButton onDownload={() => setShowTip(true)} />
        <p className="status-note" role="status" aria-live="polite">
          {showTip ? PDF_TIP : ''}
        </p>
        <p className="thanks__note">{consented ? EMAIL_NOTE : NO_LIST_NOTE}</p>
        <Link className="text-button" to={MESSAGES_PATH}>
          Voltar para as mensagens
        </Link>
      </section>
    </main>
  )
}
