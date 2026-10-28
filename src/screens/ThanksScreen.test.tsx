import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PDF_TIP } from '../components/PdfButton'
import { ThanksScreen } from './ThanksScreen'

const { track } = vi.hoisted(() => ({ track: vi.fn() }))

vi.mock('../analytics', async () => {
  const actual = await vi.importActual<typeof import('../analytics')>('../analytics')
  return { ...actual, track }
})

const EMAIL_NOTE = 'Te aviso por e-mail quando o caderninho completo sair.'
const NO_LIST_NOTE = 'Bom uso! 🧡 Se mudar de ideia, a lista fica no fim da página de mensagens.'

function renderThanks(url = '/obrigado') {
  window.history.replaceState(null, '', url)
  return render(<ThanksScreen />)
}

describe('ThanksScreen', () => {
  afterEach(() => {
    track.mockReset()
    window.history.replaceState(null, '', '/')
  })

  it('offers the PDF download and a way back to the messages', async () => {
    renderThanks()

    const download = screen.getByRole('link', { name: 'Baixar o Caderninho em PDF' })
    expect(download).toHaveAttribute('href', '/lia-3-mensagens.pdf')
    expect(download).toHaveAttribute('target', '_blank')
    expect(download).toHaveAttribute('rel', 'noopener')
    expect(screen.getByRole('link', { name: 'Voltar para as mensagens' })).toHaveAttribute('href', '/mensagens')
    expect(screen.queryByRole('link', { name: 'Quero entrar na lista de lançamento' })).not.toBeInTheDocument()
    expect(screen.queryByText(PDF_TIP)).not.toBeInTheDocument()

    await userEvent.click(download)
    expect(track).toHaveBeenCalledWith('downloaded_pdf', { page: 'thanks' })
    expect(screen.getByText(PDF_TIP)).toBeInTheDocument()
  })

  it('promises e-mail only when lista is Sim, autorizo', () => {
    renderThanks('/obrigado?lista=Sim%2C%20autorizo')

    expect(screen.getByText(EMAIL_NOTE)).toBeInTheDocument()
    expect(screen.queryByText(NO_LIST_NOTE)).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Quero entrar na lista de lançamento' })).not.toBeInTheDocument()
  })

  it('does not promise e-mail when lista is Não, só quero o PDF', () => {
    renderThanks('/obrigado?lista=N%C3%A3o%2C%20s%C3%B3%20quero%20o%20PDF')

    expect(screen.getByText(NO_LIST_NOTE)).toBeInTheDocument()
    expect(screen.queryByText(EMAIL_NOTE)).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Quero entrar na lista de lançamento' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Voltar para as mensagens' })).toHaveAttribute('href', '/mensagens')
  })

  it('does not promise e-mail when lista is missing', () => {
    renderThanks('/obrigado')

    expect(screen.getByText(NO_LIST_NOTE)).toBeInTheDocument()
    expect(screen.queryByText(EMAIL_NOTE)).not.toBeInTheDocument()
  })
})
