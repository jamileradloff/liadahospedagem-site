import { INSTAGRAM_URL } from '../../content'
import { FOOTER } from '../content'

export function Footer() {
  return (
    <footer className="sales-footer">
      <div className="sales-wrap sales-footer-grid">
        <p>
          {FOOTER.credit}
          <a href={INSTAGRAM_URL}>{FOOTER.instagram}</a>
        </p>
        <p className="sales-disclose">{FOOTER.disclosure}</p>
        <p>{FOOTER.terms}</p>
      </div>
    </footer>
  )
}
