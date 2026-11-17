import { HOW_TO_USE } from '../content'

export function HowToUse() {
  return (
    <section className="sales-section" aria-labelledby="como-usar">
      <div className="sales-wrap">
        <div className="sales-section-title">
          <span className="sales-kicker">{HOW_TO_USE.kicker}</span>
          <h2 id="como-usar">{HOW_TO_USE.title}</h2>
        </div>
        <ol className="sales-steps">
          {HOW_TO_USE.steps.map(([title, text], index) => (
            <li className="sales-step" key={title}>
              <span className="sales-step-num" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ol>
        <p className="sales-prereq">{HOW_TO_USE.prerequisites}</p>
      </div>
    </section>
  )
}
