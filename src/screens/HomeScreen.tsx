import { type ReactNode, type SyntheticEvent } from 'react'
import { LINKEDIN_URL, MESSAGE_BY_ID, MESSAGES, type Message } from '../content'
import { track, type FaqId } from '../analytics'
import { MESSAGES_PATH } from '../router'
import { Link } from '../components/Link'
import { COPIED_ANNOUNCEMENT, copyFailedHint, useCopy } from '../useCopy'
import { MessageBubble } from '../components/MessageBubble'
import { AfterCopyPrompt } from '../components/AfterCopyPrompt'
import { WaitlistCta } from '../components/WaitlistCta'
import { WaitlistSection } from '../components/WaitlistSection'
import { PdfButton } from '../components/PdfButton'

// Deliver the free messages first. A short waitlist link sits under the hero actions; the full section comes after that delivery.

const MIRROR_LINES = [
  'Se você responde a senha do Wi-Fi toda semana…',
  'Se você deixa tudo escrito e ninguém lê…',
  'Se você vive com o celular na mão, virou recepção 24 horas…',
  'Se você tem medo de cobrar o horário de saída e parecer que está expulsando o hóspede…',
]

const BEFORE_EXAMPLE = `Prezado(a) hóspede,

É com imensa satisfação que confirmamos sua reserva em nosso estabelecimento. Informamos que o check-in poderá ser realizado a partir das 14h00, conforme nossa política de hospedagem.

Caso necessite de quaisquer esclarecimentos adicionais, permanecemos à inteira disposição.

Atenciosamente,
A Administração`

const AFTER_EXAMPLE = `Oi, Carla! 😊 Aqui é a Renata, dos Estúdios do Campeche. Que bom que você vem para Florianópolis!

Já deixo aqui as informações para sua chegada:

🕒 Check-in a partir das 14h.
📶 Wi-Fi: Campeche_Hospedes · senha: praia2026
💡 Uma dica minha: a padaria Pão da Ilha abre às 6h.

Se tiver alguma dúvida, é só me chamar por aqui. Boa viagem!`

const FOR_YOU = [
  'Cuida de 1 a 5 unidades: pousada, chalé, casa ou apartamento de temporada.',
  'Responde tudo por conta própria, no WhatsApp e no app da plataforma.',
  'Gosta de receber bem e não quer parecer robô.',
]

const NOT_FOR_YOU = [
  'Tem uma equipe de atendimento e dezenas de imóveis.',
  'Procura um sistema que responda os hóspedes sozinho, sem você.',
  'Quer uma resposta igual para todo hóspede, sem trocar uma palavra.',
]

const FAQ = [
  {
    id: 'is-it-free',
    question: 'É grátis mesmo?',
    answer: 'É. Copiar é grátis e sem cadastro. Se quiser o PDF, é só deixar seu e-mail.',
  },
  {
    id: 'regular-whatsapp',
    question: 'Funciona no WhatsApp comum?',
    answer:
      'Os atalhos com a barra (/) são do WhatsApp Business, que também é grátis. No WhatsApp comum você copia e cola do mesmo jeito.',
  },
  {
    id: 'single-apartment',
    question: 'Tenho só um apartamento. Serve?',
    answer:
      'Serve. As mensagens foram feitas para quem tem de 1 a 5 unidades e responde tudo por conta própria, sem largar o celular.',
  },
  {
    id: 'tech-skills',
    question: 'Preciso entender de tecnologia?',
    answer: 'Não. Se você sabe copiar e colar no WhatsApp, já sabe usar.',
  },
] as const satisfies readonly { id: FaqId; question: string; answer: string }[]

