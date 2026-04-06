'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, AlertTriangle, Info, ChevronDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { useDashboardStore } from '@/store/dashboardStore'
import type { AnalysisResult } from '@/types'

interface ShelfLifeCardProps {
  result: AnalysisResult | null
  isLoading: boolean
}

function getBorderColor(months: number | null): string {
  if (months === null) return 'var(--text-muted)'
  if (months >= 24) return 'var(--success)'
  if (months >= 12) return 'var(--warning)'
  return 'var(--danger)'
}

function getLabel(months: number | null): string {
  if (months === null) return 'Indeterminado'
  if (months >= 24) return 'Estável'
  if (months >= 12) return 'Atenção'
  return 'Crítico'
}

// Descrições humanas dos parâmetros por modelo
const PARAM_DESCRIPTIONS: Record<string, Record<string, string>> = {
  Linear: {
    slope: 'variação por mês',
    intercept: 'valor estimado em t = 0',
  },
  Exponential: {
    a: 'valor inicial (t = 0)',
    b: 'taxa de crescimento/decaimento',
  },
  Logistic: {
    L: 'assíntota superior',
    k: 'taxa de transição',
    t0: 'ponto de inflexão (meses)',
  },
  Mean: {
    mean: 'média dos valores observados',
  },
}

const MODEL_FORMULAS: Record<string, string> = {
  Linear:      'y = intercept + slope · t',
  Exponential: 'y = a · eᵇᵗ',
  Logistic:    'y = L / (1 + e^{−k·(t−t₀)})',
  Mean:        'y = constante (sem tendência)',
}

function ModelInfoPanel({
  modelName,
  modelParams,
  equation,
  adjR2,
  sigma,
  selectedByUser,
}: {
  modelName: string
  modelParams: Record<string, number>
  equation: string | undefined
  adjR2: number
  sigma: number | null
  selectedByUser: boolean
}) {
  const descriptions = PARAM_DESCRIPTIONS[modelName] ?? {}
  const formula = equation || MODEL_FORMULAS[modelName]
  const entries = Object.entries(modelParams)

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="overflow-hidden"
    >
      <div className="mt-4 pt-4 border-t border-[var(--border-light)] space-y-3">
        {/* Seleção */}
        <p className="text-xs text-[var(--text-secondary)]">
          {selectedByUser
            ? `Modelo ${modelName} selecionado manualmente.`
            : `Modelo ${modelName} selecionado automaticamente por apresentar o maior R² ajustado entre os candidatos (Linear, Exponential, Logistic).`}
        </p>

        {/* Fórmula */}
        {formula && (
          <p className="text-xs font-mono text-[var(--text-muted)] bg-[var(--bg-light)] px-3 py-1.5 rounded-lg">
            {formula}
          </p>
        )}

        {/* Parâmetros */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          {entries.map(([key, value]) => (
            <div key={key} className="flex flex-col gap-0.5">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-mono font-semibold text-[var(--text-primary)]">
                  {key} = {Number.isFinite(value) ? value.toFixed(4) : '—'}
                </span>
              </div>
              {descriptions[key] && (
                <span className="text-[11px] text-[var(--text-muted)]">
                  {descriptions[key]}
                </span>
              )}
            </div>
          ))}

          {/* Sigma */}
          {sigma !== null && (
            <div className="flex flex-col gap-0.5">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-mono font-semibold text-[var(--text-primary)]">
                  σ = {sigma.toFixed(4)}
                </span>
              </div>
              <span className="text-[11px] text-[var(--text-muted)]">
                desvio padrão dos resíduos
              </span>
            </div>
          )}

          {/* Adj R² */}
          <div className="flex flex-col gap-0.5">
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-mono font-semibold text-[var(--text-primary)]">
                R² aj. = {adjR2.toFixed(4)}
              </span>
            </div>
            <span className="text-[11px] text-[var(--text-muted)]">
              qualidade do ajuste (0 a 1)
            </span>
          </div>
        </div>

        {/* Aviso para Mean */}
        {modelName === 'Mean' && (
          <p className="text-xs text-[var(--warning)] bg-[var(--warning)]/08 px-3 py-2 rounded-lg">
            Nenhuma tendência significativa foi detectada nos dados. O shelf life não pode ser estimado por extrapolação.
          </p>
        )}
      </div>
    </motion.div>
  )
}

