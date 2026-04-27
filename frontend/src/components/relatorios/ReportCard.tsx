'use client'

import Link from 'next/link'
import { FileText, Sparkles, ArrowRight, Clock } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { Relatorio } from '@/types/relatorios'
import { RELATORIO_TIPO_LABEL } from '@/types/relatorios'

interface ReportCardProps {
  relatorio: Relatorio
}

export function ReportCard({ relatorio }: ReportCardProps) {
  const Icon = relatorio.tipo === 'tecnico' ? FileText : Sparkles
  const isDisabled = relatorio.status === 'em_breve'

  const tipoBadgeClasses =
    relatorio.tipo === 'tecnico'
      ? 'bg-blue-50 text-blue-700 border-blue-200'
      : 'bg-purple-50 text-purple-700 border-purple-200'

  const iconWrapperClasses =
    relatorio.tipo === 'tecnico'
      ? 'bg-blue-50 text-blue-600'
      : 'bg-purple-50 text-purple-600'

  const dataFormatada = new Date(relatorio.data).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  const CardInner = (
    <div
      className={cn(
        'group h-full bg-white rounded-xl border border-[var(--border-light)] p-6 transition-all',
        isDisabled
          ? 'opacity-70 cursor-not-allowed'
          : 'hover:shadow-md hover:border-[var(--primary)]/30 cursor-pointer'
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            'w-11 h-11 rounded-lg flex items-center justify-center shrink-0',
            iconWrapperClasses
          )}
        >
          <Icon className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={cn(
                'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border',
                tipoBadgeClasses
              )}
            >
              {RELATORIO_TIPO_LABEL[relatorio.tipo]}
            </span>
            {isDisabled && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                <Clock className="w-3 h-3" />
                Em breve
              </span>
            )}
          </div>

          <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2 leading-snug">
            {relatorio.titulo}
          </h3>

          <p className="text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-3 mb-4">
            {relatorio.descricao}
          </p>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {relatorio.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs text-[var(--text-muted)] bg-[var(--bg-light)]"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[var(--border-light)]">
            <span className="text-xs text-[var(--text-muted)]">{dataFormatada}</span>
            {!isDisabled && (
              <span className="inline-flex items-center gap-1 text-sm font-medium text-[var(--primary)] group-hover:gap-2 transition-all">
                Abrir
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  if (isDisabled) {
    return <div aria-disabled>{CardInner}</div>
  }

  return <Link href={relatorio.href}>{CardInner}</Link>
}
