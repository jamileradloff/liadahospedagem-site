import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { gotoSettled } from './support'

const WCAG_AA = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

async function expectNoViolations(page: Page) {
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG_AA).analyze()
  expect(violations.map(({ id, help, nodes }) => ({ id, help, targets: nodes.map((n) => n.target.join(' ')) }))).toEqual([])
}

test.use({ reducedMotion: 'reduce' })

test('the home page has no WCAG AA violations', async ({ page }) => {
  await gotoSettled(page, '/')
  await page.getByText('Quem está por trás da Lia?').click()
  await expectNoViolations(page)
})

test('the after-copy waitlist prompt has no WCAG AA violations', async ({ page, context, browserName }) => {
  test.skip(browserName !== 'chromium', 'Only Chromium lets tests grant clipboard access')
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await gotoSettled(page, '/')
  await page.getByRole('button', { name: 'Copiar a de boas-vindas' }).click()
  await expect(page.locator('.waitlist-cta--after-copy')).toBeVisible()
  await expectNoViolations(page)
})

test('the home page copy fallback has no WCAG AA violations', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.reject(new Error('blocked')) } })
    document.execCommand = () => false
  })
  await gotoSettled(page, '/')
  await page.getByRole('button', { name: 'Copiar a de boas-vindas' }).click()
  await expect(page.locator('.copy-fallback')).toBeVisible()
  await expectNoViolations(page)
})

test('the messages page has no WCAG AA violations', async ({ page }) => {
  await gotoSettled(page, '/mensagens')
  await expectNoViolations(page)
})

test('the Pede assim index has no WCAG AA violations', async ({ page }) => {
  await gotoSettled(page, '/pede-assim')
  await expect(page.getByRole('heading', { level: 2, name: 'Índice de situações' })).toBeVisible()
  await expectNoViolations(page)
})

test('a Pede assim situation has no WCAG AA violations, also after a blocked copy', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.reject(new Error('blocked')) } })
    document.execCommand = () => false
  })
  await gotoSettled(page, '/pede-assim/check-out-mais-tarde')
  await expectNoViolations(page)
  await page.getByRole('button', { name: 'Toca aqui para copiar: Check-out mais tarde' }).click()
  await expect(page.getByRole('status')).toHaveText(/Texto selecionado/)
  await expectNoViolations(page)
})

test('the thank-you page has no WCAG AA violations', async ({ page }) => {
  await gotoSettled(page, '/obrigado?origin=pdf-request-home&reel=test')
  await expect(page.getByRole('heading', { level: 1, name: /Pronto! Seu Caderninho está aqui/ })).toBeFocused()
  await expectNoViolations(page)
})

test('the sales page has no WCAG AA violations', async ({ page }) => {
  await gotoSettled(page, '/guia-pede-assim')
  await expect(page.getByRole('heading', { level: 1, name: 'É sempre a mesma pergunta. Pede assim pra\u00a0IA.' })).toBeVisible()
  await expectNoViolations(page)
})

test('the sales page has no WCAG AA violations with the example and the FAQs open', async ({ page }) => {
  await gotoSettled(page, '/guia-pede-assim')
  await page.getByText('Ver o pedido pra IA dessa situação').click()
  const faqs = page.locator('.sales-faq summary')
  for (let i = 0; i < (await faqs.count()); i++) await faqs.nth(i).click()
  await expect(page.locator('.sales-faq details[open]')).toHaveCount(6)
  await expectNoViolations(page)
})

test('the sales page has one main, the v2 heading outline, and ordered lists for the situations and the steps', async ({ page }) => {
  await gotoSettled(page, '/guia-pede-assim')

  await expect(page.getByRole('main')).toHaveCount(1)
  await expect(page.locator('.sales > footer')).toHaveCount(1)

  const headings = await page.locator('h1, h2, h3, h4, h5, h6').evaluateAll((els) =>
    els.map((el) => ({
      level: Number(el.tagName.slice(1)),
      text: (el.textContent ?? '').replace(/\s+/g, ' ').trim(),
    })),
  )
  expect(headings.filter((heading) => heading.level === 1).map((heading) => heading.text)).toEqual([
    'É sempre a mesma pergunta. Pede assim pra IA.',
  ])
  expect(headings.filter((heading) => heading.level === 2).map((heading) => heading.text)).toEqual([
    '“Posso chegar mais cedo?”',
    'Abre na situação que você precisa resolver.',
    'As 12 situações',
    'Copia, preenche, confere e manda.',
    'Antes de comprar',
    'Hospitalidade primeiro. IA pra ajudar.',
    'Na próxima pergunta repetida, já tem o pedido.',
  ])

  // v2 goes h2 → h4 under “As 12 situações”. Every other step in the outline stays within one level.
  let previous = 0
  const skips = headings.flatMap((heading) => {
    const skipped = previous > 0 && heading.level > previous + 1 ? [`h${previous} → h${heading.level}: ${heading.text}`] : []
    previous = heading.level
    return skipped
  })
  expect(skips).toEqual(['h2 → h4: 01Pedido de desconto'])

  const situations = page.locator('ol.sales-modules')
  await expect(situations.getByRole('listitem')).toHaveCount(12)
  await expect(page.locator('ol.sales-steps').getByRole('listitem')).toHaveCount(3)
})
