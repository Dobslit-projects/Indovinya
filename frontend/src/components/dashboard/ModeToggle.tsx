'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils/cn'
import { useDashboardStore } from '@/store/dashboardStore'
import { MODOS_VISUALIZACAO, MODOS_VISIVEIS, type ModoVisualizacao } from '@/types'
import { Zap, Calendar, Scale, Shuffle, FlaskConical } from 'lucide-react'

const modeIcons: Record<ModoVisualizacao, React.ReactNode> = {
  acelerado: <Zap className="w-5 h-5" />,
  longa: <Calendar className="w-5 h-5" />,
  comparar: <Scale className="w-5 h-5" />,
  mesclar: <Shuffle className="w-5 h-5" />,
  analise: <FlaskConical className="w-5 h-5" />
}

export function ModeToggle() {
  const { modo, setModo } = useDashboardStore()

  return (
    <div className="bg-white rounded-xl p-1.5 shadow-sm border border-[var(--border-light)] inline-flex gap-1">
      {MODOS_VISIVEIS.map((modoKey) => {
        const config = MODOS_VISUALIZACAO[modoKey]
        const isActive = modo === modoKey || (modoKey === 'comparar' && modo === 'mesclar')

        return (
          <motion.button
            key={modoKey}
            onClick={() => setModo(modoKey === 'comparar' && modo === 'mesclar' ? 'comparar' : modoKey)}
            className={cn(
              'relative flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200',
              isActive
                ? 'text-white'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-light)]'
            )}
            whileHover={{ scale: isActive ? 1 : 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <AnimatePresence mode="wait">
              {isActive && (
                <motion.div
                  layoutId="activeModeToggle"
                  className="absolute inset-0 rounded-lg"
                  style={{ backgroundColor: config.cor }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </AnimatePresence>

            <span className="relative z-10">{modeIcons[modoKey]}</span>
            <span className="relative z-10 text-sm font-medium">
              {config.label}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}
