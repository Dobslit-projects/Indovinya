'use client'

import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

export type BadgeVariant =
  | 'neutral'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'purple'

export type BadgeSize = 'sm' | 'md'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  size?: BadgeSize
  bordered?: boolean
}

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  primary: 'bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger: 'bg-red-50 text-red-700 border-red-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
}

const SIZE_STYLES: Record<BadgeSize, string> = {
  sm: 'px-1.5 py-0.5 text-[11px]',
  md: 'px-2 py-0.5 text-xs',
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'neutral', size = 'md', bordered = true, children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center gap-1 rounded-md font-medium',
        bordered && 'border',
        VARIANT_STYLES[variant],
        SIZE_STYLES[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
)

Badge.displayName = 'Badge'

export { Badge }
