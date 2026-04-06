'use client'

import { motion } from 'framer-motion'
import {
  ComposedChart,
  Line,
  Area,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer
} from 'recharts'
import { Card, CardContent } from '@/components/ui/Card'
import type { AnalysisResult } from '@/types'

interface AnalysisChartProps {
  result: AnalysisResult
  showOutliers: boolean
  showProjection: boolean
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    name: string
    value: number
    color: string
    dataKey: string
  }>
  label?: number
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null

  const filtered = payload.filter(
    entry => !entry.dataKey.startsWith('banda') && !entry.dataKey.startsWith('projBanda')
  )

  return (
    <div className="bg-white rounded-lg shadow-lg border border-[var(--border-light)] p-3 text-sm">
      <p className="font-medium text-[var(--text-primary)] mb-1">
        {label?.toFixed(1)} meses
      </p>
      {filtered.map((entry, index) => (
        <p key={index} style={{ color: entry.color }} className="text-xs">
          {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(4) : entry.value}
        </p>
      ))}
    </div>
  )
}

function ChartLegend({
  showOutliers,
  hasOutliers,
  showProjection,
}: {
  showOutliers: boolean
  hasOutliers: boolean
  showProjection: boolean
}) {
  const items = [
    { label: 'Banda ±σ', type: 'band' as const, color: '#00a3e0' },
    { label: 'Curva ajustada', type: 'line' as const, color: '#00a3e0' },
    { label: 'Dados', type: 'dot' as const, color: '#003366' },
    ...(showProjection ? [{ label: 'Projeção', type: 'dashed' as const, color: '#e11d48' }] : []),
    ...(showOutliers && hasOutliers ? [{ label: 'Outliers', type: 'diamond' as const, color: 'var(--danger)' }] : []),
  ]

  return (
    <div className="flex items-center justify-center gap-5 pt-3 pb-1 border-t border-[var(--border-light)]">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          {item.type === 'band' && (
            <span className="w-5 h-3 rounded-sm opacity-30" style={{ backgroundColor: item.color }} />
          )}
          {item.type === 'line' && (
            <span className="w-5 h-0.5 rounded-full" style={{ backgroundColor: item.color }} />
          )}
          {item.type === 'dashed' && (
            <span className="w-5 flex items-center gap-[2px]">
              <span className="w-1.5 h-0.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="w-1.5 h-0.5 rounded-full" style={{ backgroundColor: item.color }} />
            </span>
          )}
          {item.type === 'dot' && (
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
          )}
          {item.type === 'diamond' && (
            <span className="w-2.5 h-2.5 rotate-45" style={{ backgroundColor: item.color }} />
          )}
          <span className="text-xs text-[var(--text-secondary)]">{item.label}</span>
        </div>
      ))}
    </div>
  )
}

const chartVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
  }
}

const FITTED_DURATION = 500
const PROJ_DELAY = 500
const PROJ_DURATION = 500
const SCATTER_DURATION = 400

