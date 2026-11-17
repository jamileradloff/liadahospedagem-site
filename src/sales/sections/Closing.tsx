import { track } from '../../analytics'
import { CLOSING, HOTMART_CHECKOUT_URL, PENDING_NOTE } from '../content'

export function Closing({ checkoutLive }: { checkoutLive: boolean }) {
  return (
    <section className="sales-closing" aria-labelledby="compra" id="comprar">
      <div className="sales-wrap sales-closing-grid">
        <div className="sales-closing-copy">
          <h2 id="compra">{CLOSING.title}</h2>
          <p>{CLOSING.text}</p>
        </div>
        <div className="sales-card">
          <h3>{CLOSING.product}</h3>
          <strong className="sales-card-price">{CLOSING.price}</strong>
          <p className="sales-card-meta">{CLOSING.meta}</p>
          <ul>
            {CLOSING.includes.map((item) => (
              <li key={item}>
                <span className="sales-tick" aria-hidden="true">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
          {checkoutLive ? (
            <>
              <a
                className="sales-btn sales-btn-wide"
                href={HOTMART_CHECKOUT_URL}
                onClick={() => track('clicked_checkout', { placement: 'closing' })}
              >
                {CLOSING.buy}{' '}
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
              <p className="sales-card-note">{CLOSING.liveNote}</p>
            </>
          ) : (
            <>
              <button
                className="sales-btn sales-btn-wide sales-btn-disabled"
                type="button"
                disabled
                aria-describedby="pendente-card"
              >
                {CLOSING.buy}
              </button>
              <p className="sales-card-note" id="pendente-card">
                <strong>{PENDING_NOTE.lead}</strong>
                {PENDING_NOTE.rest}
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
