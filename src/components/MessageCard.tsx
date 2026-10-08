import type { Message } from '../content'
import { COPIED_ANNOUNCEMENT, copyFailedHint, useCopy } from '../useCopy'
import { MessageBubble } from './MessageBubble'

type Props = { message: Message; position: number; highlighted: boolean }

export function MessageCard({ message, position, highlighted }: Props) {
  const { status, copy } = useCopy(message.id, message.text, 'messages')

  return (
    <article
      id={message.anchor}
      tabIndex={-1}
      className={highlighted ? 'message-card message-card--highlight' : 'message-card'}
      aria-labelledby={`title-${message.id}`}
    >
      <p className="message-card__number">Mensagem {position} de 3</p>
      <h2 id={`title-${message.id}`}>{message.title}</h2>
      <p className="message-card__when">
        <strong>Quando mandar:</strong> {message.whenToSend}
      </p>

      <MessageBubble text={message.text} />

      <div className="message-card__actions">
        <button type="button" className={status === 'copied' ? 'button button--done' : 'button'} onClick={() => void copy()}>
          {status === 'copied' ? 'Copiada! Agora cola no WhatsApp' : 'Copiar mensagem'}
        </button>
        <span className="shortcut">
          Atalho: <code>{message.shortcut}</code>
        </span>
      </div>
      <p className="status-note" role="status" aria-live="polite">
        {status === 'failed' && copyFailedHint('acima')}
        {status === 'copied' && <span className="visually-hidden">{COPIED_ANNOUNCEMENT}</span>}
      </p>

      <aside className="tip">
        <p className="tip__title">Dica da Lia</p>
        <p>{message.tip}</p>
      </aside>
    </article>
  )
}
