'use client'

import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { cn } from '@/lib/utils/cn'
import { useDashboardStore } from '@/store/dashboardStore'
import { calcularMetricas } from '@/lib/utils/conformidade'
import { Combobox } from '@/components/ui/Combobox'
import {
  Package,
  FolderTree,
  BarChart3,
  Calendar,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'

export function Sidebar() {
  const {
    filtroTipo,
    setFiltroTipo,
    produtos,
    familias,
    produtoSelecionado,
    setProdutoSelecionado,
    familiaSelecionada,
    setFamiliaSelecionada,
    isLoadingProdutos,
    dadosAcelerado,
    dadosLonga,
    isLoadingDados
  } = useDashboardStore(useShallow(state => ({
    filtroTipo: state.filtroTipo,
    setFiltroTipo: state.setFiltroTipo,
    produtos: state.produtos,
    familias: state.familias,
    produtoSelecionado: state.produtoSelecionado,
    setProdutoSelecionado: state.setProdutoSelecionado,
    familiaSelecionada: state.familiaSelecionada,
    setFamiliaSelecionada: state.setFamiliaSelecionada,
    isLoadingProdutos: state.isLoadingProdutos,
    dadosAcelerado: state.dadosAcelerado,
    dadosLonga: state.dadosLonga,
    isLoadingDados: state.isLoadingDados
  })))

  const produtoOptions = produtos.map(p => ({
    value: p.nome_produto,
    label: p.nome_produto,
    sublabel: p.familia_produtos || undefined
  }))

  const familiaOptions = familias.map(f => ({
    value: f,
    label: f
  }))

  const produtoInfo = produtos.find(p => p.nome_produto === produtoSelecionado)

  const produtosDaFamilia = familiaSelecionada
    ? produtos.filter(p => p.familia_produtos === familiaSelecionada)
    : []

  // Metricas do selecionado
  const metricas = useMemo(() => {
    if (isLoadingDados || (dadosAcelerado.length === 0 && dadosLonga.length === 0)) return null
    return calcularMetricas([...dadosAcelerado, ...dadosLonga])
  }, [dadosAcelerado, dadosLonga, isLoadingDados])

  const temSelecao = filtroTipo === 'produto' ? !!produtoSelecionado : !!familiaSelecionada

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-72 gradient-sidebar border-r-4 border-[var(--accent)] flex flex-col overflow-y-auto">
      {/* Toggle Produto / Familia */}
      <div className="p-4 border-b border-white/10">
        <div className="flex bg-white/10 rounded-lg p-1">
          <button
            onClick={() => setFiltroTipo('produto')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-medium transition-all',
              filtroTipo === 'produto'
                ? 'bg-white/20 text-white shadow-sm'
                : 'text-white/50 hover:text-white/70'
            )}
          >
            <Package className="w-3.5 h-3.5" />
            Produto
          </button>
          <button
            onClick={() => setFiltroTipo('familia')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-medium transition-all',
              filtroTipo === 'familia'
                ? 'bg-white/20 text-white shadow-sm'
                : 'text-white/50 hover:text-white/70'
            )}
          >
            <FolderTree className="w-3.5 h-3.5" />
            Familia
          </button>
        </div>
      </div>

      {/* Seletor de Produto ou Familia */}
      <div className="p-4 border-b border-white/10">
        {filtroTipo === 'produto' ? (
          <>
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

            {produtoInfo && (
              <div className="mt-4 space-y-2">
                {[
                  { label: 'Familia', value: produtoInfo.familia_produtos },
                  { label: 'Etoxilacao', value: produtoInfo.grau_etoxilacao },
                  { label: 'Inicio', value: produtoInfo.data_inicial_estudo }
                ].map(({ label, value }) => value && (
                  <div key={label} className="bg-white/5 rounded-lg p-2">
                    <p className="text-[10px] text-white/40 uppercase">{label}</p>
                    <p className="text-xs text-white/80 truncate">{value}</p>
                  </div>
                ))}

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
          </>
        ) : (
          <>
            <p className="text-xs font-medium text-white/60 uppercase tracking-wider mb-3">
              Familia {familias.length > 0 && `(${familias.length})`}
            </p>
            {isLoadingProdutos ? (
              <div className="flex items-center justify-center py-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              </div>
            ) : (
              <Combobox
                options={familiaOptions}
                value={familiaSelecionada}
                onChange={setFamiliaSelecionada}
                placeholder="Selecione uma familia"
                searchPlaceholder="Buscar familia..."
                emptyMessage="Nenhuma familia encontrada"
              />
            )}

            {familiaSelecionada && (
              <div className="mt-4 space-y-2">
                <div className="bg-white/5 rounded-lg p-2">
                  <p className="text-[10px] text-white/40 uppercase">Produtos na familia</p>
                  <p className="text-xs text-white/80">{produtosDaFamilia.length} produto(s)</p>
                </div>
                {produtosDaFamilia.length > 0 && (
                  <div className="bg-white/5 rounded-lg p-2 max-h-32 overflow-y-auto">
                    <p className="text-[10px] text-white/40 uppercase mb-1">Lista</p>
                    {produtosDaFamilia.map(p => (
                      <p key={p.nome_produto} className="text-[11px] text-white/60 truncate">
                        {p.nome_produto}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Resumo de Metricas */}
      {temSelecao && (
        <div className="p-4 border-b border-white/10">
          <p className="text-xs font-medium text-white/60 uppercase tracking-wider mb-3">
            Resumo
          </p>
          {isLoadingDados ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white/5 rounded-lg p-2 animate-pulse">
                  <div className="h-3 w-16 bg-white/10 rounded mb-1" />
                  <div className="h-4 w-10 bg-white/10 rounded" />
                </div>
              ))}
            </div>
          ) : metricas ? (
            <div className="space-y-2">
              <div className="bg-white/5 rounded-lg p-2.5 flex items-center gap-2.5">
                <BarChart3 className="w-4 h-4 text-[var(--accent)] shrink-0" />
                <div>
                  <p className="text-[10px] text-white/40 uppercase">Ensaios</p>
                  <p className="text-sm font-semibold text-white">{metricas.total_ensaios}</p>
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-2.5 flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-[var(--secondary)] shrink-0" style={{ color: '#0055a4' }} />
                <div>
                  <p className="text-[10px] text-white/40 uppercase">Periodos</p>
                  <p className="text-sm font-semibold text-white">{metricas.total_periodos}</p>
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-2.5 flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 shrink-0" style={{ color: 'var(--success)' }} />
                <div className="flex-1">
                  <p className="text-[10px] text-white/40 uppercase">Conformidade</p>
                  <div className="flex items-baseline gap-1.5">
                    <p className="text-sm font-semibold text-white">{metricas.pct_conforme.toFixed(1)}%</p>
                    <p className="text-[10px] text-white/40">{metricas.conformes}/{metricas.total_verificaveis}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-2.5 flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0" style={{ color: metricas.alertas > 0 ? 'var(--danger)' : 'var(--success)' }} />
                <div>
                  <p className="text-[10px] text-white/40 uppercase">Alertas</p>
                  <p className={cn(
                    'text-sm font-semibold',
                    metricas.alertas > 0 ? 'text-red-400' : 'text-green-400'
                  )}>
                    {metricas.alertas > 0 ? `${metricas.alertas} fora da spec` : 'Tudo OK'}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />
    </aside>
  )
}
