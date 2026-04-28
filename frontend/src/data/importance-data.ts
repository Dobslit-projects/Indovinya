import rawData from './importance-rankings.json'

export type Scenario = 'longa_duracao' | 'acelerado' | 'acompanhamento'
export type ModelType = 'rf' | 'xgb'
export type Version = 'com_limites' | 'sem_limites'

export type Descriptor =
  | 'slope'
  | 'abs_slope'
  | 'delta_total'
  | 'margin0_norm'
  | 'min_margin_norm'
  | 'oos_any'
  | 'first_oos_day'
  | 'n_points'
  | 'value0'
  | 'value_last'

export type ConfidenceLevel = 'alta' | 'cautela' | 'exploratorio'

export interface EnsaioRank {
  rank: number
  ensaio: string
  peso: number
  descritor: Descriptor
}

export interface FamilyRanking {
  familia: string
  numProdutos: number
  numEnsaiosValidos: number
  ensaios: EnsaioRank[]
}

export interface ExcludedFamily {
  cenario: Scenario
  familia: string
  motivo: string
}

type RawEntry = {
  Família: string
  'Nº de produtos': number
  'Nº de ensaios válidos': number
  [key: string]: string | number | null
}

type RawExcluded = {
  Arquivo: string
  Família: string
  Motivo: string
}

function parseEntry(raw: RawEntry): FamilyRanking {
  const ensaios: EnsaioRank[] = []
  for (let i = 1; i <= 5; i++) {
    const ensaio = raw[`Nº ${i}`] as string | null
    const peso = raw[`Peso ${i}`] as number | string | null
    const descritor = raw[`Descritor dominante ${i}`] as string | null
    if (ensaio != null && peso != null && descritor != null) {
      ensaios.push({
        rank: i,
        ensaio,
        peso: typeof peso === 'string' ? parseFloat(peso) : peso,
        descritor: descritor as Descriptor,
      })
    }
  }
  return {
    familia: raw['Família'],
    numProdutos: raw['Nº de produtos'],
    numEnsaiosValidos: raw['Nº de ensaios válidos'],
    ensaios,
  }
}

function parseExcluded(raw: RawExcluded): ExcludedFamily {
  const arquivo = raw['Arquivo'].toLowerCase()
  let cenario: Scenario = 'longa_duracao'
  if (arquivo.includes('acelerado')) cenario = 'acelerado'
  else if (arquivo.includes('acompanhamento')) cenario = 'acompanhamento'
  return {
    cenario,
    familia: raw['Família'],
    motivo: raw['Motivo'],
  }
}

type DataSource = Record<string, unknown>
const data = rawData as DataSource

function getSection(key: string): FamilyRanking[] {
  const arr = (data[key] as RawEntry[]) ?? []
  return arr.map(parseEntry)
}

function getExcludedSection(key: string): ExcludedFamily[] {
  const arr = (data[key] as RawExcluded[]) ?? []
  return arr.map(parseExcluded)
}

export const rfComLimites: Record<Scenario, FamilyRanking[]> = {
  longa_duracao: getSection('rf_com_limites_longa_duracao'),
  acelerado: getSection('rf_com_limites_acelerado'),
  acompanhamento: getSection('rf_com_limites_acompanhamento'),
}

export const xgbComLimites: Record<Scenario, FamilyRanking[]> = {
  longa_duracao: getSection('xgb_com_limites_longa_duracao'),
  acelerado: getSection('xgb_com_limites_acelerado'),
  acompanhamento: getSection('xgb_com_limites_acompanhamento'),
}

export const rfSemLimites: Record<Scenario, FamilyRanking[]> = {
  longa_duracao: getSection('rf_sem_limites_longa_duracao'),
  acelerado: getSection('rf_sem_limites_acelerado'),
  acompanhamento: getSection('rf_sem_limites_acompanhamento'),
}

export const xgbSemLimites: Record<Scenario, FamilyRanking[]> = {
  longa_duracao: getSection('xgb_sem_limites_longa_duracao'),
  acelerado: getSection('xgb_sem_limites_acelerado'),
  acompanhamento: getSection('xgb_sem_limites_acompanhamento'),
}

