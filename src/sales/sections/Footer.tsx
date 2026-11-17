import { INSTAGRAM_URL } from '../../content'
import { FACEBOOK_URL, FOOTER, TIKTOK_URL } from '../content'

function InstagramIcon() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
      <rect x="3.25" y="3.25" width="17.5" height="17.5" rx="5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.3" cy="6.7" r="1.05" fill="currentColor" />
    </svg>
  )
}

function TikTokIcon() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M14.2 3.2c.3 2.2 1.7 3.8 3.9 4.2v2.5a6.7 6.7 0 0 1-3.9-1.2v6.6a5.5 5.5 0 1 1-5.5-5.5c.3 0 .6 0 .8.1v2.6a2.9 2.9 0 1 0 2.1 2.8V3.2h2.6z"
      />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M14.6 8.1h2.3V5.1h-2.3c-2.5 0-3.7 1.5-3.7 3.7v1.5H8.4V13h2.5v8h3.3v-8h2.5l.4-2.7h-2.9V9c0-.7.4-.9.8-.9z"
      />
    </svg>
  )
}

const PROFILES = [
  { label: '@liadahospedagem no Instagram', href: INSTAGRAM_URL, Icon: InstagramIcon },
  { label: '@liadahospedagem no TikTok', href: TIKTOK_URL, Icon: TikTokIcon },
  { label: 'Lia da Hospedagem no Facebook', href: FACEBOOK_URL, Icon: FacebookIcon },
] as const

export function Footer() {
  return (
    <footer className="sales-footer">
      <div className="sales-wrap sales-footer-grid">
        <p>{FOOTER.credit}</p>
        <div className="sales-footer-aside">
          <p className="sales-disclose">{FOOTER.disclosure}</p>
          <nav className="sales-social" aria-label="Redes sociais">
            {PROFILES.map(({ label, href, Icon }) => (
              <a key={label} href={href} aria-label={label} target="_blank" rel="noopener">
                <Icon />
              </a>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  )
}
