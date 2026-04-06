'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useDashboardStore } from '@/store/dashboardStore'
import { AnalysisChart } from './AnalysisChart'
import { Card, CardContent } from '@/components/ui/Card'
import { AlertTriangle } from 'lucide-react'

interface AnalysisViewProps {
  ensaio: string | null
}

const RETRY_DELAY_MS = 2000
const TRANSIENT_STATUSES = new Set([502, 503, 504])

export function AnalysisView({ ensaio }: AnalysisViewProps) {
  const {
    produtoSelecionado,
    analysisResult,
    analysisStudyType,
    analysisModelName,
    isLoadingAnalysis,
    analysisError,
    showOutliers,
    showProjection,
    setAnalysisResult,
    setIsLoadingAnalysis,
    setAnalysisError,
    cacheAnalysisResult,
  } = useDashboardStore()

  // Ref para ler o cache sem torná-lo dependência reativa do useCallback
  const cacheRef = useRef(useDashboardStore.getState().analysisCache)
  useEffect(() => {
    return useDashboardStore.subscribe(
      (state) => { cacheRef.current = state.analysisCache }
    )
  }, [])

  const fetchAnalysis = useCallback(async (signal: AbortSignal) => {
    if (!produtoSelecionado || !ensaio) return

    const cacheKey = `${produtoSelecionado}|${ensaio}|${analysisStudyType}|${analysisModelName}`

    const cached = cacheRef.current[cacheKey]
    if (cached) {
      setAnalysisResult(cached)
      setAnalysisError(null)
      return
    }

    setIsLoadingAnalysis(true)
    setAnalysisError(null)
    setAnalysisResult(null)

    const doRequest = async () => {
      const response = await fetch('/api/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal,
        body: JSON.stringify({
          nome_produto: produtoSelecionado,
          ensaio_normalizado: ensaio,
          tipo_estudo: analysisStudyType,
          model_name: analysisModelName === 'Auto' ? null : analysisModelName,
        }),
      })
      const data = await response.json()
      return { ok: response.ok, status: response.status, data }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSuccess = (data: any) => {
      setAnalysisResult(data)
      cacheAnalysisResult(cacheKey, data)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleError = (data: any) => {
      setAnalysisError(data?.detail || data?.error || 'Erro na análise')
    }

    try {
      let result = await doRequest()

      // Retry silencioso uma vez para erros transientes (cold start do FastAPI)
      if (!result.ok && TRANSIENT_STATUSES.has(result.status) && !signal.aborted) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS))
        if (!signal.aborted) result = await doRequest()
      }

      if (signal.aborted) return
      result.ok ? handleSuccess(result.data) : handleError(result.data)
    } catch {
      if (signal.aborted) return
      // Erro de rede — uma segunda tentativa após delay
      try {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS))
        if (signal.aborted) return
        const result = await doRequest()
        if (signal.aborted) return
        result.ok ? handleSuccess(result.data) : handleError(result.data)
      } catch {
        if (!signal.aborted) setAnalysisError('Erro ao conectar com o serviço de análise')
      }
    } finally {
      if (!signal.aborted) setIsLoadingAnalysis(false)
    }
  }, [
    produtoSelecionado,
    ensaio,
    analysisStudyType,
    analysisModelName,
    setAnalysisResult,
    setAnalysisError,
    setIsLoadingAnalysis,
    cacheAnalysisResult,
  ])

  useEffect(() => {
    const controller = new AbortController()
    fetchAnalysis(controller.signal)
    return () => controller.abort()
  }, [fetchAnalysis])

  if (!ensaio) {
    return (
      <Card variant="bordered" className="h-[450px]">
        <CardContent className="h-full flex flex-col items-center justify-center">
          <p className="text-[var(--text-secondary)]">
            Selecione um ensaio para iniciar a análise
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Erro — só exibe após loading terminar */}
      {analysisError && !isLoadingAnalysis && (
        <Card variant="bordered" className="border-[var(--danger)]/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-[var(--danger)] shrink-0" />
              <div>
                <p className="font-medium text-sm text-[var(--text-primary)]">Erro na análise</p>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">{analysisError}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {isLoadingAnalysis && (
        <Card variant="bordered" className="h-[450px]">
          <CardContent className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-[var(--analysis)] border-t-transparent rounded-full animate-spin" />
              <p className="text-[var(--text-secondary)]">Processando análise best-fit...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gráfico */}
      {analysisResult && !isLoadingAnalysis && (
        <AnalysisChart result={analysisResult} showOutliers={showOutliers} showProjection={showProjection} />
      )}

    </div>
  )
}
