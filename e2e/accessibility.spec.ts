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
