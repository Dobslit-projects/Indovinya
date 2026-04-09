'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useDashboardStore } from '@/store/dashboardStore'
import { AnalysisChart } from './AnalysisChart'
import { Card, CardContent } from '@/components/ui/Card'
import { AlertTriangle } from 'lucide-react'

interface AnalysisViewProps {
  ensaio: string | null
  /** Se fornecido, usa /api/analysis/custom ao inves de /api/analysis */
  customDataPoints?: { periodo: string; periodo_dias: number; valor: number }[]
  customSpec?: {
    spec_min: number | null
    spec_max: number | null
    spec_tipo: string | null
    especificacao: string | null
  }
}

const RETRY_DELAY_MS = 2000
const TRANSIENT_STATUSES = new Set([502, 503, 504])

export function AnalysisView({ ensaio, customDataPoints, customSpec }: AnalysisViewProps) {
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

  const isCustom = !!customDataPoints

  // Ref para ler o cache sem torna-lo dependencia reativa
  const cacheRef = useRef(useDashboardStore.getState().analysisCache)
  useEffect(() => {
    return useDashboardStore.subscribe(
      (state) => { cacheRef.current = state.analysisCache }
    )
  }, [])

  const fetchAnalysis = useCallback(async (signal: AbortSignal) => {
    if (!ensaio) return

    // Modo custom (media de familia)
    if (isCustom) {
      if (!customDataPoints || customDataPoints.length < 3) return

      const cacheKey = `custom|${ensaio}|${JSON.stringify(customDataPoints.map(d => d.valor))}|${analysisModelName}`
      const cached = cacheRef.current[cacheKey]
      if (cached) {
        setAnalysisResult(cached)
        setAnalysisError(null)
        return
      }

      setIsLoadingAnalysis(true)
      setAnalysisError(null)
      setAnalysisResult(null)

      try {
        const response = await fetch('/api/analysis/custom', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal,
          body: JSON.stringify({
            data_points: customDataPoints.map(d => ({
              periodo: d.periodo,
              periodo_dias: d.periodo_dias,
              valor: d.valor
            })),
            spec_min: customSpec?.spec_min ?? null,
            spec_max: customSpec?.spec_max ?? null,
            spec_tipo: customSpec?.spec_tipo ?? null,
            especificacao: customSpec?.especificacao ?? null,
            model_name: analysisModelName === 'Auto' ? null : analysisModelName,
          }),
        })
        const data = await response.json()
        if (signal.aborted) return

        if (response.ok) {
          setAnalysisResult(data)
          cacheAnalysisResult(cacheKey, data)
        } else {
          setAnalysisError(data?.detail || data?.error || 'Erro na analise')
        }
      } catch {
        if (!signal.aborted) setAnalysisError('Erro ao conectar com o servico de analise')
      } finally {
        if (!signal.aborted) setIsLoadingAnalysis(false)
      }
      return
    }

    // Modo normal (por produto)
    if (!produtoSelecionado) return

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
      setAnalysisError(data?.detail || data?.error || 'Erro na analise')
    }

    try {
      let result = await doRequest()

      if (!result.ok && TRANSIENT_STATUSES.has(result.status) && !signal.aborted) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS))
        if (!signal.aborted) result = await doRequest()
      }

      if (signal.aborted) return
      result.ok ? handleSuccess(result.data) : handleError(result.data)
    } catch {
      if (signal.aborted) return
      try {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS))
        if (signal.aborted) return
        const result = await doRequest()
        if (signal.aborted) return
        result.ok ? handleSuccess(result.data) : handleError(result.data)
      } catch {
        if (!signal.aborted) setAnalysisError('Erro ao conectar com o servico de analise')
      }
    } finally {
      if (!signal.aborted) setIsLoadingAnalysis(false)
    }
  }, [
    produtoSelecionado,
    ensaio,
    analysisStudyType,
    analysisModelName,
    isCustom,
    customDataPoints,
    customSpec,
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
            Selecione um ensaio para iniciar a analise
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {analysisError && !isLoadingAnalysis && (
        <Card variant="bordered" className="border-[var(--danger)]/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-[var(--danger)] shrink-0" />
              <div>
                <p className="font-medium text-sm text-[var(--text-primary)]">Erro na analise</p>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">{analysisError}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoadingAnalysis && (
        <Card variant="bordered" className="h-[450px]">
          <CardContent className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-[var(--analysis)] border-t-transparent rounded-full animate-spin" />
              <p className="text-[var(--text-secondary)]">Processando analise best-fit...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {analysisResult && !isLoadingAnalysis && (
        <AnalysisChart result={analysisResult} showOutliers={showOutliers} showProjection={showProjection} />
      )}
    </div>
  )
}
