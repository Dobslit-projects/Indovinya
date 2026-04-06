'use client'

import Image from 'next/image'
import { useDashboardStore } from '@/store/dashboardStore'
import { MODOS_VISUALIZACAO } from '@/types'

export function Header() {
  const { modo, produtoSelecionado } = useDashboardStore()
  const modoConfig = MODOS_VISUALIZACAO[modo]

  return (
    <header className="bg-white border-b border-[var(--border-light)] px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Logo Indorama */}
          <div className="relative w-40 h-10">
            <Image
              src="/logo-indorama.png"
              alt="Indorama Ventures"
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Separador */}
          <div className="h-8 w-px bg-[var(--border-light)]" />

          {/* Título */}
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">
              Dashboard de Estabilidade
            </h1>
            <p className="text-sm text-[var(--text-secondary)]">
              Indovinya - Especialidades Químicas
            </p>
          </div>
        </div>

        {/* Status atual */}
        <div className="flex items-center gap-4">
          {produtoSelecionado && (
            <div className="px-4 py-2 bg-[var(--bg-light)] rounded-lg">
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
                Produto
              </p>
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                {produtoSelecionado}
              </p>
            </div>
          )}

          <div
            className="px-4 py-2 rounded-lg"
            style={{ backgroundColor: `${modoConfig.cor}15` }}
          >
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
              Modo
            </p>
            <p
              className="text-sm font-semibold flex items-center gap-2"
              style={{ color: modoConfig.cor }}
            >
              <span>{modoConfig.icon}</span>
              {modoConfig.label}
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
