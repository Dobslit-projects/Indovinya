import type { Descriptor, ModelType, Scenario, Version } from './importance-data'

export const WATER_EXCLUDED_TESTS = [
  'Água, %p',
  'Umidade, %p',
  'Umidade ou Material Volátil, %p',
  'Água+pesados, %p',
  'RSN, Número de água, mL',
]

export interface WaterEnsaio {
  ensaio: string
  peso: number
  descritor?: Descriptor
}

export interface WaterFamilyRanking {
  familia: string
  numProdutos: number
  ensaios: WaterEnsaio[]
}

export type WaterTable = Record<Scenario, WaterFamilyRanking[]>

// Tabela 5.1 — RF com limites, sem ensaios de água
export const RF_COM_SEM_AGUA: WaterTable = {
  longa_duracao: [
    {
      familia: 'Alkyl Ester',
      numProdutos: 9,
      ensaios: [
        { ensaio: 'Índice de saponificação', peso: 0.662, descritor: 'delta_total' },
        { ensaio: 'Índice de acidez', peso: 0.264 },
        { ensaio: 'Cor Gardner, 25ºC', peso: 0.074 },
      ],
    },
    {
      familia: 'Blend – Crop',
      numProdutos: 12,
      ensaios: [
        { ensaio: 'Cor Gardner, 25ºC', peso: 0.613, descritor: 'min_margin_norm' },
        { ensaio: 'pH 1% p/p, aquoso, 25ºC', peso: 0.387 },
      ],
    },
    {
      familia: 'Other ethoxylate',
      numProdutos: 7,
      ensaios: [{ ensaio: 'Índice de hidroxila', peso: 0.0 }],
    },
  ],
  acelerado: [
    {
      familia: 'Other ethoxylate',
      numProdutos: 8,
      ensaios: [{ ensaio: 'Índice de hidroxila', peso: 1.0, descritor: 'min_margin_norm' }],
    },
    {
      familia: 'Blend – Crop',
      numProdutos: 13,
      ensaios: [
        { ensaio: 'Cor Gardner, 25ºC', peso: 0.58, descritor: 'min_margin_norm' },
        { ensaio: 'pH 1% p/p, aquoso, 25ºC', peso: 0.42, descritor: 'slope' },
      ],
    },
    {
      familia: 'Alkyl Ester',
      numProdutos: 9,
      ensaios: [
        { ensaio: 'Índice de acidez', peso: 0.4, descritor: 'delta_total' },
        { ensaio: 'Índice de saponificação', peso: 0.369, descritor: 'abs_slope' },
        { ensaio: 'Cor Gardner, 25ºC', peso: 0.231, descritor: 'abs_slope' },
      ],
    },
  ],
  acompanhamento: [
    {
      familia: 'Eth. natural alcohol',
      numProdutos: 11,
      ensaios: [
        { ensaio: 'Índice de hidroxila', peso: 0.551, descritor: 'min_margin_norm' },
        { ensaio: 'Índice de acidez', peso: 0.365, descritor: 'slope' },
        { ensaio: 'pH 1% p/p, aquoso, 25ºC', peso: 0.046 },
        { ensaio: 'Óxido de Eteno, ppm', peso: 0.026 },
        { ensaio: 'Cor Pt-Co, 60ºC', peso: 0.012 },
      ],
    },
    {
      familia: 'Eth. synthetic alcohol',
      numProdutos: 5,
      ensaios: [
        { ensaio: 'Óxido de Eteno, ppm', peso: 0.406, descritor: 'min_margin_norm' },
        { ensaio: 'Índice de hidroxila', peso: 0.328, descritor: 'delta_total' },
        { ensaio: 'Índice de acidez', peso: 0.241, descritor: 'slope' },
        { ensaio: 'Ponto de névoa', peso: 0.008 },
        { ensaio: 'pH', peso: 0.006 },
      ],
    },
    {
      familia: 'Eth. nonyl phenol',
      numProdutos: 5,
      ensaios: [
        { ensaio: 'Cor Pt-Co, 25°C', peso: 0.381, descritor: 'min_margin_norm' },
        { ensaio: 'Índice de acidez', peso: 0.272, descritor: 'delta_total' },
        { ensaio: 'Índice de hidroxila', peso: 0.252, descritor: 'min_margin_norm' },
        { ensaio: 'pH 1%', peso: 0.095, descritor: 'abs_slope' },
      ],
    },
  ],
}

