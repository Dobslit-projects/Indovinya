import type { DadosEstudo, Metricas } from '@/types'

/**
 * Verifica se um valor está dentro da especificação
 */
export function verificarConformidade(
  valor: string | null,
  specTipo: string | null,
  specMin: number | null,
  specMax: number | null
): 'ok' | 'fora' | 'na' {
  if (!valor || valor === '' || valor === '-') {
    return 'na'
  }

  if (!specTipo || specTipo === 'QUALITATIVO') {
    return 'na'
  }

  // Converter valor para número
  const valorStr = valor.replace(',', '.').replace('<', '').trim()
  const valorNum = parseFloat(valorStr)

  if (isNaN(valorNum)) {
    return 'na'
  }

  switch (specTipo) {
    case 'RANGE':
      if (specMin !== null && specMax !== null) {
        return valorNum >= specMin && valorNum <= specMax ? 'ok' : 'fora'
      }
      break
    case 'MAXIMO':
      if (specMax !== null) {
        return valorNum <= specMax ? 'ok' : 'fora'
      }
      break
    case 'MINIMO':
      if (specMin !== null) {
        return valorNum >= specMin ? 'ok' : 'fora'
      }
      break
  }

  return 'na'
}

/**
 * Calcula métricas de conformidade para um conjunto de dados
 */
export function calcularMetricas(dados: DadosEstudo[]): Metricas {
  const ensaiosUnicos = new Set(dados.map(d => d.ensaio_normalizado))
  const periodosUnicos = new Set(dados.map(d => d.periodo))

  let conformes = 0
  let total_verificaveis = 0

  dados.forEach(d => {
    const status = verificarConformidade(d.valor, d.spec_tipo, d.spec_min, d.spec_max)
    if (status !== 'na') {
      total_verificaveis++
      if (status === 'ok') {
        conformes++
      }
    }
  })

  const pct_conforme = total_verificaveis > 0
    ? (conformes / total_verificaveis) * 100
    : 100

  const alertas = total_verificaveis - conformes

  return {
    total_ensaios: ensaiosUnicos.size,
    total_periodos: periodosUnicos.size,
    conformes,
    total_verificaveis,
    pct_conforme,
    alertas
  }
}

/**
 * Agrupa dados por categoria de ensaio
 */
export function agruparPorCategoria(dados: DadosEstudo[]): Record<string, DadosEstudo[]> {
  return dados.reduce((acc, d) => {
    const categoria = d.categoria_ensaio || 'Outros'
    if (!acc[categoria]) {
      acc[categoria] = []
    }
    acc[categoria].push(d)
    return acc
  }, {} as Record<string, DadosEstudo[]>)
}

/**
 * Obtém lista de ensaios únicos de um conjunto de dados
 */
export function obterEnsaiosUnicos(dados: DadosEstudo[]) {
  const ensaiosMap = new Map<string, DadosEstudo>()

  dados.forEach(d => {
    if (!ensaiosMap.has(d.ensaio_normalizado)) {
      ensaiosMap.set(d.ensaio_normalizado, d)
    }
  })

  return Array.from(ensaiosMap.values()).map(d => ({
    ensaio_normalizado: d.ensaio_normalizado,
    categoria_ensaio: d.categoria_ensaio,
    is_quantitativo: d.is_quantitativo,
    metodo: d.metodo,
    especificacao: d.especificacao,
    spec_tipo: d.spec_tipo,
    spec_min: d.spec_min,
    spec_max: d.spec_max
  }))
}

/**
 * Filtra ensaios que possuem pelo menos um valor numérico plotável
 */
export function filtrarEnsaiosPlotaveis(dados: DadosEstudo[]) {
  const ensaiosComNumerico = new Set<string>()

  dados.forEach(d => {
    if (d.valor && valorParaNumero(d.valor) !== null) {
      ensaiosComNumerico.add(d.ensaio_normalizado)
    }
  })

  return obterEnsaiosUnicos(dados).filter(e => ensaiosComNumerico.has(e.ensaio_normalizado))
}

/**
 * Formata valor para exibição
 */
export function formatarValor(valor: string | null, isMenorQue: boolean): string {
  if (!valor || valor === '' || valor === '-') {
    return '-'
  }
  return isMenorQue ? `< ${valor}` : valor
}

/**
 * Converte valor string para número
 */
export function valorParaNumero(valor: string | null): number | null {
  if (!valor || valor === '' || valor === '-') {
    return null
  }

  const valorStr = valor.replace(',', '.').replace('<', '').trim()
  const num = parseFloat(valorStr)

  return isNaN(num) ? null : num
}
