import { describe, expect, it } from 'vitest'
import { track } from './analytics'
import { MESSAGE_BY_ID, MESSAGES } from './content'

// The @ts-expect-error lines are the real assertions: `npm run build` (tsc) fails if any of them compiles.
describe('analytics event types', () => {
  it('accepts valid events and rejects invalid properties at compile time', () => {
    track('copied_message', { message: 'welcome', page: 'home' })
    track('opened_messages', { from: 'home', message: null })
    track('opened_faq', { question: 'is-it-free' })
    track('clicked_linkedin')
    track('clicked_waitlist', { page: 'home', placement: 'hero' })
    track('viewed_copy_prompt', { message: 'welcome', page: 'home' })
    track('requested_pdf', { page: 'home' })
    track('downloaded_pdf', { page: 'thanks' })

    // @ts-expect-error unknown message id
    track('copied_message', { message: 'goodbye', page: 'home' })
    // @ts-expect-error unknown page
    track('downloaded_pdf', { page: 'pdf' })
    // @ts-expect-error missing required `page`
    track('clicked_waitlist', {})
    // @ts-expect-error missing required `placement`
    track('clicked_waitlist', { page: 'home' })
    // @ts-expect-error unknown placement
    track('clicked_waitlist', { page: 'home', placement: 'footer' })
    // @ts-expect-error extra property
    track('downloaded_pdf', { page: 'home', anchor: 'cedo' })
    // @ts-expect-error thank-you is not a PDF-request page
    track('requested_pdf', { page: 'thanks' })
    // @ts-expect-error props are required for this event
    track('copy_failed')
    // @ts-expect-error this event takes no props
    track('clicked_linkedin', { page: 'home' })
    // @ts-expect-error unknown FAQ id
    track('opened_faq', { question: 'Quem é a Lia?' })
    // @ts-expect-error unknown event
    track('clicked_anything')

    expect(true).toBe(true)
  })
})

describe('message content', () => {
  it('looks messages up by id, independent of display order', () => {
    expect(MESSAGE_BY_ID.welcome.anchor).toBe('boasvindas')
    for (const message of MESSAGES) expect(MESSAGE_BY_ID[message.id]).toBe(message)
    expect(new Set(MESSAGES.map((m) => m.id)).size).toBe(Object.keys(MESSAGE_BY_ID).length)
  })
})
