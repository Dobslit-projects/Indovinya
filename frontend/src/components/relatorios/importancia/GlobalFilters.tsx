'use client'

import { SlidersHorizontal } from 'lucide-react'
import { Select } from '@/components/ui/Select'
import {
  SCENARIO_LABELS,
  MODEL_LABELS,
  type ModelType,
  type Scenario,
} from '@/data/importance-data'

interface GlobalFiltersProps {
  scenario: Scenario
  model: ModelType
  onScenarioChange: (s: Scenario) => void
  onModelChange: (m: ModelType) => void
}

const SCENARIO_OPTIONS = (
  Object.entries(SCENARIO_LABELS) as [Scenario, string][]
).map(([value, label]) => ({ value, label }))

const MODEL_OPTIONS = (Object.entries(MODEL_LABELS) as [ModelType, string][]).map(
  ([value, label]) => ({ value, label })
)

export function GlobalFilters({
  scenario,
  model,
  onScenarioChange,
  onModelChange,
}: GlobalFiltersProps) {
  return (
    <div className="sticky top-16 z-10 bg-white/95 backdrop-blur border-y border-[var(--border-light)] -mx-8 px-8 py-3">
      <div className="flex items-center gap-4 flex-wrap max-w-6xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline font-medium">Filtros</span>
        </div>

        <div className="flex items-center gap-2 flex-1 sm:flex-initial">
          <label className="hidden sm:block text-xs text-[var(--text-muted)] shrink-0">
            Cenário
          </label>
          <div className="min-w-[180px] flex-1 sm:flex-initial">
            <Select
              value={scenario}
              onChange={(e) => onScenarioChange(e.target.value as Scenario)}
              options={SCENARIO_OPTIONS}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-1 sm:flex-initial">
          <label className="hidden sm:block text-xs text-[var(--text-muted)] shrink-0">
            Modelo
          </label>
          <div className="min-w-[170px] flex-1 sm:flex-initial">
            <Select
              value={model}
              onChange={(e) => onModelChange(e.target.value as ModelType)}
              options={MODEL_OPTIONS}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
