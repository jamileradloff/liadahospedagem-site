import { expect, test, type Page } from '@playwright/test'
import { gotoSettled } from './support'

const card = (page: Page, anchor: string) => page.locator(`article#${anchor}`)
const homeHeading = (page: Page) => page.getByRole('heading', { level: 1, name: /3 mensagens prontas/ })
const messagesHeading = (page: Page) => page.getByRole('heading', { level: 1, name: 'Suas 3 mensagens' })

test('the main call to action opens the messages screen at the top, with focus on its heading', async ({ page }) => {
  await gotoSettled(page, '/')
  await page.getByRole('link', { name: 'Copiar as mensagens agora' }).click()

  await expect(page).toHaveURL('/mensagens')
  await expect(messagesHeading(page)).toBeFocused()
  expect(await page.evaluate(() => window.scrollY)).toBe(0)
})

for (const anchor of ['boasvindas', 'cedo', 'checkout']) {
  test(`a PDF link to #${anchor} lands on that message`, async ({ page }) => {
    await gotoSettled(page, `/mensagens?utm_source=pdf#${anchor}`)

    await expect(card(page, anchor)).toBeFocused()
    await expect(card(page, anchor)).toBeInViewport()
    await expect(card(page, anchor)).toHaveClass(/message-card--highlight/)
  })
}

test('the jump links move between messages', async ({ page }) => {
  await gotoSettled(page, '/mensagens')
  await page.getByRole('navigation', { name: 'Ir para a mensagem' }).getByRole('link', { name: 'Lembrete de check-out' }).click()

  await expect(page).toHaveURL('/mensagens#checkout')
  await expect(card(page, 'checkout')).toBeFocused()
  await expect(card(page, 'checkout')).toBeInViewport()
})

test('Back restores the home scroll position and Forward returns to the message', async ({ page }) => {
  await gotoSettled(page, '/')
  const tocLink = page.getByRole('link', { name: /Posso chegar mais cedo/ })
  await tocLink.scrollIntoViewIfNeeded()
  const scrollAtClick = page.evaluate(
    () => new Promise<number>((resolve) => window.addEventListener('click', () => resolve(window.scrollY), { capture: true, once: true })),
  )

  await tocLink.click()
  const homeScroll = await scrollAtClick
  expect(homeScroll).toBeGreaterThan(0)
  await expect(page).toHaveURL('/mensagens#cedo')
  await expect(card(page, 'cedo')).toBeFocused()

  await page.goBack()
  await expect(page).toHaveURL('/')
  await expect(homeHeading(page)).toBeFocused()
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeCloseTo(homeScroll, -1)

  await page.goForward()
  await expect(page).toHaveURL('/mensagens#cedo')
  await expect(card(page, 'cedo')).toBeFocused()
  await expect(card(page, 'cedo')).toBeInViewport()
})

test('the back link returns to the home page', async ({ page }) => {
  await gotoSettled(page, '/mensagens')
  await page.getByRole('link', { name: 'Voltar para o início' }).click()

  await expect(page).toHaveURL('/')
  await expect(homeHeading(page)).toBeFocused()
})

test.describe('copying', () => {
  test('copies the welcome message to the clipboard and confirms it', async ({ page, context, browserName }) => {
    test.skip(browserName !== 'chromium', 'Only Chromium lets tests read the clipboard')
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await gotoSettled(page, '/')

    await page.getByRole('button', { name: 'Copiar a de boas-vindas' }).click()

    await expect(page.getByRole('button', { name: 'Copiada! Agora cola no WhatsApp' })).toBeVisible()
    await expect(page.getByRole('status').filter({ hasText: 'Mensagem copiada. Agora cola no WhatsApp.' })).toHaveCount(1)
    expect(await page.evaluate(() => navigator.clipboard.readText())).toMatch(/^Oi, \[nome do hóspede\]! 😊 Aqui é \[seu nome\]/)
    const prompt = page.locator('.waitlist-cta--after-copy')
    await expect(prompt).toContainText('Essa é 1 de 12 mensagens.')
    await expect(prompt.getByRole('link', { name: 'Quero entrar na lista de lançamento' })).toHaveAttribute(
      'href',
      'https://tally.so/r/9qzR1Q?origin=home',
    )
    await expect(page.getByRole('button', { name: 'Copiada! Agora cola no WhatsApp' })).toBeFocused()
  })

  test('when the browser blocks copying, the home page shows the message to copy by hand', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: () => Promise.reject(new Error('blocked')) },
      })
      document.execCommand = () => false
    })
    await gotoSettled(page, '/')

    await page.getByRole('button', { name: 'Copiar a de boas-vindas' }).click()

    await expect(page.getByRole('status').filter({ hasText: 'Seu navegador não deixou copiar' })).toBeVisible()
    const fallback = page.locator('.copy-fallback')
    await expect(fallback).toContainText('Aqui é [seu nome], da [sua hospedagem]')

    await fallback.getByRole('link', { name: 'Abrir a mensagem de boas-vindas' }).click()
    await expect(page).toHaveURL('/mensagens#boasvindas')
    await expect(card(page, 'boasvindas')).toBeFocused()
  })
})