// Tabela 5.2 — XGBoost com limites, sem ensaios de água
export const XGB_COM_SEM_AGUA: WaterTable = {
  longa_duracao: [
    {
      familia: 'Alkyl Ester',
      numProdutos: 9,
      ensaios: [
        { ensaio: 'Índice de saponificação', peso: 0.833, descritor: 'slope' },
        { ensaio: 'Índice de acidez', peso: 0.151, descritor: 'delta_total' },
        { ensaio: 'Cor Gardner, 25ºC', peso: 0.015, descritor: 'abs_slope' },
      ],
    },
    {
      familia: 'Blend – Crop',
      numProdutos: 12,
      ensaios: [
        { ensaio: 'pH 1% p/p, aquoso, 25ºC', peso: 0.536, descritor: 'slope' },
        { ensaio: 'Cor Gardner, 25ºC', peso: 0.464, descritor: 'min_margin_norm' },
      ],
    },
    {
      familia: 'Other ethoxylate',
      numProdutos: 7,
      ensaios: [{ ensaio: 'Índice de hidroxila', peso: 0.0 }],
    },
  ],
  acelerado: [
    {
      familia: 'Other ethoxylate',
      numProdutos: 8,
      ensaios: [{ ensaio: 'Índice de hidroxila', peso: 1.0, descritor: 'delta_total' }],
    },
    {
      familia: 'Alkyl Ester',
      numProdutos: 9,
      ensaios: [
        { ensaio: 'Índice de saponificação', peso: 0.69, descritor: 'min_margin_norm' },
        { ensaio: 'Índice de acidez', peso: 0.195, descritor: 'delta_total' },
        { ensaio: 'Cor Gardner, 25ºC', peso: 0.116, descritor: 'min_margin_norm' },
      ],
    },
    {
      familia: 'Blend – Crop',
      numProdutos: 13,
      ensaios: [
        { ensaio: 'pH 1% p/p, aquoso, 25ºC', peso: 0.547, descritor: 'delta_total' },
        { ensaio: 'Cor Gardner, 25ºC', peso: 0.453, descritor: 'min_margin_norm' },
      ],
    },
  ],
  acompanhamento: [
    {
      familia: 'Eth. nonyl phenol',
      numProdutos: 5,
      ensaios: [{ ensaio: 'Cor Pt-Co, 25°C', peso: 1.0, descritor: 'delta_total' }],
    },
    {
      familia: 'Eth. synthetic alcohol',
      numProdutos: 5,
      ensaios: [
        { ensaio: 'Índice de acidez', peso: 0.523, descritor: 'slope' },
        { ensaio: 'Índice de hidroxila', peso: 0.437, descritor: 'abs_slope' },
        { ensaio: 'Óxido de Eteno, ppm', peso: 0.026 },
      ],
    },
    {
      familia: 'Eth. natural alcohol',
      numProdutos: 11,
      ensaios: [
        { ensaio: 'Índice de hidroxila', peso: 0.404, descritor: 'min_margin_norm' },
        { ensaio: 'Índice de acidez', peso: 0.292, descritor: 'slope' },
        { ensaio: 'Cor Pt-Co, 60ºC', peso: 0.263, descritor: 'delta_total' },
      ],
    },
  ],
}

