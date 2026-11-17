import { isSalesPreviewPath, rewriteSalesHtml } from '../src/sales/linkPreview.ts'

export async function onRequest(context) {
  const url = new URL(context.request.url)
  if (!isSalesPreviewPath(url.pathname) || (context.request.method !== 'GET' && context.request.method !== 'HEAD')) {
    return context.next()
  }

  const indexUrl = new URL(context.request.url)
  indexUrl.pathname = '/'
  indexUrl.search = ''
  const asset = await context.env.ASSETS.fetch(new Request(indexUrl, { method: 'GET' }))
  if (!asset.ok) return asset

  const headers = new Headers(asset.headers)
  headers.delete('content-length')
  headers.set('content-type', 'text/html; charset=utf-8')
  const pageUrl = new URL(context.request.url)
  pageUrl.hash = ''
  return new Response(rewriteSalesHtml(await asset.text(), pageUrl.toString()), { status: asset.status, headers })
}
