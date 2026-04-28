import type { ModelType, Scenario, Version } from './importance-data'

export interface PerformanceRow {
  cenario: Scenario | 'geral'
  familias: number
  produtos: number
  mae: number
  rmse: number
  r2: number
}

export type PerformanceTable = Record<Version, PerformanceRow[]>

export const PERFORMANCE: Record<ModelType, PerformanceTable> = {
  rf: {
    com_limites: [
      { cenario: 'longa_duracao', familias: 4, produtos: 33, mae: 66.33, rmse: 98.71, r2: 0.7482 },
      { cenario: 'acelerado', familias: 4, produtos: 35, mae: 69.25, rmse: 101.46, r2: 0.7214 },
      { cenario: 'acompanhamento', familias: 3, produtos: 22, mae: 38.77, rmse: 53.45, r2: 0.8583 },
      { cenario: 'geral', familias: 11, produtos: 90, mae: 60.73, rmse: 90.96, r2: 0.7531 },
    ],
    sem_limites: [
      { cenario: 'longa_duracao', familias: 12, produtos: 57, mae: 63.78, rmse: 88.15, r2: 0.7929 },
      { cenario: 'acelerado', familias: 13, produtos: 63, mae: 62.99, rmse: 86.99, r2: 0.7887 },
      { cenario: 'acompanhamento', familias: 8, produtos: 35, mae: 95.91, rmse: 158.74, r2: 0.7461 },
      { cenario: 'geral', familias: 33, produtos: 155, mae: 70.71, rmse: 107.81, r2: 0.7751 },
    ],
  },
  xgb: {
    com_limites: [
      { cenario: 'longa_duracao', familias: 4, produtos: 33, mae: 23.17, rmse: 78.32, r2: 0.8415 },
      { cenario: 'acelerado', familias: 4, produtos: 35, mae: 21.99, rmse: 76.05, r2: 0.8435 },
      { cenario: 'acompanhamento', familias: 3, produtos: 22, mae: 1.18, rmse: 2.16, r2: 0.9998 },
      { cenario: 'geral', familias: 11, produtos: 90, mae: 17.34, rmse: 67.08, r2: 0.8658 },
    ],
    sem_limites: [
      { cenario: 'longa_duracao', familias: 12, produtos: 57, mae: 13.9, rmse: 59.61, r2: 0.9053 },
      { cenario: 'acelerado', familias: 13, produtos: 63, mae: 12.7, rmse: 56.71, r2: 0.9102 },
      { cenario: 'acompanhamento', familias: 8, produtos: 35, mae: 32.79, rmse: 130.9, r2: 0.8273 },
      { cenario: 'geral', familias: 33, produtos: 155, mae: 17.68, rmse: 80.52, r2: 0.8746 },
    ],
  },
}

export interface TransversalFinding {
  ensaio: string
  cor: string
  resumo: string
}

export const TRANSVERSAL_FINDINGS: TransversalFinding[] = [
  {
    ensaio: 'Água, %p',
    cor: '#3b82f6',
    resumo:
      'Ensaio mais frequentemente dominante, aparecendo como fator principal em múltiplas famílias e cenários.',
  },
  {
    ensaio: 'Índice de saponificação',
    cor: '#10b981',
    resumo:
      'Especialmente relevante para Alkyl Ester, com forte indicação de vínculo à degradação química progressiva.',
  },
  {
    ensaio: 'Índice de acidez',
    cor: '#f59e0b',
    resumo:
      'Recorrente em Alkyl Ester e álcoois etoxilados, associado a tendência temporal e mudança acumulada.',
  },
  {
    ensaio: 'Índice de hidroxila',
    cor: '#8b5cf6',
    resumo:
      'Recorrente em famílias de álcoois etoxilados, frequentemente associado à proximidade crítica do limite.',
  },
  {
    ensaio: 'Cor Gardner / Cor Pt-Co',
    cor: '#ef4444',
    resumo:
      'Variáveis de cor se destacam em Blend – Crop e Ethoxylated nonyl phenol, geralmente via menor margem ao limite.',
  },
]

export interface ComparisonAspect {
  aspecto: string
  rfCom: string
  xgbCom: string
  rfSem: string
  xgbSem: string
}

export const COMPARISON_ASPECTS: ComparisonAspect[] = [
  {
    aspecto: 'Cobertura de famílias',
    rfCom: 'Menor',
    xgbCom: 'Menor',
    rfSem: 'Máxima',
    xgbSem: 'Máxima',
  },
  {
    aspecto: 'Robustez geral',
    rfCom: 'Alta',
    xgbCom: 'Alta',
    rfSem: 'Variável',
    xgbSem: 'Variável',
  },
  {
    aspecto: 'Concentração de pesos',
    rfCom: 'Distribuída',
    xgbCom: 'Concentrada',
    rfSem: 'Variável',
    xgbSem: 'Muito concentrada',
  },
  {
    aspecto: 'Exibe descritor dominante',
    rfCom: 'Sim',
    xgbCom: 'Sim',
    rfSem: 'Não',
    xgbSem: 'Não',
  },
  {
    aspecto: 'Uso recomendado',
    rfCom: 'Conclusões',
    xgbCom: 'Conclusões',
    rfSem: 'Exploração',
    xgbSem: 'Exploração',
  },
]

export interface Recommendation {
  titulo: string
  descricao: string
}

export const RECOMMENDATIONS: Recommendation[] = [
  {
    titulo: 'Usar a versão com limites como base principal',
    descricao:
      'É a mais apropriada para conclusões e comunicações técnicas ao cliente, pela robustez dos filtros aplicados.',
  },
  {
    titulo: 'Usar a versão sem limites como complemento exploratório',
    descricao:
      'Apresentar com linguagem prudente, destacando o grau de robustez de cada família.',
  },
  {
    titulo: 'Priorizar famílias com mais produtos e pesos menos extremos',
    descricao: 'Essas são a base mais sólida para decisões baseadas nos rankings.',
  },
  {
    titulo: 'Não interpretar Peso 1 = 1,000 como dominância absoluta',
    descricao:
      'Em famílias com 2–3 produtos, esses casos refletem limitações amostrais — não necessariamente dominância química.',
  },
  {
    titulo: 'Explorar os descritores dominantes',
    descricao:
      'Especialmente slope, delta_total e min_margin_norm — eles explicam como cada ensaio se relaciona com o Shelf Life, não apenas qual é o mais importante.',
  },
]
