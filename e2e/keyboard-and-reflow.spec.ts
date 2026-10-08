import { expect, test, type Page } from '@playwright/test'
import { blockClipboard, expectNoHorizontalOverflow, gotoSettled } from './support'

const FOCUSABLE = 'a[href], button, summary'

/** True when the focused element has a visible outline or box-shadow ring. */
function focusedElementHasIndicator(page: Page) {
  return page.evaluate(() => {
    const el = document.activeElement
    if (!el || el === document.body) return false
    const style = getComputedStyle(el)
    const outline = style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0
    return outline || style.boxShadow !== 'none'
  })
}

test.describe('keyboard', () => {
  test.skip(({ isMobile }) => isMobile, 'Keyboard navigation is a desktop concern')

  for (const path of ['/', '/mensagens']) {
    test(`${path}: every control is reachable with Tab, in page order, with a visible focus indicator`, async ({ page }) => {
      await gotoSettled(page, path)
      const expected = await page.locator(FOCUSABLE).evaluateAll((els) =>
        els.filter((el) => el.checkVisibility()).map((el) => el.textContent?.trim().slice(0, 30) ?? ''),
      )
      expect(expected.length).toBeGreaterThan(5)

      const reached: string[] = []
      for (let i = 0; i < expected.length; i++) {
        await page.keyboard.press('Tab')
        reached.push(await page.evaluate(() => document.activeElement?.textContent?.trim().slice(0, 30) ?? ''))
        expect(await focusedElementHasIndicator(page), `no focus indicator on "${reached.at(-1)}"`).toBe(true)
      }
      expect(reached).toEqual(expected)
    })
  }

  test('the whole flow works from the keyboard: open messages, jump, copy', async ({ page, context, browserName }) => {
    test.skip(browserName !== 'chromium', 'Only Chromium lets tests read the clipboard')
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await gotoSettled(page, '/')

    await page.getByRole('link', { name: 'Copiar as mensagens agora' }).focus()
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL('/mensagens')
    await expect(page.getByRole('heading', { level: 1, name: 'Suas 3 mensagens' })).toBeFocused()

    // Focus continues from the heading: back link comes before it, then the jump links.
    await page.keyboard.press('Tab')
    await expect(page.getByRole('navigation', { name: 'Ir para a mensagem' }).getByRole('link').first()).toBeFocused()
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await expect(page.getByRole('link', { name: 'Lembrete de check-out' })).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page.locator('article#checkout')).toBeFocused()

    // From the focused card, the next stop is its own copy button.
    await page.keyboard.press('Tab')
    const copy = page.locator('article#checkout').getByRole('button')
    await expect(copy).toBeFocused()
    await page.keyboard.press('Space')
    await expect(copy).toHaveText('Copiada! Agora cola no WhatsApp')
    await expect(page.locator('article#checkout').getByRole('status')).toContainText('Mensagem copiada. Agora cola no WhatsApp.')
    expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('Foi um prazer receber você')
  })

  test('FAQ items open and close with Enter and Space', async ({ page }) => {
    await gotoSettled(page, '/')
    const summary = page.getByText('Preciso entender de tecnologia?')
    const details = page.locator('details', { has: summary })
    await summary.focus()

    await page.keyboard.press('Enter')
    await expect(details).toHaveAttribute('open', '')
    await page.keyboard.press('Enter')
    await expect(details).not.toHaveAttribute('open', '')
    await page.keyboard.press('Space')
    await expect(details).toHaveAttribute('open', '')
  })
})

