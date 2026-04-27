'use client'

import { BookOpen, Grid3x3, Ruler, XCircle, Settings2 } from 'lucide-react'
import { Accordion, AccordionItem } from '@/components/ui/Accordion'
import { Badge } from '@/components/ui/Badge'
import { Callout } from '@/components/ui/Callout'
import {
  DESCRIPTORS_INFO,
  EXCLUSION_REASONS,
  INPUT_STRUCTURE_EXAMPLE,
  VERSION_RULES,
  MODEL_HYPERPARAMS,
} from '@/data/importance-methodology'
import { DESCRIPTOR_COLORS } from '@/data/importance-data'

export function MethodologySection() {
  return (
    <section id="metodologia">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-1">Metodologia</h2>
        <p className="text-sm text-[var(--text-secondary)]">
          Como os descritores temporais são construídos, as regras de inclusão, os algoritmos
          utilizados e os motivos de exclusão de famílias.
        </p>
      </div>

      <Accordion multiple defaultOpen={['descritores']}>
        <AccordionItem
          id="descritores"
          title="Descritores Temporais"
          subtitle="7 na versão com limites, 10 na sem limites"
          icon={<BookOpen className="w-4 h-4" />}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-[var(--border-light)]">
                  <th className="py-2 pr-4 font-medium text-[var(--text-secondary)]">Descritor</th>
                  <th className="py-2 pr-4 font-medium text-[var(--text-secondary)]">Definição</th>
                  <th className="py-2 pr-4 font-medium text-[var(--text-secondary)]">Versões</th>
                </tr>
              </thead>
              <tbody>
                {DESCRIPTORS_INFO.map((d) => (
                  <tr key={d.key} className="border-b border-[var(--border-light)] last:border-0">
                    <td className="py-3 pr-4 align-top">
                      <span
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold"
                        style={{
                          backgroundColor: `${DESCRIPTOR_COLORS[d.key]}15`,
                          color: DESCRIPTOR_COLORS[d.key],
                        }}
                      >
                        {d.nome}
                      </span>
                      {d.formula && (
                        <div className="mt-1 text-[11px] font-mono text-[var(--text-muted)]">
                          {d.formula}
                        </div>
                      )}
                    </td>
                    <td className="py-3 pr-4 align-top text-[var(--text-secondary)] leading-relaxed">
                      {d.definicao}
                    </td>
                    <td className="py-3 pr-4 align-top">
                      <div className="flex flex-col gap-1">
                        {d.versoes.includes('com_limites') && (
                          <Badge variant="success" size="sm">
                            c/ limites
                          </Badge>
                        )}
                        {d.versoes.includes('sem_limites') && (
                          <Badge variant="warning" size="sm">
                            s/ limites
                          </Badge>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AccordionItem>

        <AccordionItem
          id="estrutura"
          title="Estrutura das entradas do modelo"
          subtitle="Produto × (ensaio + descritor temporal)"
          icon={<Grid3x3 className="w-4 h-4" />}
        >
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
            O modelo não recebe a tabela bruta em formato longo. Os dados são reorganizados de
            modo que <strong>cada linha seja um produto</strong> e <strong>cada coluna uma
            combinação de ensaio + descritor temporal</strong>:
          </p>
          <div className="bg-[var(--bg-light)] rounded-lg p-4 border border-[var(--border-light)] font-mono text-xs text-[var(--text-secondary)] space-y-1">
            {INPUT_STRUCTURE_EXAMPLE.map((line) => (
              <div key={line}>{line}</div>
            ))}
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-3">
            A variável-alvo y é sempre o <strong>Shelf Life</strong> do produto.
          </p>
        </AccordionItem>

        <AccordionItem
          id="versoes"
          title="Versões: Com Limites vs Sem Limites"
          subtitle="Critérios de inclusão e aplicação"
          icon={<Ruler className="w-4 h-4" />}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-[var(--border-light)]">
                  <th className="py-2 pr-4 font-medium text-[var(--text-secondary)]">Aspecto</th>
                  <th className="py-2 pr-4 font-medium text-emerald-700">Com Limites</th>
                  <th className="py-2 pr-4 font-medium text-amber-700">Sem Limites</th>
                </tr>
              </thead>
              <tbody>
                {VERSION_RULES.map((rule) => (
                  <tr
                    key={rule.aspecto}
                    className="border-b border-[var(--border-light)] last:border-0"
                  >
                    <td className="py-2 pr-4 text-[var(--text-primary)]">{rule.aspecto}</td>
                    <td className="py-2 pr-4 text-[var(--text-secondary)]">{rule.comLimites}</td>
                    <td className="py-2 pr-4 text-[var(--text-secondary)]">{rule.semLimites}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Callout variant="warning" className="mt-4" title="Atenção">
            A versão <strong>com limites</strong> é a mais apropriada para conclusões sólidas. A
            versão <strong>sem limites</strong> é exploratória. Famílias com Peso 1 = 1,000 e
            demais pesos iguais a zero — especialmente com 2–3 produtos — não devem ser
            interpretadas como prova de dominância absoluta do ensaio.
          </Callout>
        </AccordionItem>

        <AccordionItem
          id="exclusoes"
          title="Motivos de exclusão de famílias"
          subtitle={`${EXCLUSION_REASONS.length} causas possíveis`}
          icon={<XCircle className="w-4 h-4" />}
        >
          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {EXCLUSION_REASONS.map((reason, i) => (
              <li
                key={reason.titulo}
                className="flex gap-3 bg-[var(--bg-light)] rounded-lg p-3 border border-[var(--border-light)]"
              >
                <div className="shrink-0 w-6 h-6 rounded-full bg-white border border-[var(--border-light)] flex items-center justify-center text-xs font-semibold text-[var(--primary)]">
                  {i + 1}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-[var(--text-primary)]">
                    {reason.titulo}
                  </div>
                  <p className="text-xs text-[var(--text-muted)] leading-snug mt-0.5">
                    {reason.descricao}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </AccordionItem>

        <AccordionItem
          id="hiperparametros"
          title="Ajuste do modelo e hiperparâmetros"
          subtitle="Média de 12 repetições por família"
          icon={<Settings2 className="w-4 h-4" />}
        >
          <ul className="text-sm text-[var(--text-secondary)] leading-relaxed space-y-2">
            <li>
              <strong>n_estimators:</strong> {MODEL_HYPERPARAMS.n_estimators}
            </li>
            <li>
              <strong>random_state:</strong> {MODEL_HYPERPARAMS.random_state_base} + seed (variando a cada repetição)
            </li>
            <li>
              <strong>Repetições:</strong> {MODEL_HYPERPARAMS.repeticoes} vezes
            </li>
            <li>
              <strong>Agregação:</strong> {MODEL_HYPERPARAMS.agregacao}
            </li>
          </ul>
          <p className="text-xs text-[var(--text-muted)] mt-3 leading-relaxed">
            As importâncias de todos os descritores pertencentes ao mesmo ensaio são somadas,
            gerando o ranking principal por ensaio. Adicionalmente, identifica-se o{' '}
            <strong>descritor dominante</strong> — aquele que concentrou a maior parcela da
            importância agregada.
          </p>
        </AccordionItem>
      </Accordion>
    </section>
  )
}
