import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GROUPS, INSTRUCTIONS, type Instruction } from './instructions'

// The router reads the URL when it loads, so each test imports a fresh App.
async function renderAt(url: string) {
  window.history.replaceState(null, '', url)
  vi.resetModules()
  const { App } = await import('../App')
  const router = await import('../router')
  render(<App />)
  return router
}

const checkout = INSTRUCTIONS[4] as Instruction
const robots = () => document.head.querySelector('meta[name="robots"]')

function promptBlock() {
  const button = screen.getByRole('button', { name: `Toca aqui para copiar: ${checkout.title}` })
  return document.getElementById(button.getAttribute('aria-controls') ?? '') as HTMLElement
}

beforeEach(() => {
  document.title = '3 mensagens prontas · Lia da Hospedagem'
  Element.prototype.scrollIntoView = vi.fn()
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  window.matchMedia = vi.fn().mockReturnValue({ matches: false })
})

describe('Pede assim index', () => {
  it('lists the 12 situations under their 5 groups, each with a real link', async () => {
    await renderAt('/pede-assim')

    expect(await screen.findByRole('heading', { level: 2, name: 'Índice de situações' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Pede assim pra IA' })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual(GROUPS.map((g) => g.title))
    for (const item of INSTRUCTIONS) {
      expect(screen.getByRole('link', { name: item.title })).toHaveAttribute('href', `/pede-assim/${item.slug}`)
    }
    expect(document.title).toBe('Pede assim pra IA · Índice')
  })

  it('shows the index for a slug that does not exist', async () => {
    await renderAt('/pede-assim/nao-existe')

    expect(await screen.findByRole('heading', { level: 2, name: 'Índice de situações' })).toBeInTheDocument()
  })

  it('opens a situation from the index without a reload', async () => {
    await renderAt('/pede-assim')

    await userEvent.click(await screen.findByRole('link', { name: checkout.title }))

    expect(window.location.pathname).toBe('/pede-assim/check-out-mais-tarde')
    expect(screen.getByRole('heading', { level: 2, name: checkout.title })).toBeInTheDocument()
  })
})

describe('Pede assim situation', () => {
  it('shows only the chosen situation, with its guidance and the text to copy', async () => {
    await renderAt('/pede-assim/check-out-mais-tarde')

    const title = await screen.findByRole('heading', { level: 2, name: checkout.title })
    expect(title.closest('section')).toHaveTextContent(/^05 \/ 12/)
    for (const name of ['Quando usar', 'O que preencher', 'Texto para copiar']) {
      expect(screen.getByRole('heading', { level: 3, name })).toBeInTheDocument()
    }
    expect(promptBlock().textContent).toBe(checkout.prompt)
    expect(promptBlock().querySelectorAll('.field')).toHaveLength(checkout.prompt.match(/\[[^\]\n]+\]/g)?.length ?? 0)
    expect(screen.getByRole('link', { name: 'Voltar ao índice de situações' })).toHaveAttribute('href', '/pede-assim')

    for (const other of INSTRUCTIONS.filter((item) => item !== checkout)) {
      expect(screen.queryByText(other.title)).not.toBeInTheDocument()
      expect(document.body.textContent).not.toContain(other.prompt)
    }
    expect(document.title).toBe('Check-out mais tarde · Pede assim pra IA')
  })

  it('starts each situation without the previous copy message', async () => {
    const { navigate } = await renderAt('/pede-assim/check-out-mais-tarde')
    await userEvent.click(await screen.findByRole('button', { name: `Toca aqui para copiar: ${checkout.title}` }))
    await waitFor(() => expect(screen.getByRole('status')).not.toBeEmptyDOMElement())

    act(() => navigate('/pede-assim/como-chegar'))

    expect(screen.getByRole('status')).toBeEmptyDOMElement()
  })

  it('returns to the index', async () => {
    await renderAt('/pede-assim/check-out-mais-tarde')

    await userEvent.click(await screen.findByRole('link', { name: 'Voltar ao índice de situações' }))

    expect(window.location.pathname).toBe('/pede-assim')
    expect(screen.getByRole('heading', { level: 2, name: 'Índice de situações' })).toBeInTheDocument()
  })
})

describe('Pede assim layout', () => {
  it('leaves out the free page header, footer, waitlist and PDF blocks but keeps the Instagram link', async () => {
    await renderAt('/pede-assim/check-out-mais-tarde')
    await screen.findByRole('heading', { level: 2, name: checkout.title })

    expect(screen.queryByRole('link', { name: /o Caderninho da Lia/ })).not.toBeInTheDocument()
    expect(screen.queryByText(/Sou uma personagem criada com IA/)).not.toBeInTheDocument()
    expect(screen.queryByText(/lista de espera/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/PDF/)).not.toBeInTheDocument()
    const footer = screen.getByRole('contentinfo')
    expect(within(footer).getByRole('link', { name: '@liadahospedagem no Instagram' })).toHaveAttribute(
      'href',
      'https://www.instagram.com/liadahospedagem/',
    )
  })

  it('asks search engines not to index these pages, and only these', async () => {
    const { navigate } = await renderAt('/pede-assim')
    await screen.findByRole('heading', { level: 2, name: 'Índice de situações' })
    expect(robots()).toHaveAttribute('content', 'noindex')

    act(() => navigate('/'))

    expect(robots()).toBeNull()
    expect(document.title).toBe('3 mensagens prontas · Lia da Hospedagem')
  })
})
