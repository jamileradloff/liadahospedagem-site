import { ABOUT, KIT_UPDATES_URL } from '../content'

/** The Caderninho mark, as drawn in v2. “Lia” is set in Fraunces, which index.html already loads. */
function CaderninhoMark() {
  return (
    <svg focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 -10 216 250">
      <g transform="rotate(-6 108 120)">
        <rect x="46" y="26" width="130" height="190" rx="12" fill="#FBF8F2" stroke="#B08A62" strokeWidth="1.5" />
        <rect x="40" y="20" width="130" height="190" rx="12" fill="#C0643F" />
        <path d="M52 20 H60 V210 H52 A12 12 0 0 1 40 198 V32 A12 12 0 0 1 52 20 Z" fill="#2B2B2B" opacity="0.15" />
        <rect x="146" y="20" width="8" height="190" fill="#1F4E5F" />
        <text
          x="103"
          y="128"
          textAnchor="middle"
          fontFamily="Fraunces, Lora, Georgia, serif"
          fontWeight="600"
          fontSize="44"
          fill="#F4ECDD"
        >
          Lia
        </text>
        <line x1="82" y1="144" x2="124" y2="144" stroke="#F4ECDD" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
        <rect x="110" y="4" width="56" height="36" rx="12" fill="#1F4E5F" stroke="#FBF8F2" strokeWidth="3" />
        <path d="M120 37 L113 51 L134 39 Z" fill="#1F4E5F" />
        <circle cx="125" cy="22" r="4" fill="#F4ECDD" />
        <circle cx="138" cy="22" r="4" fill="#F4ECDD" />
        <circle cx="151" cy="22" r="4" fill="#F4ECDD" />
      </g>
    </svg>
  )
}

export function About() {
  return (
    <section className="sales-section" aria-labelledby="sobre">
      <div className="sales-wrap">
        <div className="sales-about">
          <div className="sales-avatar" aria-hidden="true">
            <CaderninhoMark />
          </div>
          <div>
            <span className="sales-kicker">{ABOUT.kicker}</span>
            <h2 id="sobre">{ABOUT.title}</h2>
            <p>{ABOUT.audience}</p>
            <p>{ABOUT.author}</p>
            <p>
              {ABOUT.kit.before}
              <strong>{ABOUT.kit.name}</strong>
              {ABOUT.kit.after}
            </p>
            <a className="sales-text-link" href={KIT_UPDATES_URL}>
              {ABOUT.kitLink}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
