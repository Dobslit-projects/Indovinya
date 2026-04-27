'use client'

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

type AccordionContextValue = {
  openItems: Set<string>
  toggle: (id: string) => void
  multiple: boolean
}

const AccordionContext = createContext<AccordionContextValue | null>(null)

function useAccordionContext() {
  const ctx = useContext(AccordionContext)
  if (!ctx) throw new Error('Accordion.* must be used inside <Accordion>')
  return ctx
}

interface AccordionProps {
  children: ReactNode
  defaultOpen?: string[]
  multiple?: boolean
  className?: string
}

export function Accordion({
  children,
  defaultOpen = [],
  multiple = false,
  className,
}: AccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(() => new Set(defaultOpen))

  const value = useMemo<AccordionContextValue>(
    () => ({
      openItems,
      multiple,
      toggle: (id: string) => {
        setOpenItems((prev) => {
          const next = new Set(prev)
          const isOpen = next.has(id)
          if (!multiple) next.clear()
          if (isOpen) next.delete(id)
          else next.add(id)
          return next
        })
      },
    }),
    [openItems, multiple]
  )

  return (
    <AccordionContext.Provider value={value}>
      <div className={cn('flex flex-col gap-2', className)}>{children}</div>
    </AccordionContext.Provider>
  )
}

interface AccordionItemProps {
  id: string
  title: ReactNode
  subtitle?: ReactNode
  icon?: ReactNode
  children: ReactNode
  className?: string
}

export function AccordionItem({
  id,
  title,
  subtitle,
  icon,
  children,
  className,
}: AccordionItemProps) {
  const { openItems, toggle } = useAccordionContext()
  const isOpen = openItems.has(id)

  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-[var(--border-light)] overflow-hidden',
        className
      )}
    >
      <button
        type="button"
        onClick={() => toggle(id)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-[var(--bg-light)] transition-colors"
        aria-expanded={isOpen}
      >
        {icon && <div className="shrink-0 text-[var(--text-muted)]">{icon}</div>}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-[var(--text-primary)]">{title}</div>
          {subtitle && (
            <div className="text-xs text-[var(--text-muted)] mt-0.5">{subtitle}</div>
          )}
        </div>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-[var(--text-muted)] shrink-0 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1 border-t border-[var(--border-light)]">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
