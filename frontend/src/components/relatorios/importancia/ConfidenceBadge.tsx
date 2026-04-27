'use client'

import { Badge } from '@/components/ui/Badge'
import type { ConfidenceLevel } from '@/data/importance-data'

const CONFIG: Record<ConfidenceLevel, { label: string; variant: 'success' | 'warning' | 'neutral' }> = {
  alta: { label: 'Alta confiança', variant: 'success' },
  cautela: { label: 'Cautela', variant: 'warning' },
  exploratorio: { label: 'Exploratório', variant: 'neutral' },
}

export function ConfidenceBadge({ level }: { level: ConfidenceLevel }) {
  const cfg = CONFIG[level]
  return (
    <Badge variant={cfg.variant} size="sm">
      {cfg.label}
    </Badge>
  )
}
