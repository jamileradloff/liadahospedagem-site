import { expect, test, type Page } from '@playwright/test'
import data from '../src/pedeAssim/instructions.json' with { type: 'json' }

const INSTRUCTIONS = data.groups.flatMap((group) => group.items)
const CHECKOUT = 'Check-out mais tarde'

const heading = (page: Page, name: string) => page.getByRole('heading', { level: 2, name, exact: true })

/** The Pede assim screen and its fonts load after the page, so wait for both before measuring. */
async function openSettled(page: Page, path: string, title: string) {
  await page.goto(path)
  await expect(heading(page, title)).toBeVisible()
  await page.evaluate(() => document.fonts.ready.then(() => undefined))
}

async function expectInFirstViewport(page: Page, name: string, locator: ReturnType<Page['getByRole']>) {
  const box = await locator.boundingBox()
  const viewport = page.viewportSize()
  expect(box, `${name} has no box`).not.toBeNull()
  if (!box || !viewport) return
  expect(box.y, `${name} starts above the viewport`).toBeGreaterThanOrEqual(0)
  expect(box.y + box.height, `${name} ends below the first screen`).toBeLessThanOrEqual(viewport.height)
}

test.use({ reducedMotion: 'reduce' })

for (const viewport of [
  { width: 390, height: 844 },
  { width: 375, height: 667 },
]) {
  test(`every situation opens with its title focused and its copy button on the first screen (${viewport.width}×${viewport.height})`, async ({ page }) => {
    await page.setViewportSize(viewport)
    for (const item of INSTRUCTIONS) {
      await test.step(item.slug, async () => {
        await openSettled(page, `/pede-assim/${item.slug}`, item.title)
        await expect(heading(page, item.title)).toBeFocused()
        expect(await page.evaluate(() => window.scrollY)).toBe(0)
        await expectInFirstViewport(page, 'title', heading(page, item.title))
        await expectInFirstViewport(page, 'copy button', page.getByRole('button', { name: `Toca aqui para copiar: ${item.title}` }))
      })
    }
  })
}

test('refresh keeps the situation, with its title focused, and keeps the index', async ({ page }) => {
  await openSettled(page, '/pede-assim/check-out-mais-tarde', CHECKOUT)
  await page.reload()
  await expect(heading(page, CHECKOUT)).toBeFocused()

  await openSettled(page, '/pede-assim', 'Índice de situações')
  await page.reload()
  await expect(heading(page, 'Índice de situações')).toBeVisible()
})

test('Back and Forward between the index and a situation land on each heading', async ({ page }) => {
  await openSettled(page, '/pede-assim', 'Índice de situações')

  await page.getByRole('link', { name: CHECKOUT }).click()
  await expect(heading(page, CHECKOUT)).toBeFocused()

  await page.goBack()
  await expect(page).toHaveURL(/\/pede-assim$/)
  await expect(heading(page, 'Índice de situações')).toBeFocused()

  await page.goForward()
  await expect(page).toHaveURL(/\/pede-assim\/check-out-mais-tarde$/)
  await expect(heading(page, CHECKOUT)).toBeFocused()
})

test('a situation opened from the PDF offers no way to the other situations', async ({ page }) => {
  await openSettled(page, '/pede-assim/check-out-mais-tarde', CHECKOUT)

  await expect(page.getByRole('link')).toHaveCount(1)
  await expect(page.getByRole('link')).toHaveAccessibleName('@liadahospedagem no Instagram')
})
