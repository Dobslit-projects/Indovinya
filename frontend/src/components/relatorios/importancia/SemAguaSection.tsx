'use client'

import { useMemo, useState } from 'react'
import { Droplets } from 'lucide-react'
import { Callout } from '@/components/ui/Callout'
import { Badge } from '@/components/ui/Badge'
import { Tabs } from '@/components/ui/Tabs'
import {
  SCENARIO_LABELS,
  MODEL_LABELS,
  VERSION_LABELS,
  getEnsaioColor,
  type ModelType,
  type Scenario,
  type Version,
} from '@/data/importance-data'
import { getWaterTable, WATER_EXCLUDED_TESTS } from '@/data/importance-water'

interface SemAguaSectionProps {
  scenario: Scenario
  model: ModelType
}

type Tab = `${ModelType}-${Version}`

const TABS = [
  { key: 'rf-com_limites' as Tab, label: 'RF · Com limites' },
  { key: 'xgb-com_limites' as Tab, label: 'XGB · Com limites' },
  { key: 'rf-sem_limites' as Tab, label: 'RF · Sem limites' },
  { key: 'xgb-sem_limites' as Tab, label: 'XGB · Sem limites' },
]

function parseTab(tab: Tab): { model: ModelType; version: Version } {
  const [model, version] = tab.split('-') as [ModelType, Version]
  return { model, version }
}

export function SemAguaSection({ scenario, model }: SemAguaSectionProps) {
  const defaultTab: Tab = `${model}-com_limites`
  const [activeTab, setActiveTab] = useState<Tab>(defaultTab)
  const { model: tabModel, version: tabVersion } = parseTab(activeTab)

  const families = useMemo(() => {
    const table = getWaterTable(tabModel, tabVersion)
    return table[scenario]
  }, [tabModel, tabVersion, scenario])

  return (
    <section id="sem-agua">
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <Droplets className="w-5 h-5 text-[var(--primary)]" />
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            Análise Sem Ensaios de Água
          </h2>
        </div>
        <p className="text-sm text-[var(--text-secondary)]">
          Na ausência dos ensaios relacionados à água, quais outros parâmetros carregam associação
          com o Shelf Life.
        </p>
      </div>

      <Callout variant="info" title="Ensaios excluídos" className="mb-5">
        <div className="flex flex-wrap gap-1.5 mt-1">
          {WATER_EXCLUDED_TESTS.map((t) => (
            <Badge key={t} variant="info" size="sm">
              {t}
            </Badge>
          ))}
        </div>
      </Callout>

      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <Tabs
          items={TABS.map((t) => ({ key: t.key, label: t.label }))}
          value={activeTab}
          onChange={(k) => setActiveTab(k as Tab)}
          variant="pill"
          size="sm"
          layoutId="sem-agua-tabs"
        />
        <span className="text-xs text-[var(--text-muted)]">
          {SCENARIO_LABELS[scenario]} · {MODEL_LABELS[tabModel]} · {VERSION_LABELS[tabVersion]}
        </span>
      </div>

      {families.length === 0 ? (
        <div className="bg-white rounded-xl border border-[var(--border-light)] p-8 text-center text-sm text-[var(--text-muted)]">
          Sem famílias nesta configuração.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {families.map((fam) => (
            <div
              key={fam.familia}
              className="bg-white rounded-xl border border-[var(--border-light)] p-4"
            >
              <div className="flex items-center justify-between gap-3 mb-3">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  {fam.familia}
                </h3>
                <Badge variant="neutral" size="sm">
                  {fam.numProdutos} produtos
                </Badge>
              </div>

              {fam.ensaios.length === 0 || (fam.ensaios.length === 1 && fam.ensaios[0].peso === 0) ? (
                <p className="text-xs text-[var(--text-muted)] italic">
                  Ranking praticamente vazio após exclusão da água.
                </p>
              ) : (
                <div className="space-y-2">
                  {fam.ensaios.map((e, i) => (
                    <div key={`${e.ensaio}-${i}`} className="flex items-center gap-3">
                      <span className="text-xs text-[var(--text-muted)] tabular-nums w-5">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="w-2 h-2 rounded-sm shrink-0"
                            style={{ backgroundColor: getEnsaioColor(e.ensaio) }}
                          />
                          <span className="text-xs text-[var(--text-primary)] truncate">
                            {e.ensaio}
                          </span>
                        </div>
                        <div className="relative h-1.5 bg-[var(--bg-light)] rounded-full overflow-hidden">
                          <div
                            className="absolute left-0 top-0 bottom-0 rounded-full"
                            style={{
                              width: `${Math.max(2, e.peso * 100)}%`,
                              backgroundColor: getEnsaioColor(e.ensaio),
                            }}
                          />
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-[var(--text-primary)] tabular-nums w-12 text-right">
                        {(e.peso * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
