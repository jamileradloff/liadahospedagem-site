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
