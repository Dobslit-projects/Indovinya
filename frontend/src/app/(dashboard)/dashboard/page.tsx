'use client'

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDashboardStore } from '@/store/dashboardStore'
import { MetricsCards } from '@/components/dashboard/MetricsCards'
import { ModeToggle } from '@/components/dashboard/ModeToggle'
import { CategoryTabs } from '@/components/dashboard/CategoryTabs'
import { ChartContainer } from '@/components/charts/ChartContainer'
import { calcularMetricas } from '@/lib/utils/conformidade'
import { Package } from 'lucide-react'

export default function DashboardPage() {
  const {
    modo,
    produtoSelecionado,
    dadosAcelerado,
    dadosLonga,
    isLoadingDados,
    isLoadingProdutos
  } = useDashboardStore()

  // Calcular métricas baseado no modo
  const metricas = useMemo(() => {
    if (isLoadingDados) return null

    switch (modo) {
      case 'acelerado':
        return calcularMetricas(dadosAcelerado)
      case 'longa':
        return calcularMetricas(dadosLonga)
      case 'comparar':
      case 'mesclar':
        // Combina dados para métricas gerais
        return calcularMetricas([...dadosAcelerado, ...dadosLonga])
      default:
        return null
    }
  }, [modo, dadosAcelerado, dadosLonga, isLoadingDados])

  // Estado vazio - nenhum produto selecionado
  if (!produtoSelecionado && !isLoadingProdutos) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 rounded-full bg-[var(--bg-light)] flex items-center justify-center mb-6">
          <Package className="w-10 h-10 text-[var(--text-muted)]" />
        </div>
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
          Nenhum produto selecionado
        </h2>
        <p className="text-[var(--text-secondary)] max-w-md">
          Selecione um produto na barra lateral para visualizar os dados de estabilidade.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header com toggle de modo */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">
            Análise de Estabilidade
          </h2>
          <p className="text-[var(--text-secondary)]">
            Visualize e compare dados de estudos de estabilidade
          </p>
        </div>
        <ModeToggle />
      </div>

      {/* Cards de métricas (escondido no modo análise) */}
      {modo !== 'analise' && (
        <MetricsCards metricas={metricas} isLoading={isLoadingDados} />
      )}

      {/* Conteúdo principal com animação */}
      <AnimatePresence mode="wait">
        <motion.div
          key={modo === 'mesclar' ? 'comparar' : modo}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Gráficos */}
          <ChartContainer />

          {/* Tabs de categorias */}
          <div className="mt-6">
            <CategoryTabs />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