// Tabela 5.3 — RF sem limites, sem água (só famílias com ≥4 produtos)
export const RF_SEM_SEM_AGUA: WaterTable = {
  longa_duracao: [
    {
      familia: 'Alkyl Ester',
      numProdutos: 9,
      ensaios: [
        { ensaio: 'Índice de saponificação', peso: 0.647 },
        { ensaio: 'Índice de acidez', peso: 0.257 },
      ],
    },
    {
      familia: 'Blend – Crop',
      numProdutos: 12,
      ensaios: [
        { ensaio: 'Sólidos, %p', peso: 0.307 },
        { ensaio: 'pH tal qual', peso: 0.203 },
      ],
    },
    {
      familia: 'Other ethoxylate',
      numProdutos: 7,
      ensaios: [
        { ensaio: 'Índice de hidroxila', peso: 0.65 },
        { ensaio: 'pH 5% p/p, aquoso, 25ºC', peso: 0.35 },
      ],
    },
    {
      familia: 'Alkylether Sulfate',
      numProdutos: 4,
      ensaios: [
        { ensaio: 'Insulfatados, %p', peso: 0.416 },
        { ensaio: 'Cloreto de sódio, %p', peso: 0.293 },
      ],
    },
    {
      familia: 'Polyethylene glycol',
      numProdutos: 4,
      ensaios: [
        { ensaio: 'Índice de acidez', peso: 0.281 },
        { ensaio: 'pH 5% p/p, aquoso, 25ºC', peso: 0.268 },
      ],
    },
  ],
  acelerado: [
    {
      familia: 'Other ethoxylate',
      numProdutos: 8,
      ensaios: [
        { ensaio: 'Índice de hidroxila', peso: 0.901 },
        { ensaio: 'pH 5% p/p, aquoso, 25ºC', peso: 0.099 },
      ],
    },
    {
      familia: 'Alkylether Sulfate',
      numProdutos: 4,
      ensaios: [
        { ensaio: 'Insulfatados, %p', peso: 0.478 },
        { ensaio: 'Cloreto de sódio, %p', peso: 0.299 },
      ],
    },
    {
      familia: 'Polyethylene glycol',
      numProdutos: 4,
      ensaios: [
        { ensaio: 'pH 5% p/p, aquoso, 25ºC', peso: 0.449 },
        { ensaio: 'Índice de acidez', peso: 0.297 },
      ],
    },
    {
      familia: 'EOPO copolymer',
      numProdutos: 4,
      ensaios: [
        { ensaio: 'pH 1% p/p, aquoso, 25ºC', peso: 0.666 },
        { ensaio: 'pH 2,5% aquoso', peso: 0.334 },
      ],
    },
    {
      familia: 'Blend – Crop',
      numProdutos: 13,
      ensaios: [
        { ensaio: 'pH 1% p/p, aquoso, 25ºC', peso: 0.223 },
        { ensaio: 'Sólidos, %p', peso: 0.178 },
      ],
    },
  ],
  acompanhamento: [
    {
      familia: 'Eth. natural alcohol',
      numProdutos: 11,
      ensaios: [
        { ensaio: 'Índice de hidroxila', peso: 0.47 },
        { ensaio: 'Índice de acidez', peso: 0.269 },
      ],
    },
    {
      familia: 'Eth. synthetic alcohol',
      numProdutos: 5,
      ensaios: [
        { ensaio: 'Óxido de Eteno, ppm', peso: 0.453 },
        { ensaio: 'Índice de hidroxila', peso: 0.304 },
      ],
    },
    {
      familia: 'Eth. nonyl phenol',
      numProdutos: 5,
      ensaios: [
        { ensaio: 'Cor Pt-Co, 25°C', peso: 0.336 },
        { ensaio: 'Índice de acidez', peso: 0.27 },
      ],
    },
  ],
}

