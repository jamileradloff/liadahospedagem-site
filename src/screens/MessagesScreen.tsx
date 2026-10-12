import { Fragment, useEffect, useState } from 'react'
import { MESSAGES } from '../content'
import { MESSAGES_PATH } from '../router'
import { Link } from '../components/Link'
import { MessageCard } from '../components/MessageCard'
import { PdfButton, PDF_TIP } from '../components/PdfButton'
import { WaitlistCta } from '../components/WaitlistCta'
import { WaitlistSection } from '../components/WaitlistSection'

const SETUP_STEPS = [
  'Abre o WhatsApp Business e procura Ferramentas ou Ferramentas comerciais. Depois, toca em Respostas rápidas. O caminho pode variar conforme o celular e a versão do aplicativo.',
  'Toca em + e cola a mensagem. Substitui os campos entre colchetes pelos dados da sua hospedagem e apaga as orientações que não se aplicam. Deixa só [nome do hóspede] para preencher antes de enviar.',
  'Escolhe um atalho simples, como boasvindas, cedo ou checkout, e toca em Salvar. Repete esses passos para as três mensagens.',
  'Para usar, abre a conversa, digita / e seleciona a resposta. Troca [nome do hóspede] pelo nome da pessoa, confere a mensagem e envia.',
]

type Props = { anchor: string; navigationKey: number }

export function MessagesScreen({ anchor, navigationKey }: Props) {
  const [expiredNavigation, setExpiredNavigation] = useState<number | null>(null)
  const [downloaded, setDownloaded] = useState(false)

  // Landing on a message (from the PDF, the home page or a jump link) gives it a short highlight.
  const highlighted = anchor && expiredNavigation !== navigationKey ? anchor : null
  useEffect(() => {
    if (!anchor) return
    const timer = window.setTimeout(() => setExpiredNavigation(navigationKey), 2200)
    return () => window.clearTimeout(timer)
  }, [anchor, navigationKey])

  return (
    <main className="messages-layout">
      <section className="messages-intro">
        <Link className="back-link" to="/">
          <span aria-hidden="true">←</span> Voltar para o início
        </Link>
        <h1 tabIndex={-1}>Suas 3 mensagens</h1>
        <p>
          Toca em “Copiar mensagem”, cola no WhatsApp e troca o que está entre [colchetes] pelos dados da sua
          hospedagem. Não sabe por onde começar? Comece pela de boas-vindas.
        </p>
      </section>

      <div className="messages-body">
        <nav className="jump-links" aria-label="Ir para a mensagem">
          {MESSAGES.map((m) => (
            <Link key={m.id} to={`${MESSAGES_PATH}#${m.anchor}`}>
              {m.title.replace(/[“”]/g, '')}
            </Link>
          ))}
        </nav>

        <div className="messages-list">
          {MESSAGES.map((m, i) => (
            <Fragment key={m.id}>
              <MessageCard message={m} position={i + 1} highlighted={highlighted === m.anchor} />
              {i === 0 && <WaitlistCta page="messages" />}
            </Fragment>
          ))}
        </div>
      </div>

      <section className="section steps" aria-labelledby="steps-title">
        <h2 id="steps-title">Agora salva no WhatsApp Business</h2>
        <p>Leva uns 10 minutos, uma vez só.</p>
        <ol>
          {SETUP_STEPS.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <WaitlistSection page="messages" />

      <section className="pdf-cta">
        <p>Quer guardar as 3 num arquivo, com a cara do caderninho?</p>
        <PdfButton page="messages" onDownload={() => setDownloaded(true)} />
        <p className="status-note" role="status" aria-live="polite">
          {downloaded ? PDF_TIP : ''}
        </p>
      </section>
    </main>
  )
}
