'use client'

import { useMemo } from 'react'
import { Users2 } from 'lucide-react'
import { FamilyCard } from './FamilyCard'
import {
  getRankings,
  MODEL_LABELS,
  SCENARIO_LABELS,
  type ModelType,
  type Scenario,
} from '@/data/importance-data'

interface FamilyRankingPanelProps {
  scenario: Scenario
  model: ModelType
}

export function FamilyRankingPanel({ scenario, model }: FamilyRankingPanelProps) {
  const rankings = useMemo(() => getRankings(model, 'com_limites', scenario), [model, scenario])

  return (
    <section id="painel-familias">
      <div className="mb-5 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users2 className="w-5 h-5 text-[var(--primary)]" />
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">
              Ranking por Família
            </h2>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            Versão com limites — {MODEL_LABELS[model]} · {SCENARIO_LABELS[scenario]}.
          </p>
        </div>
        <div className="text-xs text-[var(--text-muted)]">
          {rankings.length} {rankings.length === 1 ? 'família' : 'famílias'}
        </div>
      </div>

      {rankings.length === 0 ? (
        <div className="bg-white rounded-xl border border-[var(--border-light)] p-10 text-center text-sm text-[var(--text-muted)]">
          Nenhuma família nesta combinação de cenário e modelo.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {rankings.map((fam) => (
            <FamilyCard
              key={fam.familia}
              family={fam}
              model={model}
              version="com_limites"
              scenario={scenario}
            />
          ))}
        </div>
      )}
    </section>
  )
}
