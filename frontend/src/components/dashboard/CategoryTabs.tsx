'use client'

import { useMemo, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useDashboardStore } from '@/store/dashboardStore'
import { Card, CardContent } from '@/components/ui/Card'
import { cn } from '@/lib/utils/cn'
import { agruparPorCategoria, verificarConformidade, formatarValor } from '@/lib/utils/conformidade'
import { CATEGORIAS_ENSAIOS, ORDEM_PERIODOS } from '@/types'
import { FolderOpen, CheckCircle, XCircle, Minus } from 'lucide-react'

export function CategoryTabs() {
  const { modo, dadosAcelerado, dadosLonga, ensaioSelecionado, isLoadingDados } = useDashboardStore()
  const selectedRowRef = useRef<HTMLTableRowElement>(null)

  // Dados baseados no modo
  const dados = useMemo(() => {
    switch (modo) {
      case 'acelerado': return dadosAcelerado
      case 'longa': return dadosLonga
      case 'comparar':
      case 'mesclar': return [...dadosAcelerado, ...dadosLonga]
      default: return []
    }
  }, [modo, dadosAcelerado, dadosLonga])

  // Agrupar por categoria
  const dadosPorCategoria = useMemo(() => agruparPorCategoria(dados), [dados])

  // Categorias disponíveis (que têm dados)
  const categoriasDisponiveis = useMemo(() =>
    CATEGORIAS_ENSAIOS.filter(cat => dadosPorCategoria[cat]?.length > 0),
    [dadosPorCategoria]
  )

  // Períodos únicos de TODOS os dados (união) para as colunas
  const periodosUnicos = useMemo(() => {
    const periodos = new Set<string>()
    dados.forEach(d => periodos.add(d.periodo))
    return Array.from(periodos).sort((a, b) =>
      (ORDEM_PERIODOS[a] || 0) - (ORDEM_PERIODOS[b] || 0)
    )
  }, [dados])

  // Scroll para linha selecionada
  useEffect(() => {
    if (selectedRowRef.current) {
      selectedRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [ensaioSelecionado])

  // Não exibir no modo análise
  if (modo === 'analise') return null

  if (isLoadingDados) {
    return (
      <Card variant="bordered">
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 border-3 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (categoriasDisponiveis.length === 0) {
    return (
      <Card variant="bordered">
        <CardContent className="py-12 text-center">
          <FolderOpen className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-4" />
          <p className="text-[var(--text-secondary)]">
            Nenhuma categoria de ensaio disponivel
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card variant="bordered">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--bg-light)]">
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider sticky left-0 bg-[var(--bg-light)] z-10">
                  Ensaio
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  Especificação
                </th>
                {periodosUnicos.map(periodo => (
                  <th
                    key={periodo}
                    className="px-3 py-3 text-center text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider"
                  >
                    {periodo}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-light)]">
              {categoriasDisponiveis.map(categoria => {
                const dadosCategoria = dadosPorCategoria[categoria] || []

                // Agrupar ensaios dentro da categoria
                const ensaiosMap = new Map<string, typeof dados>()
                dadosCategoria.forEach(d => {
                  if (!ensaiosMap.has(d.ensaio_normalizado)) {
                    ensaiosMap.set(d.ensaio_normalizado, [])
                  }
                  ensaiosMap.get(d.ensaio_normalizado)!.push(d)
                })
                const ensaiosCategoria = Array.from(ensaiosMap.entries()).map(([ensaio, items]) => ({
                  ensaio,
                  dados: items.sort((a, b) =>
                    (ORDEM_PERIODOS[a.periodo] || 0) - (ORDEM_PERIODOS[b.periodo] || 0)
                  ),
                  especificacao: items[0]?.especificacao,
                  specTipo: items[0]?.spec_tipo,
                  specMin: items[0]?.spec_min,
                  specMax: items[0]?.spec_max,
                }))

                return [
                  // Cabeçalho de categoria
                  <tr key={`cat-${categoria}`} className="bg-[var(--primary)]/[0.04] border-t-2 border-[var(--primary)]/10">
                    <td colSpan={2 + periodosUnicos.length} className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <FolderOpen className="w-3.5 h-3.5 text-[var(--primary)]" />
                        <span className="text-xs font-semibold text-[var(--primary)] uppercase tracking-wider">
                          {categoria}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)]">
                          ({ensaiosCategoria.length} ensaio{ensaiosCategoria.length !== 1 ? 's' : ''})
                        </span>
                      </div>
                    </td>
                  </tr>,

                  // Linhas de ensaios
                  ...ensaiosCategoria.map((ensaioData, idx) => {
                    const isSelected = ensaioData.ensaio === ensaioSelecionado

                    return (
                      <tr
                        key={`row-${categoria}-${ensaioData.ensaio}`}
                        ref={isSelected ? selectedRowRef : undefined}
                        className={cn(
                          'transition-colors',
                          isSelected
                            ? 'bg-[var(--primary)]/5 ring-1 ring-inset ring-[var(--primary)]/20'
                            : idx % 2 === 0
                              ? 'bg-white hover:bg-[var(--bg-light)]/50'
                              : 'bg-gray-50/50 hover:bg-[var(--bg-light)]/50'
                        )}
                      >
                        <td className={cn(
                          'px-4 py-3 text-sm font-medium sticky left-0 z-10',
                          isSelected
                            ? 'text-[var(--primary)] bg-[var(--primary)]/5'
                            : 'text-[var(--text-primary)] bg-inherit'
                        )}>
                          <div className="flex items-center gap-2">
                            {isSelected && (
                              <motion.div
                                layoutId="selectedEnsaioIndicator"
                                className="w-1 h-5 rounded-full bg-[var(--primary)]"
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                              />
                            )}
                            {ensaioData.ensaio}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-[var(--text-secondary)] max-w-[200px] truncate">
                          {ensaioData.especificacao || '-'}
                        </td>
                        {periodosUnicos.map(periodo => {
                          const dado = ensaioData.dados.find(d => d.periodo === periodo)
                          const status = dado
                            ? verificarConformidade(
                                dado.valor,
                                ensaioData.specTipo,
                                ensaioData.specMin,
                                ensaioData.specMax
                              )
                            : 'na'

                          return (
                            <td key={periodo} className="px-3 py-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <span className={cn(
                                  'text-sm',
                                  status === 'ok' && 'text-[var(--success)]',
                                  status === 'fora' && 'text-[var(--danger)]',
                                  status === 'na' && 'text-[var(--text-muted)]'
                                )}>
                                  {dado ? formatarValor(dado.valor, dado.is_menor_que) : '-'}
                                </span>
                                {status === 'ok' && <CheckCircle className="w-3.5 h-3.5 text-[var(--success)]" />}
                                {status === 'fora' && <XCircle className="w-3.5 h-3.5 text-[var(--danger)]" />}
                                {status === 'na' && dado?.valor && <Minus className="w-3.5 h-3.5 text-[var(--text-muted)]" />}
                              </div>
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })
                ]
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
