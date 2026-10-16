import { PDF_URL, TALLY_URL } from '../content'
import { pdfRequestUrl, track, type DeliveryPage } from '../analytics'

export const PDF_TIP =
  'O caderninho abriu numa aba nova. No iPhone, toca em compartilhar e depois em “Salvar em Arquivos” para guardar.'

type Props = { page: DeliveryPage; light?: boolean }

/** Opens the Tally form so the visitor can receive the PDF after submitting. */
export function PdfButton({ page, light = false }: Props) {
  return (
    <a
      className={light ? 'button button--outline button--light button--full' : 'button button--outline button--full'}
      href={pdfRequestUrl(TALLY_URL, page)}
      target="_blank"
      rel="noopener"
      onClick={() => track('requested_pdf', { page })}
    >
      Receber o Caderninho em PDF
    </a>
  )
}

/** The real PDF file, used on the thank-you screen after the form. */
export function PdfDownloadButton({ onDownload }: { onDownload?: () => void }) {
  return (
    <a
      className="button button--large"
      href={PDF_URL}
      target="_blank"
      rel="noopener"
      onClick={(e) => {
        if (PDF_URL === '#pdf') e.preventDefault()
        track('downloaded_pdf', { page: 'thanks' })
        onDownload?.()
      }}
    >
      Baixar o Caderninho em PDF
    </a>
  )
}
