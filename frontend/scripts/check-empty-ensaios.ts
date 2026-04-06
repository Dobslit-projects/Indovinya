/**
 * Script para investigar ensaios com valores vazios/nulos no Supabase
 * Verifica quais combinacoes produto+ensaio nao tem valores numericos
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const PAGE_SIZE = 1000

interface Record {
  nome_produto: string
  ensaio_normalizado: string
  valor: any
  [key: string]: any
}

async function fetchAllRecords(table: string): Promise<Record[]> {
  const allRecords: Record[] = []
  let page = 0
  let hasMore = true

  while (hasMore) {
    const from = page * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    const { data, error } = await supabase
      .from(table)
      .select('nome_produto, ensaio_normalizado, valor')
      .range(from, to)

    if (error) {
      console.error('Erro ao buscar ' + table + ' (page ' + page + '):', error.message)
      break
    }

    if (!data || data.length === 0) {
      hasMore = false
    } else {
      allRecords.push(...data)
      if (data.length < PAGE_SIZE) {
        hasMore = false
      }
      page++
    }
  }

  return allRecords
}

function isNumeric(val: any): boolean {
  if (val === null || val === undefined || val === '') return false
  const str = String(val).trim()
  if (str === '') return false
  return !isNaN(Number(str)) && isFinite(Number(str))
}

interface GroupStats {
  total: number
  nonNull: number
  numeric: number
  qualitative: number
  sampleValues: string[]
}

function analyzeTable(records: Record[]): Map<string, Map<string, GroupStats>> {
  const productMap = new Map<string, Map<string, GroupStats>>()

  for (const rec of records) {
    const produto = rec.nome_produto || '(sem nome)'
    const ensaio = rec.ensaio_normalizado || '(sem ensaio)'

    if (!productMap.has(produto)) {
      productMap.set(produto, new Map())
    }
    const ensaioMap = productMap.get(produto)!

    if (!ensaioMap.has(ensaio)) {
      ensaioMap.set(ensaio, { total: 0, nonNull: 0, numeric: 0, qualitative: 0, sampleValues: [] })
    }
    const stats = ensaioMap.get(ensaio)!

    stats.total++

    if (rec.valor !== null && rec.valor !== undefined && String(rec.valor).trim() !== '') {
      stats.nonNull++
      if (isNumeric(rec.valor)) {
        stats.numeric++
      } else {
        stats.qualitative++
        if (stats.sampleValues.length < 3) {
          stats.sampleValues.push(String(rec.valor).substring(0, 50))
        }
      }
    }
  }

  return productMap
}

function printReport(tableName: string, productMap: Map<string, Map<string, GroupStats>>) {
  const sep = '='.repeat(80)
  const dash = '-'.repeat(40)
  console.log('')
  console.log(sep)
  console.log('  TABELA: ' + tableName)
  console.log(sep)

  const emptyEnsaios: { produto: string; ensaio: string; total: number }[] = []
  const qualitativeOnly: { produto: string; ensaio: string; total: number; samples: string[] }[] = []
  const productSummary: { produto: string; totalEnsaios: number; emptyEnsaios: number; qualitativeEnsaios: number }[] = []

  const sortedProducts = [...productMap.keys()].sort()

  for (const produto of sortedProducts) {
    const ensaioMap = productMap.get(produto)!
    let emptyCount = 0
    let qualCount = 0
    const totalEnsaios = ensaioMap.size

    for (const [ensaio, stats] of ensaioMap) {
      if (stats.nonNull === 0) {
        emptyEnsaios.push({ produto, ensaio, total: stats.total })
        emptyCount++
      } else if (stats.numeric === 0 && stats.qualitative > 0) {
        qualitativeOnly.push({ produto, ensaio, total: stats.total, samples: stats.sampleValues })
        qualCount++
      }
    }

    productSummary.push({
      produto,
      totalEnsaios,
      emptyEnsaios: emptyCount,
      qualitativeEnsaios: qualCount,
    })
  }

  console.log('')
  console.log('--- ENSAIOS COMPLETAMENTE VAZIOS (valor = null em todos os registros) ---')
  if (emptyEnsaios.length === 0) {
    console.log('  Nenhum encontrado.')
  } else {
    console.log('  Total: ' + emptyEnsaios.length + ' combinacoes produto+ensaio')
    console.log('')
    for (const e of emptyEnsaios) {
      console.log('  [' + e.produto + '] "' + e.ensaio + '" -> ' + e.total + ' registros, TODOS sem valor')
    }
  }

  console.log('')
  console.log('--- ENSAIOS SOMENTE QUALITATIVOS (sem valores numericos) ---')
  if (qualitativeOnly.length === 0) {
    console.log('  Nenhum encontrado.')
  } else {
    console.log('  Total: ' + qualitativeOnly.length + ' combinacoes produto+ensaio')
    console.log('')
    for (const q of qualitativeOnly) {
      console.log('  [' + q.produto + '] "' + q.ensaio + '" -> ' + q.total + ' registros, exemplos: ' + q.samples.join(' | '))
    }
  }

  console.log('')
  console.log('--- RESUMO POR PRODUTO ---')
  console.log('  Produto'.padEnd(42) + ' Total  Vazios  Qualitativos')
  console.log('  ' + dash + ' -----  ------  ------------')
  for (const s of productSummary) {
    const line = '  ' + s.produto.padEnd(40) + ' ' + String(s.totalEnsaios).padStart(5) + '  ' + String(s.emptyEnsaios).padStart(6) + '  ' + String(s.qualitativeEnsaios).padStart(12)
    console.log(line)
  }
}

async function main() {
  console.log('Investigando ensaios com valores vazios/nulos...')
  console.log('Supabase URL: ' + supabaseUrl)
  console.log('')

  console.log('Buscando dados_acelerado...')
  const acelRecords = await fetchAllRecords('dados_acelerado')
  console.log('  -> ' + acelRecords.length + ' registros carregados')

  console.log('Buscando dados_longa_duracao...')
  const longaRecords = await fetchAllRecords('dados_longa_duracao')
  console.log('  -> ' + longaRecords.length + ' registros carregados')

  const acelAnalysis = analyzeTable(acelRecords)
  const longaAnalysis = analyzeTable(longaRecords)

  printReport('dados_acelerado', acelAnalysis)
  printReport('dados_longa_duracao', longaAnalysis)

  const sep = '='.repeat(80)
  console.log('')
  console.log(sep)
  console.log('  TOTAIS GERAIS')
  console.log(sep)

  let totalEmpty = 0
  let totalQual = 0
  let totalEnsaios = 0

  for (const analysis of [acelAnalysis, longaAnalysis]) {
    for (const [, ensaioMap] of analysis) {
      for (const [, stats] of ensaioMap) {
        totalEnsaios++
        if (stats.nonNull === 0) totalEmpty++
        else if (stats.numeric === 0 && stats.qualitative > 0) totalQual++
      }
    }
  }

  console.log('  Total de combinacoes produto+ensaio: ' + totalEnsaios)
  console.log('  Completamente vazios: ' + totalEmpty)
  console.log('  Somente qualitativos: ' + totalQual)
  console.log('  Com valores numericos: ' + (totalEnsaios - totalEmpty - totalQual))
  console.log('')
}

main().catch(console.error)