export const rfExcluidas: ExcludedFamily[] = getExcludedSection('rf_sem_limites_excluidas')
export const xgbExcluidas: ExcludedFamily[] = getExcludedSection('xgb_sem_limites_excluidas')

export function getRankings(
  model: ModelType,
  version: Version,
  scenario: Scenario
): FamilyRanking[] {
  if (model === 'rf' && version === 'com_limites') return rfComLimites[scenario]
  if (model === 'xgb' && version === 'com_limites') return xgbComLimites[scenario]
  if (model === 'rf' && version === 'sem_limites') return rfSemLimites[scenario]
  return xgbSemLimites[scenario]
}

export function getConfidenceLevel(family: FamilyRanking): ConfidenceLevel {
  const top1Peso = family.ensaios[0]?.peso ?? 0
  if (family.numProdutos >= 8 && top1Peso < 0.7) return 'alta'
  if (family.numProdutos <= 3 || top1Peso === 1.0) return 'exploratorio'
  return 'cautela'
}

export const ENSAIO_COLORS: Record<string, string> = {
  'Água, %p': '#3b82f6',
  'Índice de acidez, mgKOH/g': '#f59e0b',
  'Índice de saponificação, mgKOH/g': '#10b981',
  'Índice de hidroxila, mg KOH/g': '#8b5cf6',
  'Cor Gardner, 25ºC': '#ef4444',
  'Cor Pt-Co, 25°C': '#ec4899',
  'Cor Pt-Co, 60ºC': '#f97316',
  'pH 1% p/p, aquoso, 25ºC': '#06b6d4',
  'pH 5% p/p, aquoso, 25ºC': '#0ea5e9',
  'RSN, Número de água, mL': '#64748b',
  'Óxido de Eteno, ppm': '#84cc16',
  'Insulfatados, %p': '#a78bfa',
  'Cloreto de sódio, %p': '#fb7185',
  'Sulfato de sódio, %p': '#34d399',
  'Ponto de névoa, 1% p/p, NaCl 5% p/p, ºC': '#fbbf24',
  'Dioxana, ppm': '#c084fc',
  'Etanol, %p': '#f472b6',
  'Insulfonados, %': '#2dd4bf',
  'Matéria ativa (PM 322), %p': '#a3e635',
  'Dietanolamina, %p': '#fb923c',
}

export function getEnsaioColor(ensaio: string): string {
  return ENSAIO_COLORS[ensaio] ?? '#94a3b8'
}

export const DESCRIPTOR_LABELS: Record<Descriptor, string> = {
  slope: 'Tendência (slope)',
  abs_slope: 'Vel. mudança (|slope|)',
  delta_total: 'Variação total',
  margin0_norm: 'Margem inicial',
  min_margin_norm: 'Margem mínima',
  oos_any: 'Fora de spec.',
  first_oos_day: '1º dia fora de spec.',
  n_points: 'N° de pontos',
  value0: 'Valor inicial',
  value_last: 'Valor final',
}

export const DESCRIPTOR_COLORS: Record<Descriptor, string> = {
  slope: '#3b82f6',
  abs_slope: '#f59e0b',
  delta_total: '#10b981',
  margin0_norm: '#8b5cf6',
  min_margin_norm: '#ef4444',
  oos_any: '#ec4899',
  first_oos_day: '#f97316',
  n_points: '#64748b',
  value0: '#14b8a6',
  value_last: '#e11d48',
}

export const SCENARIO_LABELS: Record<Scenario, string> = {
  longa_duracao: 'Longa Duração',
  acelerado: 'Acelerado',
  acompanhamento: 'Acompanhamento',
}

export const MODEL_LABELS: Record<ModelType, string> = {
  rf: 'Random Forest',
  xgb: 'XGBoost',
}

export const VERSION_LABELS: Record<Version, string> = {
  com_limites: 'Com Limites',
  sem_limites: 'Sem Limites',
}
