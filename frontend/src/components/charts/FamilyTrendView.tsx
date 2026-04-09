'use client'

import { useMemo, useState, useCallback } from 'react'
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
import { Select } from '@/components/ui/Select'
import { filtrarEnsaiosPlotaveis, valorParaNumero } from '@/lib/utils/conformidade'
import { ORDEM_PERIODOS, COLORS } from '@/types'
import type { DadosEstudo } from '@/types'
import { TrendingUp } from 'lucide-react'

const PRODUCT_COLORS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#f97316', '#eab308',
  '#84cc16', '#22c55e', '#14b8a6', '#06b6d4',
]

interface FamilyTrendViewProps {
  dadosAcelerado: DadosEstudo[]
  dadosLonga: DadosEstudo[]
  familiaNome: string
}

function linearRegression(points: { x: number; y: number }[]) {
  const n = points.length
  if (n < 2) return null

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0
  for (const p of points) {
    sumX += p.x
    sumY += p.y
    sumXY += p.x * p.y
    sumX2 += p.x * p.x
  }

  const denom = n * sumX2 - sumX * sumX
  if (denom === 0) return null

  const slope = (n * sumXY - sumX * sumY) / denom
  const intercept = (sumY - slope * sumX) / n

  const meanY = sumY / n
  let ssTot = 0, ssRes = 0
  for (const p of points) {
    ssTot += (p.y - meanY) ** 2
    ssRes += (p.y - (slope * p.x + intercept)) ** 2
  }
  const r2 = ssTot > 0 ? 1 - ssRes / ssTot : 0

  return { slope, intercept, r2 }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label, hoveredLine }: any) {
  if (!active || !payload) return null

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
            {item.dataKey === '__media__' ? 'Media' : item.dataKey === '__tendencia__' ? 'Tendencia' : item.dataKey}
          </span>
          <span className="text-xs font-semibold text-[var(--text-primary)] ml-auto">
            {item.value != null ? Number(item.value).toFixed(2) : '-'}
          </span>
        </div>
      ))}
    </div>
  )
}