// Tabela 5.4 — XGBoost sem limites, sem água (famílias com ≥4 produtos)
export const XGB_SEM_SEM_AGUA: WaterTable = {
  longa_duracao: [
    {
      familia: 'Alkyl Ester',
      numProdutos: 9,
      ensaios: [
        { ensaio: 'Índice de saponificação', peso: 0.733 },
        { ensaio: 'Índice de acidez', peso: 0.233 },
      ],
    },
    {
      familia: 'Blend – Crop',
      numProdutos: 12,
      ensaios: [
        { ensaio: 'Sólidos, %p', peso: 0.418 },
        { ensaio: 'Índice de aminas totais, IAT', peso: 0.218 },
      ],
    },
    {
      familia: 'Other ethoxylate',
      numProdutos: 7,
      ensaios: [
        { ensaio: 'pH 5% p/p, aquoso, 25ºC', peso: 0.506 },
        { ensaio: 'Índice de hidroxila', peso: 0.494 },
      ],
    },
    {
      familia: 'Alkylether Sulfate',
      numProdutos: 4,
      ensaios: [{ ensaio: 'Cloreto de sódio, %p', peso: 1.0 }],
    },
    {
      familia: 'EOPO copolymer',
      numProdutos: 4,
      ensaios: [
        { ensaio: 'pH 1% p/p, aquoso, 25ºC', peso: 0.945 },
        { ensaio: 'pH 2,5% aquoso', peso: 0.055 },
      ],
    },
  ],
  acelerado: [
    {
      familia: 'Other ethoxylate',
      numProdutos: 8,
      ensaios: [
        { ensaio: 'Índice de hidroxila', peso: 0.794 },
        { ensaio: 'pH 5% p/p, aquoso, 25ºC', peso: 0.206 },
      ],
    },
    {
      familia: 'Alkyl Ester',
      numProdutos: 9,
      ensaios: [
        { ensaio: 'Índice de saponificação', peso: 0.633 },
        { ensaio: 'Índice de acidez', peso: 0.175 },
      ],
    },
    {
      familia: 'Blend – Crop',
      numProdutos: 13,
      ensaios: [
        { ensaio: 'pH 1% p/p, aquoso, 25ºC', peso: 0.353 },
        { ensaio: 'Índice de aminas totais, IAT', peso: 0.311 },
      ],
    },
    {
      familia: 'Alkylether Sulfate',
      numProdutos: 4,
      ensaios: [
        { ensaio: 'Cloreto de sódio, %p', peso: 0.992 },
        { ensaio: 'Insulfatados, %p', peso: 0.008 },
      ],
    },
    {
      familia: 'EOPO copolymer',
      numProdutos: 4,
      ensaios: [
        { ensaio: 'pH 1% p/p, aquoso, 25ºC', peso: 0.956 },
        { ensaio: 'pH 2,5% aquoso', peso: 0.044 },
      ],
    },
  ],
  acompanhamento: [
    {
      familia: 'Eth. natural alcohol',
      numProdutos: 11,
      ensaios: [
        { ensaio: 'Índice de hidroxila', peso: 0.443 },
        { ensaio: 'Cor Pt-Co, 60ºC', peso: 0.28 },
      ],
    },
    {
      familia: 'Eth. synthetic alcohol',
      numProdutos: 5,
      ensaios: [
        { ensaio: 'Índice de hidroxila', peso: 0.5 },
        { ensaio: 'Índice de acidez', peso: 0.461 },
      ],
    },
    {
      familia: 'Eth. nonyl phenol',
      numProdutos: 5,
      ensaios: [{ ensaio: 'Cor Pt-Co, 25°C', peso: 1.0 }],
    },
  ],
}

export function getWaterTable(model: ModelType, version: Version): WaterTable {
  if (model === 'rf' && version === 'com_limites') return RF_COM_SEM_AGUA
  if (model === 'xgb' && version === 'com_limites') return XGB_COM_SEM_AGUA
  if (model === 'rf' && version === 'sem_limites') return RF_SEM_SEM_AGUA
  return XGB_SEM_SEM_AGUA
}

// Tabela 5.5 — Impacto da exclusão da água (RF com limites)
export type WaterDependencyLevel = 'alta' | 'parcial' | 'independente'

