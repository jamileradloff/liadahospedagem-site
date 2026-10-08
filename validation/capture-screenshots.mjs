// Captures full-page screenshots of both routes at the reference widths, against a running `vite preview`.
//   npm run build && npx vite preview --port 4173 &
//   node validation/capture-screenshots.mjs [outDir]
// With --segments, also writes viewport-height slices (outDir/segments) for reviewing tall pages at readable size.
import { mkdir } from 'node:fs/promises'
import { chromium } from '@playwright/test'

const BASE = process.env.BASE_URL ?? 'http://localhost:4173'
const OUT = process.argv.find((a, i) => i > 1 && !a.startsWith('--')) ?? 'validation/screenshots'
const SEGMENTS = process.argv.includes('--segments')
const WIDTHS = [320, 390, 768, 1024, 1440]
const ROUTES = [
  ['home', '/'],
  ['messages', '/mensagens'],
]

await mkdir(OUT, { recursive: true })
const browser = await chromium.launch()
for (const [name, path] of ROUTES) {
  for (const width of WIDTHS) {
    const page = await browser.newPage({ viewport: { width, height: 900 } })
    await page.goto(BASE + path)
    await page.evaluate(() => document.fonts.ready.then(() => undefined))
    await page.emulateMedia({ reducedMotion: 'reduce' })
    const file = `${OUT}/${name}-${width}`
    await page.screenshot({ path: `${file}.jpg`, fullPage: true, type: 'jpeg', quality: 60 })
    if (SEGMENTS) {
      await mkdir(`${OUT}/segments`, { recursive: true })
      const height = await page.evaluate(() => document.documentElement.scrollHeight)
      const step = width >= 1024 ? 1100 : 1500
      for (let y = 0, i = 1; y < height; y += step, i++) {
        await page.screenshot({
          path: `${OUT}/segments/${name}-${width}-${String(i).padStart(2, '0')}.jpg`,
          fullPage: true,
          type: 'jpeg',
          quality: 70,
          clip: { x: 0, y, width, height: Math.min(step, height - y) },
        })
      }
    }
    await page.close()
  }
}
await browser.close()
