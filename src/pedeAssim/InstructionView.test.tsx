import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { copyText } from '../clipboard'
import { INSTRUCTIONS, type Instruction } from './instructions'
import { InstructionView } from './InstructionView'

const { track } = vi.hoisted(() => ({ track: vi.fn() }))

vi.mock('../clipboard', () => ({ copyText: vi.fn() }))
vi.mock('../analytics', async () => {
  const actual = await vi.importActual<typeof import('../analytics')>('../analytics')
  return { ...actual, track }
})

const mockedCopyText = vi.mocked(copyText)
const checkout = INSTRUCTIONS[4] as Instruction
const COPIED = 'Instrução copiada. Agora cole na IA.'
const SELECTED = 'Texto selecionado. Use a opção de copiar do aparelho e cole na IA.'

const copyButton = (item: Instruction) => screen.getByRole('button', { name: `Toca aqui para copiar: ${item.title}` })

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn()
})

afterEach(() => {
  mockedCopyText.mockReset()
  track.mockReset()
  window.getSelection()?.removeAllRanges()
})

describe('copying an instruction', () => {
  it.each(INSTRUCTIONS.map((item) => [item.title, item] as const))('copies exactly the prompt of %s', async (_, item) => {
    mockedCopyText.mockResolvedValue(true)
    render(<InstructionView instruction={item} />)

    await userEvent.click(copyButton(item))

    expect(mockedCopyText).toHaveBeenCalledTimes(1)
    expect(mockedCopyText).toHaveBeenCalledWith(item.prompt)
  })

  it('confirms the copy and records which situation was copied', async () => {
    mockedCopyText.mockResolvedValue(true)
    render(<InstructionView instruction={checkout} />)

    await userEvent.click(copyButton(checkout))

    expect(screen.getByRole('status')).toHaveTextContent(COPIED)
    expect(track).toHaveBeenCalledWith('copied_instruction', { instruction: 'check-out-mais-tarde' })
  })

  it('selects the text and explains how to copy it by hand when the browser blocks copying', async () => {
    mockedCopyText.mockResolvedValue(false)
    render(<InstructionView instruction={checkout} />)

    await userEvent.click(copyButton(checkout))

    expect(window.getSelection()?.toString()).toBe(checkout.prompt)
    expect(screen.getByRole('status')).toHaveTextContent(SELECTED)
    expect(track).not.toHaveBeenCalled()
  })

  it('clears the status before each copy, so screen readers announce it again', async () => {
    mockedCopyText.mockResolvedValue(true)
    render(<InstructionView instruction={checkout} />)
    await userEvent.click(copyButton(checkout))
    expect(screen.getByRole('status')).toHaveTextContent(COPIED)

    let finish!: (ok: boolean) => void
    const pending = new Promise<boolean>((resolve) => (finish = resolve))
    mockedCopyText.mockReturnValueOnce(pending)
    await userEvent.click(copyButton(checkout))
    expect(screen.getByRole('status')).toBeEmptyDOMElement()

    await act(async () => {
      finish(true)
      await pending
    })
    expect(screen.getByRole('status')).toHaveTextContent(COPIED)
  })

  it('ignores an older copy that finishes after a newer one', async () => {
    let finishFirst!: (ok: boolean) => void
    const first = new Promise<boolean>((resolve) => (finishFirst = resolve))
    mockedCopyText.mockReturnValueOnce(first).mockResolvedValueOnce(true)
    render(<InstructionView instruction={checkout} />)

    await userEvent.click(copyButton(checkout))
    await userEvent.click(copyButton(checkout))
    expect(screen.getByRole('status')).toHaveTextContent(COPIED)

    await act(async () => {
      finishFirst(false)
      await first
    })
    expect(screen.getByRole('status')).toHaveTextContent(COPIED)
    expect(window.getSelection()?.toString()).toBe('')
  })
})
