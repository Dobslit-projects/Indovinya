'use client'

import { useMemo } from 'react'
import { TrendingDown, ArrowRightLeft, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { SCENARIO_LABELS } from '@/data/importance-data'
import {
  WATER_IMPACT,
  DEPENDENCY_CONFIG,
  type WaterDependencyLevel,
} from '@/data/importance-water'

const GROUP_ICONS: Record<WaterDependencyLevel, React.ReactNode> = {
  alta: <TrendingDown className="w-4 h-4" />,
  parcial: <ArrowRightLeft className="w-4 h-4" />,
  independente: <CheckCircle2 className="w-4 h-4" />,
}

const GROUP_ORDER: WaterDependencyLevel[] = ['alta', 'parcial', 'independente']

export function WaterImpactTable() {
  const grouped = useMemo(() => {
    const out: Record<WaterDependencyLevel, typeof WATER_IMPACT> = {
      alta: [],
      parcial: [],
      independente: [],
    }
    for (const row of WATER_IMPACT) out[row.dependencia].push(row)
    return out
  }, [])

  return (
    <section id="impacto-agua">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
          Impacto da Exclusão da Água
        </h3>
        <p className="text-sm text-[var(--text-secondary)]">
          Classificação das famílias (RF com limites) em três grupos de dependência.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {GROUP_ORDER.map((level) => {
          const config = DEPENDENCY_CONFIG[level]
          const rows = grouped[level]
          return (
            <div
              key={level}
              className={cn('rounded-xl border p-4 flex flex-col', config.bg)}
            >
              <div
                className="flex items-center gap-2 mb-2 font-semibold text-sm"
                style={{ color: config.color }}
              >
                {GROUP_ICONS[level]}
                {config.label}
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-3">
                {config.description}
              </p>

              <div className="space-y-2 flex-1">
                {rows.map((row, i) => (
                  <div
                    key={`${row.familia}-${row.cenario}-${i}`}
                    className="bg-white/70 rounded-lg px-3 py-2 border border-white"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-semibold text-[var(--text-primary)] truncate">
                        {row.familia}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)] shrink-0">
                        {SCENARIO_LABELS[row.cenario]}
                      </span>
                    </div>
                    <div className="text-[11px] text-[var(--text-secondary)] leading-snug">
                      <div className="flex items-center gap-1">
                        <span className="text-[var(--text-muted)]">Com água:</span>
                        <span className="font-medium">{row.ensaioOriginal}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[var(--text-muted)]">Sem água:</span>
                        <span className="font-medium">{row.ensaioSemAgua}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
