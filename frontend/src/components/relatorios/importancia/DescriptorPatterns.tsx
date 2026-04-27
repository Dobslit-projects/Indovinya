'use client'

import { Compass } from 'lucide-react'
import { DESCRIPTOR_CATEGORIES } from '@/data/importance-methodology'
import { DESCRIPTOR_COLORS, DESCRIPTOR_LABELS } from '@/data/importance-data'

export function DescriptorPatterns() {
  return (
    <section id="descritores-padrao">
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <Compass className="w-5 h-5 text-[var(--primary)]" />
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            Padrão dos Descritores Temporais
          </h2>
        </div>
        <p className="text-sm text-[var(--text-secondary)]">
          A importância dos ensaios não decorre apenas da magnitude da variação ao longo do tempo —
          ela se manifesta em três tipos principais de sinal.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {DESCRIPTOR_CATEGORIES.map((cat, idx) => (
          <div
            key={cat.key}
            className="bg-white rounded-xl border border-[var(--border-light)] p-5 relative overflow-hidden"
          >
            <div
              className="absolute top-0 left-0 right-0 h-1"
              style={{ backgroundColor: DESCRIPTOR_COLORS[cat.descritores[0]] }}
            />

            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-[var(--text-muted)]">
                {String(idx + 1).padStart(2, '0')}
              </span>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">{cat.titulo}</h3>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {cat.descritores.map((d) => (
                <span
                  key={d}
                  className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-medium"
                  style={{
                    backgroundColor: `${DESCRIPTOR_COLORS[d]}15`,
                    color: DESCRIPTOR_COLORS[d],
                  }}
                >
                  {DESCRIPTOR_LABELS[d]}
                </span>
              ))}
            </div>

            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
              {cat.descricao}
            </p>

            <div className="pt-3 border-t border-[var(--border-light)]">
              <div className="text-xs font-medium text-[var(--text-muted)] mb-1">
                Onde aparece
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {cat.exemplos}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
