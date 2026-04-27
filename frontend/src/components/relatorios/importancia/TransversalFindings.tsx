'use client'

import { Sparkles } from 'lucide-react'
import { TRANSVERSAL_FINDINGS } from '@/data/importance-performance'

export function TransversalFindings() {
  return (
    <section id="achados-transversais">
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-[var(--primary)]" />
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            Achados Transversais
          </h2>
        </div>
        <p className="text-sm text-[var(--text-secondary)]">
          Ensaios consistentemente relevantes para a explicação do Shelf Life em todos os
          cenários e versões.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        {TRANSVERSAL_FINDINGS.map((finding, i) => (
          <div
            key={finding.ensaio}
            className="bg-white rounded-xl border border-[var(--border-light)] p-4 flex flex-col relative overflow-hidden"
          >
            <div
              className="absolute left-0 top-0 bottom-0 w-1"
              style={{ backgroundColor: finding.cor }}
            />

            <div className="pl-2 flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-[var(--text-muted)]">
                  #{i + 1}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] leading-snug mb-2">
                {finding.ensaio}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {finding.resumo}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
