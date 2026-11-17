import type { SyntheticEvent } from 'react'
import { track, type SalesFaqId } from '../../analytics'
import { FAQ } from '../content'

function trackFaqOpen(event: SyntheticEvent<HTMLDetailsElement>, question: SalesFaqId) {
  if (event.currentTarget.open) track('opened_faq', { question })
}

export function Faq() {
  return (
    <section className="sales-section sales-grey" aria-labelledby="faq">
      <div className="sales-wrap">
        <div className="sales-section-title">
          <span className="sales-kicker">{FAQ.kicker}</span>
          <h2 id="faq">{FAQ.title}</h2>
        </div>
        <div className="sales-faq">
          {FAQ.items.map((item) => (
            <details key={item.id} onToggle={(event) => trackFaqOpen(event, item.id)}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
