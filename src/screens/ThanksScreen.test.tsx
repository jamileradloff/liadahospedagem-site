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

describe('ThanksScreen', () => {
  afterEach(() => {
    track.mockReset()
  })

  it('offers the PDF download and a way back to the messages', async () => {
    render(<ThanksScreen />)

    const download = screen.getByRole('link', { name: 'Baixar o Caderninho em PDF' })
    expect(download).toHaveAttribute('href', '/lia-3-mensagens.pdf')
    expect(download).toHaveAttribute('target', '_blank')
    expect(download).toHaveAttribute('rel', 'noopener')
    expect(screen.getByRole('link', { name: 'Voltar para as mensagens' })).toHaveAttribute('href', '/mensagens')
    expect(screen.queryByText(PDF_TIP)).not.toBeInTheDocument()

    await userEvent.click(download)
    expect(track).toHaveBeenCalledWith('downloaded_pdf', { page: 'thanks' })
    expect(screen.getByText(PDF_TIP)).toBeInTheDocument()
  })
})
