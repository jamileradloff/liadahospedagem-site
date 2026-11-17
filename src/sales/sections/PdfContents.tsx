import { PDF_CONTENTS, SITUATIONS } from '../content'

const ICONS = {
  phone: (
    <>
      <rect x="6" y="2" width="12" height="20" rx="2.5" />
      <path d="M11 18h2" />
    </>
  ),
  check: <path d="M20 6 9 17l-5-5" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
}

const number = (index: number) => String(index + 1).padStart(2, '0')

export function PdfContents() {
  return (
    <section className="sales-section sales-grey" aria-labelledby="conteudo-pdf">
      <div className="sales-wrap">
        <div className="sales-section-title">
          <span className="sales-kicker">{PDF_CONTENTS.kicker}</span>
          <h2 id="conteudo-pdf">{PDF_CONTENTS.title}</h2>
          <p>{PDF_CONTENTS.intro}</p>
        </div>
        <div className="sales-benefits">
          {PDF_CONTENTS.benefits.map((benefit) => (
            <div className="sales-benefit" key={benefit.title}>
              <div className="sales-icon" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {ICONS[benefit.icon]}
                </svg>
              </div>
              <h3>{benefit.title}</h3>
              <p>{benefit.text}</p>
            </div>
          ))}
        </div>

        <div className="sales-inside">
          <h3>{PDF_CONTENTS.insideTitle}</h3>
          <ul className="sales-inside-list">
            {PDF_CONTENTS.inside.map((item) => (
              <li key={item.lead}>
                <span className="sales-tick" aria-hidden="true">
                  ✓
                </span>
                <span>
                  <b>{item.lead}</b>
                  {item.text}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="sales-section-title sales-situations-title">
          <h2>{PDF_CONTENTS.situationsTitle}</h2>
          <p>{PDF_CONTENTS.situationsIntro}</p>
        </div>
        <ol className="sales-modules">
          {SITUATIONS.map(([title, text], index) => (
            <li className="sales-module" key={title}>
              <h4>
                <span>{number(index)}</span>
                {title}
              </h4>
              <p>{text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
