import { expect, test, type Locator, type Page } from '@playwright/test'
import { expectNoHorizontalOverflow, gotoSettled } from './support'

const WIDTHS = [320, 390, 768, 1024, 1440]

const ROUTES: { path: string; controls: (page: Page) => Locator[] }[] = [
  {
    path: '/',
    controls: (page) => [
      page.getByRole('link', { name: 'Copiar as mensagens agora' }),
      page.getByRole('button', { name: 'Copiar a de boas-vindas' }),
      page.getByRole('link', { name: 'Receber o PDF' }).last(),
      page.locator('.waitlist').getByRole('link', { name: 'Quero entrar na lista de lançamento' }),
      page.getByText('Quem está por trás da Lia?'),
    ],
  },
  {
    path: '/mensagens',
    controls: (page) => [
      page.getByRole('link', { name: 'Voltar para o início' }),
      ...[0, 1, 2].map((i) => page.getByRole('button', { name: 'Copiar mensagem' }).nth(i)),
      page.locator('.waitlist').getByRole('link', { name: 'Quero entrar na lista de lançamento' }),
      page.getByRole('link', { name: 'Receber o PDF' }),
    ],
  },
  {
    path: '/obrigado',
    controls: (page) => [
      page.getByRole('link', { name: 'Baixar o Caderninho em PDF' }),
      page.getByRole('link', { name: 'Voltar para as mensagens' }),
    ],
  },
  {
    path: '/pede-assim',
    controls: (page) => [
      page.getByRole('link', { name: 'Pedido de desconto' }),
      page.getByRole('link', { name: 'Responder a uma avaliação negativa' }),
      page.getByRole('link', { name: '@liadahospedagem no Instagram' }),
    ],
  },
  {
    path: '/pede-assim/check-out-mais-tarde',
    controls: (page) => [
      page.getByRole('button', { name: 'Toca aqui para copiar: Check-out mais tarde' }),
      page.getByRole('link', { name: '@liadahospedagem no Instagram' }),
    ],
  },
  {
    path: '/guia-pede-assim',
    controls: (page) => [
      page.getByRole('link', { name: 'Ver um exemplo ↓' }),
      page.getByText('Ver o pedido pra IA dessa situação'),
      page.getByText('Como recebo o PDF?'),
      page.getByRole('link', { name: 'Quero receber novidades do Kit' }),
      page.getByRole('link', { name: '@liadahospedagem' }),
    ],
  },
]

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

test('the sales page keeps tall tap targets, and the cover moves beside the text from 56em', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'The sales layout sweep runs once, in desktop Chromium')

  await page.setViewportSize({ width: 390, height: 900 })
  await gotoSettled(page, '/guia-pede-assim')

  const tall = [
    page.getByRole('link', { name: 'Ver um exemplo ↓' }),
    page.getByRole('button', { name: 'Quero meu PDF por R$10' }),
    page.getByText('Ver o pedido pra IA dessa situação'),
    ...[0, 1, 2, 3, 4, 5].map((i) => page.locator('.sales-faq summary').nth(i)),
  ]
  for (const control of tall) {
    const box = await control.boundingBox()
    expect(box, `${control.toString()} has no box`).not.toBeNull()
    expect(box!.height, `${control.toString()} is under 48px`).toBeGreaterThanOrEqual(48)
  }

  const stack = [
    page.getByRole('heading', { level: 1 }),
    page.locator('.sales-hero-sub'),
    page.locator('.sales-hero-price'),
    page.getByRole('link', { name: 'Ver um exemplo ↓' }),
    page.locator('.sales-hero-note').first(),
    page.locator('.sales-hero-note').last(),
    page.locator('.sales-cover'),
    page.locator('#exemplo'),
  ]
  let previous = -1
  for (const part of stack) {
    const box = await part.boundingBox()
    expect(box, `${part.toString()} has no box`).not.toBeNull()
    expect(box!.y, `${part.toString()} is out of order`).toBeGreaterThan(previous)
    previous = box!.y
  }
  const text = await page.locator('.sales-hero-grid > div').first().boundingBox()
  const cover = await page.locator('.sales-cover').boundingBox()
  expect(cover!.y).toBeGreaterThanOrEqual(text!.y + text!.height - 1)

  // 56em is 896px at the default root size. The cover sits in the second column from there up.
  await page.setViewportSize({ width: 1024, height: 900 })
  await gotoSettled(page, '/guia-pede-assim')
  const wideText = await page.locator('.sales-hero-grid > div').first().boundingBox()
  const wideCover = await page.locator('.sales-cover').boundingBox()
  expect(wideCover!.x).toBeGreaterThanOrEqual(wideText!.x + wideText!.width - 1)
})

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
