'use client'

import { Download, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface PdfViewerProps {
  src: string
  filename?: string
  title?: string
  onDownload?: () => void
}

export function PdfViewer({ src, filename, title, onDownload }: PdfViewerProps) {
  const downloadName = filename ?? src.split('/').pop() ?? 'relatorio.pdf'

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-white rounded-xl border border-[var(--border-light)] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-light)] bg-[var(--bg-light)]">
        <p className="text-sm text-[var(--text-secondary)] truncate">
          {title ?? downloadName}
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <a href={src} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="sm">
              <ExternalLink className="w-4 h-4" />
              Abrir em nova aba
            </Button>
          </a>
          <a href={src} download={downloadName} onClick={onDownload}>
            <Button variant="primary" size="sm">
              <Download className="w-4 h-4" />
              Download
            </Button>
          </a>
        </div>
      </div>

      <iframe
        src={`${src}#view=FitH`}
        title={title ?? downloadName}
        className="flex-1 w-full"
      />
    </div>
  )
}
