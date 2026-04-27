'use client'

import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { PieChart as PieIcon } from 'lucide-react'
import {
  rfComLimites,
  xgbComLimites,
  rfSemLimites,
  xgbSemLimites,
  DESCRIPTOR_LABELS,
  DESCRIPTOR_COLORS,
  type Descriptor,
  type FamilyRanking,
} from '@/data/importance-data'

type Counts = Partial<Record<Descriptor, number>>

function tallyDescriptors(families: FamilyRanking[], acc: Counts) {
  for (const fam of families) {
    for (const ensaio of fam.ensaios) {
      acc[ensaio.descritor] = (acc[ensaio.descritor] ?? 0) + 1
    }
  }
}

function buildDistribution(): { key: Descriptor; name: string; value: number; color: string }[] {
  const counts: Counts = {}
  for (const bucket of [rfComLimites, xgbComLimites, rfSemLimites, xgbSemLimites]) {
    tallyDescriptors(bucket.longa_duracao, counts)
    tallyDescriptors(bucket.acelerado, counts)
    tallyDescriptors(bucket.acompanhamento, counts)
  }
  return (Object.entries(counts) as [Descriptor, number][])
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([key, value]) => ({
      key,
      name: DESCRIPTOR_LABELS[key],
      value,
      color: DESCRIPTOR_COLORS[key],
    }))
}

export function DescriptorDistribution() {
  const data = useMemo(buildDistribution, [])
  const total = useMemo(() => data.reduce((sum, d) => sum + d.value, 0), [data])

  return (
    <section id="descritores-distribuicao">
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <PieIcon className="w-5 h-5 text-[var(--primary)]" />
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            Distribuição dos Descritores Dominantes
          </h2>
        </div>
        <p className="text-sm text-[var(--text-secondary)]">
          Agregando todos os modelos × cenários × versões, quais descritores aparecem como
          dominantes com maior frequência.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-[var(--border-light)] p-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={130}
                  paddingAngle={2}
                  label={({ percent }) => {
                    const pct = (percent as number) * 100
                    return pct >= 6 ? `${pct.toFixed(0)}%` : ''
                  }}
                  labelLine={false}
                >
                  {data.map((d) => (
                    <Cell key={d.key} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid var(--border-light)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value, name) => {
                    const num = typeof value === 'number' ? value : Number(value ?? 0)
                    return [`${num} (${((num / total) * 100).toFixed(1)}%)`, name]
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-[var(--border-light)]">
                  <th className="py-2 pr-3 font-medium text-[var(--text-secondary)]">Descritor</th>
                  <th className="py-2 pr-3 font-medium text-[var(--text-secondary)] text-right">
                    Aparições
                  </th>
                  <th className="py-2 pr-3 font-medium text-[var(--text-secondary)] text-right">
                    Participação
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((d) => (
                  <tr
                    key={d.key}
                    className="border-b border-[var(--border-light)] last:border-0"
                  >
                    <td className="py-2 pr-3">
                      <span className="inline-flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-sm"
                          style={{ backgroundColor: d.color }}
                        />
                        <span className="text-[var(--text-primary)]">{d.name}</span>
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums text-[var(--text-secondary)]">
                      {d.value}
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums font-medium text-[var(--text-primary)]">
                      {((d.value / total) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
