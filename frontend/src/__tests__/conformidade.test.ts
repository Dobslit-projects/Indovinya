import { describe, it, expect } from 'vitest'
import {
  verificarConformidade,
  calcularMetricas,
  valorParaNumero
} from '@/lib/utils/conformidade'
import type { DadosEstudo } from '@/types'

describe('verificarConformidade', () => {
  it('retorna "na" para valor null', () => {
    expect(verificarConformidade(null, 'RANGE', 5, 10)).toBe('na')
  })

  it('retorna "na" para valor vazio', () => {
    expect(verificarConformidade('', 'RANGE', 5, 10)).toBe('na')
    expect(verificarConformidade('-', 'MAXIMO', null, 10)).toBe('na')
  })

  it('retorna "na" para spec_tipo QUALITATIVO', () => {
    expect(verificarConformidade('7.5', 'QUALITATIVO', null, null)).toBe('na')
  })

  it('retorna "na" para spec_tipo null', () => {
    expect(verificarConformidade('7.5', null, null, null)).toBe('na')
  })

  it('RANGE: valor dentro → "ok"', () => {
    expect(verificarConformidade('7.5', 'RANGE', 5, 10)).toBe('ok')
  })

  it('RANGE: valor fora → "fora"', () => {
    expect(verificarConformidade('12', 'RANGE', 5, 10)).toBe('fora')
    expect(verificarConformidade('3', 'RANGE', 5, 10)).toBe('fora')
  })

  it('RANGE: limites exatos → "ok"', () => {
    expect(verificarConformidade('5', 'RANGE', 5, 10)).toBe('ok')
    expect(verificarConformidade('10', 'RANGE', 5, 10)).toBe('ok')
  })

  it('MAXIMO: valor dentro → "ok"', () => {
    expect(verificarConformidade('8', 'MAXIMO', null, 10)).toBe('ok')
  })

  it('MAXIMO: valor fora → "fora"', () => {
    expect(verificarConformidade('12', 'MAXIMO', null, 10)).toBe('fora')
  })

  it('MINIMO: valor dentro → "ok"', () => {
    expect(verificarConformidade('8', 'MINIMO', 5, null)).toBe('ok')
  })

  it('MINIMO: valor fora → "fora"', () => {
    expect(verificarConformidade('3', 'MINIMO', 5, null)).toBe('fora')
  })

  it('valor com vírgula decimal → converte corretamente', () => {
    expect(verificarConformidade('7,5', 'RANGE', 5, 10)).toBe('ok')
  })

  it('valor com "<" → remove e converte', () => {
    expect(verificarConformidade('<5', 'MAXIMO', null, 10)).toBe('ok')
  })

  it('valor não numérico → "na"', () => {
    expect(verificarConformidade('Conforme', 'RANGE', 5, 10)).toBe('na')
  })
})

describe('valorParaNumero', () => {
  it('null → null', () => {
    expect(valorParaNumero(null)).toBe(null)
  })

  it('vazio → null', () => {
    expect(valorParaNumero('')).toBe(null)
    expect(valorParaNumero('-')).toBe(null)
  })

  it('número simples', () => {
    expect(valorParaNumero('7.5')).toBe(7.5)
  })

  it('vírgula decimal', () => {
    expect(valorParaNumero('7,5')).toBe(7.5)
  })

  it('< prefixo', () => {
    expect(valorParaNumero('<5')).toBe(5)
  })

  it('texto → null', () => {
    expect(valorParaNumero('Conforme')).toBe(null)
  })
})

describe('calcularMetricas', () => {
  const baseDado: DadosEstudo = {
    id: 1,
    item: 1,
    codigo_item: 'C001',
    nome_produto: 'Produto A',
    descricao_quimica: null,
    grau_etoxilacao: null,
    grupo_familia: null,
    familia_produtos: null,
    peso_molecular: null,
    data_inicial_estudo: null,
    tipo_estudo: 'Acelerado',
    ensaio: 'pH',
    ensaio_normalizado: 'pH',
    categoria_ensaio: 'Físico-Químico',
    is_quantitativo: true,
    metodo: null,
    especificacao: '5.0 - 8.0',
    spec_tipo: 'RANGE',
    spec_min: 5,
    spec_max: 8,
    periodo: '0 dia',
    valor: '6.5',
    is_menor_que: false,
    periodo_dias: 0
  }

  it('calcula métricas corretas para dados conformes', () => {
    const dados: DadosEstudo[] = [
      { ...baseDado, valor: '6.5', periodo: '0 dia' },
      { ...baseDado, valor: '7.0', periodo: '1m', periodo_dias: 30 },
      { ...baseDado, valor: '6.8', periodo: '3m', periodo_dias: 90 }
    ]

    const metricas = calcularMetricas(dados)

    expect(metricas.total_ensaios).toBe(1)
    expect(metricas.total_periodos).toBe(3)
    expect(metricas.conformes).toBe(3)
    expect(metricas.total_verificaveis).toBe(3)
    expect(metricas.pct_conforme).toBe(100)
    expect(metricas.alertas).toBe(0)
  })

  it('calcula métricas com valores fora da spec', () => {
    const dados: DadosEstudo[] = [
      { ...baseDado, valor: '6.5', periodo: '0 dia' },
      { ...baseDado, valor: '9.0', periodo: '1m', periodo_dias: 30 }
    ]

    const metricas = calcularMetricas(dados)

    expect(metricas.conformes).toBe(1)
    expect(metricas.total_verificaveis).toBe(2)
    expect(metricas.pct_conforme).toBe(50)
    expect(metricas.alertas).toBe(1)
  })

  it('ignora dados qualitativos', () => {
    const dados: DadosEstudo[] = [
      { ...baseDado, valor: '6.5' },
      { ...baseDado, valor: 'Conforme', spec_tipo: 'QUALITATIVO', ensaio_normalizado: 'Aspecto' }
    ]

    const metricas = calcularMetricas(dados)

    expect(metricas.total_ensaios).toBe(2)
    expect(metricas.total_verificaveis).toBe(1)
  })

  it('retorna 100% para dados sem verificáveis', () => {
    const dados: DadosEstudo[] = [
      { ...baseDado, valor: 'Conforme', spec_tipo: 'QUALITATIVO' }
    ]

    const metricas = calcularMetricas(dados)
    expect(metricas.pct_conforme).toBe(100)
  })
})