export function AnalysisChart({ result, showOutliers, showProjection }: AnalysisChartProps) {
  const {
    data_points,
    fitted_curve,
    projection_curve,
    shelf_life_months,
    spec_min,
    spec_max,
    spec_tipo,
  } = result

  const scatterData = data_points
    .filter(p => showOutliers || !p.is_outlier)
    .map(p => ({
      meses: p.periodo_dias / 30,
      valor: p.valor,
      isOutlier: p.is_outlier,
      periodo: p.periodo
    }))

  const normalPoints = scatterData.filter(p => !p.isOutlier)
  const outlierPoints = scatterData.filter(p => p.isOutlier)

  const fittedData = fitted_curve.map(p => ({
    meses: p.meses,
    fitted: p.valor,
    bandaUpper: p.valor_upper,
    bandaLower: p.valor_lower
  }))

  const projectionData = projection_curve.map(p => ({
    meses: p.meses,
    projection: p.valor,
    projBandaUpper: p.valor_upper,
    projBandaLower: p.valor_lower
  }))

  // Domínio Y — exclui projeção quando oculta
  const allValues = [
    ...data_points.map(p => p.valor),
    ...fitted_curve.map(p => p.valor_upper),
    ...fitted_curve.map(p => p.valor_lower),
    ...(showProjection ? projection_curve.map(p => p.valor_upper) : []),
    ...(showProjection ? projection_curve.map(p => p.valor_lower) : []),
    ...(spec_min !== null ? [spec_min] : []),
    ...(spec_max !== null ? [spec_max] : []),
  ]
  const yMin = Math.min(...allValues) * 0.95
  const yMax = Math.max(...allValues) * 1.05

  // Domínio X — exclui projeção quando oculta
  const allMeses = [
    ...data_points.map(p => p.periodo_dias / 30),
    ...fitted_curve.map(p => p.meses),
    ...(showProjection ? projection_curve.map(p => p.meses) : []),
  ]
  const xMax = Math.max(...allMeses) * 1.05

  const chartHeight = 'calc(100vh - 360px)'

  return (
    <motion.div variants={chartVariants} initial="hidden" animate="visible">
      <Card variant="bordered">
        <CardContent className="p-4">
          <div style={{ width: '100%', height: chartHeight, minHeight: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart margin={{ top: 30, right: 80, left: 15, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                <XAxis
                  dataKey="meses"
                  type="number"
                  domain={[0, xMax]}
                  tickFormatter={(v: number) => `${v.toFixed(0)}m`}
                  label={{ value: 'Meses', position: 'insideBottom', offset: -2, style: { fill: 'var(--text-muted)', fontSize: 12 } }}
                  stroke="var(--text-muted)"
                  fontSize={12}
                />
                <YAxis
                  domain={[yMin, yMax]}
                  stroke="var(--text-muted)"
                  fontSize={12}
                  tickFormatter={(v: number) => v.toFixed(2)}
                />
                <Tooltip content={<CustomTooltip />} />

                {/* Linhas de especificação — seguem spec_tipo (igual LineChart) */}
                {(spec_tipo === 'MAXIMO' || spec_tipo === 'RANGE') && spec_max !== null && (
                  <ReferenceLine
                    y={spec_max}
                    stroke="var(--danger)"
                    strokeDasharray="8 4"
                    label={{ value: `Máx: ${spec_max}`, position: 'right', fill: 'var(--danger)', fontSize: 11 }}
                  />
                )}
                {(spec_tipo === 'MINIMO' || spec_tipo === 'RANGE') && spec_min !== null && (
                  <ReferenceLine
                    y={spec_min}
                    stroke="var(--warning)"
                    strokeDasharray="8 4"
                    label={{ value: `Mín: ${spec_min}`, position: 'right', fill: 'var(--warning)', fontSize: 11 }}
                  />
                )}

                {/* Shelf life vertical */}
                {shelf_life_months !== null && showProjection && (
                  <ReferenceLine
                    x={shelf_life_months}
                    stroke="var(--analysis)"
                    strokeDasharray="6 3"
                    strokeWidth={2}
                    label={{
                      value: `SL: ${shelf_life_months.toFixed(1)}m`,
                      position: 'top',
                      fill: 'var(--analysis)',
                      fontSize: 12,
                      fontWeight: 600
                    }}
                  />
                )}

                {/* Banda de confiança — curva ajustada */}
                <Area
                  data={fittedData}
                  dataKey="bandaUpper"
                  stroke="none"
                  fill="#00a3e0"
                  fillOpacity={0.1}
                  name="Banda ±σ"
                  legendType="none"
                  isAnimationActive={true}
                  animationDuration={FITTED_DURATION}
                  animationEasing="ease-out"
                />
                <Area
                  data={fittedData}
                  dataKey="bandaLower"
                  stroke="none"
                  fill="#ffffff"
                  fillOpacity={1}
                  name=""
                  legendType="none"
                  isAnimationActive={true}
                  animationDuration={FITTED_DURATION}
                  animationEasing="ease-out"
                />

                {/* Banda + linha de projeção (condicional) */}
                {showProjection && (
                  <>
                    <Area
                      data={projectionData}
                      dataKey="projBandaUpper"
                      stroke="none"
                      fill="#e11d48"
                      fillOpacity={0.08}
                      name=""
                      legendType="none"
                      isAnimationActive={true}
                      animationBegin={PROJ_DELAY}
                      animationDuration={PROJ_DURATION}
                      animationEasing="ease-out"
                    />
                    <Area
                      data={projectionData}
                      dataKey="projBandaLower"
                      stroke="none"
                      fill="#ffffff"
                      fillOpacity={1}
                      name=""
                      legendType="none"
                      isAnimationActive={true}
                      animationBegin={PROJ_DELAY}
                      animationDuration={PROJ_DURATION}
                      animationEasing="ease-out"
                    />
                    <Line
                      data={projectionData}
                      dataKey="projection"
                      stroke="#e11d48"
                      strokeWidth={2}
                      strokeDasharray="8 4"
                      dot={false}
                      name="Projeção"
                      legendType="none"
                      isAnimationActive={true}
                      animationBegin={PROJ_DELAY}
                      animationDuration={PROJ_DURATION}
                      animationEasing="ease-out"
                    />
                  </>
                )}

                {/* Curva ajustada (sólida) */}
                <Line
                  data={fittedData}
                  dataKey="fitted"
                  stroke="#00a3e0"
                  strokeWidth={2.5}
                  dot={false}
                  name="Curva ajustada"
                  legendType="none"
                  isAnimationActive={true}
                  animationDuration={FITTED_DURATION}
                  animationEasing="ease-out"
                />

                {/* Pontos normais */}
                <Scatter
                  data={normalPoints}
                  dataKey="valor"
                  fill="#003366"
                  name="Dados"
                  legendType="none"
                  isAnimationActive={true}
                  animationDuration={SCATTER_DURATION}
                />

                {/* Pontos outliers */}
                {showOutliers && outlierPoints.length > 0 && (
                  <Scatter
                    data={outlierPoints}
                    dataKey="valor"
                    fill="var(--danger)"
                    name="Outliers"
                    shape="diamond"
                    legendType="none"
                    isAnimationActive={true}
                    animationDuration={SCATTER_DURATION}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <ChartLegend
            showOutliers={showOutliers}
            hasOutliers={outlierPoints.length > 0}
            showProjection={showProjection}
          />
        </CardContent>
      </Card>
    </motion.div>
  )
}
