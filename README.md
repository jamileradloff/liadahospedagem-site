# liadahospedagem-site

Landing page for Lia da Hospedagem's free guide: 3 ready-to-copy WhatsApp messages for small Brazilian hosts.
React + TypeScript + Vite, hosted on Cloudflare Pages, cookieless analytics with PostHog.

The code is in English; the page copy is in Brazilian Portuguese (it is the product's content).

## Screens

One single-page app with two screens:

- `/` home: where the ManyChat DM link lands
- `/mensagens` the 3 messages with copy buttons, with anchors `#boasvindas`, `#cedo`, `#checkout`

The `/mensagens` path and the anchors stay in Portuguese on purpose: they are user-facing, they are baked into the
PDF links, and the anchors match the WhatsApp shortcuts the host saves.

## Project structure

```
src/
  main.tsx            app entry, starts analytics
  App.tsx             header + current screen + footer
  router.ts           two-screen router (history API, or in-memory in preview mode)
  analytics.ts        PostHog (lazy, cookieless), event names, Tally link builder
  content.ts          message copy and external URLs
  clipboard.ts        copy with fallback for Instagram's in-app browser
  useCopy.ts          copy hook: button state + tracking
  styles.css          brand tokens and all styles
  components/         Header, Footer, MessageBubble, MessageCard, PdfButton, WaitlistSection
  screens/            HomeScreen, MessagesScreen
  **/*.test.ts(x)     unit and component tests (Vitest + Testing Library, jsdom)
e2e/                  browser tests (Playwright): navigation, copy, layout, accessibility, keyboard, zoom, motion
validation/           repeatable validation scripts (see FRONTEND_VALIDATION.md); screenshots are generated, not committed
pdf/                  source of the free PDF (see pdf/README.md)
public/               the generated PDF and the social preview image
```

## Run locally

```bash
npm install
npm run dev
```

`VITE_PREVIEW=1 npm run build` builds the preview variant (screens kept in memory, PDF link disabled) used for
the single-file preview artifact.

## Checks

| Command | What it does |
|---|---|
| `npm run typecheck` | TypeScript for the app (`tsconfig.json`) and for the configs and browser tests (`tsconfig.node.json`) |
| `npm run lint` | ESLint with type-aware TypeScript rules and the React Hooks rules |
| `npm test` | unit and component tests in jsdom (`npm run test:watch` while working) |
| `npm run test:e2e` | browser tests against the production build |
| `npm run check` | type check, lint and unit tests together |
| `npm run build` | type check and production build |

The browser tests need the Playwright browsers once per machine:

```bash
npx playwright install chromium webkit
```

`npm run test:e2e` builds the site and serves it with `vite preview` on port 4173, with the PostHog key forced
empty so no events are sent. It runs in desktop Chrome, a Pixel 7 and an iPhone 14 (WebKit). The layout sweep at
320, 390, 768, 1024 and 1440px runs in desktop Chrome only. Clipboard reads only work in Chromium, so the copy
success test is skipped in WebKit. Add `--project=desktop-chromium` to run a single browser, or `--ui` to debug.

The accessibility tests run axe against WCAG 2.2 AA rules. They don't replace checking with the keyboard and a
screen reader.

Two scripts in `validation/` go beyond the test suite (they build the site themselves, so run them from a clean tree):

- `node validation/verify-builds.mjs` builds the analytics, no-key and preview variants and checks them: every event
  and its properties (against a fake PostHog host, nothing is sent), the Tally link attribution, no cookies or
  storage, the PDF being served, and the preview's in-memory routing.
- `node validation/capture-screenshots.mjs` takes full-page screenshots of both routes at 320, 390, 768, 1024 and
  1440 px (needs `npx vite preview --port 4173` running).

PostHog drops events from browsers that look automated, so analytics tests must hide `navigator.webdriver` and the
headless user agent, as `verify-builds.mjs` does.

CI (`.github/workflows/ci.yml`) runs every check, both builds and the browser tests on each pull request and on
pushes to `main`. A failed browser run uploads the Playwright report as an artifact.

## Deploy on Cloudflare Pages (free)

1. Push this repo to GitHub.
2. In Cloudflare: **Workers & Pages → Create → Pages → Connect to Git**, pick the repo
   (install the Cloudflare GitHub app on "Only select repositories").
3. Project name: `liadahospedagem` (becomes `liadahospedagem.pages.dev`).
   If the name is taken, update the `og:image` URL in `index.html` and `SITE` in `pdf/build.py`.
4. Build: framework **Vite**, command `npm run check && npm run build`, output `dist`.
   A failing type check, lint or unit test then stops the deploy. Cloudflare can't run the browser tests;
   GitHub runs them on pull requests (see [Checks](#checks)). In GitHub, protect `main` and require the CI checks
   to pass before merging.
5. **Settings → Variables and Secrets**: add `VITE_POSTHOG_KEY` and `VITE_POSTHOG_HOST` (see `.env.example`)
   to the **Production** environment only, then redeploy.

Every push to `main` deploys production; every PR gets its own preview URL. There is no `404.html` on purpose,
so Cloudflare serves the app for `/mensagens` too.

## Analytics (PostHog)

1. Create a free PostHog account in the **EU** region.
2. Put the *Project API key* (`phc_...`) in `VITE_POSTHOG_KEY`.
3. In *Project settings*, turn on **Discard client IP data**. The site already runs without cookies.
4. Optional: turn on *Session replay*.

Events:

| Event | When | Properties |
|---|---|---|
| `$pageview` | a screen was shown | URL, utm_*, origin |
| `opened_messages` | went from home to the messages screen | `from` (`home`), `message` (a message id, or `null` for the whole list) |
| `copied_message` | copied a message | `message` (`welcome`, `early-checkin`, `checkout`), `page` (`home`, `messages`) |
| `copy_failed` | the browser blocked the copy | `message`, `page` |
| `downloaded_pdf` | opened the PDF | `page` |
| `clicked_waitlist` | went to the Tally form | `page` |
| `opened_faq` | opened an FAQ item | `question` (`is-it-free`, `regular-whatsapp`, `single-apartment`, `tech-skills`, `who-is-behind-lia`) |
| `clicked_linkedin` | clicked Jamile's LinkedIn | |

The properties are typed in `EventProps` (`src/analytics.ts`): a call with a missing, extra or misspelled property
does not compile.

Funnel: `$pageview` → (`copied_message` or `downloaded_pdf`) → `clicked_waitlist`. Break it down by `utm_content`
to compare Reels. Answers and price ranges live in Tally.

## Tally

The waitlist button sends `?origin=home|messages|pdf&reel=<utm_content>`.
The form needs two **hidden fields** named `origin` and `reel`.

## Links inside the PDF

| Where | Link |
|---|---|
| "Toca aqui para copiar" (p. 3) | `https://liadahospedagem.pages.dev/mensagens?utm_source=pdf#boasvindas` |
| "Toca aqui para copiar" (p. 4) | `https://liadahospedagem.pages.dev/mensagens?utm_source=pdf#cedo` |
| "Toca aqui para copiar" (p. 5) | `https://liadahospedagem.pages.dev/mensagens?utm_source=pdf#checkout` |
| "Abrir as 3 mensagens…" (p. 6) | `https://liadahospedagem.pages.dev/mensagens?utm_source=pdf` |
| "Me avisa quando sair!" (p. 8) | `https://tally.so/r/9qzR1Q?origin=pdf` |

Regenerate the PDF with `python pdf/build.py`; it keeps the same file name in `public/`.

## ManyChat DM link

One `utm_content` per Reel:

```
https://liadahospedagem.pages.dev/?utm_source=instagram&utm_medium=dm&utm_content=w3a-welcome
```

## Instagram short links

`public/_redirects` sends two short paths to the tagged homepage with a 302. Cloudflare Pages applies the rules;
`npm run dev` and `npm run preview` do not.

| Link | Use | Redirects to |
|---|---|---|
| `https://liadahospedagem.pages.dev/ig` | Instagram bio | `/?utm_source=instagram&utm_medium=bio` |
| `https://liadahospedagem.pages.dev/story` | Story link stickers | `/?utm_source=instagram&utm_medium=story` |

Keep the full UTM links (with `utm_content`) in DM buttons. Published Story stickers keep pointing at `/story`,
so fix that rule rather than removing it.
