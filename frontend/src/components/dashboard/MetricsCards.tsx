'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils/cn'
import { BarChart3, Calendar, CheckCircle, AlertTriangle } from 'lucide-react'
import type { Metricas } from '@/types'

interface MetricsCardsProps {
  metricas: Metricas | null
  isLoading?: boolean
}

interface AnimatedNumberProps {
  value: number
  suffix?: string
  decimals?: number
}

function AnimatedNumber({ value, suffix = '', decimals = 0 }: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const duration = 1000
    const steps = 60
    const increment = value / steps
    let current = 0
    let step = 0

    const timer = setInterval(() => {
      step++
      current = Math.min(current + increment, value)
      setDisplayValue(current)

      if (step >= steps) {
        setDisplayValue(value)
        clearInterval(timer)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [value])

  return (
    <>
      {decimals > 0 ? displayValue.toFixed(decimals) : Math.round(displayValue)}
      {suffix}
    </>
  )
}

export function MetricsCards({ metricas, isLoading }: MetricsCardsProps) {
  const cards = [
    {
      icon: BarChart3,
      label: 'Ensaios',
      value: metricas?.total_ensaios ?? 0,
      color: 'var(--primary)',
      bgColor: 'rgba(0, 51, 102, 0.1)'
    },
    {
      icon: Calendar,
      label: 'Períodos',
      value: metricas?.total_periodos ?? 0,
      color: 'var(--secondary)',
      bgColor: 'rgba(0, 85, 164, 0.1)'
    },
    {
      icon: CheckCircle,
      label: 'Conformidade',
      value: metricas?.pct_conforme ?? 0,
      suffix: '%',
      decimals: 1,
      color: 'var(--success)',
      bgColor: 'rgba(0, 166, 81, 0.1)',
      detail: metricas ? `${metricas.conformes}/${metricas.total_verificaveis}` : null
    },
    {
      icon: AlertTriangle,
      label: 'Alertas',
      value: metricas?.alertas ?? 0,
      color: metricas?.alertas ? 'var(--danger)' : 'var(--success)',
      bgColor: metricas?.alertas ? 'rgba(200, 16, 46, 0.1)' : 'rgba(0, 166, 81, 0.1)',
      detail: metricas?.alertas ? 'fora da spec' : 'tudo OK'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon

        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              variant="bordered"
              className={cn(
                'p-5 transition-all duration-200',
                'border-l-4 hover:shadow-md hover:-translate-y-0.5'
              )}
              style={{ borderLeftColor: card.color }}
            >
              {isLoading ? (
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg skeleton" />
                  <div className="w-16 h-8 skeleton" />
                  <div className="w-20 h-4 skeleton" />
                </div>
              ) : (
                <>
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                    style={{ backgroundColor: card.bgColor }}
                  >
                    <Icon className="w-5 h-5" style={{ color: card.color }} />
                  </div>

                  <div
                    className="text-3xl font-bold mb-1"
                    style={{ color: card.color }}
                  >
                    <AnimatedNumber
                      value={card.value}
                      suffix={card.suffix}
                      decimals={card.decimals}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                      {card.label}
                    </span>
                    {card.detail && (
                      <span className="text-xs text-[var(--text-muted)]">
                        {card.detail}
                      </span>
                    )}
                  </div>
                </>
              )}
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}
