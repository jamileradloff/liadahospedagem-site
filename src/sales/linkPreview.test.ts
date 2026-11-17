import { describe, expect, it } from 'vitest'
import indexHtml from '../../index.html?raw'
import { PAGE_DESCRIPTION, PAGE_TITLE } from './content'
import { isSalesPreviewPath, rewriteSalesHtml, SALES_PREVIEW } from './linkPreview'

const HEAD = `<title>3 mensagens prontas · Lia da Hospedagem</title>
    <meta name="description" content="Boas-vindas, chegada mais cedo e lembrete de check-out. Copia, troca o que está entre colchetes e salva no WhatsApp. Copiar é grátis e sem cadastro." />
    <meta property="og:title" content="3 mensagens prontas para você parar de digitar a mesma coisa todo dia" />
    <meta property="og:description" content="Grátis e com carinho, Lia. Copia, troca o que está entre colchetes e salva no WhatsApp." />
    <meta property="og:image" content="https://liadahospedagem.pages.dev/og.png" />
    <script type="module" src="/assets/index-abc.js"></script>`

describe('sales link preview', () => {
  it('uses the sales page title and description', () => {
    expect(SALES_PREVIEW.title).toBe(PAGE_TITLE)
    expect(SALES_PREVIEW.description).toBe(PAGE_DESCRIPTION)
  })

  it('recognises the sales path with or without a trailing slash', () => {
    expect(isSalesPreviewPath('/guia-pede-assim')).toBe(true)
    expect(isSalesPreviewPath('/guia-pede-assim/')).toBe(true)
    expect(isSalesPreviewPath('/')).toBe(false)
    expect(isSalesPreviewPath('/mensagens')).toBe(false)
    expect(isSalesPreviewPath('/pede-assim')).toBe(false)
  })

  it('replaces the free-page preview with the sales page title, description and cover', () => {
    const html = rewriteSalesHtml(HEAD, 'https://preview.example/guia-pede-assim')

    expect(html).toContain('<title>Pede assim pra IA | Lia da Hospedagem</title>')
    expect(html).toContain('content="É sempre a mesma pergunta. Pede assim pra IA."')
    expect(html).toContain(
      'content="12 instruções testadas no ChatGPT grátis pra pedir à IA um rascunho de mensagem pro hóspede. PDF de 15 páginas por R$10."',
    )
    expect(html).toContain('property="og:image" content="https://preview.example/og-pede-assim.png"')
    expect(html).toContain('property="og:url" content="https://preview.example/guia-pede-assim"')

    const fresh = rewriteSalesHtml(HEAD, 'https://preview.example/guia-pede-assim?v=2')
    expect(fresh).toContain('property="og:url" content="https://preview.example/guia-pede-assim?v=2"')
    expect(fresh).toContain('property="og:image" content="https://preview.example/og-pede-assim.png"')
    expect(html).not.toContain('3 mensagens prontas')
    expect(html).not.toContain('og.png')
    expect(html).toContain('<script type="module" src="/assets/index-abc.js"></script>')
  })

  it('matches the tags in the real index.html, so the rewrite still finds them', () => {
    const html = rewriteSalesHtml(indexHtml, 'https://liadahospedagem.pages.dev/guia-pede-assim')
    expect(html).not.toContain('3 mensagens prontas')
    expect(html).toContain('Pede assim pra IA')
    expect(html).toContain('https://liadahospedagem.pages.dev/og-pede-assim.png')
  })
})
