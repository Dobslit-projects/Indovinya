import type { Descriptor, Version } from './importance-data'

export interface DescriptorInfo {
  key: Descriptor
  nome: string
  formula?: string
  definicao: string
  versoes: Version[]
  categoria: 'posicao_inicial' | 'menor_margem' | 'mudanca_tendencia' | 'outros'
}

export const DESCRIPTORS_INFO: DescriptorInfo[] = [
  {
    key: 'slope',
    nome: 'slope',
    definicao:
      'Inclinação da reta ajustada aos pontos do ensaio ao longo do tempo. Positivo = aumento; negativo = queda; próximo de zero = pouca tendência linear.',
    versoes: ['com_limites', 'sem_limites'],
    categoria: 'mudanca_tendencia',
  },
  {
    key: 'abs_slope',
    nome: 'abs_slope',
    definicao:
      'Valor absoluto de slope. Capta a intensidade da mudança ao longo do tempo, independentemente da direção.',
    versoes: ['com_limites', 'sem_limites'],
    categoria: 'mudanca_tendencia',
  },
  {
    key: 'delta_total',
    nome: 'delta_total',
    formula: 'Δ = x_final − x_inicial',
    definicao:
      'Diferença entre o último e o primeiro valor observado. Resume a mudança acumulada total.',
    versoes: ['com_limites', 'sem_limites'],
    categoria: 'mudanca_tendencia',
  },
  {
    key: 'margin0_norm',
    nome: 'margin0_norm',
    formula: 'min(|x₀ − L_min|, |L_max − x₀|) / (L_max − L_min)',
    definicao:
      'Margem inicial normalizada até o limite de especificação. Com limite unilateral, usa-se a distância absoluta.',
    versoes: ['com_limites', 'sem_limites'],
    categoria: 'posicao_inicial',
  },
  {
    key: 'min_margin_norm',
    nome: 'min_margin_norm',
    definicao:
      'Menor margem observada ao longo de toda a série temporal. Captura o momento de maior aproximação aos limites durante o estudo.',
    versoes: ['com_limites', 'sem_limites'],
    categoria: 'menor_margem',
  },
  {
    key: 'oos_any',
    nome: 'oos_any',
    definicao:
      'Variável binária: 0 = nunca saiu de especificação; 1 = saiu em pelo menos um momento.',
    versoes: ['com_limites', 'sem_limites'],
    categoria: 'outros',
  },
  {
    key: 'first_oos_day',
    nome: 'first_oos_day',
    definicao:
      'Primeiro dia em que o ensaio saiu de especificação. Ausente quando o ensaio nunca saiu da faixa.',
    versoes: ['com_limites', 'sem_limites'],
    categoria: 'outros',
  },
  {
    key: 'n_points',
    nome: 'n_points',
    definicao:
      'Número de pontos disponíveis na série temporal (apenas na versão sem limites).',
    versoes: ['sem_limites'],
    categoria: 'outros',
  },
  {
    key: 'value0',
    nome: 'value0',
    definicao: 'Valor inicial observado (apenas na versão sem limites).',
    versoes: ['sem_limites'],
    categoria: 'outros',
  },
  {
    key: 'value_last',
    nome: 'value_last',
    definicao: 'Último valor observado (apenas na versão sem limites).',
    versoes: ['sem_limites'],
    categoria: 'outros',
  },
]

export interface ExclusionReason {
  titulo: string
  descricao: string
}

export const EXCLUSION_REASONS: ExclusionReason[] = [
  {
    titulo: 'Poucos produtos na família',
    descricao: 'O script exige um número mínimo de produtos para que o resultado não fique frágil.',
  },
  {
    titulo: 'Shelf Life sem variação',
    descricao:
      'Se todos os produtos da família tiverem o mesmo shelf life, o modelo não tem o que aprender.',
  },
  {
    titulo: 'Pouca presença de ensaio',
    descricao: 'Um ensaio precisa aparecer em uma fração mínima dos produtos da família.',
  },
  {
    titulo: 'Valores numéricos ausentes',
    descricao:
      'Se Resultado_Numerico estiver muito vazio ou não puder ser convertido corretamente.',
  },
  {
    titulo: 'Poucas medições no tempo',
    descricao:
      'Para calcular inclinação, delta e margens, é preciso histórico temporal suficiente.',
  },
  {
    titulo: 'Ensaios muito esparsos',
    descricao: 'Após filtros, sobram poucas ou nenhuma coluna robusta para modelar.',
  },
  {
    titulo: 'Limites matemáticos ausentes',
    descricao:
      'Descritores como margem ao limite dependem de Limite_Min e Limite_Max definidos.',
  },
]

export const INPUT_STRUCTURE_EXAMPLE = [
  'Água, %p__slope',
  'Água, %p__abs_slope',
  'Água, %p__delta_total',
  'Índice de acidez__slope',
  'Índice de acidez__delta_total',
  'Cor Gardner, 25ºC__min_margin_norm',
  '...',
]

export interface VersionRule {
  aspecto: string
  comLimites: string
  semLimites: string
}

export const VERSION_RULES: VersionRule[] = [
  { aspecto: 'Mín. produtos por família', comLimites: '5', semLimites: '2' },
  { aspecto: 'Mín. presença por ensaio', comLimites: '40%', semLimites: 'Sem restrição' },
  { aspecto: 'Descritores utilizados', comLimites: '7', semLimites: '10' },
  { aspecto: 'Exibe descritor dominante', comLimites: 'Sim', semLimites: 'Não' },
  { aspecto: 'Robustez interpretativa', comLimites: 'Alta', semLimites: 'Variável' },
  { aspecto: 'Cobertura de famílias', comLimites: 'Menor', semLimites: 'Máxima' },
]

export const MODEL_HYPERPARAMS = {
  n_estimators: 200,
  random_state_base: 42,
  repeticoes: 12,
  agregacao: 'Média das importâncias ao longo das 12 repetições (variando a seed).',
}

export interface DescriptorCategory {
  key: 'posicao_inicial' | 'menor_margem' | 'mudanca_tendencia'
  titulo: string
  descritores: Descriptor[]
  descricao: string
  exemplos: string
}

export const DESCRIPTOR_CATEGORIES: DescriptorCategory[] = [
  {
    key: 'posicao_inicial',
    titulo: 'Posição inicial em relação ao limite',
    descritores: ['margin0_norm'],
    descricao:
      'O shelf life se relaciona mais à distância inicial do valor aos limites de especificação do que à velocidade de degradação propriamente dita.',
    exemplos:
      'Other ethoxylate no cenário acelerado com RF e no cenário de longa duração com XGBoost.',
  },
  {
    key: 'menor_margem',
    titulo: 'Menor margem observada',
    descritores: ['min_margin_norm'],
    descricao:
      'O momento em que o ensaio mais se aproximou dos limites durante o estudo carrega o sinal mais relevante sobre o shelf life.',
    exemplos:
      'Cor Gardner em Blend – Crop, e Índice de saponificação em Alkyl Ester no acelerado com XGBoost.',
  },
  {
    key: 'mudanca_tendencia',
    titulo: 'Mudança acumulada e tendência',
    descritores: ['slope', 'abs_slope', 'delta_total'],
    descricao:
      'Direção, intensidade ou variação total ao longo do tempo dominam em famílias com trajetória química progressiva.',
    exemplos: 'Alkyl Ester (degradação química), e Ethoxylated synthetic alcohol (Óxido de Eteno).',
  },
]
