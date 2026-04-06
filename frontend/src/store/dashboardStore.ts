import { create } from 'zustand'
import type { ModoVisualizacao, Produto, Ensaio, DadosEstudo, AnalysisResult } from '@/types'

interface DashboardState {
  // Seleções
  modo: ModoVisualizacao
  produtoSelecionado: string | null
  ensaioSelecionado: string | null
  categoriaSelecionada: string | null

  // Dados
  produtos: Produto[]
  ensaios: Ensaio[]
  dadosAcelerado: DadosEstudo[]
  dadosLonga: DadosEstudo[]

  // Loading states
  isLoadingProdutos: boolean
  isLoadingDados: boolean

  // Análise best-fit
  analysisResult: AnalysisResult | null
  analysisStudyType: 'Acelerado' | 'Longa Duração'
  analysisModelName: string
  isLoadingAnalysis: boolean
  analysisError: string | null
  showOutliers: boolean
  showProjection: boolean
  analysisCache: Record<string, AnalysisResult>

  // Actions
  setModo: (modo: ModoVisualizacao) => void
  setProdutoSelecionado: (produto: string | null) => void
  setEnsaioSelecionado: (ensaio: string | null) => void
  setCategoriaSelecionada: (categoria: string | null) => void
  setProdutos: (produtos: Produto[]) => void
  setEnsaios: (ensaios: Ensaio[]) => void
  setDadosAcelerado: (dados: DadosEstudo[]) => void
  setDadosLonga: (dados: DadosEstudo[]) => void
  setIsLoadingProdutos: (loading: boolean) => void
  setIsLoadingDados: (loading: boolean) => void
  setAnalysisResult: (result: AnalysisResult | null) => void
  setAnalysisStudyType: (tipo: 'Acelerado' | 'Longa Duração') => void
  setAnalysisModelName: (name: string) => void
  setIsLoadingAnalysis: (loading: boolean) => void
  setAnalysisError: (error: string | null) => void
  setShowOutliers: (show: boolean) => void
  setShowProjection: (show: boolean) => void
  cacheAnalysisResult: (key: string, result: AnalysisResult) => void
  reset: () => void
}

const initialState = {
  modo: 'acelerado' as ModoVisualizacao,
  produtoSelecionado: null,
  ensaioSelecionado: null,
  categoriaSelecionada: null,
  produtos: [],
  ensaios: [],
  dadosAcelerado: [],
  dadosLonga: [],
  isLoadingProdutos: false,
  isLoadingDados: false,
  analysisResult: null,
  analysisStudyType: 'Acelerado' as const,
  analysisModelName: 'Auto',
  isLoadingAnalysis: false,
  analysisError: null,
  showOutliers: true,
  showProjection: true,
  analysisCache: {} as Record<string, AnalysisResult>,
}

export const useDashboardStore = create<DashboardState>((set) => ({
  ...initialState,

  setModo: (modo) => set((state) => ({
    modo,
    ...(state.modo === 'analise' && modo !== 'analise'
      ? { analysisResult: null, analysisError: null }
      : {})
  })),
  setProdutoSelecionado: (produto) => set({
    produtoSelecionado: produto,
    ensaioSelecionado: null,
    analysisCache: {},
    analysisResult: null,
    analysisError: null
  }),
  setEnsaioSelecionado: (ensaio) => set({ ensaioSelecionado: ensaio }),
  setCategoriaSelecionada: (categoria) => set({ categoriaSelecionada: categoria, ensaioSelecionado: null }),
  setProdutos: (produtos) => set({ produtos }),
  setEnsaios: (ensaios) => set({ ensaios }),
  setDadosAcelerado: (dados) => set({ dadosAcelerado: dados }),
  setDadosLonga: (dados) => set({ dadosLonga: dados }),
  setIsLoadingProdutos: (loading) => set({ isLoadingProdutos: loading }),
  setIsLoadingDados: (loading) => set({ isLoadingDados: loading }),
  setAnalysisResult: (result) => set({ analysisResult: result }),
  setAnalysisStudyType: (tipo) => set({ analysisStudyType: tipo }),
  setAnalysisModelName: (name) => set({ analysisModelName: name, analysisResult: null, analysisError: null }),
  setIsLoadingAnalysis: (loading) => set({ isLoadingAnalysis: loading }),
  setAnalysisError: (error) => set({ analysisError: error }),
  setShowOutliers: (show) => set({ showOutliers: show }),
  setShowProjection: (show) => set({ showProjection: show }),
  cacheAnalysisResult: (key, result) => set((state) => ({
    analysisCache: { ...state.analysisCache, [key]: result }
  })),
  reset: () => set(initialState),
}))
