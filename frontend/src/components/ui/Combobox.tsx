'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils/cn'
import { Search, ChevronDown, X, Check } from 'lucide-react'

interface ComboboxOption {
  value: string
  label: string
  sublabel?: string
}

interface ComboboxProps {
  options: ComboboxOption[]
  value: string | null
  onChange: (value: string | null) => void
  placeholder?: string
  searchPlaceholder?: string
  className?: string
  emptyMessage?: string
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = 'Selecione...',
  searchPlaceholder = 'Buscar...',
  className,
  emptyMessage = 'Nenhum resultado encontrado'
}: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selectedOption = options.find(opt => opt.value === value)

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(search.toLowerCase()) ||
    opt.sublabel?.toLowerCase().includes(search.toLowerCase())
  )

  // Fechar ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearch('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focar input ao abrir
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
    setSearch('')
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(null)
    setSearch('')
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg',
          'bg-white/10 border border-white/20 text-white',
          'hover:bg-white/15 transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-[var(--accent)]'
        )}
      >
        <span className={cn(
          'truncate text-sm',
          !selectedOption && 'text-white/50'
        )}>
          {selectedOption?.label || placeholder}
        </span>
        <div className="flex items-center gap-1">
          {selectedOption && (
            <span
              role="button"
              onClick={handleClear}
              className="p-0.5 hover:bg-white/20 rounded transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown className={cn(
            'w-4 h-4 transition-transform',
            isOpen && 'rotate-180'
          )} />
        </div>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-[var(--border-light)] overflow-hidden"
          >
            {/* Search input */}
            <div className="p-2 border-b border-[var(--border-light)]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={searchPlaceholder}
                  className={cn(
                    'w-full pl-9 pr-3 py-2 text-sm rounded-md',
                    'bg-[var(--bg-light)] text-[var(--text-primary)]',
                    'placeholder:text-[var(--text-muted)]',
                    'focus:outline-none focus:ring-2 focus:ring-[var(--accent)]'
                  )}
                />
              </div>
            </div>

            {/* Options list */}
            <div className="max-h-60 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-6 text-center text-sm text-[var(--text-muted)]">
                  {emptyMessage}
                </div>
              ) : (
                filteredOptions.map((option) => {
                  const isSelected = option.value === value

                  return (
                    <button
                      key={option.value}
                      onClick={() => handleSelect(option.value)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 text-left',
                        'hover:bg-[var(--bg-light)] transition-colors',
                        isSelected && 'bg-[var(--primary)]/5'
                      )}
                    >
                      <div className={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                        isSelected
                          ? 'border-[var(--primary)] bg-[var(--primary)]'
                          : 'border-[var(--border-light)]'
                      )}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          'text-sm truncate',
                          isSelected ? 'text-[var(--primary)] font-medium' : 'text-[var(--text-primary)]'
                        )}>
                          {option.label}
                        </p>
                        {option.sublabel && (
                          <p className="text-xs text-[var(--text-muted)] truncate">
                            {option.sublabel}
                          </p>
                        )}
                      </div>
                    </button>
                  )
                })
              )}
            </div>

            {/* Footer com contagem */}
            <div className="px-3 py-2 border-t border-[var(--border-light)] bg-[var(--bg-light)]">
              <p className="text-xs text-[var(--text-muted)]">
                {filteredOptions.length} de {options.length} produtos
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
