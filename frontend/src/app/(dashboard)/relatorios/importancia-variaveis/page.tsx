'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { FadeIn } from '@/components/ui/FadeIn'
import { useImportanceFilters } from '@/hooks/useImportanceFilters'
import { useSessionTracking } from '@/hooks/useSessionTracking'
import { ReportHero } from '@/components/relatorios/importancia/ReportHero'
import { MethodologySection } from '@/components/relatorios/importancia/MethodologySection'
import { PerformanceSection } from '@/components/relatorios/importancia/PerformanceSection'
import { GlobalFilters } from '@/components/relatorios/importancia/GlobalFilters'
import { FamilyRankingPanel } from '@/components/relatorios/importancia/FamilyRankingPanel'
import { ComparisonHeatmap } from '@/components/relatorios/importancia/ComparisonHeatmap'
import { DescriptorDistribution } from '@/components/relatorios/importancia/DescriptorDistribution'
import { DescriptorPatterns } from '@/components/relatorios/importancia/DescriptorPatterns'
import { UnlimitedSection } from '@/components/relatorios/importancia/UnlimitedSection'
import { SemAguaSection } from '@/components/relatorios/importancia/SemAguaSection'
import { WaterImpactTable } from '@/components/relatorios/importancia/WaterImpactTable'
import { TransversalFindings } from '@/components/relatorios/importancia/TransversalFindings'
import { ConclusionSection } from '@/components/relatorios/importancia/ConclusionSection'

export default function ImportanciaVariaveisPage() {
  const { filters, setScenario, setModel } = useImportanceFilters()
  const { trackEvent } = useSessionTracking()

  useEffect(() => {
    trackEvent('report_view', { slug: 'importancia-variaveis', tipo: 'interativo' })
  }, [trackEvent])

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <Link
          href="/relatorios"
          className="inline-flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Relatórios
        </Link>
      </div>

      <div className="flex flex-col gap-10 pb-10">
        <FadeIn>
          <ReportHero />
        </FadeIn>

        <FadeIn>
          <MethodologySection />
        </FadeIn>

        <FadeIn>
          <PerformanceSection />
        </FadeIn>
      </div>

      <GlobalFilters
        scenario={filters.scenario}
        model={filters.model}
        onScenarioChange={setScenario}
        onModelChange={setModel}
      />

      <div className="flex flex-col gap-10 py-10">
        <FadeIn>
          <FamilyRankingPanel scenario={filters.scenario} model={filters.model} />
        </FadeIn>

        <FadeIn>
          <ComparisonHeatmap scenario={filters.scenario} />
        </FadeIn>

        <FadeIn>
          <TransversalFindings />
        </FadeIn>

        <FadeIn>
          <DescriptorDistribution />
        </FadeIn>

        <FadeIn>
          <DescriptorPatterns />
        </FadeIn>

        <FadeIn>
          <UnlimitedSection scenario={filters.scenario} model={filters.model} />
        </FadeIn>

        <FadeIn>
          <SemAguaSection scenario={filters.scenario} model={filters.model} />
        </FadeIn>

        <FadeIn>
          <WaterImpactTable />
        </FadeIn>

        <FadeIn>
          <ConclusionSection />
        </FadeIn>
      </div>
    </div>
  )
}