test.describe('zoom and reflow', () => {
  test.skip(({ isMobile }) => isMobile, 'Zoom is emulated with the desktop viewport')

  for (const path of ['/', '/mensagens']) {
    // 200% and 400% browser zoom on a 1280px-wide window leave 640 and 320 CSS pixels (WCAG 1.4.10 uses 320).
    for (const [zoom, width] of [['200%', 640], ['400%', 320]] as const) {
      test(`${path} at ${zoom} zoom (${width} CSS px) reflows without horizontal scrolling`, async ({ page }) => {
        await page.setViewportSize({ width, height: 1024 / (1280 / width) })
        await gotoSettled(page, path)
        await expectNoHorizontalOverflow(page)
      })
    }

    test(`${path} stays usable with text enlarged to 200% on a 320px screen`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 640 })
      await gotoSettled(page, path)
      await page.addStyleTag({ content: 'html { font-size: 200% !important; }' })
      await expectNoHorizontalOverflow(page)
      const clipped = await page.evaluate(() =>
        [...document.querySelectorAll<HTMLElement>('h1, h2, p, a, button, summary, li')]
          .filter((el) => el.getClientRects().length > 0 && el.getBoundingClientRect().right > window.innerWidth + 1)
          .map((el) => el.textContent?.trim().slice(0, 40)),
      )
      expect(clipped, 'elements extending past the right edge').toEqual([])
    })

    test(`${path} tolerates the WCAG text-spacing overrides`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 800 })
      await gotoSettled(page, path)
      await page.addStyleTag({
        content: '* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }',
      })
      await expectNoHorizontalOverflow(page)
      // Text must not be cut off inside fixed-height boxes.
      const cutOff = await page.evaluate(() =>
        [...document.querySelectorAll<HTMLElement>('*')]
          .filter((el) => getComputedStyle(el).overflow !== 'visible' && el.scrollHeight > el.clientHeight + 1 && el.clientHeight > 0)
          .map((el) => `${el.tagName}.${el.className}`),
      )
      expect(cutOff).toEqual([])
    })
  }

  test('a long copy-failure message fits a narrow screen with enlarged text', async ({ page }) => {
    await blockClipboard(page)
    await page.setViewportSize({ width: 320, height: 640 })
    await gotoSettled(page, '/')
    await page.addStyleTag({ content: 'html { font-size: 200% !important; }' })

    await page.getByRole('button', { name: 'Copiar a de boas-vindas' }).click()
    const status = page.getByRole('status').filter({ hasText: 'Seu navegador não deixou copiar' })
    await expect(status).toBeVisible()
    await expectNoHorizontalOverflow(page)
    const box = await status.boundingBox()
    expect(box!.x).toBeGreaterThanOrEqual(0)
    expect(box!.x + box!.width).toBeLessThanOrEqual(320)
    await expect(page.locator('.copy-fallback .bubble')).toBeVisible()
  })

  test('a long copy-failure message fits a message card too', async ({ page }) => {
    await blockClipboard(page)
    await page.setViewportSize({ width: 320, height: 640 })
    await gotoSettled(page, '/mensagens')
    await page.addStyleTag({ content: 'html { font-size: 200% !important; }' })

    await page.getByRole('button', { name: 'Copiar mensagem' }).first().click()
    await expect(page.getByRole('status').filter({ hasText: 'Seu navegador não deixou copiar' })).toBeVisible()
    await expectNoHorizontalOverflow(page)
  })
})

test.describe('reduced motion', () => {
  test.skip(({ isMobile }) => isMobile, 'Scroll sampling runs once, in desktop Chromium')

  async function scrollPositionsAfterJump(page: Page) {
    await gotoSettled(page, '/mensagens')
    await page.evaluate(() => {
      const w = window as unknown as { seen: number[] }
      w.seen = []
      const tick = () => {
        w.seen.push(Math.round(window.scrollY))
        requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    })
    await page.getByRole('navigation', { name: 'Ir para a mensagem' }).getByRole('link', { name: 'Lembrete de check-out' }).click()
    await expect(page.locator('article#checkout')).toBeFocused()
    await page.waitForTimeout(1000)
    return page.evaluate(() => [...new Set((window as unknown as { seen: number[] }).seen)])
  }

  test.describe('reduce', () => {
    test.use({ reducedMotion: 'reduce' })

    test('jumps between messages without animating, and drops the highlight transition', async ({ page }) => {
      const positions = await scrollPositionsAfterJump(page)
      expect(positions, 'scroll went through intermediate positions').toHaveLength(2)
      const duration = await page.locator('article#checkout').evaluate((el) => getComputedStyle(el).transitionDuration)
      expect(duration).toBe('0s')
    })
  })

  test.describe('no preference', () => {
    test.use({ reducedMotion: 'no-preference' })

    test('animates jumps between messages', async ({ page }) => {
      const positions = await scrollPositionsAfterJump(page)
      expect(positions.length, 'scroll should pass through intermediate positions').toBeGreaterThan(3)
    })
  })
})
