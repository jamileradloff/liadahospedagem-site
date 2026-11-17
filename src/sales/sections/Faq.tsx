import { FAQ } from '../content'

export function Faq() {
  return (
    <section className="sales-section sales-grey" aria-labelledby="faq">
      <div className="sales-wrap">
        <div className="sales-section-title">
          <span className="sales-kicker">{FAQ.kicker}</span>
          <h2 id="faq">{FAQ.title}</h2>
        </div>
        <div className="sales-faq">
          {FAQ.items.map(([question, answer]) => (
            <details key={question}>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
