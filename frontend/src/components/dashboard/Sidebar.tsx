'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { useShallow } from 'zustand/react/shallow'
import { cn } from '@/lib/utils/cn'
import { useDashboardStore } from '@/store/dashboardStore'
import { useAuth } from '@/hooks/useAuth'
import { MODOS_VISUALIZACAO, MODOS_VISIVEIS, type ModoVisualizacao } from '@/types'
import { Combobox } from '@/components/ui/Combobox'
import {
  LayoutDashboard,
  Users,
  BarChart3,
  LogOut,
  Zap,
  Calendar,
  Scale,
  Shuffle,
  FlaskConical
} from 'lucide-react'

const modeIcons: Record<ModoVisualizacao, React.ReactNode> = {
  acelerado: <Zap className="w-4 h-4" />,
  longa: <Calendar className="w-4 h-4" />,
  comparar: <Scale className="w-4 h-4" />,
  mesclar: <Shuffle className="w-4 h-4" />,
  analise: <FlaskConical className="w-4 h-4" />
}

export function Sidebar() {
  const pathname = usePathname()
  const { user, profile, isAdmin, signOut } = useAuth()
  const {
    modo,
    setModo,
    produtos,
    produtoSelecionado,
    setProdutoSelecionado,
    isLoadingProdutos
  } = useDashboardStore(useShallow(state => ({
    modo: state.modo,
    setModo: state.setModo,
    produtos: state.produtos,
    produtoSelecionado: state.produtoSelecionado,
    setProdutoSelecionado: state.setProdutoSelecionado,
    isLoadingProdutos: state.isLoadingProdutos
  })))

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ...(isAdmin ? [
      { href: '/admin', label: 'Usuarios', icon: Users },
      { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 }
    ] : [])
  ]

  const produtoOptions = produtos.map(p => ({
    value: p.nome_produto,
    label: p.nome_produto,
    sublabel: p.familia_produtos || undefined
  }))

  const produtoInfo = produtos.find(p => p.nome_produto === produtoSelecionado)

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 gradient-sidebar border-r-4 border-[var(--accent)] flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="relative w-full h-12 mb-2">
          <Image
            src="/logo-dobslit.png"
            alt="Dobslit"
            fill
            className="object-contain"
            priority
          />
        </div>
        <p className="text-xs text-white/60 text-center">
          Dashboard de Estabilidade
        </p>
      </div>

      {/* Seletor de Modo */}
      <div className="p-4 border-b border-white/10">
        <p className="text-xs font-medium text-white/60 uppercase tracking-wider mb-3">
          Modo de Visualização
        </p>
        <div className="grid grid-cols-2 gap-2">
          {MODOS_VISIVEIS.map((modoKey) => {
            const config = MODOS_VISUALIZACAO[modoKey]
            const isActive = modo === modoKey || (modoKey === 'comparar' && modo === 'mesclar')

            return (
              <motion.button
                key={modoKey}
                onClick={() => setModo(modoKey === 'comparar' && modo === 'mesclar' ? 'comparar' : modoKey)}
                className={cn(
                  'relative flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-200',
                  'border-2',
                  isActive
                    ? 'bg-white/15 border-white/40 text-white'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white/80'
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-lg mb-1">{modeIcons[modoKey]}</span>
                <span className="text-xs font-medium">{config.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeMode"
                    className="absolute inset-0 rounded-lg border-2 border-[var(--accent)]"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Seletor de Produto */}
      <div className="p-4 border-b border-white/10">
        <p className="text-xs font-medium text-white/60 uppercase tracking-wider mb-3">
          Produto {produtos.length > 0 && `(${produtos.length})`}
        </p>
        {isLoadingProdutos ? (
          <div className="flex items-center justify-center py-3">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        ) : (
          <Combobox
            options={produtoOptions}
            value={produtoSelecionado}
            onChange={setProdutoSelecionado}
            placeholder="Selecione um produto"
            searchPlaceholder="Buscar produto..."
            emptyMessage="Nenhum produto encontrado"
          />
        )}

        {/* Info do Produto */}
        {produtoInfo && (
          <div className="mt-4 space-y-2">
            {[
              { label: 'Família', value: produtoInfo.familia_produtos },
              { label: 'Etoxilação', value: produtoInfo.grau_etoxilacao },
              { label: 'Início', value: produtoInfo.data_inicial_estudo }
            ].map(({ label, value }) => value && (
              <div key={label} className="bg-white/5 rounded-lg p-2">
                <p className="text-[10px] text-white/40 uppercase">{label}</p>
                <p className="text-xs text-white/80 truncate">{value}</p>
              </div>
            ))}

            {/* Indicadores de disponibilidade */}
            <div className="flex gap-2 mt-3">
              <span className={cn(
                'text-[10px] px-2 py-1 rounded-full',
                produtoInfo.tem_acelerado
                  ? 'bg-[var(--accent)]/20 text-[var(--accent)]'
                  : 'bg-white/10 text-white/30'
              )}>
                Acelerado
              </span>
              <span className={cn(
                'text-[10px] px-2 py-1 rounded-full',
                produtoInfo.tem_longa
                  ? 'bg-[var(--success)]/20 text-[var(--success)]'
                  : 'bg-white/10 text-white/30'
              )}>
                Longa
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Navegação */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-white/15 text-white'
                      : 'text-white/60 hover:bg-white/10 hover:text-white'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Usuário e Logout */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-semibold">
            {profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {profile?.full_name || 'Usuário'}
            </p>
            <p className="text-xs text-white/50 truncate">
              {user?.email}
            </p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm">Sair</span>
        </button>
      </div>
    </aside>
  )
}
