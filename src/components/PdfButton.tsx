import { PDF_URL } from '../content'
import { track, type Page } from '../analytics'

export const PDF_TIP =
  'O caderninho abriu numa aba nova. No iPhone, toca em compartilhar e depois em “Salvar em Arquivos” para guardar.'

type Props = { page: Page; light?: boolean; onDownload?: () => void }

/** Secondary PDF button. Opens in a new tab and notifies the parent through onDownload. */
export function PdfButton({ page, light = false, onDownload }: Props) {
  return (
    <a
      className={light ? 'button button--outline button--light button--full' : 'button button--outline button--full'}
      href={PDF_URL}
      target="_blank"
      rel="noopener"
      onClick={(e) => {
        if (PDF_URL === '#pdf') e.preventDefault() // the preview does not host the PDF
        track('downloaded_pdf', { page })
        onDownload?.()
      }}
    >
      Baixar o Caderninho em PDF
    </a>
  )
}
