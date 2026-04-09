'use client'

import { useState, useMemo, useCallback } from 'react'
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  ReferenceLine
} from 'recharts'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { valorParaNumero } from '@/lib/utils/conformidade'
import { ORDEM_PERIODOS, COLORS } from '@/types'
import type { DadosEstudo } from '@/types'

const PRODUCT_COLORS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#f97316', '#eab308',
  '#84cc16', '#22c55e', '#14b8a6', '#06b6d4',
  '#3b82f6', '#2563eb', '#7c3aed', '#c026d3',
]

interface FamilyOverlayChartProps {
  dados: DadosEstudo[]
  ensaio: string
  tipoEstudo: 'Acelerado' | 'Longa Duracao'
  familiaNome: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label, hoveredLine }: any) {
  if (!active || !payload) return null

  // Se ha uma linha em hover, mostrar so ela
  const items = hoveredLine
    ? payload.filter((p: { dataKey: string }) => p.dataKey === hoveredLine)
    : payload.filter((p: { value: unknown }) => p.value != null)

  if (items.length === 0) return null

  return (
    <div className="bg-white border border-[var(--border-light)] rounded-lg shadow-lg p-3 max-h-[300px] overflow-y-auto">
      <p className="text-xs font-medium text-[var(--text-secondary)] mb-2">Periodo: {label}</p>
      {items.map((item: { dataKey: string; color: string; value: number | null }, i: number) => (
        <div key={i} className="flex items-center gap-2 py-0.5">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
          <span className="text-xs text-[var(--text-secondary)] truncate max-w-[150px]">
            {item.dataKey === '__media__' ? 'Media' : item.dataKey}
          </span>
          <span className="text-xs font-semibold text-[var(--text-primary)] ml-auto">
            {item.value != null ? Number(item.value).toFixed(2) : '-'}
          </span>
        </div>
      ))}
    </div>
  )
}

