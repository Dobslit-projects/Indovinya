'use client'

import { useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

export interface TabItem {
  key: string
  label: ReactNode
  icon?: ReactNode
  disabled?: boolean
}

interface TabsProps {
  items: TabItem[]
  value?: string
  defaultValue?: string
  onChange?: (key: string) => void
  variant?: 'pill' | 'underline'
  size?: 'sm' | 'md'
  className?: string
  layoutId?: string
}

export function Tabs({
  items,
  value,
  defaultValue,
  onChange,
  variant = 'pill',
  size = 'md',
  className,
  layoutId,
}: TabsProps) {
  const [internal, setInternal] = useState(defaultValue ?? items[0]?.key ?? '')
  const active = value ?? internal
  const effectiveLayoutId = layoutId ?? `tabs-${variant}`

  const handleClick = (key: string, disabled?: boolean) => {
    if (disabled) return
    if (value === undefined) setInternal(key)
    onChange?.(key)
  }

  const sizeStyles = size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'

  if (variant === 'underline') {
    return (
      <div
        className={cn(
          'flex items-center gap-1 border-b border-[var(--border-light)]',
          className
        )}
      >
        {items.map((item) => {
          const isActive = item.key === active
          return (
            <button
              key={item.key}
              onClick={() => handleClick(item.key, item.disabled)}
              disabled={item.disabled}
              className={cn(
                'relative flex items-center gap-2 font-medium transition-colors',
                sizeStyles,
                isActive
                  ? 'text-[var(--primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]',
                item.disabled && 'opacity-40 cursor-not-allowed'
              )}
            >
              {item.icon}
              {item.label}
              {isActive && (
                <motion.div
                  layoutId={effectiveLayoutId}
                  className="absolute left-0 right-0 -bottom-px h-0.5 bg-[var(--primary)]"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex items-center gap-1 bg-white border border-[var(--border-light)] rounded-xl p-1 w-fit',
        className
      )}
    >
      {items.map((item) => {
        const isActive = item.key === active
        return (
          <button
            key={item.key}
            onClick={() => handleClick(item.key, item.disabled)}
            disabled={item.disabled}
            className={cn(
              'relative flex items-center gap-2 rounded-lg font-medium transition-colors',
              sizeStyles,
              isActive
                ? 'text-white'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-light)]',
              item.disabled && 'opacity-40 cursor-not-allowed'
            )}
          >
            {isActive && (
              <motion.div
                layoutId={effectiveLayoutId}
                className="absolute inset-0 bg-[var(--primary)] rounded-lg"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {item.icon}
              {item.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
