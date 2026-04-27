'use client'

import { useMemo, useState } from 'react'
import { FileText, Library, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { ReportCard } from '@/components/relatorios/ReportCard'
import { RELATORIOS } from '@/data/relatorios'
import type { RelatorioTipo } from '@/types/relatorios'

type Filtro = 'todos' | RelatorioTipo

const FILTROS: { key: Filtro; label: string; icon: React.ReactNode }[] = [
  { key: 'todos', label: 'Todos', icon: <Library className="w-4 h-4" /> },
  { key: 'tecnico', label: 'Técnicos', icon: <FileText className="w-4 h-4" /> },
  { key: 'interativo', label: 'Interativos', icon: <Sparkles className="w-4 h-4" /> },
]

export default function RelatoriosPage() {
  const [filtro, setFiltro] = useState<Filtro>('todos')

  const relatoriosFiltrados = useMemo(() => {
    if (filtro === 'todos') return RELATORIOS
    return RELATORIOS.filter((r) => r.tipo === filtro)
  }, [filtro])

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-2">
          Relatórios
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Documentos técnicos e visualizações interativas das análises de Shelf Life.
        </p>
      </div>

      <div className="flex items-center gap-1 bg-white border border-[var(--border-light)] rounded-xl p-1 w-fit mb-6">
        {FILTROS.map((f) => {
          const isActive = filtro === f.key
          return (
            <button
              key={f.key}
              onClick={() => setFiltro(f.key)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[var(--primary)] text-white'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-light)]'
              )}
            >
              {f.icon}
              {f.label}
            </button>
          )
        })}
      </div>

      {relatoriosFiltrados.length === 0 ? (
        <div className="bg-white rounded-xl border border-[var(--border-light)] p-12 text-center">
          <Library className="w-10 h-10 mx-auto text-[var(--text-muted)] mb-3" />
          <p className="text-sm text-[var(--text-secondary)]">
            Nenhum relatório nesta categoria ainda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {relatoriosFiltrados.map((relatorio) => (
            <ReportCard key={relatorio.slug} relatorio={relatorio} />
          ))}
        </div>
      )}
    </div>
  )
}
