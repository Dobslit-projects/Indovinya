'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Users, FlaskConical, BookOpen, ChevronDown, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { ConfidenceBadge } from './ConfidenceBadge'
import { ImportanceBarChart } from './ImportanceBarChart'
import {
  getConfidenceLevel,
  getEnsaioColor,
  DESCRIPTOR_LABELS,
  type FamilyRanking,
  type ModelType,
  type Scenario,
  type Version,
} from '@/data/importance-data'
import { getNarrative } from '@/data/importance-narratives'

interface FamilyCardProps {
  family: FamilyRanking
  showConfidence?: boolean
  model?: ModelType
  version?: Version
  scenario?: Scenario
}

export function FamilyCard({
  family,
  showConfidence = true,
  model,
  version,
  scenario,
}: FamilyCardProps) {
  const confidence = getConfidenceLevel(family)
  const top = family.ensaios[0]

  const narrative =
    model && version && scenario
      ? getNarrative(model, version, scenario, family.familia)
      : undefined

  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-white rounded-xl border border-[var(--border-light)] p-5 flex flex-col h-full">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] leading-snug">
          {family.familia}
        </h3>
        {showConfidence && <ConfidenceBadge level={confidence} />}
      </div>

      <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] mb-3">
        <span className="inline-flex items-center gap-1">
          <Users className="w-3.5 h-3.5" />
          {family.numProdutos} {family.numProdutos === 1 ? 'produto' : 'produtos'}
        </span>
        <span className="inline-flex items-center gap-1">
          <FlaskConical className="w-3.5 h-3.5" />
          {family.numEnsaiosValidos}{' '}
          {family.numEnsaiosValidos === 1 ? 'ensaio válido' : 'ensaios válidos'}
        </span>
      </div>

      {top && (
        <div className="bg-[var(--bg-light)] rounded-lg p-3 mb-3 border border-[var(--border-light)]">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-2.5 h-2.5 rounded-sm shrink-0"
              style={{ backgroundColor: getEnsaioColor(top.ensaio) }}
            />
            <span className="text-xs font-medium text-[var(--text-primary)] truncate">
              {top.ensaio}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
            <span>
              Descritor:{' '}
              <span className="text-[var(--text-secondary)]">
                {DESCRIPTOR_LABELS[top.descritor]}
              </span>
            </span>
            <span className="font-semibold text-[var(--text-primary)] tabular-nums">
              {(top.peso * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      )}

      <div className="flex-1">
        <ImportanceBarChart ensaios={family.ensaios} />
      </div>

      {narrative && (
        <div className="mt-3 border-t border-[var(--border-light)] pt-3">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="w-full flex items-center justify-between gap-2 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            aria-expanded={expanded}
          >
            <span className="inline-flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              {expanded ? 'Ocultar leitura' : 'Ver leitura'}
            </span>
            <ChevronDown
              className={cn(
                'w-4 h-4 text-[var(--text-muted)] transition-transform',
                expanded && 'rotate-180'
              )}
            />
          </button>

          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="pt-3 text-sm text-[var(--text-secondary)] leading-relaxed">
                  <p>{narrative.leitura}</p>
                  {narrative.alerta && (
                    <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-900 leading-relaxed">
                        {narrative.alerta}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
