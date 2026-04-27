'use client'

import { Gauge } from 'lucide-react'
import { Callout } from '@/components/ui/Callout'
import { cn } from '@/lib/utils/cn'
import {
  MODEL_LABELS,
  SCENARIO_LABELS,
  VERSION_LABELS,
  type ModelType,
  type Version,
  type Scenario,
} from '@/data/importance-data'
import { PERFORMANCE, type PerformanceRow } from '@/data/importance-performance'

function cenarioLabel(c: PerformanceRow['cenario']) {
  if (c === 'geral') return 'Geral'
  return SCENARIO_LABELS[c as Scenario]
}

function r2Color(r2: number) {
  if (r2 >= 0.99) return 'text-amber-600 font-semibold'
  if (r2 >= 0.85) return 'text-emerald-600 font-semibold'
  if (r2 >= 0.7) return 'text-[var(--text-primary)] font-semibold'
  return 'text-[var(--text-secondary)]'
}

function PerformanceTable({
  model,
  version,
}: {
  model: ModelType
  version: Version
}) {
  const rows = PERFORMANCE[model][version]

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b border-[var(--border-light)]">
            <th className="py-2 pr-4 font-medium text-[var(--text-secondary)]">Cenário</th>
            <th className="py-2 pr-3 font-medium text-[var(--text-secondary)] text-right">
              Famílias
            </th>
            <th className="py-2 pr-3 font-medium text-[var(--text-secondary)] text-right">
              Produtos
            </th>
            <th className="py-2 pr-3 font-medium text-[var(--text-secondary)] text-right">MAE</th>
            <th className="py-2 pr-3 font-medium text-[var(--text-secondary)] text-right">RMSE</th>
            <th className="py-2 pr-3 font-medium text-[var(--text-secondary)] text-right">R²</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isGeral = row.cenario === 'geral'
            return (
              <tr
                key={row.cenario}
                className={cn(
                  'border-b border-[var(--border-light)] last:border-0',
                  isGeral && 'bg-[var(--bg-light)] font-medium'
                )}
              >
                <td className="py-2 pr-4 text-[var(--text-primary)]">
                  {cenarioLabel(row.cenario)}
                </td>
                <td className="py-2 pr-3 text-right tabular-nums text-[var(--text-secondary)]">
                  {row.familias}
                </td>
                <td className="py-2 pr-3 text-right tabular-nums text-[var(--text-secondary)]">
                  {row.produtos}
                </td>
                <td className="py-2 pr-3 text-right tabular-nums text-[var(--text-secondary)]">
                  {row.mae.toFixed(2)}
                </td>
                <td className="py-2 pr-3 text-right tabular-nums text-[var(--text-secondary)]">
                  {row.rmse.toFixed(2)}
                </td>
                <td className={cn('py-2 pr-3 text-right tabular-nums', r2Color(row.r2))}>
                  {row.r2.toFixed(4)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export function PerformanceSection() {
  return (
    <section id="desempenho">
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <Gauge className="w-5 h-5 text-[var(--primary)]" />
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            Desempenho Preditivo
          </h2>
        </div>
        <p className="text-sm text-[var(--text-secondary)]">
          Métricas de ajuste in-sample por cenário × versão, para ambos os modelos. Servem como
          verificação de sanidade — rankings extraídos de modelos mal-ajustados refletem ruído.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {(['rf', 'xgb'] as ModelType[]).map((model) => (
          <div
            key={model}
            className="bg-white rounded-xl border border-[var(--border-light)] p-5"
          >
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
              {MODEL_LABELS[model]}
            </h3>

            {(['com_limites', 'sem_limites'] as Version[]).map((version) => (
              <div key={version} className="mb-5 last:mb-0">
                <div className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-2">
                  {VERSION_LABELS[version]}
                </div>
                <PerformanceTable model={model} version={version} />
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Callout variant="warning" title="Atenção — Métricas in-sample">
          Estas métricas são calculadas sobre os mesmos dados utilizados no treinamento de cada
          família. São medidas de <strong>ajuste à base</strong>, não de generalização para novos
          dados. Sua função aqui é confirmar que os modelos capturaram estrutura real, legitimando
          a extração de importâncias.
        </Callout>
        <Callout variant="critical" title="XGBoost em família pequena: R² = 0,9998">
          O R² próximo de 1,0 em <strong>Acompanhamento com Limites</strong> do XGBoost (3
          famílias, 22 produtos) é consistente com o comportamento esperado do boosting em
          conjuntos pequenos. Use as importâncias dessa configuração com cautela adicional —
          podem refletir particularidades do treino, não padrões generalizáveis.
        </Callout>
      </div>
    </section>
  )
}
