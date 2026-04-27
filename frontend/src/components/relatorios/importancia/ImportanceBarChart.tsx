'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import {
  getEnsaioColor,
  DESCRIPTOR_LABELS,
  type EnsaioRank,
} from '@/data/importance-data'

interface ImportanceBarChartProps {
  ensaios: EnsaioRank[]
}

function truncate(text: string, max = 28) {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text
}

export function ImportanceBarChart({ ensaios }: ImportanceBarChartProps) {
  if (ensaios.length === 0) {
    return (
      <div className="text-xs text-[var(--text-muted)] italic px-2 py-4">
        Sem ensaios válidos.
      </div>
    )
  }

  const data = ensaios.map((e) => ({
    ...e,
    ensaioShort: truncate(e.ensaio),
  }))

  const height = Math.max(120, ensaios.length * 44)

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 4, right: 16, left: 4, bottom: 4 }}
        >
          <XAxis
            type="number"
            domain={[0, 1]}
            tickFormatter={(v) => `${Math.round(v * 100)}%`}
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="ensaioShort"
            tick={{ fontSize: 11, fill: '#475569' }}
            axisLine={false}
            tickLine={false}
            width={170}
          />
          <Tooltip
            cursor={{ fill: 'rgba(148,163,184,0.1)' }}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '12px',
              padding: '8px 10px',
            }}
            formatter={(value, _name, item) => {
              const num = typeof value === 'number' ? value : Number(value ?? 0)
              const payload = item?.payload as EnsaioRank | undefined
              return [
                `${(num * 100).toFixed(1)}% · ${payload ? DESCRIPTOR_LABELS[payload.descritor] : ''}`,
                payload?.ensaio ?? '',
              ]
            }}
          />
          <Bar dataKey="peso" radius={[0, 4, 4, 0]}>
            {data.map((entry) => (
              <Cell key={entry.ensaio} fill={getEnsaioColor(entry.ensaio)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
