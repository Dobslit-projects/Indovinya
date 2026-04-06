// ============================================
// Tipos do Banco de Dados
// ============================================

export interface UserProfile {
  id: string
  full_name: string | null
  company: string | null
  role: 'admin' | 'viewer'
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SessionTracking {
  id: string
  user_id: string
  session_start: string
  session_end: string | null
  duration_seconds: number
  pages_visited: string[]
  created_at: string
}

export interface PageEvent {
  id: string
  session_id: string
  user_id: string
  event_type: 'page_view' | 'mode_change' | 'product_select' | 'test_select'
  page_path: string
  metadata: Record<string, unknown>
  timestamp: string
}

// ============================================
// Tipos de Dados do Dashboard
// ============================================

export interface DadosEstudo {
  id: number
  item: number
  codigo_item: string
  nome_produto: string
  descricao_quimica: string | null
  grau_etoxilacao: string | null
  grupo_familia: string | null
  familia_produtos: string | null
  peso_molecular: string | null
  data_inicial_estudo: string | null
  tipo_estudo: 'Acelerado' | 'Longa Duração'
  ensaio: string
  ensaio_normalizado: string
  categoria_ensaio: string
  is_quantitativo: boolean
  metodo: string | null
  especificacao: string | null
  spec_tipo: 'RANGE' | 'MAXIMO' | 'MINIMO' | 'QUALITATIVO' | null
  spec_min: number | null
  spec_max: number | null
  periodo: string
  valor: string | null
  is_menor_que: boolean
  periodo_dias: number
}

export interface Produto {
  nome_produto: string
  codigo_item: string
  descricao_quimica: string | null
  familia_produtos: string | null
  grau_etoxilacao: string | null
  data_inicial_estudo: string | null
  tem_acelerado: boolean
  tem_longa: boolean
}

export interface Ensaio {
  ensaio_normalizado: string
  categoria_ensaio: string
  is_quantitativo: boolean
  metodo: string | null
  especificacao: string | null
  spec_tipo: string | null
  spec_min: number | null
  spec_max: number | null
}

export interface DadosGrafico {
  periodo: string
  periodo_dias: number
  valor: number | null
  is_menor_que: boolean
  tipo_estudo: string
}

export interface Metricas {
  total_ensaios: number
  total_periodos: number
  conformes: number
  total_verificaveis: number
  pct_conforme: number
  alertas: number
}

// ============================================
// Tipos de UI/Estado
// ============================================

export type ModoVisualizacao = 'acelerado' | 'longa' | 'comparar' | 'mesclar' | 'analise'

export interface ModoConfig {
  label: string
  icon: string
  cor: string
  descricao: string
}

export const MODOS_VISUALIZACAO: Record<ModoVisualizacao, ModoConfig> = {
  acelerado: {
    label: 'Acelerado',
    icon: '⚡',
    cor: '#00a3e0',
    descricao: 'Dados de estudo acelerado'
  },
  longa: {
    label: 'Longa Duração',
    icon: '📅',
    cor: '#00a651',
    descricao: 'Dados de estudo de longa duração'
  },
  comparar: {
    label: 'Comparar',
    icon: '⚖️',
    cor: '#f59e0b',
    descricao: 'Comparar lado a lado'
  },
  mesclar: {
    label: 'Mesclar',
    icon: '🔀',
    cor: '#8b5cf6',
    descricao: 'Visualização mesclada'
  },
  analise: {
    label: 'Análise',
    icon: '🔬',
    cor: '#e11d48',
    descricao: 'Análise best-fit e shelf life'
  }
}

// Modos visíveis na navegação (mesclar é interno ao comparar)
export const MODOS_VISIVEIS: ModoVisualizacao[] = ['acelerado', 'longa', 'comparar', 'analise']

export const CATEGORIAS_ENSAIOS = [
  'Composição',
  'Cor',
  'Físico-Químico',
  'Organoléptico',
  'Identificação',
  'Contaminante'
] as const

export type CategoriaEnsaio = typeof CATEGORIAS_ENSAIOS[number]

// ============================================
// Constantes de Período
// ============================================

export const ORDEM_PERIODOS: Record<string, number> = {
  '0 dia': 0,
  '1 sem': 7,
  '2 sem': 14,
  '1m': 30,
  '2m': 60,
  '3m': 90,
  '4m': 120,
  '5m': 150,
  '6m': 180,
  '9m': 270,
  '12m': 365,
  '18m': 545,
  '24m': 730,
  '30m': 912,
  '36m': 1095
}

export const FATOR_NORMALIZACAO = 4

// ============================================
// Cores do Tema
// ============================================

export const COLORS = {
  primary: '#003366',
  primaryDark: '#002244',
  secondary: '#0055a4',
  accent: '#00a3e0',
  success: '#00a651',
  warning: '#f59e0b',
  danger: '#c8102e',
  bgLight: '#f8fafc',
  bgCard: '#ffffff',
  bgDark: '#0a1628',
  textPrimary: '#1e293b',
  textSecondary: '#64748b',
  textMuted: '#94a3b8',
  borderLight: '#e2e8f0',
  analysis: '#e11d48'
}

// ============================================
// Tipos de Análise Best-fit
// ============================================

export interface AnalysisDataPoint {
  periodo: string
  periodo_dias: number
  valor: number
  is_outlier: boolean
}

export interface AnalysisCurvePoint {
  meses: number
  valor: number
  valor_upper: number
  valor_lower: number
}

export interface ModelMetrics {
  adj_r2: number | null
  sigma: number | null
  aic: number | null
}

export interface AnalysisResult {
  data_points: AnalysisDataPoint[]
  model_name: string
  model_params: Record<string, number>
  equation: string
  adj_r2: number
  fitted_curve: AnalysisCurvePoint[]
  projection_curve: AnalysisCurvePoint[]
  shelf_life_months: number | null
  shelf_life_error: number | null
  spec_min: number | null
  spec_max: number | null
  spec_tipo: string | null
  failure_mode: string
  especificacao: string | null
  all_models: Record<string, ModelMetrics>
}
