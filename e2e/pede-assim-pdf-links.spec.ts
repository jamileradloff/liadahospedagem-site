import { expect, test, type Page } from '@playwright/test'
import data from '../src/pedeAssim/instructions.json' with { type: 'json' }
import { blockClipboard } from './support'

// Each copy button in the guide's PDF opens /pede-assim/<slug>, in this order (pdf/pede-assim/verify.py checks the PDF
// side). Run against a deployed site with PLAYWRIGHT_BASE_URL=https://… npx playwright test e2e/pede-assim*.
const INSTRUCTIONS = data.groups.flatMap((group) => group.items)
const COPIED = 'Instrução copiada. Agora cole na IA.'
const longestLine = (prompt: string) => prompt.split('\n').reduce((a, b) => (b.length > a.length ? b : a))

declare global {
  interface Window {
    copiedTexts: string[]
  }
}

/** Records every string the page asks to copy. Chromium also writes it to the real clipboard; WebKit can't grant that. */
async function recordCopies(page: Page, realClipboard: boolean) {
  await page.addInitScript((real) => {
    window.copiedTexts = []
    const write = real ? navigator.clipboard.writeText.bind(navigator.clipboard) : () => Promise.resolve()
    Object.defineProperty(navigator.clipboard, 'writeText', {
      configurable: true,
      value: (text: string) => {
        window.copiedTexts.push(text)
        return write(text)
      },
    })
  }, realClipboard)
}

test('the site data has the 12 situations the PDF links to', () => {
  expect(INSTRUCTIONS).toHaveLength(12)
  expect(new Set(INSTRUCTIONS.map((item) => item.slug)).size).toBe(12)
})

test('every PDF copy link opens only its situation and copies its exact instruction', async ({ page, context, browserName }) => {
  const realClipboard = browserName === 'chromium'
  if (realClipboard) await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await recordCopies(page, realClipboard)

  for (const [index, item] of INSTRUCTIONS.entries()) {
    await test.step(`${item.number}. ${item.slug}`, async () => {
      await page.goto(`/pede-assim/${item.slug}`)
      const main = page.getByRole('main')
      await expect(main.getByRole('heading', { level: 2 })).toHaveText(item.title)
      await expect(main.getByText(`${String(index + 1).padStart(2, '0')} / 12`, { exact: true })).toBeVisible()
      expect(item.number).toBe(index + 1)

      const text = await page.locator('body').innerText()
      for (const other of INSTRUCTIONS.filter((candidate) => candidate !== item)) {
        expect(text, `${other.title} is also on the page`).not.toContain(longestLine(other.prompt))
        await expect(page.getByRole('heading', { name: other.title, exact: true })).toHaveCount(0)
      }

      await page.getByRole('button', { name: `Toca aqui para copiar: ${item.title}` }).click()
      await expect(page.getByRole('status')).toHaveText(COPIED)
      expect(await page.evaluate(() => window.copiedTexts.at(-1))).toBe(item.prompt)
      if (realClipboard) expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(item.prompt)
    })
  }
})

test('the copied “Check-out mais tarde” pastes intact and its five fields can be filled', async ({ page, context, browserName }) => {
  test.skip(browserName !== 'chromium', 'Only Chromium lets tests read and paste the clipboard')
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  const checkout = INSTRUCTIONS.find((item) => item.slug === 'check-out-mais-tarde')!

  await page.goto('/pede-assim/check-out-mais-tarde')
  await page.getByRole('button', { name: 'Toca aqui para copiar: Check-out mais tarde' }).click()
  await expect(page.getByRole('status')).toHaveText(COPIED)

  // An isolated test field: no AI service or guest data is involved.
  await page.evaluate(() => {
    const input = document.createElement('textarea')
    input.setAttribute('aria-label', 'Campo de teste para colar o texto')
    document.body.prepend(input)
  })
  const field = page.getByRole('textbox', { name: 'Campo de teste para colar o texto' })
  await field.focus()
  await page.keyboard.press('ControlOrMeta+V')
  const pasted = await field.inputValue()
  expect(pasted).toBe(checkout.prompt)

  // The fictitious values from the guide's example; Taxa stays blank.
  const values = ['Dá pra sair às 14h?', '11h', 'em verificação', '', 'até as 10h de hoje']
  let i = 0
  const filled = pasted.replace(/\[[^\]]+\]\./g, () => (values[i] ? `${values[i++]}.` : (i++, '')))
  expect(i).toBe(5)
  expect(filled).toMatch(
    /Mensagem do hóspede: Dá pra sair às 14h\?\.\nCheck-out da reserva: 11h\.\nMinha decisão: em verificação\.\nTaxa .*: \nPrazo de retorno .*: até as 10h de hoje\./,
  )
})

test('a blocked clipboard selects the exact instruction and says how to copy it by hand', async ({ page }) => {
  await blockClipboard(page)
  const checkout = INSTRUCTIONS.find((item) => item.slug === 'check-out-mais-tarde')!

  await page.goto('/pede-assim/check-out-mais-tarde')
  await page.getByRole('button', { name: 'Toca aqui para copiar: Check-out mais tarde' }).click()
  await expect(page.getByRole('status')).toHaveText('Texto selecionado. Use a opção de copiar do aparelho e cole na IA.')
  expect(await page.evaluate(() => window.getSelection()?.toString())).toBe(checkout.prompt)
})
