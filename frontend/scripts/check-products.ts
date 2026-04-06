/**
 * Script para comparar produtos entre o Excel original e o Supabase.
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import * as XLSX from 'xlsx'
import * as path from 'path'

config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const EXCEL_PATH = path.resolve(__dirname, '../../Pacote de dados_1 - PoC Indovinya.xlsx')

function readExcelProducts(): { products: Set<string>; productStudyTypes: Map<string, Set<string>> } {
  console.log('Lendo Excel: ' + EXCEL_PATH)
  console.log('')
  const workbook = XLSX.readFile(EXCEL_PATH)

  if (!workbook.SheetNames.includes('Modelo')) {
    throw new Error('Aba Modelo nao encontrada. Abas disponiveis: ' + workbook.SheetNames.join(', '))
  }

  const sheet = workbook.Sheets['Modelo']
  const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet)

  const products = new Set<string>()
  const productStudyTypes = new Map<string, Set<string>>()

  for (const row of rows) {
    const name = (row['Nome do produto'] ?? row['Nome do Produto'] ?? '') as string
    const studyType = (row['Tipo de estudo'] ?? row['Tipo de Estudo'] ?? '') as string
    const trimmed = String(name).trim()
    if (trimmed) {
      products.add(trimmed)
      if (!productStudyTypes.has(trimmed)) {
        productStudyTypes.set(trimmed, new Set())
      }
      if (String(studyType).trim()) {
        productStudyTypes.get(trimmed)!.add(String(studyType).trim())
      }
    }
  }

  return { products, productStudyTypes }
}

async function fetchAllProducts(table: string): Promise<Set<string>> {
  const PAGE_SIZE = 1000
  const products = new Set<string>()
  let from = 0

  while (true) {
    const to = from + PAGE_SIZE - 1
    const { data, error } = await supabase
      .from(table)
      .select('nome_produto')
      .range(from, to)

    if (error) {
      console.error('Erro ao buscar ' + table + ' (range ' + from + '-' + to + '): ' + error.message)
      break
    }

    if (!data || data.length === 0) break

    for (const row of data) {
      const name = String(row.nome_produto ?? '').trim()
      if (name) products.add(name)
    }

    if (data.length < PAGE_SIZE) break
    from += PAGE_SIZE
  }

  return products
}

function diff(a: Set<string>, b: Set<string>): string[] {
  return [...a].filter(x => !b.has(x)).sort()
}

async function main() {
  const { products: excelProducts, productStudyTypes } = readExcelProducts()

  console.log('=== PRODUTOS NO EXCEL (aba Modelo) ===')
  console.log('Total de produtos unicos: ' + excelProducts.size)
  console.log('')

  const sortedExcel = [...excelProducts].sort()
  for (const p of sortedExcel) {
    const types = productStudyTypes.get(p)
    const typesStr = types && types.size > 0 ? [...types].join(', ') : '(sem tipo)'
    console.log('  - ' + p + '  [' + typesStr + ']')
  }

  console.log('')
  console.log('Buscando dados do Supabase...')
  console.log('')

  const aceleradoProducts = await fetchAllProducts('dados_acelerado')
  const longaDuracaoProducts = await fetchAllProducts('dados_longa_duracao')

  const allSupabase = new Set([...aceleradoProducts, ...longaDuracaoProducts])

  console.log('=== PRODUTOS NO SUPABASE ===')
  console.log('  dados_acelerado:       ' + aceleradoProducts.size + ' produtos unicos')
  console.log('  dados_longa_duracao:   ' + longaDuracaoProducts.size + ' produtos unicos')
  console.log('  Total (union):         ' + allSupabase.size + ' produtos unicos')
  console.log('')

  for (const [tableName, supaProducts] of [
    ['dados_acelerado', aceleradoProducts],
    ['dados_longa_duracao', longaDuracaoProducts],
  ] as const) {
    const onlyExcel = diff(excelProducts, supaProducts)
    const onlySupa = diff(supaProducts, excelProducts)

    console.log('--- Comparacao: Excel vs ' + tableName + ' ---')
    if (onlyExcel.length > 0) {
      console.log('  No Excel mas NAO em ' + tableName + ' (' + onlyExcel.length + '):')
      for (const p of onlyExcel) {
        const types = productStudyTypes.get(p)
        const typesStr = types && types.size > 0 ? [...types].join(', ') : '(sem tipo)'
        console.log('    - ' + p + '  [' + typesStr + ']')
      }
    } else {
      console.log('  Todos os produtos do Excel estao em ' + tableName + '.')
    }

    if (onlySupa.length > 0) {
      console.log('  Em ' + tableName + ' mas NAO no Excel (' + onlySupa.length + '):')
      for (const p of onlySupa) console.log('    - ' + p)
    } else {
      console.log('  Todos os produtos de ' + tableName + ' estao no Excel.')
    }
    console.log('')
  }

  const onlyExcelGlobal = diff(excelProducts, allSupabase)
  const onlySupaGlobal = diff(allSupabase, excelProducts)

  console.log('--- Comparacao GLOBAL: Excel vs Supabase (ambas tabelas) ---')
  if (onlyExcelGlobal.length > 0) {
    console.log('  No Excel mas em NENHUMA tabela do Supabase (' + onlyExcelGlobal.length + '):')
    for (const p of onlyExcelGlobal) {
      const types = productStudyTypes.get(p)
      const typesStr = types && types.size > 0 ? [...types].join(', ') : '(sem tipo)'
      console.log('    - ' + p + '  [' + typesStr + ']')
    }
  } else {
    console.log('  Todos os produtos do Excel estao em pelo menos uma tabela do Supabase.')
  }

  if (onlySupaGlobal.length > 0) {
    console.log('  No Supabase mas NAO no Excel (' + onlySupaGlobal.length + '):')
    for (const p of onlySupaGlobal) console.log('    - ' + p)
  } else {
    console.log('  Todos os produtos do Supabase estao no Excel.')
  }

  console.log('')
  console.log('Done.')
}

main().catch(err => {
  console.error('Erro fatal:', err)
  process.exit(1)
})
