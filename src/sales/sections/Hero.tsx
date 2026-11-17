import { COVER_ALT, HERO, HERO_TITLE, HOTMART_CHECKOUT_URL, PENDING_NOTE } from '../content'
import cover from '../assets/pede-assim-capa-600.png'

export function Hero({ checkoutLive }: { checkoutLive: boolean }) {
  return (
    <header className="sales-hero">
      <div className="sales-wrap sales-hero-grid">
        <div>
          <h1>
            {HERO_TITLE.lead}
            <em>{HERO_TITLE.highlight}</em>
          </h1>
          <p className="sales-hero-sub">{HERO.subtitle}</p>
          <p className="sales-hero-price">
            <strong>{HERO.price}</strong>
            <span>{HERO.priceDetail}</span>
          </p>
          <div className="sales-hero-actions">
            {checkoutLive ? (
              <>
                <a className="sales-btn" href={HOTMART_CHECKOUT_URL}>
                  {HERO.buy}{' '}
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </a>
                <a className="sales-hero-link" href="#exemplo">
                  {HERO.exampleFirst}
                </a>
              </>
            ) : (
              <a className="sales-btn" href="#exemplo">
                {HERO.example}
              </a>
            )}
          </div>
          <p className="sales-hero-note">{HERO.delivery}</p>
          {!checkoutLive && (
            <p className="sales-hero-note">
              <strong>{PENDING_NOTE.lead}</strong>
              {PENDING_NOTE.rest}
            </p>
          )}
        </div>
        <div className="sales-cover">
          <img src={cover} width={600} height={600} alt={COVER_ALT} />
        </div>
      </div>
    </header>
  )
}
