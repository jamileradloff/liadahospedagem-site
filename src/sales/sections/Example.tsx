import { EXAMPLE } from '../content'

export function Example() {
  return (
    <section className="sales-section" aria-labelledby="exemplo">
      <div className="sales-wrap">
        <div className="sales-demo-head">
          <span className="sales-kicker">{EXAMPLE.kicker}</span>
          {/* Focusable so the router can land on it from “Ver um exemplo ↓”. */}
          <h2 id="exemplo" tabIndex={-1}>
            {EXAMPLE.title}
          </h2>
          <p>{EXAMPLE.intro}</p>
        </div>
        <figure>
          <div className="sales-chat">
            <div className="sales-bubble sales-guest">
              <span className="sales-kicker">{EXAMPLE.guestKicker}</span>
              <blockquote>
                <p>{EXAMPLE.guestMessage}</p>
              </blockquote>
              <p className="sales-guest-note">{EXAMPLE.guestNote}</p>
            </div>
            <div>
              <div className="sales-bubble sales-draft">
                <span className="sales-kicker">{EXAMPLE.draftKicker}</span>
                <blockquote>
                  <p>{EXAMPLE.draft}</p>
                </blockquote>
              </div>
              <p className="sales-check">
                <strong>{EXAMPLE.checkLead}</strong>
                {EXAMPLE.check}
              </p>
            </div>
          </div>
          <figcaption className="sales-fineprint">{EXAMPLE.caption}</figcaption>
        </figure>
        <details className="sales-disclosure">
          <summary>{EXAMPLE.disclosure}</summary>
          <div className="sales-disclosure-body">
            <pre>{EXAMPLE.instruction}</pre>
            <p className="sales-fields">{EXAMPLE.fields}</p>
          </div>
        </details>
      </div>
    </section>
  )
}
