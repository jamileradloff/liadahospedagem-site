// Verifies the three build variants end to end, without sending anything to the real PostHog or Tally:
//   1. analytics build: a fake PostHog key and host, with every PostHog request intercepted and decoded
//   2. no-key build: the default for local work and PR previews, which must make no analytics requests
//   3. preview build (VITE_PREVIEW=1): in-memory routing, PDF link disabled
//   node validation/verify-builds.mjs
import { gunzipSync } from 'node:zlib'
import { build, preview } from 'vite'
import { chromium } from '@playwright/test'

const FAKE_HOST = 'http://127.0.0.1:4999'
const REEL = 'w3a-welcome'
const results = []
const check = (name, ok, detail = '') => {
  results.push({ name, ok, detail })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`)
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

async function serve(outDir, port) {
  return preview({ logLevel: 'error', build: { outDir }, preview: { port, strictPort: true } })
}

function decodeCapture(buffer) {
  let text
  if (buffer[0] === 0x1f && buffer[1] === 0x8b) text = gunzipSync(buffer).toString('utf8')
  else {
    text = buffer.toString('utf8')
    if (text.startsWith('data=')) text = Buffer.from(decodeURIComponent(text.slice(5)), 'base64').toString('utf8')
  }
  const parsed = JSON.parse(text)
  return Array.isArray(parsed) ? parsed : Array.isArray(parsed.batch) ? parsed.batch : [parsed]
}

async function stubExternal(context) {
  await context.route(/^https:\/\/(tally\.so|www\.linkedin\.com)\//, (route) => route.fulfill({ status: 200, contentType: 'text/html', body: 'stub' }))
}

// ---------------------------------------------------------------- 1. analytics build
async function verifyAnalytics(browser) {
  console.log('\n# Analytics build (fake key, intercepted host)')
  await buildVariant('/tmp/lia-dist-analytics', { VITE_POSTHOG_KEY: 'phc_validation_key', VITE_POSTHOG_HOST: FAKE_HOST, VITE_PREVIEW: '' })
  const server = await serve('/tmp/lia-dist-analytics', 4174)
  // PostHog silently drops events from anything that looks like a bot: a "HeadlessChrome" user agent or brand,
  // or navigator.webdriver. Hide those signals so the events this test wants to inspect are actually sent.
  const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, userAgent })
  await context.addInitScript(() => {
    Object.defineProperty(Navigator.prototype, 'webdriver', { get: () => false })
    Object.defineProperty(Navigator.prototype, 'userAgentData', { get: () => undefined })
  })
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await stubExternal(context)

  const events = []
  const hostRequests = []
  await context.route(`${FAKE_HOST}/**`, async (route) => {
    const request = route.request()
    hostRequests.push(new URL(request.url()).pathname)
    const headers = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' }
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers })
    const body = request.postDataBuffer()
    if (body && /\/(e|i\/v0\/e|batch)\/?$/.test(new URL(request.url()).pathname)) {
      try {
        events.push(...decodeCapture(body))
      } catch {
        // not an event payload
      }
    }
    const path = new URL(request.url()).pathname
    if (path.endsWith('.js')) return route.fulfill({ status: 200, headers, contentType: 'application/javascript', body: '' })
    // Minimal answers to the config and feature-flag calls that PostHog makes on start.
    const json = path.endsWith('/config')
      ? { token: 'phc_validation_key', supportedCompression: ['gzip-js'], hasFeatureFlags: false, analytics: { endpoint: '/i/v0/e/' }, siteApps: [] }
      : path.startsWith('/flags')
        ? { featureFlags: {}, featureFlagPayloads: {}, flags: {}, errorsWhileComputingFlags: false }
        : {}
    return route.fulfill({ status: 200, headers, contentType: 'application/json', body: JSON.stringify(json) })
  })

  const page = await context.newPage()
  await page.goto(`http://localhost:4174/?utm_source=instagram&utm_medium=dm&utm_content=${REEL}`)
  await page.evaluate(() => document.fonts.ready.then(() => undefined))

  const waitlistHome = new URL(await page.locator('.waitlist').getByRole('link', { name: 'Quero entrar na lista de lançamento' }).getAttribute('href'))
  check('home waitlist link carries origin=home and the reel', waitlistHome.searchParams.get('origin') === 'home' && waitlistHome.searchParams.get('reel') === REEL, waitlistHome.search)

  await page.getByText('É grátis mesmo?').click()
  await page.getByRole('button', { name: 'Copiar a de boas-vindas' }).click()
  await page.getByRole('button', { name: 'Copiada! Agora cola no WhatsApp' }).waitFor()
  const [pdfPopup] = await Promise.all([page.waitForEvent('popup'), page.getByRole('link', { name: 'Baixar o Caderninho em PDF' }).last().click()])
  await pdfPopup.close()
  const [tallyPopup] = await Promise.all([page.waitForEvent('popup'), page.locator('.waitlist').getByRole('link', { name: 'Quero entrar na lista de lançamento' }).click()])
  await tallyPopup.close()
  await page.getByText('Quem está por trás da Lia?').click()
  const [linkedinPopup] = await Promise.all([page.waitForEvent('popup'), page.getByRole('link', { name: 'Conheça a Jamile no LinkedIn' }).click()])
  await linkedinPopup.close()

  await page.getByRole('link', { name: 'Copiar as mensagens agora' }).click()
  await page.getByRole('heading', { level: 1, name: 'Suas 3 mensagens' }).waitFor()
  const waitlistMessages = new URL(await page.locator('.waitlist').getByRole('link', { name: 'Quero entrar na lista de lançamento' }).getAttribute('href'))
  check('messages waitlist link carries origin=messages and the reel', waitlistMessages.searchParams.get('origin') === 'messages' && waitlistMessages.searchParams.get('reel') === REEL, waitlistMessages.search)
  await page.locator('article#cedo').getByRole('button').click()
  await page.locator('article#cedo').getByRole('button', { name: /Copiada/ }).waitFor()

  const wanted = ['$pageview', 'opened_faq', 'copied_message', 'downloaded_pdf', 'clicked_waitlist', 'clicked_linkedin', 'opened_messages', 'viewed_copy_prompt']
  for (let i = 0; i < 40 && !wanted.every((name) => events.some((e) => e.event === name)); i++) await page.waitForTimeout(250)
  await page.waitForTimeout(500)

  const named = (name) => events.filter((e) => e.event === name)
  // Everything PostHog adds on its own: $-properties, the empty ad-campaign fields, the token and the attribution we register.
  const POSTHOG_CAMPAIGN_FIELDS = new Set(['li_fat_id', 'gad_source', 'mc_cid', 'gclid', 'gclsrc', 'dclid', 'gbraid', 'wbraid', 'fbclid', 'msclkid', 'twclid', 'igshid', 'ttclid', 'rdt_cid', 'epik', 'qclid', 'sccid', 'oppref', 'irclid', '_kx'])
  const props = (e) => Object.fromEntries(Object.entries(e.properties ?? {}).filter(([key]) => !key.startsWith('$') && !key.startsWith('utm_') && !POSTHOG_CAMPAIGN_FIELDS.has(key) && key !== 'token' && key !== 'distinct_id' && key !== 'origin'))
  const sameProps = (event, expected) => JSON.stringify(props(event)) === JSON.stringify(expected)

  check('$pageview was sent for both screens', named('$pageview').length === 2, `${named('$pageview').length} sent`)
  check('opened_faq { question: is-it-free }', named('opened_faq').some((e) => sameProps(e, { question: 'is-it-free' })), JSON.stringify(named('opened_faq').map(props)))
  check('opened_faq { question: who-is-behind-lia }', named('opened_faq').some((e) => sameProps(e, { question: 'who-is-behind-lia' })))
  check('copied_message { message: welcome, page: home }', named('copied_message').some((e) => sameProps(e, { message: 'welcome', page: 'home' })), JSON.stringify(named('copied_message').map(props)))
  check('copied_message { message: early-checkin, page: messages }', named('copied_message').some((e) => sameProps(e, { message: 'early-checkin', page: 'messages' })))
  check('downloaded_pdf { page: home }', named('downloaded_pdf').some((e) => sameProps(e, { page: 'home' })), JSON.stringify(named('downloaded_pdf').map(props)))
  check('clicked_waitlist { page: home, placement: section }', named('clicked_waitlist').some((e) => sameProps(e, { page: 'home', placement: 'section' })), JSON.stringify(named('clicked_waitlist').map(props)))
  check('viewed_copy_prompt { message: welcome, page: home }', named('viewed_copy_prompt').some((e) => sameProps(e, { message: 'welcome', page: 'home' })), JSON.stringify(named('viewed_copy_prompt').map(props)))
  check('the copy prompt is recorded once per visit', named('viewed_copy_prompt').length === 1, `${named('viewed_copy_prompt').length} sent`)
  check('clicked_linkedin has no properties', named('clicked_linkedin').some((e) => sameProps(e, {})))
  check('opened_messages { from: home, message: null }', named('opened_messages').some((e) => sameProps(e, { from: 'home', message: null })), JSON.stringify(named('opened_messages').map(props)))
  check('every event carries the Reel attribution (utm_content)', events.length > 0 && events.every((e) => e.properties?.utm_content === REEL), `${events.length} events`)
  check('no cookies were set', (await context.cookies()).length === 0)
  const storage = await page.evaluate(() => ({ local: Object.keys(localStorage), session: Object.keys(sessionStorage) }))
  check('nothing was written to localStorage or sessionStorage', storage.local.length === 0 && storage.session.length === 0, JSON.stringify(storage))
  const unexpected = events.filter((e) => e.event === '$autocapture')
  check('autocapture is off', unexpected.length === 0)
  console.log(`  events seen: ${[...new Set(events.map((e) => e.event))].join(', ')}`)
  console.log(`  analytics host paths: ${[...new Set(hostRequests)].join(', ')}`)

  await context.close()
  await server.close()
}

// ---------------------------------------------------------------- 2. build without a key + PDF
async function verifyNoKeyBuild(browser) {
  console.log('\n# Production build without a PostHog key')
  await buildVariant('/tmp/lia-dist-nokey', { VITE_POSTHOG_KEY: '', VITE_PREVIEW: '' })
  const server = await serve('/tmp/lia-dist-nokey', 4175)
  const context = await browser.newContext()
  await stubExternal(context)
  const page = await context.newPage()
  const requested = []
  page.on('request', (request) => requested.push(request.url()))
  await page.goto('http://localhost:4175/?utm_content=x')
  await page.getByRole('link', { name: 'Copiar as mensagens agora' }).click()
  await page.getByRole('heading', { level: 1, name: 'Suas 3 mensagens' }).waitFor()
  await page.waitForTimeout(1000)
  check('makes no PostHog request', !requested.some((url) => /posthog/i.test(url)), `${requested.length} requests`)

  const pdf = await page.request.get('http://localhost:4175/lia-3-mensagens.pdf')
  const pdfBody = await pdf.body()
  check('the PDF is served as application/pdf', pdf.status() === 200 && /application\/pdf/.test(pdf.headers()['content-type'] ?? '') && pdfBody.subarray(0, 4).toString() === '%PDF', `${pdf.status()}, ${pdfBody.length} bytes`)
  const direct = await page.request.get('http://localhost:4175/mensagens')
  check('/mensagens is served the app directly (no 404)', direct.status() === 200 && (await direct.text()).includes('<div id="root">'))
  const og = await page.request.get('http://localhost:4175/og.png')
  check('the social preview image is served', og.status() === 200 && /image\/png/.test(og.headers()['content-type'] ?? ''))
  const href = await page.getByRole('link', { name: 'Baixar o Caderninho em PDF' }).last().getAttribute('href')
  check('the PDF button points at the real file', href === '/lia-3-mensagens.pdf', href ?? '')
  await context.close()
  await server.close()
}

// ---------------------------------------------------------------- 3. preview build
async function verifyPreviewBuild(browser) {
  console.log('\n# Preview build (VITE_PREVIEW=1)')
  await buildVariant('/tmp/lia-dist-preview', { VITE_POSTHOG_KEY: '', VITE_PREVIEW: '1' })
  const server = await serve('/tmp/lia-dist-preview', 4176)
  const context = await browser.newContext()
  const page = await context.newPage()
  await page.goto('http://localhost:4176/')
  await page.evaluate(() => document.fonts.ready.then(() => undefined))

  await page.getByRole('link', { name: 'Copiar as mensagens agora' }).click()
  await page.getByRole('heading', { level: 1, name: 'Suas 3 mensagens' }).waitFor()
  check('opens the messages screen without changing the URL', new URL(page.url()).pathname === '/' && new URL(page.url()).hash === '', page.url())
  await page.getByRole('navigation', { name: 'Ir para a mensagem' }).getByRole('link', { name: 'Lembrete de check-out' }).click()
  check('jump links still land on the message', await page.locator('article#checkout').evaluate((el) => el === document.activeElement))
  check('the URL stays unchanged after jumping', new URL(page.url()).pathname === '/' && new URL(page.url()).hash === '', page.url())
  await page.getByRole('link', { name: 'Voltar para o início' }).click()
  await page.getByRole('heading', { level: 1, name: /3 mensagens prontas/ }).waitFor()
  check('the back link returns to the home screen', true)

  const pdfLink = page.getByRole('link', { name: 'Baixar o Caderninho em PDF' }).last()
  check('the PDF link is disabled (#pdf)', (await pdfLink.getAttribute('href')) === '#pdf')
  let opened = false
  context.on('page', () => {
    opened = true
  })
  await pdfLink.click()
  await page.waitForTimeout(500)
  check('clicking the PDF link opens nothing', !opened && new URL(page.url()).hash === '', page.url())

  await page.goto('http://localhost:4176/mensagens')
  check('a direct visit to /mensagens shows the home screen (in-memory routing)', await page.getByRole('heading', { level: 1, name: /3 mensagens prontas/ }).isVisible())
  await context.close()
  await server.close()
}

const browser = await chromium.launch()
try {
  await verifyAnalytics(browser)
  await verifyNoKeyBuild(browser)
  await verifyPreviewBuild(browser)
} finally {
  await browser.close()
}

const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
process.exit(failed.length ? 1 : 0)