/** Link to the messages screen (optionally to one message) that records where the visitor came from. */
function MessagesLink({
  message,
  ...rest
}: {
  message?: Message
  className?: string
  tabIndex?: number
  'aria-hidden'?: boolean
  children: ReactNode
}) {
  return (
    <Link
      {...rest}
      to={`${MESSAGES_PATH}${message ? `#${message.anchor}` : ''}`}
      onClick={() => track('opened_messages', { from: 'home', message: message?.id ?? null })}
    />
  )
}

function trackFaqOpen(event: SyntheticEvent<HTMLDetailsElement>, question: FaqId) {
  if (event.currentTarget.open) track('opened_faq', { question })
}

export function HomeScreen() {
  const welcome = MESSAGE_BY_ID.welcome
  const { status, copy, showPrompt } = useCopy(welcome.id, welcome.text, 'home')

  return (
    <main>
      {/* 1. Delivery: confirm the request and offer the shortest path */}
      <section className="hero">
        <div className="hero__copy">
          <p className="handwritten">Oi! Aqui está o que você pediu.</p>
          <h1 tabIndex={-1}>3 mensagens prontas para você parar de digitar a mesma coisa todo dia</h1>
          <p className="hero__lead">
            Boas-vindas, pedido de check-in cedo e lembrete de check-out. Copia, troca o que está entre colchetes e
            salva como atalho no WhatsApp. Em 10 minutos, tá feito.
          </p>
          <div className="hero__actions">
            <MessagesLink className="button button--large">Copiar as mensagens agora</MessagesLink>
            <PdfButton page="home" light />
          </div>
          <p className="hero__note">Copiar é grátis e sem cadastro.</p>
          <WaitlistCta page="home" placement="hero" />
        </div>
        {/* Visual preview, a tap target only: the primary button already leads to the same messages. */}
        <MessagesLink className="hero__preview" message={welcome} tabIndex={-1} aria-hidden>
          <MessageBubble text={welcome.text} truncated />
        </MessagesLink>
      </section>

      {/* 2. Mirror: her own words */}
      <section className="section" aria-labelledby="mirror-title">
        <h2 id="mirror-title">É sempre a mesma pergunta, né?</h2>
        <ul className="mirror">
          {MIRROR_LINES.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      {/* 3. Reframe + before and after */}
      <section className="section" aria-labelledby="reframe-title">
        <p className="reframe" id="reframe-title">
          O problema não é o hóspede. É o processo.
        </p>
        <p>
          Hóspede não lê manual, ele pergunta. Você não precisa fazer ele parar de perguntar, só parar de digitar.
          E se você já tentou usar a IA (Inteligência Artificial), sabe o que costuma vir:
        </p>
        <div className="comparison">
          <figure>
            <figcaption>O que costuma vir da IA</figcaption>
            <div className="bubble bubble--before">
              <p className="bubble__text">{BEFORE_EXAMPLE}</p>
            </div>
          </figure>
          <figure>
            <figcaption>A mensagem da Lia, preenchida</figcaption>
            <MessageBubble text={AFTER_EXAMPLE} />
          </figure>
        </div>
        <p className="example-note">Exemplo: Estúdios do Campeche, Florianópolis.</p>
      </section>

      {/* 4. What's inside, framed as outcomes */}
      <section className="section contents" aria-labelledby="contents-title">
        <h2 id="contents-title">O que tem no caderninho</h2>
        <ol className="toc">
          {MESSAGES.map((m) => (
            <li key={m.id}>
              <MessagesLink message={m}>
                <span className="toc__title">{m.title}</span>
                <span className="toc__subtitle">{m.subtitle}</span>
              </MessagesLink>
            </li>
          ))}
        </ol>
      </section>

      {/* 5. Who it's for / not for */}
      <section className="section audience" aria-label="Pra quem é e pra quem não é">
        <div className="audience__block audience__block--yes">
          <h2>Pra quem é</h2>
          <ul className="checklist checklist--yes">
            {FOR_YOU.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
        <div className="audience__block audience__block--no">
          <h2>Não é pra você se</h2>
          <ul className="checklist checklist--no">
            {NOT_FOR_YOU.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* 6. About Lia */}
      <section className="section about" aria-labelledby="about-title">
        <h2 id="about-title">Oi, eu sou a Lia</h2>
        <p>
          Falo do dia a dia de quem recebe hóspedes: mensagem pronta, WhatsApp, avaliação e IA, sem complicar. Sou
          uma personagem criada com IA e falo isso abertamente. Já as mensagens foram escritas do jeito que a gente
          fala com hóspede: curtas, gentis e sem “Prezado hóspede”.
        </p>
      </section>

      {/* 7. Where to start: the first quick win */}
      <section className="start-here" aria-labelledby="start-here-title">
        <div className="start-here__intro">
          <p className="handwritten">por onde começar</p>
          <h2 id="start-here-title">Comece pela de boas-vindas. Salva hoje.</h2>
          <p>É a que você mais manda. Uma mensagem salva já tira várias perguntas da sua semana.</p>
        </div>
        <div className="start-here__body">
          <div className="start-here__actions">
            <button
              type="button"
              className={status === 'copied' ? 'button button--large button--done' : 'button button--large'}
              onClick={() => void copy()}
            >
              {status === 'copied' ? 'Copiada! Agora cola no WhatsApp' : 'Copiar a de boas-vindas'}
            </button>
            <PdfButton page="home" />
          </div>
          <p className="status-note" role="status" aria-live="polite">
            {status === 'failed' && copyFailedHint('abaixo')}
            {status === 'copied' && <span className="visually-hidden">{COPIED_ANNOUNCEMENT}</span>}
          </p>
          {showPrompt && <AfterCopyPrompt page="home" />}
          {status === 'failed' && (
            <div className="copy-fallback">
              <MessageBubble text={welcome.text} />
              <p className="copy-fallback__link">
                Prefere copiar com as dicas do lado?{' '}
                <MessagesLink message={welcome}>Abrir a mensagem de boas-vindas</MessagesLink>
              </p>
            </div>
          )}
          <MessagesLink className="text-button">Ver as 3 mensagens com as dicas</MessagesLink>
        </div>
      </section>

      {/* 8. Full waitlist section, after the free messages */}
      <WaitlistSection page="home" />

      {/* 9. FAQ */}
      <section className="section faq" aria-labelledby="faq-title">
        <h2 id="faq-title">Dúvidas rápidas</h2>
        {FAQ.map((item) => (
          <details key={item.id} className="faq-item" onToggle={(e) => trackFaqOpen(e, item.id)}>
            <summary>{item.question}</summary>
            <p>{item.answer}</p>
          </details>
        ))}
        <details className="faq-item" onToggle={(e) => trackFaqOpen(e, 'who-is-behind-lia')}>
          <summary>Quem está por trás da Lia?</summary>
          <p>
            Eu sou uma personagem, mas quem me criou é a Jamile Radloff. Ela tem mestrado em gestão hoteleira,
            trabalhou anos numa das plataformas de reserva mais conhecidas do mundo e numa empresa de software para
            aluguel de temporada. Hoje é engenheira de software e decidiu juntar as duas paixões, hospitalidade e
            tecnologia, para ajudar quem recebe hóspedes a ter mais tempo para o que importa.{' '}
            <a href={LINKEDIN_URL} target="_blank" rel="noopener" onClick={() => track('clicked_linkedin')}>
              Conheça a Jamile no LinkedIn
            </a>
          </p>
        </details>
      </section>
    </main>
  )
}
