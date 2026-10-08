import { useEffect, useState } from 'react'
import { MESSAGES } from '../content'
import { currentAnchor } from '../router'
import { MessageCard } from '../components/MessageCard'
import { PdfButton, PDF_TIP } from '../components/PdfButton'
import { WaitlistSection } from '../components/WaitlistSection'

const SETUP_STEPS = [
  'Abre o WhatsApp Business e procura Ferramentas ou Ferramentas comerciais. Depois, toca em Respostas rápidas. O caminho pode variar conforme o celular e a versão do aplicativo.',
  'Toca em + e cola a mensagem. Substitui os campos entre colchetes pelos dados da sua hospedagem e apaga as orientações que não se aplicam. Deixa só [nome do hóspede] para preencher antes de enviar.',
  'Escolhe um atalho simples, como boasvindas, cedo ou checkout, e toca em Salvar. Repete esses passos para as três mensagens.',
  'Para usar, abre a conversa, digita / e seleciona a resposta. Troca [nome do hóspede] pelo nome da pessoa, confere a mensagem e envia.',
]

export function MessagesScreen() {
  const [highlighted, setHighlighted] = useState<string | null>(null)
  const [downloaded, setDownloaded] = useState(false)

  // Tapping "copy" in the PDF lands on the right message, with a short highlight.
  useEffect(() => {
    const anchor = currentAnchor()
    if (!anchor) return
    const target = document.getElementById(anchor)
    if (!target) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
    setHighlighted(anchor)
    const timer = window.setTimeout(() => setHighlighted(null), 2200)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <main>
      <section className="messages-intro">
        <h1>Suas 3 mensagens</h1>
        <p>
          Toca em “Copiar mensagem”, cola no WhatsApp e troca o que está entre [colchetes] pelos dados da sua
          hospedagem. Não sabe por onde começar? Comece pela de boas-vindas.
        </p>
        <nav className="jump-links" aria-label="Ir para a mensagem">
          {MESSAGES.map((m) => (
            <a key={m.id} href={`#${m.anchor}`}>
              {m.title.replace(/[“”]/g, '')}
            </a>
          ))}
        </nav>
      </section>

      {MESSAGES.map((m, i) => (
        <MessageCard key={m.id} message={m} position={i + 1} highlighted={highlighted === m.anchor} />
      ))}

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
