'use client'

import { useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useDashboardStore } from '@/store/dashboardStore'
import { StabilityLineChart } from './LineChart'
import { MergedChart } from './MergedChart'
import { CompareView } from './CompareView'
import { AnalysisView } from './AnalysisView'
import { ModelComparisonModal } from './ModelComparisonModal'
import { Select } from '@/components/ui/Select'
import { filtrarEnsaiosPlotaveis } from '@/lib/utils/conformidade'
import { Card, CardContent } from '@/components/ui/Card'
import { LineChart, Shuffle, Scale, Clock, AlertTriangle, Info, TrendingUp } from 'lucide-react'

// Animacoes customizadas por transicao
const mergeVariants = {
  initial: { opacity: 0, scale: 0.92, filter: 'blur(8px)' },
  animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
  exit: { opacity: 0, scale: 0.92, filter: 'blur(8px)' }
}

const compareVariants = {
  initial: { opacity: 0, scale: 1.05 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 }
}

const defaultVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

const studyTypeOptions = [
  { value: 'Acelerado', label: 'Acelerado' },
  { value: 'Longa Duração', label: 'Longa Duração' }
]

const MODEL_OPTIONS = ['Auto', 'Linear', 'Exponential', 'Logistic', 'Mean'] as const

function getShelfLifeColor(months: number | null): string {
  if (months === null) return 'var(--text-muted)'
  if (months >= 24) return 'var(--success)'
  if (months >= 12) return 'var(--warning)'
  return 'var(--danger)'
}

function getShelfLifeLabel(months: number | null): string {
  if (months === null) return 'Indeterminado'
  if (months >= 24) return 'Estável'
  if (months >= 12) return 'Atenção'
  return 'Crítico'
}

