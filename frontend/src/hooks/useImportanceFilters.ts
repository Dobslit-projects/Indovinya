'use client'

import { useCallback, useState } from 'react'
import type { ModelType, Scenario } from '@/data/importance-data'
import { useSessionTracking } from './useSessionTracking'

export interface ImportanceFilters {
  scenario: Scenario
  model: ModelType
}

export function useImportanceFilters(initial?: Partial<ImportanceFilters>) {
  const { trackEvent } = useSessionTracking()
  const [filters, setFilters] = useState<ImportanceFilters>({
    scenario: initial?.scenario ?? 'longa_duracao',
    model: initial?.model ?? 'rf',
  })

  const setScenario = useCallback(
    (scenario: Scenario) => {
      setFilters((prev) => {
        if (prev.scenario === scenario) return prev
        trackEvent('report_filter_change', { filter: 'scenario', value: scenario })
        return { ...prev, scenario }
      })
    },
    [trackEvent]
  )

  const setModel = useCallback(
    (model: ModelType) => {
      setFilters((prev) => {
        if (prev.model === model) return prev
        trackEvent('report_filter_change', { filter: 'model', value: model })
        return { ...prev, model }
      })
    },
    [trackEvent]
  )

  return { filters, setScenario, setModel }
}
