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

## Deploy on Cloudflare Pages (free)

1. Push this repo to GitHub.
2. In Cloudflare: **Workers & Pages → Create → Pages → Connect to Git**, pick the repo
   (install the Cloudflare GitHub app on "Only select repositories").
3. Project name: `liadahospedagem` (becomes `liadahospedagem.pages.dev`).
   If the name is taken, update the `og:image` URL in `index.html` and `SITE` in `pdf/build.py`.
4. Build: framework **Vite**, command `npm run build`, output `dist`.
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
| `opened_messages` | went from home to the messages screen | `from`, `message` |
| `copied_message` | copied a message | `message` (`welcome`, `early-checkin`, `checkout`), `page` |
| `copy_failed` | the browser blocked the copy | `message`, `page` |
| `downloaded_pdf` | opened the PDF | `page` |
| `clicked_waitlist` | went to the Tally form | `page` |
| `opened_faq` | opened an FAQ item | `question` |
| `clicked_linkedin` | clicked Jamile's LinkedIn | |

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