export interface WaterImpactRow {
  cenario: Scenario
  familia: string
  ensaioOriginal: string
  ensaioSemAgua: string
  impacto: string
  dependencia: WaterDependencyLevel
}

export const WATER_IMPACT: WaterImpactRow[] = [
  {
    cenario: 'longa_duracao',
    familia: 'Other ethoxylate',
    ensaioOriginal: 'Água, %p',
    ensaioSemAgua: 'Índice de hidroxila (peso ≈ 0)',
    impacto: 'Alto: ranking praticamente vazio',
    dependencia: 'alta',
  },
  {
    cenario: 'longa_duracao',
    familia: 'Alkyl Ester',
    ensaioOriginal: 'Índice de saponificação',
    ensaioSemAgua: 'Índice de saponificação',
    impacto: 'Baixo: mesmo ensaio líder',
    dependencia: 'independente',
  },
  {
    cenario: 'longa_duracao',
    familia: 'Blend – Crop',
    ensaioOriginal: 'Água, %p',
    ensaioSemAgua: 'Cor Gardner, 25ºC',
    impacto: 'Médio: Cor Gardner emerge',
    dependencia: 'parcial',
  },
  {
    cenario: 'acelerado',
    familia: 'Other ethoxylate',
    ensaioOriginal: 'Água, %p',
    ensaioSemAgua: 'Índice de hidroxila (1,000)',
    impacto: 'Alto: hidroxila assume posição',
    dependencia: 'alta',
  },
  {
    cenario: 'acelerado',
    familia: 'Alkyl Ester',
    ensaioOriginal: 'Índice de acidez',
    ensaioSemAgua: 'Índice de acidez',
    impacto: 'Baixo: mesmo ensaio líder',
    dependencia: 'independente',
  },
  {
    cenario: 'acelerado',
    familia: 'Blend – Crop',
    ensaioOriginal: 'Água, %p',
    ensaioSemAgua: 'Cor Gardner, 25ºC',
    impacto: 'Médio: Cor Gardner emerge',
    dependencia: 'parcial',
  },
  {
    cenario: 'acompanhamento',
    familia: 'Eth. natural alcohol',
    ensaioOriginal: 'Índice de hidroxila',
    ensaioSemAgua: 'Índice de hidroxila',
    impacto: 'Baixo: sem alteração',
    dependencia: 'independente',
  },
  {
    cenario: 'acompanhamento',
    familia: 'Eth. synthetic alcohol',
    ensaioOriginal: 'Óxido de Eteno, ppm',
    ensaioSemAgua: 'Óxido de Eteno, ppm',
    impacto: 'Baixo: sem alteração',
    dependencia: 'independente',
  },
  {
    cenario: 'acompanhamento',
    familia: 'Eth. nonyl phenol',
    ensaioOriginal: 'Cor Pt-Co, 25°C',
    ensaioSemAgua: 'Cor Pt-Co, 25°C',
    impacto: 'Baixo: sem alteração',
    dependencia: 'independente',
  },
]

export const DEPENDENCY_CONFIG: Record<
  WaterDependencyLevel,
  { label: string; color: string; bg: string; description: string }
> = {
  alta: {
    label: 'Alta dependência',
    color: '#b91c1c',
    bg: 'bg-red-50 border-red-200',
    description:
      'A remoção da água deixa o modelo praticamente sem sinal útil — a água era o principal explicador.',
  },
  parcial: {
    label: 'Dependência parcial',
    color: '#b45309',
    bg: 'bg-amber-50 border-amber-200',
    description:
      'Água era o ensaio líder, mas outros ensaios carregam sinal independente substancial.',
  },
  independente: {
    label: 'Independente da água',
    color: '#047857',
    bg: 'bg-emerald-50 border-emerald-200',
    description:
      'Ranking praticamente idêntico com e sem água — ensaios líderes têm poder explicativo autônomo.',
  },
}
