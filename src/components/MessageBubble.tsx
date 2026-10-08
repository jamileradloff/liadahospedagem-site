// WhatsApp-style bubble with the [placeholders] highlighted, like in the PDF.
export function MessageBubble({ text, truncated = false }: { text: string; truncated?: boolean }) {
  const parts = text.split(/(\[[^\]]+\])/g)
  return (
    <div className={truncated ? 'bubble bubble--truncated' : 'bubble'}>
      <p className="bubble__text">
        {parts.map((part, i) =>
          part.startsWith('[') ? (
            <span key={i} className="placeholder">
              {part}
            </span>
          ) : (
            part
          ),
        )}
      </p>
      {!truncated && (
        <span className="bubble__ticks" aria-hidden="true">
          ✓✓
        </span>
      )}
    </div>
  )
}