export function FamilyTrendView({ dadosAcelerado, dadosLonga, familiaNome }: FamilyTrendViewProps) {
  const [tipoEstudo, setTipoEstudo] = useState<'Acelerado' | 'Longa Duracao'>('Acelerado')
  const [ensaioSelecionado, setEnsaioSelecionado] = useState<string | null>(null)
  const [showTrend, setShowTrend] = useState(true)
  const [produtosAtivos, setProdutosAtivos] = useState<Set<string> | null>(null)
  const [hoveredLine, setHoveredLine] = useState<string | null>(null)

  const dados = tipoEstudo === 'Acelerado' ? dadosAcelerado : dadosLonga

  const ensaiosDisponiveis = useMemo(() => filtrarEnsaiosPlotaveis(dados), [dados])

  const ensaioAtual = ensaioSelecionado ||
    (ensaiosDisponiveis.length > 0 ? ensaiosDisponiveis[0].ensaio_normalizado : null)

  const ensaioOptions = ensaiosDisponiveis.map(e => ({
    value: e.ensaio_normalizado,
    label: `${e.ensaio_normalizado} (${e.categoria_ensaio})`
  }))

  const studyTypeOptions = [
    { value: 'Acelerado', label: 'Acelerado' },
    { value: 'Longa Duracao', label: 'Longa Duracao' }
  ]

  // Agrupar dados por produto
  const produtosMap = useMemo((): Map<string, { periodo: string; periodoDias: number; valor: number }[]> => {
    if (!ensaioAtual) return new Map<string, { periodo: string; periodoDias: number; valor: number }[]>()
    const dadosEnsaio = dados.filter(d => d.ensaio_normalizado === ensaioAtual)
    const map = new Map<string, { periodo: string; periodoDias: number; valor: number }[]>()
    dadosEnsaio.forEach(d => {
      const valor = valorParaNumero(d.valor)
      if (valor === null) return
      if (!map.has(d.nome_produto)) map.set(d.nome_produto, [])
      map.get(d.nome_produto)!.push({ periodo: d.periodo, periodoDias: d.periodo_dias, valor })
    })
    return map
  }, [dados, ensaioAtual])

  const todosProdutos = useMemo(() => Array.from(produtosMap.keys()).sort(), [produtosMap])
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

  // Preparar dados do grafico
  const { chartData, yMin, yMax, spec, trendLine } = useMemo(() => {
    if (!ensaioAtual) return { chartData: [], yMin: 0, yMax: 100, spec: null, trendLine: null }

    const dadosEnsaio = dados.filter(d => d.ensaio_normalizado === ensaioAtual)
    if (dadosEnsaio.length === 0) return { chartData: [], yMin: 0, yMax: 100, spec: null, trendLine: null }

    const specInfo = dadosEnsaio[0]

    const periodosSet = new Set<string>()
    dadosEnsaio.forEach(d => periodosSet.add(d.periodo))
    const periodos = Array.from(periodosSet).sort(
      (a, b) => (ORDEM_PERIODOS[a] || 0) - (ORDEM_PERIODOS[b] || 0)
    )

    const mediaPoints: { x: number; y: number }[] = []
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

      const media = valoresAtivos.length > 0
        ? valoresAtivos.reduce((a, b) => a + b, 0) / valoresAtivos.length
        : null
      row['__media__'] = media

      if (media !== null) {
        mediaPoints.push({ x: ORDEM_PERIODOS[periodo] || 0, y: media })
      }

      return row
    })

    // Linha de tendencia
    const trend = linearRegression(mediaPoints)

    if (trend && mediaPoints.length >= 2) {
      const maxX = Math.max(...mediaPoints.map(p => p.x))
      const minX = Math.min(...mediaPoints.map(p => p.x))
      const extendedMax = maxX + (maxX - minX) * 0.5

      cData.forEach(row => {
        const dias = row.periodoDias as number
        row['__tendencia__'] = trend.slope * dias + trend.intercept
      })

      const lastPeriodoDias = Math.max(...cData.map(r => r.periodoDias as number))
      if (extendedMax > lastPeriodoDias) {
        const mesesProj = Math.round(extendedMax / 30)
        cData.push({
          periodo: `~${mesesProj}m`,
          periodoDias: extendedMax,
          '__media__': null,
          '__tendencia__': trend.slope * extendedMax + trend.intercept,
          ...Object.fromEntries(todosProdutos.map(p => [p, null]))
        })
      }
    }

    // Dominio Y
    const todosValores: number[] = []
    cData.forEach(row => {
      todosProdutos.forEach(p => { if (typeof row[p] === 'number') todosValores.push(row[p] as number) })
      if (typeof row['__media__'] === 'number') todosValores.push(row['__media__'] as number)
      if (typeof row['__tendencia__'] === 'number') todosValores.push(row['__tendencia__'] as number)
    })

    const specMinVal = specInfo?.spec_min ?? Infinity
    const specMaxVal = specInfo?.spec_max ?? -Infinity
    const minV = Math.min(...todosValores, specMinVal)
    const maxV = Math.max(...todosValores, specMaxVal)
    const margem = (maxV - minV) * 0.1 || 1

    return {
      chartData: cData,
      yMin: Math.floor(minV - margem),
      yMax: Math.ceil(maxV + margem),
      spec: specInfo,
      trendLine: trend
    }
  }, [dados, ensaioAtual, todosProdutos, produtosMap, ativos])

  const cor = tipoEstudo === 'Acelerado' ? COLORS.accent : COLORS.success

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleMouseMove = useCallback((e: any) => {
    if (!e?.activePayload?.length) { setHoveredLine(null); return }
    const chartY = e.chartY
    if (chartY == null) { setHoveredLine(null); return }

    let closest: string | null = null
    let minDist = Infinity
    for (const entry of e.activePayload) {
      if (entry.value == null || entry.dataKey === 'periodo' || entry.dataKey === 'periodoDias') continue
      if (entry.coordinate != null) {
        const dist = Math.abs(entry.coordinate - chartY)
        if (dist < minDist) { minDist = dist; closest = entry.dataKey }
      }
    }
    setHoveredLine(minDist < 30 ? closest : null)
  }, [])

  const handleMouseLeave = useCallback(() => { setHoveredLine(null) }, [])

  if (ensaiosDisponiveis.length === 0) {
    return (
      <Card variant="bordered" className="h-[450px]">
        <CardContent className="h-full flex items-center justify-center">
          <p className="text-[var(--text-secondary)]">Nenhum ensaio disponivel para esta familia</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Controles */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-[var(--border-light)] flex-wrap">
        <label className="text-sm font-medium text-[var(--text-secondary)]">Ensaio:</label>
        <div className="w-72">
          <Select
            options={ensaioOptions}
            value={ensaioAtual || ''}
            onChange={(e) => setEnsaioSelecionado(e.target.value)}
            placeholder="Selecione um ensaio"
          />
        </div>

        <div className="w-px h-8 bg-[var(--border-light)]" />

        <label className="text-sm font-medium text-[var(--text-secondary)]">Estudo:</label>
        <div className="w-40">
          <Select
            options={studyTypeOptions}
            value={tipoEstudo}
            onChange={(e) => setTipoEstudo(e.target.value as 'Acelerado' | 'Longa Duracao')}
          />
        </div>

        <div className="flex-1" />

        {trendLine && (
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <span>R² = {trendLine.r2.toFixed(3)}</span>
          </div>
        )}

        <button
          onClick={() => setShowTrend(!showTrend)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
            showTrend
              ? 'bg-[var(--analysis)]/10 text-[var(--analysis)] border-[var(--analysis)]/20'
              : 'bg-[var(--bg-light)] text-[var(--text-muted)] border-[var(--border-light)]'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Tendencia
        </button>
      </div>

      {/* Grafico */}
      {ensaioAtual && chartData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card variant="bordered">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cor }} />
                Tendencia - {familiaNome} - {ensaioAtual}
              </CardTitle>
              <p className="text-sm text-[var(--text-muted)]">
                {ativos.size}/{todosProdutos.length} produto(s) ativo(s) | Media + tendencia
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={450}>
                <RechartsLineChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                  <XAxis dataKey="periodo" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={{ stroke: 'var(--border-light)' }} />
                  <YAxis domain={[yMin, yMax]} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={{ stroke: 'var(--border-light)' }} />

                  <Tooltip content={<CustomTooltip hoveredLine={hoveredLine} />} />

                  {/* Specs */}
                  {spec?.spec_tipo === 'RANGE' && spec.spec_min !== null && spec.spec_max !== null && (
                    <ReferenceArea y1={spec.spec_min} y2={spec.spec_max} fill={COLORS.success} fillOpacity={0.1} stroke={COLORS.success} strokeOpacity={0.3} />
                  )}
                  {(spec?.spec_tipo === 'MAXIMO' || spec?.spec_tipo === 'RANGE') && spec?.spec_max !== null && (
                    <ReferenceLine y={spec.spec_max} stroke={COLORS.danger} strokeDasharray="5 5" label={{ value: `Max: ${spec.spec_max}`, fill: COLORS.danger, fontSize: 11 }} />
                  )}
                  {(spec?.spec_tipo === 'MINIMO' || spec?.spec_tipo === 'RANGE') && spec?.spec_min !== null && (
                    <ReferenceLine y={spec.spec_min} stroke={COLORS.warning} strokeDasharray="5 5" label={{ value: `Min: ${spec.spec_min}`, fill: COLORS.warning, fontSize: 11 }} />
                  )}

                  {/* Linhas individuais */}
                  {todosProdutos.map((produto, idx) => {
                    if (!ativos.has(produto)) return null
                    const isHovered = hoveredLine === produto
                    const isOtherHovered = hoveredLine !== null && hoveredLine !== produto && hoveredLine !== '__media__' && hoveredLine !== '__tendencia__'

                    return (
                      <Line
                        key={produto}
                        type="monotone"
                        dataKey={produto}
                        name={produto}
                        stroke={PRODUCT_COLORS[idx % PRODUCT_COLORS.length]}
                        strokeWidth={isHovered ? 3 : 1.5}
                        strokeOpacity={isOtherHovered ? 0.15 : isHovered ? 1 : 0.4}
                        dot={{ r: isHovered ? 4 : 2, strokeWidth: 1 }}
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
                    stroke={cor}
                    strokeWidth={hoveredLine === '__media__' ? 4 : hoveredLine !== null ? 2 : 3}
                    strokeOpacity={hoveredLine !== null && hoveredLine !== '__media__' ? 0.3 : 1}
                    dot={{ fill: cor, stroke: 'white', strokeWidth: 2, r: 5 }}
                    connectNulls
                    animationDuration={1000}
                  />

                  {/* Linha de tendencia */}
                  {showTrend && trendLine && (
                    <Line
                      type="linear"
                      dataKey="__tendencia__"
                      name="__tendencia__"
                      stroke={COLORS.analysis}
                      strokeWidth={hoveredLine === '__tendencia__' ? 3 : 2}
                      strokeOpacity={hoveredLine !== null && hoveredLine !== '__tendencia__' ? 0.2 : 1}
                      strokeDasharray="8 4"
                      dot={false}
                      connectNulls
                      animationDuration={600}
                    />
                  )}
                </RechartsLineChart>
              </ResponsiveContainer>

              {/* Legenda clicavel */}
              <div className="flex flex-wrap gap-2 mt-3 px-2">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[var(--bg-light)] border border-[var(--border-light)]">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cor }} />
                  <span className="text-xs font-medium text-[var(--text-primary)]">Media</span>
                </div>
                {showTrend && trendLine && (
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[var(--bg-light)] border border-[var(--border-light)]">
                    <span className="w-2.5 h-0.5" style={{ backgroundColor: COLORS.analysis }} />
                    <span className="text-xs font-medium text-[var(--text-primary)]">Tendencia</span>
                  </div>
                )}
                {todosProdutos.map((produto, idx) => {
                  const isActive = ativos.has(produto)
                  const prodCor = PRODUCT_COLORS[idx % PRODUCT_COLORS.length]
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
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: isActive ? prodCor : '#d1d5db' }} />
                      <span className="truncate max-w-[120px]">{produto}</span>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