export function ShelfLifeCard({ result, isLoading }: ShelfLifeCardProps) {
  const [showInfo, setShowInfo] = useState(false)
  const { analysisModelName } = useDashboardStore()

  if (isLoading) {
    return (
      <Card variant="bordered" className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[var(--bg-light)] animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-6 w-32 bg-[var(--bg-light)] rounded animate-pulse" />
              <div className="h-4 w-48 bg-[var(--bg-light)] rounded animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!result) return null

  const {
    shelf_life_months,
    shelf_life_error,
    model_name,
    model_params,
    equation,
    adj_r2,
    especificacao,
  } = result

  const borderColor = getBorderColor(shelf_life_months)
  const statusLabel = getLabel(shelf_life_months)
  const selectedByUser = analysisModelName !== 'Auto'
  const hasParams = model_params && Object.keys(model_params).length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card
        variant="bordered"
        className="overflow-hidden"
        style={{ borderLeftWidth: '4px', borderLeftColor: borderColor }}
      >
        <CardContent className="p-6">
          {/* Linha principal */}
          <div className="flex items-center gap-4">
            {/* Ícone */}
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${borderColor}15` }}
            >
              {shelf_life_months !== null ? (
                <Clock className="w-6 h-6" style={{ color: borderColor }} />
              ) : (
                <AlertTriangle className="w-6 h-6" style={{ color: borderColor }} />
              )}
            </div>

            {/* Shelf life */}
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                {shelf_life_months !== null ? (
                  <>
                    <span className="text-3xl font-bold text-[var(--text-primary)]">
                      {shelf_life_months.toFixed(1)}
                    </span>
                    {shelf_life_error !== null && (
                      <span className="text-lg text-[var(--text-secondary)]">
                        ± {shelf_life_error.toFixed(1)}
                      </span>
                    )}
                    <span className="text-sm text-[var(--text-secondary)]">meses</span>
                  </>
                ) : (
                  <span className="text-xl font-semibold text-[var(--text-secondary)]">
                    Indeterminado
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${borderColor}15`,
                    color: borderColor,
                  }}
                >
                  {statusLabel}
                </span>
                <span className="text-xs text-[var(--text-muted)]">
                  Modelo {model_name}
                </span>
                {especificacao && (
                  <span className="text-xs text-[var(--text-muted)]">
                    Spec: {especificacao}
                  </span>
                )}
              </div>

              {/* Equação com valores reais — sempre visível */}
              {equation && (
                <p className="text-xs font-mono text-[var(--text-secondary)] bg-[var(--bg-light)] px-3 py-1.5 rounded-lg mt-2">
                  {equation}
                </p>
              )}
            </div>

            {/* Label + botão info */}
            <div className="flex flex-col items-end gap-2 shrink-0">
              <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                Shelf Life
              </p>
              {hasParams && (
                <button
                  onClick={() => setShowInfo((v) => !v)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors border ${
                    showInfo
                      ? 'bg-[var(--analysis)]/10 text-[var(--analysis)] border-[var(--analysis)]/20'
                      : 'bg-[var(--bg-light)] text-[var(--text-muted)] border-[var(--border-light)] hover:text-[var(--text-secondary)]'
                  }`}
                  title="Ver parâmetros do modelo"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>Info</span>
                  <ChevronDown
                    className={`w-3 h-3 transition-transform ${showInfo ? 'rotate-180' : ''}`}
                  />
                </button>
              )}
            </div>
          </div>

          {/* Painel expansível */}
          <AnimatePresence>
            {showInfo && hasParams && (
              <ModelInfoPanel
                modelName={model_name}
                modelParams={model_params}
                equation={equation}
                adjR2={adj_r2 ?? 0}
                sigma={shelf_life_error}
                selectedByUser={selectedByUser}
              />
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}