export function FamilyOverlayChart({ dados, ensaio, tipoEstudo, familiaNome }: FamilyOverlayChartProps) {
  const [produtosAtivos, setProdutosAtivos] = useState<Set<string> | null>(null)
  const [hoveredLine, setHoveredLine] = useState<string | null>(null)

  const dadosEnsaio = dados.filter(d => d.ensaio_normalizado === ensaio)

  // Agrupar dados por produto
  const produtosMap = useMemo(() => {
    const map = new Map<string, { periodo: string; periodoDias: number; valor: number }[]>()
    dadosEnsaio.forEach(d => {
      const valor = valorParaNumero(d.valor)
      if (valor === null) return
      if (!map.has(d.nome_produto)) map.set(d.nome_produto, [])
      map.get(d.nome_produto)!.push({ periodo: d.periodo, periodoDias: d.periodo_dias, valor })
    })
    return map
  }, [dadosEnsaio])

  const todosProdutos = useMemo(() => Array.from(produtosMap.keys()).sort(), [produtosMap])

  // Inicializar ativos na primeira renderizacao
  const ativos = produtosAtivos ?? new Set(todosProdutos)

  const toggleProduto = useCallback((produto: string) => {
    setProdutosAtivos(prev => {
      const current = prev ?? new Set(todosProdutos)
      const next = new Set(current)
      if (next.has(produto)) {
        if (next.size > 1) next.delete(produto)
      } else {
        next.add(produto)
      }
      return next
    })
  }, [todosProdutos])

  // Dados do grafico recalculados com produtos ativos
  const { chartData, yMin, yMax, spec } = useMemo(() => {
    if (dadosEnsaio.length === 0) return { chartData: [], yMin: 0, yMax: 100, spec: null }

    const specInfo = dadosEnsaio[0]

    const periodosSet = new Set<string>()
    dadosEnsaio.forEach(d => periodosSet.add(d.periodo))
    const periodos = Array.from(periodosSet).sort(
      (a, b) => (ORDEM_PERIODOS[a] || 0) - (ORDEM_PERIODOS[b] || 0)
    )

    const cData = periodos.map(periodo => {
      const row: Record<string, string | number | null> = {
        periodo,
        periodoDias: ORDEM_PERIODOS[periodo] || 0,
      }

      const valoresAtivos: number[] = []

      todosProdutos.forEach(produto => {
        const dadosProd = produtosMap.get(produto)!
        const ponto = dadosProd.find(d => d.periodo === periodo)
        const val = ponto?.valor ?? null
        row[produto] = ativos.has(produto) ? val : null
        if (val !== null && ativos.has(produto)) valoresAtivos.push(val)
      })

      row['__media__'] = valoresAtivos.length > 0
        ? valoresAtivos.reduce((a, b) => a + b, 0) / valoresAtivos.length
        : null

      return row
    })

    const todosValores: number[] = []
    cData.forEach(row => {
      todosProdutos.forEach(p => {
        const v = row[p]
        if (typeof v === 'number') todosValores.push(v)
      })
      if (typeof row['__media__'] === 'number') todosValores.push(row['__media__'] as number)
    })

    const specMinVal = specInfo.spec_min ?? Infinity
    const specMaxVal = specInfo.spec_max ?? -Infinity
    const minV = Math.min(...todosValores, specMinVal)
    const maxV = Math.max(...todosValores, specMaxVal)
    const margem = (maxV - minV) * 0.1 || 1

    return {
      chartData: cData,
      yMin: Math.floor(minV - margem),
      yMax: Math.ceil(maxV + margem),
      spec: specInfo
    }
  }, [dadosEnsaio, todosProdutos, produtosMap, ativos])

  // Detectar linha mais proxima ao cursor
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleMouseMove = useCallback((e: any) => {
    if (!e?.activePayload?.length) {
      setHoveredLine(null)
      return
    }

    const chartY = e.chartY
    if (chartY == null) {
      setHoveredLine(null)
      return
    }

    // Encontrar qual linha esta mais proxima do cursor Y
    // activePayload tem os valores no ponto X atual
    let closest: string | null = null
    let minDist = Infinity

    for (const entry of e.activePayload) {
      if (entry.value == null || entry.dataKey === 'periodo' || entry.dataKey === 'periodoDias') continue
      // O coordinate do ponto esta em entry.coordinate (pixel Y)
      // Mas Recharts nao expoe isso diretamente no activePayload
      // Usamos a posicao relativa do valor no dominio Y
      const valPixelY = e.activeCoordinateY
      // Calcular distancia baseada no valor vs cursor
      if (entry.coordinate != null) {
        const dist = Math.abs(entry.coordinate - chartY)
        if (dist < minDist) {
          minDist = dist
          closest = entry.dataKey
        }
      }
    }

    // Fallback: se nao conseguiu por coordinate, usar threshold de proximidade
    if (closest === null && e.activePayload.length > 0) {
      setHoveredLine(null)
      return
    }

    setHoveredLine(minDist < 30 ? closest : null)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setHoveredLine(null)
  }, [])

  if (dadosEnsaio.length === 0) {
    return (
      <Card variant="bordered" className="h-[400px] flex items-center justify-center">
        <p className="text-[var(--text-muted)]">Sem dados disponiveis para esta familia</p>
      </Card>
    )
  }

  const specTipo = spec?.spec_tipo
  const specMin = spec?.spec_min ?? null
  const specMax = spec?.spec_max ?? null
  const corPrincipal = tipoEstudo === 'Acelerado' ? COLORS.accent : COLORS.success

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card variant="bordered">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: corPrincipal }} />
            {familiaNome} - {tipoEstudo === 'Acelerado' ? 'Acelerado' : 'Longa Duracao'} - {ensaio}
          </CardTitle>
          <p className="text-sm text-[var(--text-muted)]">
            {ativos.size}/{todosProdutos.length} produto(s) ativo(s) | Linha grossa = media
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <RechartsLineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />

              <XAxis
                dataKey="periodo"
                tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                axisLine={{ stroke: 'var(--border-light)' }}
              />

              <YAxis
                domain={[yMin, yMax]}
                tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                axisLine={{ stroke: 'var(--border-light)' }}
              />

              <Tooltip
                content={<CustomTooltip hoveredLine={hoveredLine} />}
              />

              {/* Specs */}
              {specTipo === 'RANGE' && specMin !== null && specMax !== null && (
                <ReferenceArea y1={specMin} y2={specMax} fill={COLORS.success} fillOpacity={0.1} stroke={COLORS.success} strokeOpacity={0.3} />
              )}
              {(specTipo === 'MAXIMO' || specTipo === 'RANGE') && specMax !== null && (
                <ReferenceLine y={specMax} stroke={COLORS.danger} strokeDasharray="5 5" label={{ value: `Max: ${specMax}`, fill: COLORS.danger, fontSize: 11 }} />
              )}
              {(specTipo === 'MINIMO' || specTipo === 'RANGE') && specMin !== null && (
                <ReferenceLine y={specMin} stroke={COLORS.warning} strokeDasharray="5 5" label={{ value: `Min: ${specMin}`, fill: COLORS.warning, fontSize: 11 }} />
              )}

              {/* Linhas individuais */}
              {todosProdutos.map((produto, idx) => {
                if (!ativos.has(produto)) return null
                const isHovered = hoveredLine === produto
                const isOtherHovered = hoveredLine !== null && hoveredLine !== produto && hoveredLine !== '__media__'

                return (
                  <Line
                    key={produto}
                    type="monotone"
                    dataKey={produto}
                    name={produto}
                    stroke={PRODUCT_COLORS[idx % PRODUCT_COLORS.length]}
                    strokeWidth={isHovered ? 3 : 1.5}
                    strokeOpacity={isOtherHovered ? 0.15 : isHovered ? 1 : 0.5}
                    dot={{ r: isHovered ? 5 : 3, strokeWidth: 1 }}
                    connectNulls
                    animationDuration={800}
                  />
                )
              })}

              {/* Linha de media */}
              <Line
                type="monotone"
                dataKey="__media__"
                name="__media__"
                stroke={corPrincipal}
                strokeWidth={hoveredLine === '__media__' ? 5 : hoveredLine !== null ? 2 : 4}
                strokeOpacity={hoveredLine !== null && hoveredLine !== '__media__' ? 0.3 : 1}
                dot={{ fill: corPrincipal, stroke: 'white', strokeWidth: 2, r: 6 }}
                activeDot={{ fill: corPrincipal, stroke: 'white', strokeWidth: 2, r: 8 }}
                connectNulls
                animationDuration={1000}
                animationEasing="ease-out"
              />
            </RechartsLineChart>
          </ResponsiveContainer>

          {/* Legenda clicavel */}
          <div className="flex flex-wrap gap-2 mt-3 px-2">
            {/* Media (sempre visivel) */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[var(--bg-light)] border border-[var(--border-light)]">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: corPrincipal }} />
              <span className="text-xs font-medium text-[var(--text-primary)]">Media</span>
            </div>

            {/* Produtos toggleaveis */}
            {todosProdutos.map((produto, idx) => {
              const isActive = ativos.has(produto)
              const cor = PRODUCT_COLORS[idx % PRODUCT_COLORS.length]

              return (
                <button
                  key={produto}
                  onClick={() => toggleProduto(produto)}
                  onMouseEnter={() => setHoveredLine(produto)}
                  onMouseLeave={() => setHoveredLine(null)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-all border ${
                    isActive
                      ? 'bg-white border-[var(--border-light)] text-[var(--text-primary)]'
                      : 'bg-gray-100 border-gray-200 text-gray-400 line-through'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: isActive ? cor : '#d1d5db' }}
                  />
                  <span className="truncate max-w-[120px]">{produto}</span>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
