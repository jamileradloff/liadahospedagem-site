import { expect, type Page } from '@playwright/test'

/**
 * Opens a page and waits for the web fonts. They load with `display=swap`, so text reflows when they arrive,
 * which moves layout and scroll positions measured before that.
 */
export async function gotoSettled(page: Page, path: string) {
  await page.goto(path)
  await page.evaluate(() => document.fonts.ready.then(() => undefined))
}

export async function expectNoHorizontalOverflow(page: Page) {
  const { scrollWidth, innerWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }))
  expect(scrollWidth, 'page is wider than the viewport').toBeLessThanOrEqual(innerWidth)
}

/** Makes `navigator.clipboard` and the legacy copy command fail, as in some in-app browsers. */
export async function blockClipboard(page: Page) {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.reject(new Error('blocked')) } })
    document.execCommand = () => false
  })
}
