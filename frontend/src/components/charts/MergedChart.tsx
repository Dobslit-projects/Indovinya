'use client'

import {
  LineChart,
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
import { ORDEM_PERIODOS, FATOR_NORMALIZACAO, COLORS } from '@/types'
import type { DadosEstudo } from '@/types'

interface MergedChartProps {
  dadosAcelerado: DadosEstudo[]
  dadosLonga: DadosEstudo[]
  ensaio: string
}

// Função para converter dias para label de período
function diasParaPeriodoLabel(dias: number): string {
  if (dias === 0) return '0 dia'
  if (dias <= 7) return '1 sem'
  if (dias <= 14) return '2 sem'
  if (dias <= 30) return '1m'
  if (dias <= 60) return '2m'
  if (dias <= 90) return '3m'
  if (dias <= 120) return '4m'
  if (dias <= 150) return '5m'
  if (dias <= 180) return '6m'
  if (dias <= 270) return '9m'
  if (dias <= 365) return '12m'
  if (dias <= 545) return '18m'
  if (dias <= 730) return '24m'
  if (dias <= 912) return '30m'
  return '36m'
}

export function MergedChart({ dadosAcelerado, dadosLonga, ensaio }: MergedChartProps) {
  // Filtrar dados do ensaio
  const dadosAcelEnsaio = dadosAcelerado.filter(d => d.ensaio_normalizado === ensaio)
  const dadosLongEnsaio = dadosLonga.filter(d => d.ensaio_normalizado === ensaio)

  if (dadosAcelEnsaio.length === 0 && dadosLongEnsaio.length === 0) {
    return (
      <Card variant="bordered" className="h-[400px] flex items-center justify-center">
        <p className="text-[var(--text-muted)]">Sem dados disponíveis</p>
      </Card>
    )
  }

  // Extrair especificação
  const spec = dadosAcelEnsaio[0] || dadosLongEnsaio[0]
  const specTipo = spec?.spec_tipo
  const specMin = spec?.spec_min
  const specMax = spec?.spec_max

  // Normalizar dados acelerado (multiplicar dias por 4)
  const dadosAcelNorm = dadosAcelEnsaio.map(d => ({
    diasNorm: d.periodo_dias * FATOR_NORMALIZACAO,
    valor: valorParaNumero(d.valor),
    periodoOriginal: d.periodo,
    periodoEquiv: diasParaPeriodoLabel(d.periodo_dias * FATOR_NORMALIZACAO),
    tipo: 'Acelerado'
  }))

  // Dados longa duração (dias normais)
  const dadosLongNorm = dadosLongEnsaio.map(d => ({
    diasNorm: d.periodo_dias,
    valor: valorParaNumero(d.valor),
    periodoOriginal: d.periodo,
    periodoEquiv: d.periodo,
    tipo: 'Longa Duração'
  }))

  // Combinar todos os pontos de dias para o eixo X
  const todosDias = new Set<number>()
  dadosAcelNorm.forEach(d => todosDias.add(d.diasNorm))
  dadosLongNorm.forEach(d => todosDias.add(d.diasNorm))

  const diasOrdenados = Array.from(todosDias).sort((a, b) => a - b)

  // Criar dados combinados para o gráfico
  const chartData = diasOrdenados.map(dias => {
    const acelPonto = dadosAcelNorm.find(d => d.diasNorm === dias)
    const longPonto = dadosLongNorm.find(d => d.diasNorm === dias)

    return {
      dias,
      periodoLabel: diasParaPeriodoLabel(dias),
      valorAcelerado: acelPonto?.valor ?? null,
      valorLonga: longPonto?.valor ?? null,
      periodoAcelOriginal: acelPonto?.periodoOriginal,
      periodoLongOriginal: longPonto?.periodoOriginal
    }
  })

  // Calcular domínio Y
  const todosValores = [
    ...dadosAcelNorm.map(d => d.valor),
    ...dadosLongNorm.map(d => d.valor)
  ].filter((v): v is number => v !== null)

  const minValor = Math.min(...todosValores, specMin ?? Infinity)
  const maxValor = Math.max(...todosValores, specMax ?? -Infinity)
  const margem = (maxValor - minValor) * 0.1 || 1
  const yMin = Math.floor(minValor - margem)
  const yMax = Math.ceil(maxValor + margem)

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ color: string; name: string; value: number; payload: { periodoAcelOriginal?: string; periodoLongOriginal?: string } }>; label?: string }) => {
    if (!active || !payload || payload.length === 0) return null

    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-[var(--border-light)]">
        <p className="font-medium text-[var(--text-primary)] mb-2">
          Período: {label}
        </p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-[var(--text-secondary)]">{entry.name}:</span>
            <span className="font-medium" style={{ color: entry.color }}>
              {entry.value?.toFixed(2) || '-'}
            </span>
            {entry.name === 'Acelerado (×4)' && entry.payload.periodoAcelOriginal && (
              <span className="text-xs text-[var(--text-muted)]">
                ({entry.payload.periodoAcelOriginal})
              </span>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card variant="bordered">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-[var(--accent)]" />
              <span className="w-3 h-3 rounded-full bg-[var(--success)]" />
            </span>
            Visualização Mesclada - {ensaio}
          </CardTitle>
          <p className="text-sm text-[var(--text-muted)]">
            Acelerado normalizado (×{FATOR_NORMALIZACAO}) + Longa Duração
            {spec?.especificacao && ` | Spec: ${spec.especificacao}`}
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
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

              <Tooltip content={<CustomTooltip />} />

              <Legend />

              {/* Área de especificação */}
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

              {/* Linhas de especificação */}
              {(specTipo === 'MAXIMO' || specTipo === 'RANGE') && specMax !== null && (
                <ReferenceLine
                  y={specMax}
                  stroke={COLORS.danger}
                  strokeDasharray="5 5"
                />
              )}

              {(specTipo === 'MINIMO' || specTipo === 'RANGE') && specMin !== null && (
                <ReferenceLine
                  y={specMin}
                  stroke={COLORS.warning}
                  strokeDasharray="5 5"
                />
              )}

              {/* Linha Acelerado */}
              <Line
                type="monotone"
                dataKey="valorAcelerado"
                name={`Acelerado (×${FATOR_NORMALIZACAO})`}
                stroke={COLORS.accent}
                strokeWidth={3}
                dot={{
                  fill: COLORS.accent,
                  stroke: 'white',
                  strokeWidth: 2,
                  r: 6
                }}
                connectNulls
                animationDuration={1000}
              />

              {/* Linha Longa Duração */}
              <Line
                type="monotone"
                dataKey="valorLonga"
                name="Longa Duração"
                stroke={COLORS.success}
                strokeWidth={3}
                dot={{
                  fill: COLORS.success,
                  stroke: 'white',
                  strokeWidth: 2,
                  r: 6,
                  strokeDasharray: ''
                }}
                connectNulls
                animationDuration={1000}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  )
}
