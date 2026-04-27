'use client'

import { Flag, Check } from 'lucide-react'
import { COMPARISON_ASPECTS, RECOMMENDATIONS } from '@/data/importance-performance'

export function ConclusionSection() {
  return (
    <section id="conclusao">
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <Flag className="w-5 h-5 text-[var(--primary)]" />
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Conclusão</h2>
        </div>
        <p className="text-sm text-[var(--text-secondary)]">
          Comparação final entre modelos e versões + recomendações de uso.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-[var(--border-light)] p-5 mb-5">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
          Comparativo entre Modelos e Versões
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-[var(--border-light)]">
                <th className="py-2 pr-4 font-medium text-[var(--text-secondary)]">Aspecto</th>
                <th className="py-2 pr-3 font-medium text-center bg-blue-50/50 rounded-t-md">
                  <div className="text-blue-700">RF</div>
                  <div className="text-[10px] text-blue-600 font-normal">c/ Limites</div>
                </th>
                <th className="py-2 pr-3 font-medium text-center bg-purple-50/50 rounded-t-md">
                  <div className="text-purple-700">XGB</div>
                  <div className="text-[10px] text-purple-600 font-normal">c/ Limites</div>
                </th>
                <th className="py-2 pr-3 font-medium text-center bg-blue-50/30 rounded-t-md">
                  <div className="text-blue-700">RF</div>
                  <div className="text-[10px] text-blue-600 font-normal">s/ Limites</div>
                </th>
                <th className="py-2 pr-3 font-medium text-center bg-purple-50/30 rounded-t-md">
                  <div className="text-purple-700">XGB</div>
                  <div className="text-[10px] text-purple-600 font-normal">s/ Limites</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ASPECTS.map((aspect) => (
                <tr
                  key={aspect.aspecto}
                  className="border-b border-[var(--border-light)] last:border-0"
                >
                  <td className="py-2.5 pr-4 font-medium text-[var(--text-primary)]">
                    {aspect.aspecto}
                  </td>
                  <td className="py-2.5 pr-3 text-center text-[var(--text-secondary)]">
                    {aspect.rfCom}
                  </td>
                  <td className="py-2.5 pr-3 text-center text-[var(--text-secondary)]">
                    {aspect.xgbCom}
                  </td>
                  <td className="py-2.5 pr-3 text-center text-[var(--text-secondary)]">
                    {aspect.rfSem}
                  </td>
                  <td className="py-2.5 pr-3 text-center text-[var(--text-secondary)]">
                    {aspect.xgbSem}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Recomendações</h3>
        <div className="space-y-3">
          {RECOMMENDATIONS.map((rec, i) => (
            <div
              key={rec.titulo}
              className="bg-white rounded-xl border border-[var(--border-light)] p-4 flex gap-4"
            >
              <div className="shrink-0 w-8 h-8 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center font-semibold text-sm">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                    {rec.titulo}
                  </h4>
                </div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {rec.descricao}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
