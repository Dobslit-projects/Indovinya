'use client'

import { Activity, Layers, Target, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'

const STATS = [
  { icon: <Target className="w-4 h-4" />, label: '3 cenários', descricao: 'Longa Duração, Acelerado, Acompanhamento' },
  { icon: <Activity className="w-4 h-4" />, label: '2 modelos', descricao: 'Random Forest e XGBoost' },
  { icon: <Layers className="w-4 h-4" />, label: '2 versões', descricao: 'Com Limites e Sem Limites' },
  { icon: <Sparkles className="w-4 h-4" />, label: '7 descritores', descricao: 'slope, delta_total, margens...' },
]

export function ReportHero() {
  return (
    <section className="bg-white rounded-2xl border border-[var(--border-light)] p-8">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Badge variant="info">Random Forest</Badge>
        <Badge variant="purple">XGBoost</Badge>
        <Badge variant="success">Com Limites</Badge>
        <Badge variant="warning">Sem Limites</Badge>
      </div>

      <h1 className="text-3xl sm:text-4xl font-semibold text-[var(--text-primary)] leading-tight mb-3">
        Análise Temporal de Shelf Life
      </h1>
      <p className="text-lg text-[var(--text-secondary)] mb-2">
        Ranking de importância de ensaios físico-químicos
      </p>

      <p className="text-sm text-[var(--text-secondary)] max-w-3xl leading-relaxed mb-6">
        Esta análise identifica, para cada família de produtos, quais ensaios físico-químicos
        apresentam maior associação com o Shelf Life. O histórico temporal de cada ensaio é
        convertido em descritores resumidos e modelos de regressão são ajustados separadamente
        por família, usando Random Forest e XGBoost em duas versões — uma conservadora (com
        limites) e uma exploratória (sem limites).
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="bg-[var(--bg-light)] rounded-lg px-4 py-3 border border-[var(--border-light)]"
          >
            <div className="flex items-center gap-1.5 text-[var(--primary)] mb-1">
              {stat.icon}
              <span className="text-sm font-semibold">{stat.label}</span>
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-snug">{stat.descricao}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
