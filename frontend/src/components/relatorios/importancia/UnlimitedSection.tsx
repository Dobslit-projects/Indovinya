'use client'

import { useMemo } from 'react'
import { Telescope } from 'lucide-react'
import { Accordion, AccordionItem } from '@/components/ui/Accordion'
import { Callout } from '@/components/ui/Callout'
import { Badge } from '@/components/ui/Badge'
import { FamilyCard } from './FamilyCard'
import {
  getRankings,
  rfComLimites,
  xgbComLimites,
  rfExcluidas,
  xgbExcluidas,
  SCENARIO_LABELS,
  MODEL_LABELS,
  type ModelType,
  type Scenario,
} from '@/data/importance-data'

interface UnlimitedSectionProps {
  scenario: Scenario
  model: ModelType
}

export function UnlimitedSection({ scenario, model }: UnlimitedSectionProps) {
  const rankings = useMemo(
    () => getRankings(model, 'sem_limites', scenario),
    [model, scenario]
  )

  const exclusivas = useMemo(() => {
    const comSet = new Set(
      (model === 'rf' ? rfComLimites : xgbComLimites)[scenario].map((f) => f.familia)
    )
    return rankings.filter((f) => !comSet.has(f.familia)).map((f) => f.familia)
  }, [model, scenario, rankings])

  const excluidas = useMemo(() => {
    const all = model === 'rf' ? rfExcluidas : xgbExcluidas
    return all.filter((e) => e.cenario === scenario)
  }, [model, scenario])

  return (
    <section id="sem-limites">
      <Accordion>
        <AccordionItem
          id="sem-limites-accordion"
          title="Versão Sem Limites"
          subtitle={`${MODEL_LABELS[model]} · ${SCENARIO_LABELS[scenario]} · ${rankings.length} famílias`}
          icon={<Telescope className="w-4 h-4" />}
        >
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge variant="warning">Exploratório</Badge>
            <span className="text-xs text-[var(--text-muted)]">
              Cobertura máxima — leitura cautelosa em famílias pequenas
            </span>
          </div>

          <Callout variant="warning" className="mb-4">
            Critérios relaxados (mín. 2 produtos, sem mínimo de presença de ensaio). Pesos
            extremos (1,000 e demais zero) em famílias com 2–3 produtos refletem limitações
            amostrais — não dominância química.
          </Callout>

          {rankings.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
              {rankings.map((fam) => (
                <FamilyCard
                  key={fam.familia}
                  family={fam}
                  model={model}
                  version="sem_limites"
                  scenario={scenario}
                />
              ))}
            </div>
          ) : (
            <div className="text-sm text-[var(--text-muted)] text-center py-6 mb-5">
              Nenhuma família nesta combinação.
            </div>
          )}

          {exclusivas.length > 0 && (
            <div className="mb-5">
              <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
                Famílias exclusivas desta versão
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {exclusivas.map((fam) => (
                  <Badge key={fam} variant="neutral" size="sm">
                    {fam}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {excluidas.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
                Famílias excluídas neste cenário
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-[var(--border-light)]">
                      <th className="py-2 pr-4 font-medium text-[var(--text-secondary)]">
                        Família
                      </th>
                      <th className="py-2 pr-4 font-medium text-[var(--text-secondary)]">
                        Motivo
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {excluidas.map((e, i) => (
                      <tr
                        key={`${e.familia}-${i}`}
                        className="border-b border-[var(--border-light)] last:border-0"
                      >
                        <td className="py-2 pr-4 text-[var(--text-primary)]">{e.familia}</td>
                        <td className="py-2 pr-4 text-[var(--text-secondary)]">{e.motivo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </AccordionItem>
      </Accordion>
    </section>
  )
}
