'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { PdfViewer } from '@/components/relatorios/PdfViewer'
import { getRelatorio } from '@/data/relatorios'
import { useSessionTracking } from '@/hooks/useSessionTracking'

export default function ImportanciaFinalPage() {
  const relatorio = getRelatorio('importancia-final')
  const { trackEvent } = useSessionTracking()

  useEffect(() => {
    if (relatorio) {
      trackEvent('report_view', { slug: relatorio.slug, tipo: relatorio.tipo })
    }
  }, [relatorio, trackEvent])

  if (!relatorio || !relatorio.pdfPath) {
    notFound()
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-4">
        <Link
          href="/relatorios"
          className="inline-flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Relatórios
        </Link>
      </div>

      <div className="mb-4">
        <h1 className="text-xl font-semibold text-[var(--text-primary)] mb-1">
          {relatorio.titulo}
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">{relatorio.descricao}</p>
      </div>

      <PdfViewer
        src={relatorio.pdfPath}
        filename="Relatorio_Final_Importancias.pdf"
        title={relatorio.titulo}
        onDownload={() => trackEvent('report_download', { slug: relatorio.slug })}
      />
    </div>
  )
}
