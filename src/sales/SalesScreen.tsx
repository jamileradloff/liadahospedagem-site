import { useEffect } from 'react'
import '@fontsource-variable/outfit'
import { INSTAGRAM_URL } from '../content'
import { landOn, type Location } from '../router'
import { CHECKOUT_LIVE, FOOTER, PAGE_DESCRIPTION, PAGE_TITLE } from './content'
import { Example } from './sections/Example'
import { Hero } from './sections/Hero'
import { HowToUse } from './sections/HowToUse'
import { PdfContents } from './sections/PdfContents'
import './sales.css'

/** Sets the page's meta description, and puts back whatever was there before on leaving. */
function useDescription(content: string) {
  useEffect(() => {
    const existing = document.head.querySelector<HTMLMetaElement>('meta[name="description"]')
    const meta = existing ?? document.createElement('meta')
    const previous = existing?.content
    meta.name = 'description'
    meta.content = content
    if (!existing) document.head.append(meta)
    return () => {
      if (previous === undefined) meta.remove()
      else meta.content = previous
    }
  }, [content])
}

/** The paid guide's sales page: its own layout, without the free page's header, footer or waitlist. */
export function SalesScreen({ location, checkoutLive = CHECKOUT_LIVE }: { location: Location; checkoutLive?: boolean }) {
  useDescription(PAGE_DESCRIPTION)

  useEffect(() => {
    const previousTitle = document.title
    document.title = PAGE_TITLE
    return () => {
      document.title = previousTitle
    }
  }, [])

  useEffect(() => {
    landOn(location)
  }, [location])

  return (
    <div className="sales">
      <main id="conteudo">
        <Hero checkoutLive={checkoutLive} />
        <Example />
        <PdfContents />
        <HowToUse />
      </main>
      <footer className="sales-footer">
        <p>
          {FOOTER.credit}
          <a href={INSTAGRAM_URL}>{FOOTER.instagram}</a>
        </p>
        <p>{FOOTER.disclosure}</p>
        <p>{FOOTER.terms}</p>
      </footer>
    </div>
  )
}
