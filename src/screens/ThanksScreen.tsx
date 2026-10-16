import { useState } from 'react'
import { MESSAGES_PATH } from '../router'
import { Link } from '../components/Link'
import { PdfDownloadButton, PDF_TIP } from '../components/PdfButton'

export function ThanksScreen() {
  const [showTip, setShowTip] = useState(false)

  return (
    <main>
      <section className="thanks">
        <p className="handwritten">pronto</p>
        <h1 tabIndex={-1}>Pronto! Seu Caderninho está aqui. 🧡</h1>
        <PdfDownloadButton onDownload={() => setShowTip(true)} />
        <p className="status-note" role="status" aria-live="polite">
          {showTip ? PDF_TIP : ''}
        </p>
        <p className="thanks__note">Te aviso por e-mail quando o caderninho completo sair.</p>
        <Link className="text-button" to={MESSAGES_PATH}>
          Voltar para as mensagens
        </Link>
      </section>
    </main>
  )
}
