import { useRef } from 'react'
import { Link } from '../components/Link'
import { PEDE_ASSIM_PATH } from '../router'
import { INSTRUCTIONS, type Instruction } from './instructions'
import { useInstructionCopy } from './useInstructionCopy'

const paragraphs = (text: string) => text.split('\n\n').map((paragraph) => <p key={paragraph}>{paragraph}</p>)

export function InstructionView({ instruction }: { instruction: Instruction }) {
  const { slug, title, number } = instruction
  const promptId = `${slug}-texto`
  const promptElement = useRef<HTMLDivElement>(null)
  const { status, copy } = useInstructionCopy(slug, instruction.prompt, promptElement)

  return (
    <section className="pede-assim-instruction" aria-labelledby={`${slug}-titulo`}>
      <p className="eyebrow">
        {String(number).padStart(2, '0')} / {INSTRUCTIONS.length}
      </p>
      <h2 id={`${slug}-titulo`} tabIndex={-1}>
        {title}
      </h2>
      <p className="lead">Copie a instrução, cole na IA e troque os trechos entre colchetes.</p>
      <div className="actions">
        <button
          type="button"
          className="copy"
          aria-label={`Toca aqui para copiar: ${title}`}
          aria-controls={promptId}
          onClick={() => void copy()}
        >
          <svg aria-hidden="true" width="19" height="19" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="2" width="11" height="12" rx="2" />
            <rect className="glyph-front" x="6" y="5" width="11" height="12" rx="2" />
          </svg>
          Toca aqui para copiar
        </button>
        <p className="status" role="status" aria-atomic="true">
          {status}
        </p>
      </div>
      <h3>O que preencher</h3>
      <div className="fields">{paragraphs(instruction.fields)}</div>
      <h3>Texto para copiar</h3>
      <div className="prompt" id={promptId} ref={promptElement}>
        {/* The capture group keeps each [campo] as its own odd-numbered piece. */}
        {instruction.prompt.split(/(\[[^\]\n]+\])/).map((piece, i) =>
          i % 2 ? (
            <span key={i} className="field">
              {piece}
            </span>
          ) : (
            piece
          ),
        )}
      </div>
      <Link className="return" to={PEDE_ASSIM_PATH}>
        Voltar ao índice de situações
      </Link>
    </section>
  )
}
