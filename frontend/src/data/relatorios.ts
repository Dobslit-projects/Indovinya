import type { Relatorio } from '@/types/relatorios'

export const RELATORIOS: Relatorio[] = [
  {
    slug: 'importancia-final',
    titulo: 'Relatório Final — Importância de Ensaios',
    descricao:
      'Análise temporal de Shelf Life com Random Forest e XGBoost. Ranking de importância de ensaios físico-químicos por família, nas versões com e sem limites, incluindo análise de sensibilidade sem ensaios de água.',
    tipo: 'tecnico',
    status: 'disponivel',
    data: '2026-03-27',
    tags: ['Shelf Life', 'Importância', 'Random Forest', 'XGBoost'],
    href: '/relatorios/importancia-final',
    pdfPath: '/reports/importancia-final.pdf',
  },
  {
    slug: 'importancia-variaveis',
    titulo: 'Importância de Variáveis — Visão Interativa',
    descricao:
      'Exploração interativa dos rankings por família, cenário e modelo. Filtros dinâmicos, heatmap comparativo, leituras família-a-família e análise sem ensaios de água.',
    tipo: 'interativo',
    status: 'disponivel',
    data: '2026-03-27',
    tags: ['Shelf Life', 'Importância', 'Interativo'],
    href: '/relatorios/importancia-variaveis',
  },
]

export function getRelatorio(slug: string): Relatorio | undefined {
  return RELATORIOS.find((r) => r.slug === slug)
}
