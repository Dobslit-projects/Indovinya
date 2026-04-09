'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useShallow } from 'zustand/react/shallow'
import { cn } from '@/lib/utils/cn'
import { useDashboardStore } from '@/store/dashboardStore'
import { useAuth } from '@/hooks/useAuth'
import type { AbaAtiva } from '@/types'
import {
  FlaskConical,
  BarChart3,
  LogOut,
  Users,
  ChevronDown,
  TestTubes,
  LayoutDashboard
} from 'lucide-react'

const ABAS: { key: AbaAtiva; label: string; icon: React.ReactNode }[] = [
  { key: 'ensaios', label: 'Ensaios', icon: <TestTubes className="w-4 h-4" /> },
  { key: 'analise', label: 'Analise', icon: <FlaskConical className="w-4 h-4" /> },
]

export function Navbar() {
  const { user, profile, isAdmin, signOut } = useAuth()
  const { abaAtiva, setAbaAtiva } = useDashboardStore(useShallow(state => ({
    abaAtiva: state.abaAtiva,
    setAbaAtiva: state.setAbaAtiva,
  })))

  const pathname = usePathname()
  const router = useRouter()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const isDashboard = pathname === '/dashboard'

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[var(--border-light)] h-16">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Esquerda: Logos (clicaveis - voltam ao dashboard) */}
        <Link href="/dashboard" className="flex items-center gap-4">
          <div className="relative w-28 h-8">
            <Image
              src="/logo-dobslit.png"
              alt="Dobslit"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="h-6 w-px bg-[var(--border-light)]" />
          <div className="relative w-32 h-8">
            <Image
              src="/logo-indorama.png"
              alt="Indorama Ventures"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>

        {/* Centro: Abas */}
        <nav className="flex items-center gap-1 bg-[var(--bg-light)] rounded-xl p-1">
          {ABAS.map((aba) => {
            const isActive = isDashboard && abaAtiva === aba.key
            return (
              <button
                key={aba.key}
                onClick={() => {
                  setAbaAtiva(aba.key)
                  if (!isDashboard) router.push('/dashboard')
                }}
                className={cn(
                  'relative flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'text-[var(--primary)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white rounded-lg shadow-sm"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {aba.icon}
                  {aba.label}
                </span>
              </button>
            )
          })}
        </nav>

        {/* Direita: Avatar + Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-[var(--bg-light)] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-sm font-semibold">
              {profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="text-sm font-medium text-[var(--text-primary)] max-w-[120px] truncate hidden sm:block">
              {profile?.full_name || 'Usuario'}
            </span>
            <ChevronDown className={cn(
              'w-4 h-4 text-[var(--text-muted)] transition-transform',
              dropdownOpen && 'rotate-180'
            )} />
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-[var(--border-light)] overflow-hidden"
              >
                {/* Info do usuario */}
                <div className="px-4 py-3 border-b border-[var(--border-light)]">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                    {profile?.full_name || 'Usuario'}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] truncate">
                    {user?.email}
                  </p>
                  {profile?.company && (
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                      {profile.company}
                    </p>
                  )}
                </div>

                {/* Link voltar ao dashboard (quando fora dele) */}
                {!isDashboard && (
                  <div className="py-1 border-b border-[var(--border-light)]">
                    <Link
                      href="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-light)] transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                  </div>
                )}

                {/* Links admin */}
                {isAdmin && (
                  <div className="py-1 border-b border-[var(--border-light)]">
                    <Link
                      href="/admin"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-light)] transition-colors"
                    >
                      <Users className="w-4 h-4" />
                      Usuarios
                    </Link>
                    <Link
                      href="/admin/analytics"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-light)] transition-colors"
                    >
                      <BarChart3 className="w-4 h-4" />
                      Analytics
                    </Link>
                  </div>
                )}

                {/* Logout */}
                <div className="py-1">
                  <button
                    onClick={() => {
                      setDropdownOpen(false)
                      signOut()
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[var(--danger)] hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sair
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
