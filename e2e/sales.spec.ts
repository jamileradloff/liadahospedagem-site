import { expect, test, type Page } from '@playwright/test'

const SALES_PATH = '/guia-pede-assim'
const SALES_TITLE = 'Pede assim pra IA | Lia da Hospedagem'

const salesHeading = (page: Page) =>
  page.getByRole('heading', { level: 1, name: 'É sempre a mesma pergunta. Pede assim pra\u00a0IA.' })

test('a direct visit with campaign parameters shows the sales page, and so does a reload', async ({ page }) => {
  await page.goto(`${SALES_PATH}?utm_source=instagram`)
  await expect(salesHeading(page)).toBeVisible()
  await expect(page).toHaveTitle(SALES_TITLE)

  await page.reload()
  await expect(salesHeading(page)).toBeVisible()
  await expect(page).toHaveTitle(SALES_TITLE)
})

test('the cover and the Outfit font load on the page', async ({ page }) => {
  await page.goto(SALES_PATH)
  const cover = page.getByRole('img', { name: /^Capa do PDF Pede assim pra IA/ })
  await expect(cover).toBeVisible()
  await expect.poll(() => cover.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth)).toBe(600)

  // document.fonts.check() is also true for a family that doesn't exist, so look for the loaded face itself.
  const outfit = await page.evaluate(async () => {
    await document.fonts.ready
    const heading = document.querySelector('h1') as HTMLElement
    return {
      loaded: [...document.fonts].some((face) => face.family.replace(/"/g, '') === 'Outfit Variable' && face.status === 'loaded'),
      headingFamily: getComputedStyle(heading).fontFamily,
    }
  })
  expect(outfit.loaded).toBe(true)
  expect(outfit.headingFamily).toMatch(/^"?Outfit Variable"?,/)
})

test.describe('early check-in example', () => {
  test.use({ reducedMotion: 'reduce' })

  test('“Antes, quero ver um exemplo ↓” moves focus and scroll to the example heading', async ({ page }) => {
    await page.goto(SALES_PATH)
    await page.evaluate(() => document.fonts.ready.then(() => undefined))
    const button = page.getByRole('link', { name: 'Antes, quero ver um exemplo ↓' })
    await button.focus()
    await page.keyboard.press('Enter')

    const heading = page.getByRole('heading', { level: 2, name: '“Posso chegar mais cedo?”' })
    await expect(heading).toBeFocused()
    await expect(heading).toBeInViewport()
    await expect(page).toHaveURL(/#exemplo$/)
  })

  test('the instruction disclosure opens and closes with Enter and Space, and its text can be selected', async ({ page }) => {
    await page.goto(SALES_PATH)
    const summary = page.locator('summary', { hasText: 'Ver o pedido pra IA dessa situação' })
    const details = page.locator('details', { has: summary })
    const isOpen = () => details.evaluate((el: HTMLDetailsElement) => el.open)

    await summary.focus()
    expect(await isOpen()).toBe(false)
    await page.keyboard.press('Enter')
    expect(await isOpen()).toBe(true)
    await page.keyboard.press('Enter')
    expect(await isOpen()).toBe(false)
    await page.keyboard.press('Space')
    expect(await isOpen()).toBe(true)

    const instruction = details.locator('pre')
    await expect(instruction).toBeVisible()
    const selected = await instruction.evaluate((pre) => {
      const range = document.createRange()
      range.selectNodeContents(pre)
      const selection = window.getSelection() as Selection
      selection.removeAllRanges()
      selection.addRange(range)
      return { text: selection.toString(), userSelect: getComputedStyle(pre).userSelect }
    })
    expect(selected.userSelect).not.toBe('none')
    expect(selected.text).toContain('Mensagem do hóspede: [cole a mensagem].')

    await page.keyboard.press('Space')
    expect(await isOpen()).toBe(false)
  })
})

test('each FAQ item opens and closes with Enter and Space', async ({ page }) => {
  await page.goto(SALES_PATH)
  const items = page.getByRole('region', { name: 'Antes de comprar' }).locator('details')
  await expect(items).toHaveCount(6)

  for (const item of await items.all()) {
    const isOpen = () => item.evaluate((el: HTMLDetailsElement) => el.open)
    await item.locator('summary').focus()
    await page.keyboard.press('Enter')
    expect(await isOpen()).toBe(true)
    await page.keyboard.press('Enter')
    expect(await isOpen()).toBe(false)
    await page.keyboard.press('Space')
    expect(await isOpen()).toBe(true)
    await page.keyboard.press('Space')
    expect(await isOpen()).toBe(false)
  }
})

test('both buy links go to Hotmart, and Tab reaches the closing one', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Keyboard navigation is a desktop concern')
  await page.goto(SALES_PATH)
  const hotmart = 'https://pay.hotmart.com/T108525255F'
  const buy = page.getByRole('link', { name: 'Quero meu PDF por R$10' })
  await expect(buy).toHaveCount(2)
  await expect(buy.first()).toHaveAttribute('href', hotmart)
  await expect(page.locator('#comprar').getByRole('link', { name: 'Quero meu PDF por R$10' })).toHaveAttribute('href', hotmart)
  await expect(page.getByText('Checkout pendente')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Quero meu PDF por R$10' })).toHaveCount(0)

  await page.getByRole('link', { name: 'Quero receber novidades do Kit' }).focus()
  await page.keyboard.press('Tab')
  await expect(page.locator('#comprar').getByRole('link', { name: 'Quero meu PDF por R$10' })).toBeFocused()
})

test('Back returns to the previous page with its own title', async ({ page }) => {
  await page.goto('/mensagens')
  await expect(page.getByRole('heading', { level: 1, name: 'Suas 3 mensagens' })).toBeVisible()
  const previousTitle = await page.title()
  await page.goto(SALES_PATH)
  await expect(salesHeading(page)).toBeVisible()

  await page.goBack()
  await expect(page).toHaveURL(/\/mensagens$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Suas 3 mensagens' })).toBeVisible()
  await expect(page).toHaveTitle(previousTitle)
})
