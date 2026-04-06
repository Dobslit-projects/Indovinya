'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Check } from 'lucide-react'
import type { ModelMetrics } from '@/types'

const MODEL_FORMULAS: Record<string, string> = {
  Linear: 'y = a + b·t',
  Exponential: 'y = a·eᵇᵗ',
  Logistic: 'y = L / (1 + e^{−k·(t−t₀)})',
}

const MODEL_ORDER = ['Linear', 'Exponential', 'Logistic'] as const

interface ModelComparisonModalProps {
  allModels: Record<string, ModelMetrics>
  selectedModel: string
  equation?: string
  isAutoSelected: boolean
  onClose: () => void
}

export function ModelComparisonModal({
  allModels,
  selectedModel,
  equation,
  isAutoSelected,
  onClose,
}: ModelComparisonModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const models = MODEL_ORDER.filter((name) => name in allModels)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-[var(--border-light)]">
          <div>
            <h2 className="text-base font-semibold text-[var(--text-primary)]">
              Comparação de Modelos
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
              {isAutoSelected
                ? `Modelo ${selectedModel} selecionado automaticamente — maior R² ajustado entre os candidatos.`
                : `Modelo ${selectedModel} selecionado manualmente pelo usuário.`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="mt-0.5 p-1.5 rounded-lg hover:bg-[var(--bg-light)] transition-colors shrink-0"
          >
            <X className="w-4 h-4 text-[var(--text-muted)]" />
          </button>
        </div>

        {/* Table */}
        <div className="p-6 space-y-2">
          {/* Header row */}
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-3 pb-1">
            <span className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider">
              Modelo
            </span>
            <span className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider text-right">
              R² ajustado
            </span>
            <span className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider text-right">
              σ resíduo
            </span>
            <span className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider text-right w-14">
              Status
            </span>
          </div>

          {models.map((name) => {
            const metrics = allModels[name]
            const isSelected = name === selectedModel
            const failed = metrics.adj_r2 === null

            return (
              <div
                key={name}
                className={`grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-3 py-3 rounded-xl border transition-colors ${
                  isSelected
                    ? 'bg-[var(--analysis)]/[0.05] border-[var(--analysis)]/25'
                    : 'bg-[var(--bg-light)] border-transparent'
                }`}
              >
                {/* Nome + fórmula */}
                <div>
                  <p
                    className={`text-sm font-medium ${
                      isSelected ? 'text-[var(--analysis)]' : 'text-[var(--text-primary)]'
                    }`}
                  >
                    {name}
                  </p>
                  <p className="text-[10px] font-mono text-[var(--text-muted)] mt-0.5">
                    {isSelected && equation ? equation : MODEL_FORMULAS[name]}
                  </p>
                </div>

                {/* R² ajustado */}
                <span
                  className={`text-sm font-mono tabular-nums text-right min-w-[4.5rem] ${
                    isSelected
                      ? 'text-[var(--analysis)] font-semibold'
                      : 'text-[var(--text-primary)]'
                  }`}
                >
                  {failed ? '—' : (metrics.adj_r2?.toFixed(4) ?? '—')}
                </span>

                {/* Sigma */}
                <span className="text-sm font-mono tabular-nums text-[var(--text-secondary)] text-right min-w-[4rem]">
                  {failed ? '—' : (metrics.sigma?.toFixed(4) ?? '—')}
                </span>

                {/* Status */}
                <div className="flex justify-end w-14">
                  {isSelected ? (
                    <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--analysis)]/10 text-[var(--analysis)] whitespace-nowrap">
                      <Check className="w-3 h-3" />
                      {isAutoSelected ? 'Auto' : 'Manual'}
                    </span>
                  ) : failed ? (
                    <span className="text-[10px] text-[var(--text-muted)]">Falhou</span>
                  ) : null}
                </div>
              </div>
            )
          })}

          {/* Nota de rodapé */}
          {isAutoSelected && (
            <p className="pt-2 text-[11px] text-[var(--text-muted)] leading-relaxed">
              Critério de seleção: maior R² ajustado. Em caso de empate, menor AIC (Akaike
              Information Criterion).
            </p>
          )}
        </div>
      </motion.div>
    </div>
  )
}
