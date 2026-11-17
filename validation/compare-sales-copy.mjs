// Compares the visible text of /guia-pede-assim with the v2 preview, pending and live.
// Local only: v2 is not in this repo, so CI does not run this.
//   node validation/compare-sales-copy.mjs <path to pede-assim-preview-v2.html>
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { build, preview } from 'vite'
import { chromium } from '@playwright/test'

const v2Path = process.argv[2]
if (!v2Path) {
  console.error('Usage: node validation/compare-sales-copy.mjs <path to pede-assim-preview-v2.html>')
  process.exit(1)
}

function normalise(text) {
  return text.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim()
}

/** Visible text of main and footer, with every disclosure and FAQ opened. */
async function visibleText(page) {
  await page.evaluate(() => {
    for (const details of document.querySelectorAll('details')) details.open = true
  })
  const main = await page.locator('main').innerText()
  const footer = await page.locator('footer').innerText()
  return normalise(`${main}\n${footer}`)
}

/** Jamile removed these from the footer on 2026-11-17. v2 still has them; the page must not. */
const REMOVED_FROM_V2 = ['Suporte, reembolso e termos de compra: a confirmar.', ' · @liadahospedagem']

/** v2 says “criado”; the page says “criada”. */
const V2_REPLACEMENTS = [['criado por Jamile Radloff', 'criada por Jamile Radloff']]

function report(label, pageText, v2Text) {
  if (pageText === v2Text) {
    console.log(`PASS  ${label}`)
    return true
  }
  const pageWords = pageText.split(' ')
  const v2Words = v2Text.split(' ')
  let index = 0
  while (index < pageWords.length && index < v2Words.length && pageWords[index] === v2Words[index]) index++
  const windowOf = (words) => words.slice(Math.max(0, index - 6), index + 14).join(' ')
  console.log(`FAIL  ${label}`)
  console.log(`  page: …${windowOf(pageWords)}…`)
  console.log(`  v2:   …${windowOf(v2Words)}…`)
  console.log(`  lengths: page ${pageText.length}, v2 ${v2Text.length}`)
  return false
}

async function buildVariant(outDir, env) {
  const previous = {}
  for (const [key, value] of Object.entries(env)) {
    previous[key] = process.env[key]
    process.env[key] = value
  }
  try {
    await build({ logLevel: 'error', build: { outDir, emptyOutDir: true } })
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
  }
}

const browser = await chromium.launch()
let failed = false
try {
  for (const [label, live] of [
    ['pending', false],
    ['live', true],
  ]) {
    const port = live ? 4181 : 4180
    const outDir = live ? '/tmp/lia-sales-live' : '/tmp/lia-sales-pending'
    await buildVariant(outDir, { VITE_POSTHOG_KEY: '', VITE_PREVIEW: '', VITE_CHECKOUT_LIVE: live ? 'true' : 'false' })
    const server = await preview({ logLevel: 'error', build: { outDir }, preview: { port, strictPort: true } })
    const page = await browser.newPage()
    const v2 = await browser.newPage()
    try {
      await page.goto(`http://localhost:${port}/guia-pede-assim`)
      await page.getByRole('heading', { level: 1 }).waitFor()
      await v2.goto(pathToFileURL(resolve(v2Path)).href)
      await v2.locator('main').waitFor()
      if (live) await v2.locator('input[name="checkout"][value="live"]').check()
      const pageText = await visibleText(page)
      const v2Text = normalise(
        V2_REPLACEMENTS.reduce(
          (text, [from, to]) => text.replace(from, to),
          REMOVED_FROM_V2.reduce((text, removed) => text.replace(removed, ''), await visibleText(v2)),
        ),
      )
      const stillThere = REMOVED_FROM_V2.find((removed) => pageText.includes(removed))
      if (stillThere || pageText.includes('criado por Jamile Radloff')) {
        console.log(`FAIL  ${label} checkout still shows removed footer text: ${stillThere ?? 'criado por Jamile Radloff'}`)
        failed = true
      }
      const ok = report(`${label} checkout`, pageText, v2Text)
      failed ||= !ok
    } finally {
      await page.close()
      await v2.close()
      await server.close()
    }
  }
} finally {
  await browser.close()
}
process.exit(failed ? 1 : 0)
