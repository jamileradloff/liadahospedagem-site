import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// The router reads the URL and preview flag when it loads, so each test imports a fresh App.
async function renderAt(url: string) {
  window.history.replaceState(null, '', url)
  vi.resetModules()
  const { App } = await import('./App')
  return render(<App />)
}

function historyTraversal(go: () => void) {
  return act(async () => {
    const popped = new Promise((resolve) => window.addEventListener('popstate', resolve, { once: true }))
    go()
    await popped
  })
}

const card = (anchor: string) => document.getElementById(anchor)

describe('navigation', () => {
  let scrollIntoView: ReturnType<typeof vi.fn>

  beforeEach(() => {
    scrollIntoView = vi.fn()
    Element.prototype.scrollIntoView = scrollIntoView
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    window.matchMedia = vi.fn().mockReturnValue({ matches: false })
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('opens the messages screen without a reload and focuses its heading', async () => {
    await renderAt('/')
    const pushState = vi.spyOn(window.history, 'pushState')

    await userEvent.click(screen.getByRole('link', { name: 'Copiar as mensagens agora' }))

    expect(pushState).toHaveBeenCalledWith({}, '', '/mensagens')
    expect(window.location.pathname).toBe('/mensagens')
    expect(screen.getByRole('heading', { level: 1, name: 'Suas 3 mensagens' })).toHaveFocus()
  })

  it.each([
    ['Ctrl-click', { ctrlKey: true }],
    ['Cmd-click', { metaKey: true }],
    ['Shift-click', { shiftKey: true }],
    ['middle-click', { button: 1 }],
  ])('leaves %s to the browser', async (_, init) => {
    await renderAt('/')
    const link = screen.getByRole('link', { name: 'Ver as 3 mensagens com as dicas' })
    let preventedByApp: boolean | undefined
    // Runs after React's handlers; stops jsdom from attempting the (unsupported) native navigation.
    const recordAndStop = (event: MouseEvent) => {
      preventedByApp = event.defaultPrevented
      event.preventDefault()
    }
    window.addEventListener('click', recordAndStop)

    expect(link).toHaveAttribute('href', '/mensagens')
    fireEvent.click(link, init)
    window.removeEventListener('click', recordAndStop)

    expect(preventedByApp).toBe(false)
    expect(window.location.pathname).toBe('/')
  })

  it('lands on the chosen message and highlights it', async () => {
    await renderAt('/')

    await userEvent.click(screen.getByRole('link', { name: /Posso chegar mais cedo/ }))

    expect(window.location.hash).toBe('#cedo')
    expect(card('cedo')).toHaveFocus()
    expect(card('cedo')).toHaveClass('message-card--highlight')
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'instant', block: 'start' })
  })

  it('animates jumps between messages on the same screen', async () => {
    await renderAt('/mensagens')
    const jumpLinks = screen.getByRole('navigation', { name: 'Ir para a mensagem' })

    await userEvent.click(within(jumpLinks).getByRole('link', { name: 'Lembrete de check-out' }))

    expect(card('checkout')).toHaveFocus()
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })
  })

  it('does not animate the scroll when reduced motion is preferred', async () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true })
    await renderAt('/mensagens')
    const jumpLinks = screen.getByRole('navigation', { name: 'Ir para a mensagem' })

    await userEvent.click(within(jumpLinks).getByRole('link', { name: 'Lembrete de check-out' }))

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'instant', block: 'start' })
  })

  it.each(['boasvindas', 'cedo', 'checkout'])('supports direct entry to /mensagens#%s', async (anchor) => {
    await renderAt(`/mensagens#${anchor}`)

    expect(card(anchor)).toHaveFocus()
    expect(card(anchor)).toHaveClass('message-card--highlight')
  })

  it('returns to the home page from the back link on the messages screen', async () => {
    await renderAt('/mensagens#cedo')
    const back = screen.getByRole('link', { name: 'Voltar para o início' })

    expect(back).toHaveAttribute('href', '/')
    await userEvent.click(back)

    expect(window.location.pathname).toBe('/')
    expect(screen.getByRole('heading', { level: 1, name: /3 mensagens prontas/ })).toHaveFocus()
  })

  it('does not move focus on a plain page load', async () => {
    await renderAt('/mensagens')

    expect(document.body).toHaveFocus()
  })

  it('opens the thank-you screen, focuses its heading, and goes back to the messages', async () => {
    await renderAt('/obrigado?origin=pdf-request-home&reel=test')

    expect(screen.getByRole('heading', { level: 1, name: /Pronto! Seu Caderninho está aqui/ })).toHaveFocus()
    expect(screen.getByRole('link', { name: 'Baixar o Caderninho em PDF' })).toHaveAttribute('href', '/lia-3-mensagens.pdf')

    await userEvent.click(screen.getByRole('link', { name: 'Voltar para as mensagens' }))

    expect(window.location.pathname).toBe('/mensagens')
    expect(screen.getByRole('heading', { level: 1, name: 'Suas 3 mensagens' })).toHaveFocus()
  })

  it('follows Back and Forward between screens and message anchors', async () => {
    await renderAt('/')
    await userEvent.click(screen.getByRole('link', { name: /Posso chegar mais cedo/ }))
    const jumpLinks = screen.getByRole('navigation', { name: 'Ir para a mensagem' })
    await userEvent.click(within(jumpLinks).getByRole('link', { name: 'Lembrete de check-out' }))
    expect(card('checkout')).toHaveFocus()

    await historyTraversal(() => window.history.back())
    expect(window.location.hash).toBe('#cedo')
    expect(card('cedo')).toHaveFocus()
    expect(card('cedo')).toHaveClass('message-card--highlight')

    await historyTraversal(() => window.history.back())
    expect(window.location.pathname).toBe('/')
    expect(screen.getByRole('heading', { level: 1, name: /3 mensagens prontas/ })).toHaveFocus()

    await historyTraversal(() => window.history.forward())
    expect(card('cedo')).toHaveFocus()
  })

  it('reacts to a hash change while the messages screen stays mounted', async () => {
    await renderAt('/mensagens')

    await act(async () => {
      window.location.hash = 'checkout'
      await new Promise((resolve) => window.addEventListener('hashchange', resolve, { once: true }))
    })

    expect(card('checkout')).toHaveFocus()
    expect(card('checkout')).toHaveClass('message-card--highlight')
  })

  describe('sales page', () => {
    const FREE_TITLE = '3 mensagens prontas · Lia da Hospedagem'
    const FREE_DESCRIPTION = 'Boas-vindas, chegada mais cedo e lembrete de check-out.'
    const description = () => document.head.querySelector('meta[name="description"]')

    beforeEach(() => {
      document.title = FREE_TITLE
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content = FREE_DESCRIPTION
      document.head.append(meta)
    })

    afterEach(() => {
      document.head.querySelectorAll('meta[name="description"]').forEach((meta) => meta.remove())
    })

    it('renders its own layout, without the free page header, footer or waitlist', async () => {
      await renderAt('/guia-pede-assim?utm_source=instagram&utm_medium=bio')

      const title = await screen.findByRole('heading', { level: 1 })
      expect(title.textContent).toBe('É sempre a mesma pergunta. Pede assim pra\u00a0IA.')
      expect(title.querySelector('em')?.textContent).toBe('Pede assim pra\u00a0IA.')
      expect(screen.getAllByRole('main')).toHaveLength(1)
      expect(screen.getByRole('main')).toHaveAttribute('id', 'conteudo')
      expect(document.querySelector('.site-header')).toBeNull()
      expect(document.querySelector('.site-footer')).toBeNull()
      expect(document.querySelector('.waitlist')).toBeNull()
      expect(screen.queryByText(/lista de lançamento/)).not.toBeInTheDocument()
    })

    it('sets its title and description, stays indexable, and restores both on leaving', async () => {
      await renderAt('/guia-pede-assim')
      await screen.findByRole('heading', { level: 1 })
      const { navigate } = await import('./router')

      expect(document.title).toBe('Pede assim pra IA | Lia da Hospedagem')
      expect(description()).toHaveAttribute(
        'content',
        '12 instruções testadas no ChatGPT grátis pra pedir à IA um rascunho de mensagem pro hóspede. PDF de 15 páginas por R$10.',
      )
      expect(document.head.querySelector('meta[name="robots"]')).toBeNull()

      act(() => navigate('/'))

      expect(document.title).toBe(FREE_TITLE)
      expect(description()).toHaveAttribute('content', FREE_DESCRIPTION)
      expect(document.head.querySelectorAll('meta[name="description"]')).toHaveLength(1)
    })
  })

  it('navigates in memory in preview mode without changing the URL', async () => {
    vi.stubEnv('VITE_PREVIEW', '1')
    await renderAt('/')

    await userEvent.click(screen.getByRole('link', { name: /Posso chegar mais cedo/ }))

    expect(window.location.pathname).toBe('/')
    expect(window.location.hash).toBe('')
    expect(card('cedo')).toHaveFocus()

    await userEvent.click(screen.getByRole('link', { name: /Caderninho da Lia/ }))
    expect(screen.getByRole('heading', { level: 1, name: /3 mensagens prontas/ })).toHaveFocus()
    expect(window.location.pathname).toBe('/')
  })
})
