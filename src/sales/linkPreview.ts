/** Tags Instagram and WhatsApp read from the HTML. The app is one index.html, so the sales path rewrites them. */

const FREE_TITLE = '3 mensagens prontas · Lia da Hospedagem'
const FREE_DESCRIPTION =
  'Boas-vindas, chegada mais cedo e lembrete de check-out. Copia, troca o que está entre colchetes e salva no WhatsApp. Copiar é grátis e sem cadastro.'
const FREE_OG_TITLE = '3 mensagens prontas para você parar de digitar a mesma coisa todo dia'
const FREE_OG_DESCRIPTION = 'Grátis e com carinho, Lia. Copia, troca o que está entre colchetes e salva no WhatsApp.'
const FREE_OG_IMAGE = 'https://liadahospedagem.pages.dev/og.png'

export const SALES_PREVIEW = {
  title: 'Pede assim pra IA | Lia da Hospedagem',
  description:
    '12 instruções testadas no ChatGPT grátis pra pedir à IA um rascunho de mensagem pro hóspede. PDF de 15 páginas por R$10.',
  ogTitle: 'É sempre a mesma pergunta. Pede assim pra IA.',
  imagePath: '/og-pede-assim.png',
}

export function isSalesPreviewPath(pathname: string) {
  const path = pathname.replace(/\/+$/, '') || '/'
  return path === '/guia-pede-assim'
}

/** Rewrites the free page's preview tags. A query on `pageUrl` stays on og:url so a new share is a new card. */
export function rewriteSalesHtml(html: string, pageUrl: string) {
  const url = new URL(pageUrl)
  url.pathname = '/guia-pede-assim'
  url.hash = ''
  const image = new URL(SALES_PREVIEW.imagePath, url.origin).href

  return html
    .replace(`<title>${FREE_TITLE}</title>`, `<title>${SALES_PREVIEW.title}</title>`)
    .replace(`content="${FREE_DESCRIPTION}"`, `content="${SALES_PREVIEW.description}"`)
    .replace(`content="${FREE_OG_TITLE}"`, `content="${SALES_PREVIEW.ogTitle}"`)
    .replace(`content="${FREE_OG_DESCRIPTION}"`, `content="${SALES_PREVIEW.description}"`)
    .replace(
      `<meta property="og:image" content="${FREE_OG_IMAGE}" />`,
      `<meta property="og:url" content="${url.href}" />\n    <meta property="og:image" content="${image}" />`,
    )
}
