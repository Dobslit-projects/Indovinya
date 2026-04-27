'use client'

import { useMemo, useState } from 'react'
import { GitCompare } from 'lucide-react'
import { Callout } from '@/components/ui/Callout'
import {
  rfComLimites,
  xgbComLimites,
  SCENARIO_LABELS,
  type FamilyRanking,
  type Scenario,
} from '@/data/importance-data'

interface ComparisonHeatmapProps {
  scenario: Scenario
}

interface Cell {
  family: string
  ensaio: string
  rf: number
  xgb: number
  diff: number
}

function familyPesoMap(fams: FamilyRanking[]): Record<string, Record<string, number>> {
  const out: Record<string, Record<string, number>> = {}
  for (const fam of fams) {
    const inner: Record<string, number> = {}
    for (const e of fam.ensaios) inner[e.ensaio] = e.peso
    out[fam.familia] = inner
  }
  return out
}

function buildMatrix(scenario: Scenario) {
  const rfMap = familyPesoMap(rfComLimites[scenario])
  const xgbMap = familyPesoMap(xgbComLimites[scenario])

  const sharedFamilies = Object.keys(rfMap).filter((f) => xgbMap[f])

  const ensaiosSet = new Set<string>()
  for (const f of sharedFamilies) {
    Object.keys(rfMap[f]).forEach((e) => ensaiosSet.add(e))
    Object.keys(xgbMap[f]).forEach((e) => ensaiosSet.add(e))
  }
  const ensaios = Array.from(ensaiosSet).sort()

  const rows = sharedFamilies.map((family) => {
    const cells: Cell[] = ensaios.map((ensaio) => {
      const rf = rfMap[family][ensaio] ?? 0
      const xgb = xgbMap[family][ensaio] ?? 0
      return { family, ensaio, rf, xgb, diff: rf - xgb }
    })
    return { family, cells }
  })

  return { ensaios, rows }
}

function diffColor(diff: number): string {
  const intensity = Math.min(1, Math.abs(diff) / 0.6)
  const alpha = 0.08 + intensity * 0.72
  if (diff > 0.01) return `rgba(59, 130, 246, ${alpha.toFixed(2)})`
  if (diff < -0.01) return `rgba(239, 68, 68, ${alpha.toFixed(2)})`
  return 'rgba(148, 163, 184, 0.08)'
}

function truncate(s: string, n: number) {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s
}

export function ComparisonHeatmap({ scenario }: ComparisonHeatmapProps) {
  const { ensaios, rows } = useMemo(() => buildMatrix(scenario), [scenario])
  const [hover, setHover] = useState<Cell | null>(null)

  if (rows.length === 0 || ensaios.length === 0) {
    return null
  }

  return (
    <section id="heatmap">
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <GitCompare className="w-5 h-5 text-[var(--primary)]" />
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            Comparativo RF vs XGBoost
          </h2>
        </div>
        <p className="text-sm text-[var(--text-secondary)]">
          Diferença de importância (RF − XGBoost) por família × ensaio no cenário{' '}
          <strong>{SCENARIO_LABELS[scenario]}</strong>. Azul = RF atribui mais peso; vermelho =
          XGBoost atribui mais peso.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-[var(--border-light)] p-4 overflow-x-auto relative">
        <table className="text-xs border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="sticky left-0 bg-white z-10 text-left font-medium text-[var(--text-secondary)] p-2 border-b border-[var(--border-light)] min-w-[180px]">
                Família
              </th>
              {ensaios.map((e) => (
                <th
                  key={e}
                  className="p-1 border-b border-[var(--border-light)] align-bottom"
                  style={{ minWidth: 32, height: 140 }}
                >
                  <div
                    className="text-[10px] text-[var(--text-secondary)] whitespace-nowrap"
                    style={{
                      writingMode: 'vertical-rl',
                      transform: 'rotate(180deg)',
                    }}
                  >
                    {truncate(e, 32)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.family}>
                <td className="sticky left-0 bg-white z-10 p-2 text-[var(--text-primary)] font-medium border-b border-[var(--border-light)] whitespace-nowrap">
                  {row.family}
                </td>
                {row.cells.map((cell) => {
                  const isEmpty = cell.rf === 0 && cell.xgb === 0
                  const diffPp = cell.diff * 100
                  return (
                    <td
                      key={cell.ensaio}
                      className="p-0 border-b border-[var(--border-light)]"
                      style={{ minWidth: 32, height: 32 }}
                      onMouseEnter={() => setHover(cell)}
                      onMouseLeave={() => setHover(null)}
                    >
                      <div
                        className="w-full h-full flex items-center justify-center text-[10px] font-semibold tabular-nums"
                        style={{
                          backgroundColor: isEmpty ? 'transparent' : diffColor(cell.diff),
                          color:
                            Math.abs(diffPp) > 20
                              ? 'white'
                              : 'var(--text-secondary)',
                        }}
                      >
                        {isEmpty
                          ? ''
                          : Math.abs(diffPp) < 0.5
                            ? '·'
                            : `${diffPp > 0 ? '+' : ''}${diffPp.toFixed(0)}`}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {hover && (
          <div className="absolute bottom-2 right-2 bg-white border border-[var(--border-light)] rounded-lg shadow-md p-3 text-xs max-w-xs pointer-events-none">
            <div className="font-semibold text-[var(--text-primary)] mb-1">
              {hover.family}
            </div>
            <div className="text-[var(--text-secondary)] mb-2">{hover.ensaio}</div>
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <div>
                <div className="text-[var(--text-muted)]">RF</div>
                <div className="font-semibold text-blue-700 tabular-nums">
                  {(hover.rf * 100).toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-[var(--text-muted)]">XGB</div>
                <div className="font-semibold text-purple-700 tabular-nums">
                  {(hover.xgb * 100).toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-[var(--text-muted)]">Δ</div>
                <div className="font-semibold text-[var(--text-primary)] tabular-nums">
                  {hover.diff > 0 ? '+' : ''}
                  {(hover.diff * 100).toFixed(1)}pp
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 mt-3 mb-4 text-xs text-[var(--text-muted)]">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-blue-500" />
          RF maior
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-red-500" />
          XGBoost maior
        </div>
      </div>

      <Callout variant="note">
        Quando o XGBoost concentra fortemente a importância em uma variável, isso é um indício de
        dominância dentro deste conjunto de dados — e não necessariamente prova de que os demais
        ensaios sejam irrelevantes na prática. RF e XGBoost tendem a concordar em famílias maiores
        e com distribuição de pesos menos extrema.
      </Callout>
    </section>
  )
}
