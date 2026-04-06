import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ShelfLifeCard } from '@/components/charts/ShelfLifeCard'
import type { AnalysisResult } from '@/types'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
      const filteredProps = Object.fromEntries(
        Object.entries(props).filter(([key]) => !['initial', 'animate', 'transition', 'whileHover', 'whileTap', 'exit'].includes(key))
      )
      return <div {...filteredProps}>{children}</div>
    }
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>
}))

const baseResult: AnalysisResult = {
  data_points: [],
  model_name: 'Linear',
  fitted_curve: [],
  projection_curve: [],
  shelf_life_months: 24.3,
  shelf_life_error: 1.2,
  spec_min: null,
  spec_max: 10,
  spec_tipo: 'MAXIMO',
  failure_mode: 'one_sided_max',
  especificacao: '≤ 10.0'
}

describe('ShelfLifeCard', () => {
  it('exibe shelf life quando disponível', () => {
    render(<ShelfLifeCard result={baseResult} isLoading={false} />)

    expect(screen.getByText('24.3')).toBeDefined()
    expect(screen.getByText('± 1.2')).toBeDefined()
    expect(screen.getByText('meses')).toBeDefined()
  })

  it('exibe modelo e spec', () => {
    render(<ShelfLifeCard result={baseResult} isLoading={false} />)

    expect(screen.getByText('Modelo Linear')).toBeDefined()
    expect(screen.getByText('Spec: ≤ 10.0')).toBeDefined()
  })

  it('exibe "Estável" para shelf life >= 24', () => {
    render(<ShelfLifeCard result={baseResult} isLoading={false} />)
    expect(screen.getByText('Estável')).toBeDefined()
  })

  it('exibe "Atenção" para shelf life entre 12 e 24', () => {
    const result = { ...baseResult, shelf_life_months: 18.5 }
    render(<ShelfLifeCard result={result} isLoading={false} />)
    expect(screen.getByText('Atenção')).toBeDefined()
  })

  it('exibe "Crítico" para shelf life < 12', () => {
    const result = { ...baseResult, shelf_life_months: 8.2 }
    render(<ShelfLifeCard result={result} isLoading={false} />)
    expect(screen.getByText('Crítico')).toBeDefined()
  })

  it('exibe "Indeterminado" para shelf life null', () => {
    const result = { ...baseResult, shelf_life_months: null, shelf_life_error: null }
    render(<ShelfLifeCard result={result} isLoading={false} />)
    const elements = screen.getAllByText('Indeterminado')
    expect(elements.length).toBeGreaterThan(0)
  })

  it('exibe skeleton no loading', () => {
    const { container } = render(<ShelfLifeCard result={null} isLoading={true} />)
    const pulseElements = container.querySelectorAll('.animate-pulse')
    expect(pulseElements.length).toBeGreaterThan(0)
  })

  it('não renderiza nada sem resultado e sem loading', () => {
    const { container } = render(<ShelfLifeCard result={null} isLoading={false} />)
    expect(container.innerHTML).toBe('')
  })
})
