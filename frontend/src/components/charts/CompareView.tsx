'use client'

import { motion } from 'framer-motion'
import { StabilityLineChart } from './LineChart'
import type { DadosEstudo } from '@/types'

interface CompareViewProps {
  dadosAcelerado: DadosEstudo[]
  dadosLonga: DadosEstudo[]
  ensaio: string
}

export function CompareView({ dadosAcelerado, dadosLonga, ensaio }: CompareViewProps) {
  const hasAcel = dadosAcelerado.some(d => d.ensaio_normalizado === ensaio)
  const hasLong = dadosLonga.some(d => d.ensaio_normalizado === ensaio)

  return (
    <motion.div
      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, gap: '1.5rem' }}
      exit={{ opacity: 0, gap: '0rem' }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Grafico Acelerado */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 80, scale: 0.9 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      >
        {hasAcel ? (
          <StabilityLineChart
            dados={dadosAcelerado}
            ensaio={ensaio}
            tipoEstudo="Acelerado"
            title={`Acelerado - ${ensaio}`}
          />
        ) : (
          <div className="h-[400px] bg-white rounded-xl border border-[var(--border-light)] flex items-center justify-center">
            <p className="text-[var(--text-muted)]">
              Sem dados de estudo acelerado
            </p>
          </div>
        )}
      </motion.div>

      {/* Grafico Longa Duracao */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -80, scale: 0.9 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1], delay: 0.05 }}
      >
        {hasLong ? (
          <StabilityLineChart
            dados={dadosLonga}
            ensaio={ensaio}
            tipoEstudo="Longa Duração"
            title={`Longa Duração - ${ensaio}`}
          />
        ) : (
          <div className="h-[400px] bg-white rounded-xl border border-[var(--border-light)] flex items-center justify-center">
            <p className="text-[var(--text-muted)]">
              Sem dados de estudo de longa duracao
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
