'use client'

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceArea,
  ReferenceLine
} from 'recharts'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { valorParaNumero } from '@/lib/utils/conformidade'
import { ORDEM_PERIODOS, COLORS } from '@/types'
import type { DadosEstudo } from '@/types'

interface LineChartProps {
  dados: DadosEstudo[]
  ensaio: string
  tipoEstudo: 'Acelerado' | 'Longa Duração'
  title?: string
}

export function StabilityLineChart({ dados, ensaio, tipoEstudo, title }: LineChartProps) {
  // Filtrar dados do ensaio selecionado
  const dadosEnsaio = dados.filter(d => d.ensaio_normalizado === ensaio)

  if (dadosEnsaio.length === 0) {
    return (
      <Card variant="bordered" className="h-[400px] flex items-center justify-center">
        <p className="text-[var(--text-muted)]">Sem dados disponíveis</p>
      </Card>
    )
  }

  // Extrair especificação
  const spec = dadosEnsaio[0]
  const specTipo = spec.spec_tipo
  const specMin = spec.spec_min
  const specMax = spec.spec_max

  // Preparar dados para o gráfico
  const chartData = dadosEnsaio
    .map(d => ({
      periodo: d.periodo,
      periodoLabel: d.periodo,
      periodoDias: d.periodo_dias,
      valor: valorParaNumero(d.valor),
      isMenorQue: d.is_menor_que,
      valorOriginal: d.valor
    }))
    .filter(d => d.valor !== null)
    .sort((a, b) => (ORDEM_PERIODOS[a.periodo] || 0) - (ORDEM_PERIODOS[b.periodo] || 0))

  // Calcular domínio Y com margem
  const valores = chartData.map(d => d.valor).filter((v): v is number => v !== null)
  const minValor = Math.min(...valores, specMin ?? Infinity)
  const maxValor = Math.max(...valores, specMax ?? -Infinity)
  const margem = (maxValor - minValor) * 0.1 || 1
  const yMin = Math.floor(minValor - margem)
  const yMax = Math.ceil(maxValor + margem)

  // Cor baseada no tipo de estudo
  const cor = tipoEstudo === 'Acelerado' ? COLORS.accent : COLORS.success

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card variant="bordered">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: cor }}
            />
            {title || `${tipoEstudo} - ${ensaio}`}
          </CardTitle>
          {spec.especificacao && (
            <p className="text-sm text-[var(--text-muted)]">
              Especificação: {spec.especificacao}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <RechartsLineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />

              <XAxis
                dataKey="periodoLabel"
                tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                axisLine={{ stroke: 'var(--border-light)' }}
              />

              <YAxis
                domain={[yMin, yMax]}
                tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                axisLine={{ stroke: 'var(--border-light)' }}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid var(--border-light)',
                  borderRadius: '8px',
                  boxShadow: 'var(--shadow-md)'
                }}
                formatter={(value) => [typeof value === 'number' ? value.toFixed(2) : value, 'Valor']}
                labelFormatter={(label) => `Período: ${label}`}
              />

              <Legend />

              {/* Área de especificação (RANGE) */}
              {specTipo === 'RANGE' && specMin !== null && specMax !== null && (
                <ReferenceArea
                  y1={specMin}
                  y2={specMax}
                  fill={COLORS.success}
                  fillOpacity={0.1}
                  stroke={COLORS.success}
                  strokeOpacity={0.3}
                />
              )}

              {/* Linha de especificação máxima */}
              {(specTipo === 'MAXIMO' || specTipo === 'RANGE') && specMax !== null && (
                <ReferenceLine
                  y={specMax}
                  stroke={COLORS.danger}
                  strokeDasharray="5 5"
                  label={{
                    value: `Máx: ${specMax}`,
                    fill: COLORS.danger,
                    fontSize: 11
                  }}
                />
              )}

              {/* Linha de especificação mínima */}
              {(specTipo === 'MINIMO' || specTipo === 'RANGE') && specMin !== null && (
                <ReferenceLine
                  y={specMin}
                  stroke={COLORS.warning}
                  strokeDasharray="5 5"
                  label={{
                    value: `Mín: ${specMin}`,
                    fill: COLORS.warning,
                    fontSize: 11
                  }}
                />
              )}

              {/* Linha de dados */}
              <Line
                type="monotone"
                dataKey="valor"
                name={tipoEstudo}
                stroke={cor}
                strokeWidth={3}
                dot={{
                  fill: cor,
                  stroke: 'white',
                  strokeWidth: 2,
                  r: 6
                }}
                activeDot={{
                  fill: cor,
                  stroke: 'white',
                  strokeWidth: 2,
                  r: 8
                }}
                animationDuration={1000}
                animationEasing="ease-out"
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  )
}