export function ChartContainer() {
  const {
    modo,
    setModo,
    dadosAcelerado,
    dadosLonga,
    ensaioSelecionado,
    setEnsaioSelecionado,
    isLoadingDados,
    analysisResult,
    analysisStudyType,
    analysisModelName,
    isLoadingAnalysis,
    showProjection,
    setAnalysisStudyType,
    setAnalysisModelName,
    setShowProjection,
  } = useDashboardStore()

  const [showCompareModal, setShowCompareModal] = useState(false)

  const prevModoRef = useRef(modo)

  const isMesclado = modo === 'mesclar'
  const isCompareGroup = modo === 'comparar' || modo === 'mesclar'
  const isAnalise = modo === 'analise'

  // Determinar animacao baseada na transicao
  const getVariants = () => {
    const prev = prevModoRef.current
    prevModoRef.current = modo

    if (prev === 'comparar' && modo === 'mesclar') return mergeVariants
    if (prev === 'mesclar' && modo === 'comparar') return compareVariants
    return defaultVariants
  }

  const variants = getVariants()

  // Obter lista de ensaios disponiveis
  const ensaiosDisponiveis = useMemo(() => {
    const dados = modo === 'acelerado'
      ? dadosAcelerado
      : modo === 'longa'
        ? dadosLonga
        : [...dadosAcelerado, ...dadosLonga]

    return filtrarEnsaiosPlotaveis(dados)
  }, [modo, dadosAcelerado, dadosLonga])

  // Selecionar primeiro ensaio se nenhum selecionado
  const ensaioAtual = ensaioSelecionado ||
    (ensaiosDisponiveis.length > 0 ? ensaiosDisponiveis[0].ensaio_normalizado : null)

  const ensaioOptions = ensaiosDisponiveis.map(e => ({
    value: e.ensaio_normalizado,
    label: `${e.ensaio_normalizado} (${e.categoria_ensaio})`
  }))

  // Shelf life inline
  const shelfLife = analysisResult?.shelf_life_months ?? null
  const shelfLifeError = analysisResult?.shelf_life_error ?? null
  const shelfLifeColor = getShelfLifeColor(shelfLife)
  const shelfLifeLabel = getShelfLifeLabel(shelfLife)

  if (isLoadingDados) {
    return (
      <Card variant="bordered" className="h-[450px]">
        <CardContent className="h-full flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
            <p className="text-[var(--text-secondary)]">Carregando dados...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (ensaiosDisponiveis.length === 0) {
    return (
      <Card variant="bordered" className="h-[450px]">
        <CardContent className="h-full flex flex-col items-center justify-center">
          <LineChart className="w-16 h-16 text-[var(--text-muted)] mb-4" />
          <p className="text-[var(--text-secondary)]">
            Nenhum ensaio disponivel para este produto
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Barra de controles unificada */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-[var(--border-light)] flex-wrap">
        {/* Ensaio */}
        <label className="text-sm font-medium text-[var(--text-secondary)]">
          Ensaio:
        </label>
        <div className="w-72">
          <Select
            options={ensaioOptions}
            value={ensaioAtual || ''}
            onChange={(e) => setEnsaioSelecionado(e.target.value)}
            placeholder="Selecione um ensaio"
          />
        </div>

        {/* Separador visual */}
        {isAnalise && (
          <div className="w-px h-8 bg-[var(--border-light)]" />
        )}

        {/* Tipo de estudo - só no modo análise */}
        {isAnalise && (
          <>
            <label className="text-sm font-medium text-[var(--text-secondary)]">
              Estudo:
            </label>
            <div className="w-40">
              <Select
                options={studyTypeOptions}
                value={analysisStudyType}
                onChange={(e) => setAnalysisStudyType(e.target.value as 'Acelerado' | 'Longa Duração')}
              />
            </div>
          </>
        )}

        {/* Seletor de modelo - só no modo análise */}
        {isAnalise && (
          <>
            <div className="w-px h-8 bg-[var(--border-light)]" />
            <label className="text-sm font-medium text-[var(--text-secondary)]">
              Modelo:
            </label>
            <div className="flex gap-1">
              {MODEL_OPTIONS.map((m) => (
                <button
                  key={m}
                  onClick={() => setAnalysisModelName(m)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border ${
                    analysisModelName === m
                      ? 'bg-[var(--analysis)]/10 text-[var(--analysis)] border-[var(--analysis)]/20'
                      : 'bg-[var(--bg-light)] text-[var(--text-muted)] border-[var(--border-light)] hover:text-[var(--text-secondary)]'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Shelf Life inline - só no modo análise com resultado */}
        {isAnalise && analysisResult && !isLoadingAnalysis && (
          <>
            <div className="w-px h-8 bg-[var(--border-light)]" />
            <motion.div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border"
              style={{
                borderColor: `${shelfLifeColor}30`,
                backgroundColor: `${shelfLifeColor}08`
              }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {shelfLife !== null ? (
                <Clock className="w-4 h-4 shrink-0" style={{ color: shelfLifeColor }} />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0" style={{ color: shelfLifeColor }} />
              )}
              {shelfLife !== null ? (
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  {shelfLife.toFixed(1)}
                  {shelfLifeError !== null && (
                    <span className="font-normal text-[var(--text-secondary)]"> ± {shelfLifeError.toFixed(1)}</span>
                  )}
                  <span className="font-normal text-[var(--text-muted)]"> meses</span>
                </span>
              ) : (
                <span className="text-sm text-[var(--text-secondary)]">Indeterminado</span>
              )}
              <span
                className="text-[10px] font-medium px-1.5 py-0.5 rounded-full uppercase"
                style={{ backgroundColor: `${shelfLifeColor}18`, color: shelfLifeColor }}
              >
                {shelfLifeLabel}
              </span>
              {analysisResult.model_name && (
                <span className="text-[10px] text-[var(--text-muted)] uppercase">
                  {analysisResult.model_name}
                </span>
              )}
              {analysisResult.all_models && (
                <button
                  onClick={() => setShowCompareModal(true)}
                  className="p-0.5 rounded hover:bg-black/[0.06] transition-colors"
                  title="Comparar todos os modelos"
                >
                  <Info className="w-3.5 h-3.5" style={{ color: shelfLifeColor }} />
                </button>
              )}
            </motion.div>
          </>
        )}

        {/* Shelf Life loading skeleton */}
        {isAnalise && isLoadingAnalysis && (
          <>
            <div className="w-px h-8 bg-[var(--border-light)]" />
            <div className="flex items-center gap-2 px-3 py-1.5">
              <div className="w-4 h-4 rounded-full bg-[var(--bg-light)] animate-pulse" />
              <div className="h-4 w-24 bg-[var(--bg-light)] rounded animate-pulse" />
            </div>
          </>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Spec info - modos não-análise */}
        {!isAnalise && ensaioAtual && (
          <span className="text-sm text-[var(--text-muted)]">
            {ensaiosDisponiveis.find(e => e.ensaio_normalizado === ensaioAtual)?.especificacao || 'Sem especificacao'}
          </span>
        )}

        {/* Botao Mesclar/Separar */}
        {isCompareGroup && (
          <motion.button
            onClick={() => setModo(isMesclado ? 'comparar' : 'mesclar')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
              isMesclado
                ? 'bg-[#8b5cf6]/10 text-[#8b5cf6] border-[#8b5cf6]/30'
                : 'bg-[var(--bg-light)] text-[var(--text-muted)] border-[var(--border-light)] hover:text-[var(--text-secondary)]'
            }`}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            layout
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={isMesclado ? 'separar' : 'mesclar'}
                className="flex items-center gap-2"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                {isMesclado ? <Scale className="w-4 h-4" /> : <Shuffle className="w-4 h-4" />}
                {isMesclado ? 'Separar' : 'Mesclar'}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        )}

        {/* Botao Projeção - só no modo análise */}
        {isAnalise && (
          <button
            onClick={() => setShowProjection(!showProjection)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
              showProjection
                ? 'bg-[var(--analysis)]/10 text-[var(--analysis)] border-[var(--analysis)]/20'
                : 'bg-[var(--bg-light)] text-[var(--text-muted)] border-[var(--border-light)]'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Projeção
          </button>
        )}
      </div>

      {/* Modal de comparação de modelos */}
      {showCompareModal && analysisResult?.all_models && (
        <ModelComparisonModal
          allModels={analysisResult.all_models}
          selectedModel={analysisResult.model_name}
          equation={analysisResult.equation}
          isAutoSelected={analysisModelName === 'Auto'}
          onClose={() => setShowCompareModal(false)}
        />
      )}

      {/* Grafico baseado no modo */}
      <AnimatePresence mode="wait">
        {ensaioAtual && (
          <motion.div
            key={`${modo}-${ensaioAtual}`}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{
              duration: (modo === 'mesclar' || modo === 'comparar') ? 0.5 : 0.3,
              ease: [0.4, 0, 0.2, 1]
            }}
          >
            {modo === 'acelerado' && (
              <StabilityLineChart
                dados={dadosAcelerado}
                ensaio={ensaioAtual}
                tipoEstudo="Acelerado"
              />
            )}

            {modo === 'longa' && (
              <StabilityLineChart
                dados={dadosLonga}
                ensaio={ensaioAtual}
                tipoEstudo="Longa Duração"
              />
            )}

            {modo === 'comparar' && (
              <CompareView
                dadosAcelerado={dadosAcelerado}
                dadosLonga={dadosLonga}
                ensaio={ensaioAtual}
              />
            )}

            {modo === 'mesclar' && (
              <MergedChart
                dadosAcelerado={dadosAcelerado}
                dadosLonga={dadosLonga}
                ensaio={ensaioAtual}
              />
            )}

            {modo === 'analise' && (
              <AnalysisView ensaio={ensaioAtual} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
