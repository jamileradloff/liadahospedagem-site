import { expect, test, type Locator, type Page } from '@playwright/test'
import { gotoSettled } from './support'

const WIDTHS = [320, 390, 768, 1024, 1440]

const ROUTES: { path: string; controls: (page: Page) => Locator[] }[] = [
  {
    path: '/',
    controls: (page) => [
      page.getByRole('link', { name: 'Copiar as mensagens agora' }),
      page.getByRole('button', { name: 'Copiar a de boas-vindas' }),
      page.getByRole('link', { name: 'Baixar o Caderninho em PDF' }).last(),
      page.getByRole('link', { name: 'Me avisa quando sair!' }),
      page.getByText('Quem está por trás da Lia?'),
    ],
  },
  {
    path: '/mensagens',
    controls: (page) => [
      page.getByRole('link', { name: 'Voltar para o início' }),
      ...[0, 1, 2].map((i) => page.getByRole('button', { name: 'Copiar mensagem' }).nth(i)),
      page.getByRole('link', { name: 'Me avisa quando sair!' }),
      page.getByRole('link', { name: 'Baixar o Caderninho em PDF' }),
    ],
  },
]

async function expectNoHorizontalOverflow(page: Page) {
  const { scrollWidth, innerWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }))
  expect(scrollWidth, 'page is wider than the viewport').toBeLessThanOrEqual(innerWidth)
}

async function expectControlsReachable(page: Page, controls: Locator[]) {
  const width = page.viewportSize()?.width ?? 0
  for (const control of controls) {
    await control.scrollIntoViewIfNeeded()
    await expect(control).toBeVisible()
    const box = await control.boundingBox()
    expect(box, `${control.toString()} has no box`).not.toBeNull()
    if (!box) continue
    expect(box.x, `${control.toString()} starts offscreen`).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width, `${control.toString()} ends offscreen`).toBeLessThanOrEqual(width + 0.5)
    expect(box.height, `${control.toString()} is too small to tap`).toBeGreaterThanOrEqual(24)
  }
}

for (const route of ROUTES) {
  test(`${route.path} fits the device viewport`, async ({ page }) => {
    await gotoSettled(page, route.path)
    await expectNoHorizontalOverflow(page)
    await expectControlsReachable(page, route.controls(page))
  })

  test(`${route.path} fits every reference width`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chromium', 'Width sweep runs once, in desktop Chromium')
    for (const width of WIDTHS) {
      await test.step(`${width}px`, async () => {
        await page.setViewportSize({ width, height: 900 })
        await gotoSettled(page, route.path)
        await expectNoHorizontalOverflow(page)
        await expectControlsReachable(page, route.controls(page))
      })
    }
  })
}
