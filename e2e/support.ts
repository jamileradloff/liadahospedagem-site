import type { Page } from '@playwright/test'

/**
 * Opens a page and waits for the web fonts. They load with `display=swap`, so text reflows when they arrive,
 * which moves layout and scroll positions measured before that.
 */
export async function gotoSettled(page: Page, path: string) {
  await page.goto(path)
  await page.evaluate(() => document.fonts.ready.then(() => undefined))
}
