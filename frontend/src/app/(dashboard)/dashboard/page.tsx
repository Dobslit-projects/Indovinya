'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDashboardStore } from '@/store/dashboardStore'
import { ModeToggle } from '@/components/dashboard/ModeToggle'
import { ChartContainer } from '@/components/charts/ChartContainer'
import { Package, FolderTree, FlaskConical } from 'lucide-react'

function EnsaiosTab() {
  const {
    modo,
    filtroTipo,
    produtoSelecionado,
    familiaSelecionada,
    isLoadingProdutos
  } = useDashboardStore()

  const temSelecao = filtroTipo === 'produto' ? !!produtoSelecionado : !!familiaSelecionada

  if (!temSelecao && !isLoadingProdutos) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 rounded-full bg-[var(--bg-light)] flex items-center justify-center mb-6">
          {filtroTipo === 'produto'
            ? <Package className="w-10 h-10 text-[var(--text-muted)]" />
            : <FolderTree className="w-10 h-10 text-[var(--text-muted)]" />
          }
        </div>
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
          {filtroTipo === 'produto' ? 'Nenhum produto selecionado' : 'Nenhuma familia selecionada'}
        </h2>
        <p className="text-[var(--text-secondary)] max-w-md">
          {filtroTipo === 'produto'
            ? 'Selecione um produto na barra lateral para visualizar os dados de estabilidade.'
            : 'Selecione uma familia na barra lateral para visualizar a media dos ensaios.'
          }
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">
            {filtroTipo === 'produto' ? 'Analise de Estabilidade' : `Familia: ${familiaSelecionada}`}
          </h2>
          <p className="text-[var(--text-secondary)]">
            {filtroTipo === 'produto'
              ? 'Visualize e compare dados de estudos de estabilidade'
              : 'Media dos ensaios entre os produtos da familia'
            }
          </p>
        </div>
        <ModeToggle />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={modo === 'mesclar' ? 'comparar' : modo}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <ChartContainer />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function AnaliseTab() {
  const {
    filtroTipo,
    produtoSelecionado,
    familiaSelecionada,
    isLoadingProdutos,
    setModo
  } = useDashboardStore()

  // Forcar modo analise quando esta aba esta ativa
  useEffect(() => {
    setModo('analise')
  }, [setModo])

  const temSelecao = filtroTipo === 'produto' ? !!produtoSelecionado : !!familiaSelecionada

  if (!temSelecao && !isLoadingProdutos) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 rounded-full bg-[var(--bg-light)] flex items-center justify-center mb-6">
          <FlaskConical className="w-10 h-10 text-[var(--text-muted)]" />
        </div>
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
          Selecione um {filtroTipo === 'produto' ? 'produto' : 'familia'} para analisar
        </h2>
        <p className="text-[var(--text-secondary)] max-w-md">
          A analise estatistica requer dados carregados. Selecione na barra lateral.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">
          Analise Estatistica
        </h2>
        <p className="text-[var(--text-secondary)]">
          Best-fit, shelf life e projecao
        </p>
      </div>

      <ChartContainer />
    </div>
  )
}

export default function DashboardPage() {
  const { abaAtiva } = useDashboardStore()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={abaAtiva}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        {abaAtiva === 'ensaios' ? <EnsaiosTab /> : <AnaliseTab />}
      </motion.div>
    </AnimatePresence>
  )
}
