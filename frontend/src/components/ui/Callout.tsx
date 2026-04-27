'use client'

import { type ReactNode } from 'react'
import { AlertTriangle, Info, AlertCircle, Lightbulb, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export type CalloutVariant = 'info' | 'warning' | 'critical' | 'note' | 'success'

interface CalloutProps {
  variant?: CalloutVariant
  title?: ReactNode
  icon?: ReactNode
  children: ReactNode
  className?: string
}

const VARIANT_CONFIG: Record<
  CalloutVariant,
  { container: string; icon: ReactNode; title: string }
> = {
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-900',
    icon: <Info className="w-5 h-5 text-blue-600" />,
    title: 'text-blue-900',
  },
  warning: {
    container: 'bg-amber-50 border-amber-200 text-amber-900',
    icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
    title: 'text-amber-900',
  },
  critical: {
    container: 'bg-red-50 border-red-200 text-red-900',
    icon: <AlertCircle className="w-5 h-5 text-red-600" />,
    title: 'text-red-900',
  },
  note: {
    container: 'bg-slate-50 border-slate-200 text-slate-800',
    icon: <Lightbulb className="w-5 h-5 text-slate-500" />,
    title: 'text-slate-900',
  },
  success: {
    container: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
    title: 'text-emerald-900',
  },
}

export function Callout({
  variant = 'info',
  title,
  icon,
  children,
  className,
}: CalloutProps) {
  const config = VARIANT_CONFIG[variant]

  return (
    <div
      className={cn(
        'flex gap-3 rounded-lg border px-4 py-3',
        config.container,
        className
      )}
      role={variant === 'critical' || variant === 'warning' ? 'alert' : undefined}
    >
      <div className="shrink-0 pt-0.5">{icon ?? config.icon}</div>
      <div className="flex-1 min-w-0 text-sm leading-relaxed">
        {title && (
          <div className={cn('font-semibold mb-1', config.title)}>{title}</div>
        )}
        <div className="text-[0.875rem]">{children}</div>
      </div>
    </div>
  )
}
