/**
 * Script de validação de consistência de dados
 * Compara: Excel fonte → Supabase
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import * as XLSX from 'xlsx'
import * as path from 'path'

// Carregar env
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const DATA_PATH = path.join(__dirname, '../../')

interface ExcelRow {
  [key: string]: unknown
}

function readExcelRaw(filename: string): ExcelRow[] {
  const filepath = path.join(DATA_PATH, filename)
  const workbook = XLSX.readFile(filepath)
  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]
  return XLSX.utils.sheet_to_json(worksheet) as ExcelRow[]
}

async function fetchAllFromTable(tableName: string) {
  const allData: any[] = []
  let offset = 0
  const batchSize = 1000

  while (true) {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .range(offset, offset + batchSize - 1)

    if (error) {
      console.error(`Erro ao buscar ${tableName}:`, error.message)
      break
    }

    if (!data || data.length === 0) break
    allData.push(...data)
    offset += batchSize

    if (data.length < batchSize) break
  }

  return allData
}

async function main() {
  console.log('='.repeat(80))
  console.log('VALIDAÇÃO DE CONSISTÊNCIA DE DADOS')
  console.log('='.repeat(80))

  // 1. Ler Excel
  console.log('\n📂 1. LENDO ARQUIVOS EXCEL...')
  const excelAcel = readExcelRaw('dados_acelerado.xlsx')
  const excelLonga = readExcelRaw('dados_longa_duracao.xlsx')

  console.log(`   Excel Acelerado: ${excelAcel.length} linhas`)
  console.log(`   Excel Longa Duração: ${excelLonga.length} linhas`)

  // Mostrar colunas do Excel
  if (excelAcel.length > 0) {
    console.log(`\n   Colunas Excel Acelerado: ${Object.keys(excelAcel[0]).join(', ')}`)
  }
  if (excelLonga.length > 0) {
    console.log(`   Colunas Excel Longa: ${Object.keys(excelLonga[0]).join(', ')}`)
  }

  // 2. Buscar dados do Supabase
  console.log('\n🔍 2. BUSCANDO DADOS DO SUPABASE...')
  const dbAcel = await fetchAllFromTable('dados_acelerado')
  const dbLonga = await fetchAllFromTable('dados_longa_duracao')

  console.log(`   Supabase Acelerado: ${dbAcel.length} registros`)
  console.log(`   Supabase Longa Duração: ${dbLonga.length} registros`)

  // 3. Comparação de contagem
  console.log('\n📊 3. COMPARAÇÃO DE CONTAGEM')
  console.log(`   Acelerado: Excel=${excelAcel.length} vs Supabase=${dbAcel.length} → ${excelAcel.length === dbAcel.length ? '✅ OK' : '❌ DIFERENTE (diff=' + (excelAcel.length - dbAcel.length) + ')'}`)
  console.log(`   Longa:     Excel=${excelLonga.length} vs Supabase=${dbLonga.length} → ${excelLonga.length === dbLonga.length ? '✅ OK' : '❌ DIFERENTE (diff=' + (excelLonga.length - dbLonga.length) + ')'}`)

  // 4. Análise de produtos únicos
  console.log('\n📋 4. ANÁLISE DE PRODUTOS ÚNICOS')

  const excelProdutosAcel = new Set(excelAcel.map(r => String(r['nome_produto'] || r['Nome do produto'] || '')))
  const excelProdutosLonga = new Set(excelLonga.map(r => String(r['nome_produto'] || r['Nome do produto'] || '')))
  const dbProdutosAcel = new Set(dbAcel.map((r: any) => r.nome_produto))
  const dbProdutosLonga = new Set(dbLonga.map((r: any) => r.nome_produto))

  console.log(`   Acelerado - Produtos Excel: ${excelProdutosAcel.size} | Supabase: ${dbProdutosAcel.size}`)
  console.log(`   Longa     - Produtos Excel: ${excelProdutosLonga.size} | Supabase: ${dbProdutosLonga.size}`)

  // Produtos faltantes
  const missingInDbAcel = [...excelProdutosAcel].filter(p => !dbProdutosAcel.has(p))
  const missingInDbLonga = [...excelProdutosLonga].filter(p => !dbProdutosLonga.has(p))
  const extraInDbAcel = [...dbProdutosAcel].filter(p => !excelProdutosAcel.has(p))
  const extraInDbLonga = [...dbProdutosLonga].filter(p => !excelProdutosLonga.has(p))

  if (missingInDbAcel.length > 0) console.log(`   ❌ Produtos no Excel Acel mas NÃO no Supabase: ${missingInDbAcel.join(', ')}`)
  if (extraInDbAcel.length > 0) console.log(`   ⚠️ Produtos no Supabase Acel mas NÃO no Excel: ${extraInDbAcel.join(', ')}`)
  if (missingInDbLonga.length > 0) console.log(`   ❌ Produtos no Excel Longa mas NÃO no Supabase: ${missingInDbLonga.join(', ')}`)
  if (extraInDbLonga.length > 0) console.log(`   ⚠️ Produtos no Supabase Longa mas NÃO no Excel: ${extraInDbLonga.join(', ')}`)

  // 5. Análise de ensaios (testes) únicos
  console.log('\n🧪 5. ANÁLISE DE ENSAIOS ÚNICOS')

  const excelEnsaiosAcel = new Set(excelAcel.map(r => String(r['ensaio_normalizado'] || '')))
  const excelEnsaiosLonga = new Set(excelLonga.map(r => String(r['ensaio_normalizado'] || '')))
  const dbEnsaiosAcel = new Set(dbAcel.map((r: any) => r.ensaio_normalizado))
  const dbEnsaiosLonga = new Set(dbLonga.map((r: any) => r.ensaio_normalizado))

  console.log(`   Acelerado - Ensaios Excel: ${excelEnsaiosAcel.size} | Supabase: ${dbEnsaiosAcel.size}`)
  console.log(`   Longa     - Ensaios Excel: ${excelEnsaiosLonga.size} | Supabase: ${dbEnsaiosLonga.size}`)

  // 6. Análise de períodos
  console.log('\n📅 6. ANÁLISE DE PERÍODOS')

  const excelPeriodosAcel = new Set(excelAcel.map(r => String(r['periodo'] || '')))
  const excelPeriodosLonga = new Set(excelLonga.map(r => String(r['periodo'] || '')))
  const dbPeriodosAcel = new Set(dbAcel.map((r: any) => r.periodo))
  const dbPeriodosLonga = new Set(dbLonga.map((r: any) => r.periodo))

  console.log(`   Acelerado - Períodos Excel: ${[...excelPeriodosAcel].sort().join(', ')}`)
  console.log(`   Acelerado - Períodos Supabase: ${[...dbPeriodosAcel].sort().join(', ')}`)
  console.log(`   Longa     - Períodos Excel: ${[...excelPeriodosLonga].sort().join(', ')}`)
  console.log(`   Longa     - Períodos Supabase: ${[...dbPeriodosLonga].sort().join(', ')}`)

  // 7. Detecção de duplicatas
  console.log('\n🔄 7. DETECÇÃO DE DUPLICATAS NO SUPABASE')

  // Verificar duplicatas por (nome_produto, ensaio_normalizado, periodo)
  const keyCountsAcel = new Map<string, number>()
  dbAcel.forEach((r: any) => {
    const key = `${r.nome_produto}|${r.ensaio_normalizado}|${r.periodo}`
    keyCountsAcel.set(key, (keyCountsAcel.get(key) || 0) + 1)
  })

  const dupsAcel = [...keyCountsAcel.entries()].filter(([_, count]) => count > 1)
  console.log(`   Acelerado - Combinações duplicadas (produto+ensaio+periodo): ${dupsAcel.length}`)
  if (dupsAcel.length > 0) {
    console.log(`   ❌ DUPLICATAS ENCONTRADAS NO ACELERADO:`)
    dupsAcel.slice(0, 20).forEach(([key, count]) => {
      console.log(`      ${key} → ${count}x`)
    })
    if (dupsAcel.length > 20) console.log(`      ... e mais ${dupsAcel.length - 20} duplicatas`)
  }

  const keyCountsLonga = new Map<string, number>()
  dbLonga.forEach((r: any) => {
    const key = `${r.nome_produto}|${r.ensaio_normalizado}|${r.periodo}`
    keyCountsLonga.set(key, (keyCountsLonga.get(key) || 0) + 1)
  })

  const dupsLonga = [...keyCountsLonga.entries()].filter(([_, count]) => count > 1)
  console.log(`   Longa     - Combinações duplicadas (produto+ensaio+periodo): ${dupsLonga.length}`)
  if (dupsLonga.length > 0) {
    console.log(`   ❌ DUPLICATAS ENCONTRADAS NO LONGA DURAÇÃO:`)
    dupsLonga.slice(0, 20).forEach(([key, count]) => {
      console.log(`      ${key} → ${count}x`)
    })
    if (dupsLonga.length > 20) console.log(`      ... e mais ${dupsLonga.length - 20} duplicatas`)
  }

  // Verificar duplicatas no Excel também
  const excelKeyCountsAcel = new Map<string, number>()
  excelAcel.forEach((r: ExcelRow) => {
    const produto = String(r['nome_produto'] || r['Nome do produto'] || '')
    const ensaio = String(r['ensaio_normalizado'] || '')
    const periodo = String(r['periodo'] || '')
    const key = `${produto}|${ensaio}|${periodo}`
    excelKeyCountsAcel.set(key, (excelKeyCountsAcel.get(key) || 0) + 1)
  })

  const excelDupsAcel = [...excelKeyCountsAcel.entries()].filter(([_, count]) => count > 1)
  console.log(`\n   Excel Acelerado - Duplicatas: ${excelDupsAcel.length}`)
  if (excelDupsAcel.length > 0) {
    console.log(`   ⚠️ DUPLICATAS JÁ EXISTEM NO EXCEL ACELERADO:`)
    excelDupsAcel.slice(0, 20).forEach(([key, count]) => {
      console.log(`      ${key} → ${count}x`)
    })
    if (excelDupsAcel.length > 20) console.log(`      ... e mais ${excelDupsAcel.length - 20}`)
  }

  const excelKeyCountsLonga = new Map<string, number>()
  excelLonga.forEach((r: ExcelRow) => {
    const produto = String(r['nome_produto'] || r['Nome do produto'] || '')
    const ensaio = String(r['ensaio_normalizado'] || '')
    const periodo = String(r['periodo'] || '')
    const key = `${produto}|${ensaio}|${periodo}`
    excelKeyCountsLonga.set(key, (excelKeyCountsLonga.get(key) || 0) + 1)
  })

  const excelDupsLonga = [...excelKeyCountsLonga.entries()].filter(([_, count]) => count > 1)
  console.log(`   Excel Longa - Duplicatas: ${excelDupsLonga.length}`)
  if (excelDupsLonga.length > 0) {
    console.log(`   ⚠️ DUPLICATAS JÁ EXISTEM NO EXCEL LONGA:`)
    excelDupsLonga.slice(0, 20).forEach(([key, count]) => {
      console.log(`      ${key} → ${count}x`)
    })
    if (excelDupsLonga.length > 20) console.log(`      ... e mais ${excelDupsLonga.length - 20}`)
  }

  // 8. Análise por produto - contagem de registros por produto
  console.log('\n📊 8. CONTAGEM POR PRODUTO')

  const produtoCountExcelAcel = new Map<string, number>()
  excelAcel.forEach(r => {
    const p = String(r['nome_produto'] || r['Nome do produto'] || '')
    produtoCountExcelAcel.set(p, (produtoCountExcelAcel.get(p) || 0) + 1)
  })

  const produtoCountDbAcel = new Map<string, number>()
  dbAcel.forEach((r: any) => {
    produtoCountDbAcel.set(r.nome_produto, (produtoCountDbAcel.get(r.nome_produto) || 0) + 1)
  })

  console.log('\n   ACELERADO - Registros por produto:')
  console.log('   ' + '-'.repeat(70))
  console.log(`   ${'Produto'.padEnd(35)} | ${'Excel'.padStart(6)} | ${'Supabase'.padStart(8)} | ${'Diff'.padStart(6)}`)
  console.log('   ' + '-'.repeat(70))

  const allProdutosAcel = new Set([...produtoCountExcelAcel.keys(), ...produtoCountDbAcel.keys()])
  for (const p of [...allProdutosAcel].sort()) {
    const excelCount = produtoCountExcelAcel.get(p) || 0
    const dbCount = produtoCountDbAcel.get(p) || 0
    const diff = excelCount - dbCount
    const status = diff === 0 ? '' : ' ❌'
    console.log(`   ${p.padEnd(35).substring(0, 35)} | ${String(excelCount).padStart(6)} | ${String(dbCount).padStart(8)} | ${String(diff).padStart(6)}${status}`)
  }

  const produtoCountExcelLonga = new Map<string, number>()
  excelLonga.forEach(r => {
    const p = String(r['nome_produto'] || r['Nome do produto'] || '')
    produtoCountExcelLonga.set(p, (produtoCountExcelLonga.get(p) || 0) + 1)
  })

  const produtoCountDbLonga = new Map<string, number>()
  dbLonga.forEach((r: any) => {
    produtoCountDbLonga.set(r.nome_produto, (produtoCountDbLonga.get(r.nome_produto) || 0) + 1)
  })

  console.log('\n   LONGA DURAÇÃO - Registros por produto:')
  console.log('   ' + '-'.repeat(70))
  console.log(`   ${'Produto'.padEnd(35)} | ${'Excel'.padStart(6)} | ${'Supabase'.padStart(8)} | ${'Diff'.padStart(6)}`)
  console.log('   ' + '-'.repeat(70))

  const allProdutosLonga = new Set([...produtoCountExcelLonga.keys(), ...produtoCountDbLonga.keys()])
  for (const p of [...allProdutosLonga].sort()) {
    const excelCount = produtoCountExcelLonga.get(p) || 0
    const dbCount = produtoCountDbLonga.get(p) || 0
    const diff = excelCount - dbCount
    const status = diff === 0 ? '' : ' ❌'
    console.log(`   ${p.padEnd(35).substring(0, 35)} | ${String(excelCount).padStart(6)} | ${String(dbCount).padStart(8)} | ${String(diff).padStart(6)}${status}`)
  }

  // 9. Verificar valores nulos/vazios
  console.log('\n🔍 9. ANÁLISE DE VALORES NULOS/VAZIOS NO SUPABASE')

  const nullAnalysis = (data: any[], label: string) => {
    const total = data.length
    const nullValor = data.filter(r => r.valor === null || r.valor === '' || r.valor === undefined).length
    const nullEnsaio = data.filter(r => !r.ensaio_normalizado || r.ensaio_normalizado === '').length
    const nullPeriodo = data.filter(r => !r.periodo || r.periodo === '').length
    const nullSpec = data.filter(r => !r.especificacao || r.especificacao === '').length
    const nullProduto = data.filter(r => !r.nome_produto || r.nome_produto === '').length
    const zeroPeriodoDias = data.filter(r => r.periodo_dias === 0).length

    console.log(`   ${label}:`)
    console.log(`     Total registros: ${total}`)
    console.log(`     valor nulo/vazio: ${nullValor} (${(nullValor/total*100).toFixed(1)}%)`)
    console.log(`     ensaio_normalizado vazio: ${nullEnsaio}`)
    console.log(`     periodo vazio: ${nullPeriodo}`)
    console.log(`     especificacao vazia: ${nullSpec}`)
    console.log(`     nome_produto vazio: ${nullProduto}`)
    console.log(`     periodo_dias = 0: ${zeroPeriodoDias}`)
  }

  nullAnalysis(dbAcel, 'Acelerado')
  nullAnalysis(dbLonga, 'Longa Duração')

  // 10. Analisar problema do "0 dia" - períodos com periodo_dias=0
  console.log('\n📅 10. ANÁLISE DO PROBLEMA "0 dia" / periodo_dias=0')

  const zeroDayAcel = dbAcel.filter((r: any) => r.periodo_dias === 0)
  const zeroDayLonga = dbLonga.filter((r: any) => r.periodo_dias === 0)

  console.log(`   Acelerado - Registros com periodo_dias=0: ${zeroDayAcel.length}`)
  if (zeroDayAcel.length > 0) {
    const periodos0 = new Set(zeroDayAcel.map((r: any) => r.periodo))
    console.log(`     Períodos associados: ${[...periodos0].join(', ')}`)
    // Verificar se existem períodos que NÃO são "0 dia" mas têm periodo_dias=0
    const nonZeroPeriodWith0Days = zeroDayAcel.filter((r: any) => r.periodo !== '0 dia')
    if (nonZeroPeriodWith0Days.length > 0) {
      console.log(`     ❌ PROBLEMA: ${nonZeroPeriodWith0Days.length} registros com periodo≠"0 dia" mas periodo_dias=0!`)
      const wrongPeriodos = new Set(nonZeroPeriodWith0Days.map((r: any) => r.periodo))
      console.log(`     Períodos afetados: ${[...wrongPeriodos].join(', ')}`)
    }
  }

  console.log(`   Longa - Registros com periodo_dias=0: ${zeroDayLonga.length}`)
  if (zeroDayLonga.length > 0) {
    const periodos0 = new Set(zeroDayLonga.map((r: any) => r.periodo))
    console.log(`     Períodos associados: ${[...periodos0].join(', ')}`)
    const nonZeroPeriodWith0Days = zeroDayLonga.filter((r: any) => r.periodo !== '0 dia')
    if (nonZeroPeriodWith0Days.length > 0) {
      console.log(`     ❌ PROBLEMA: ${nonZeroPeriodWith0Days.length} registros com periodo≠"0 dia" mas periodo_dias=0!`)
      const wrongPeriodos = new Set(nonZeroPeriodWith0Days.map((r: any) => r.periodo))
      console.log(`     Períodos afetados: ${[...wrongPeriodos].join(', ')}`)
    }
  }

  // 11. Verificação amostra: comparar valores Excel vs Supabase para primeiro produto
  console.log('\n🔬 11. VERIFICAÇÃO POR AMOSTRA - Primeiro produto')

  const firstProduct = [...dbProdutosAcel][0]
  if (firstProduct) {
    console.log(`   Produto: ${firstProduct}`)

    const dbSample = dbAcel.filter((r: any) => r.nome_produto === firstProduct)
    const excelSample = excelAcel.filter(r => String(r['nome_produto'] || r['Nome do produto'] || '') === firstProduct)

    console.log(`   Registros Excel: ${excelSample.length} | Supabase: ${dbSample.length}`)

    // Agrupar por ensaio e periodo
    const dbByKey = new Map<string, any>()
    dbSample.forEach((r: any) => {
      const key = `${r.ensaio_normalizado}|${r.periodo}`
      if (dbByKey.has(key)) {
        console.log(`   ⚠️ Duplicata no DB: ${key}`)
      }
      dbByKey.set(key, r)
    })

    const excelByKey = new Map<string, ExcelRow>()
    excelSample.forEach(r => {
      const ensaio = String(r['ensaio_normalizado'] || '')
      const periodo = String(r['periodo'] || '')
      const key = `${ensaio}|${periodo}`
      if (excelByKey.has(key)) {
        console.log(`   ⚠️ Duplicata no Excel: ${key}`)
      }
      excelByKey.set(key, r)
    })

    // Comparar valores
    let matchCount = 0
    let mismatchCount = 0
    let missingCount = 0

    for (const [key, excelRow] of excelByKey) {
      const dbRow = dbByKey.get(key)
      if (!dbRow) {
        missingCount++
        if (missingCount <= 5) console.log(`   ❌ Faltando no DB: ${key}`)
        continue
      }

      const excelValor = String(excelRow['valor'] || '')
      const dbValor = String(dbRow.valor || '')

      if (excelValor === dbValor) {
        matchCount++
      } else {
        mismatchCount++
        if (mismatchCount <= 10) {
          console.log(`   ❌ Valor diferente em ${key}: Excel="${excelValor}" vs DB="${dbValor}"`)
        }
      }
    }

    console.log(`\n   Resultados da amostra:`)
    console.log(`     ✅ Valores iguais: ${matchCount}`)
    console.log(`     ❌ Valores diferentes: ${mismatchCount}`)
    console.log(`     ❌ Faltando no DB: ${missingCount}`)
  }

  // 12. Analisar distribuição de periodo_dias
  console.log('\n📊 12. DISTRIBUIÇÃO DE periodo_dias')

  const periodDiasDistAcel = new Map<number, number>()
  dbAcel.forEach((r: any) => {
    periodDiasDistAcel.set(r.periodo_dias, (periodDiasDistAcel.get(r.periodo_dias) || 0) + 1)
  })

  console.log('   Acelerado:')
  for (const [dias, count] of [...periodDiasDistAcel.entries()].sort((a, b) => a[0] - b[0])) {
    const periodos = [...new Set(dbAcel.filter((r: any) => r.periodo_dias === dias).map((r: any) => r.periodo))]
    console.log(`     periodo_dias=${dias}: ${count} registros (periodos: ${periodos.join(', ')})`)
  }

  const periodDiasDistLonga = new Map<number, number>()
  dbLonga.forEach((r: any) => {
    periodDiasDistLonga.set(r.periodo_dias, (periodDiasDistLonga.get(r.periodo_dias) || 0) + 1)
  })

  console.log('   Longa Duração:')
  for (const [dias, count] of [...periodDiasDistLonga.entries()].sort((a, b) => a[0] - b[0])) {
    const periodos = [...new Set(dbLonga.filter((r: any) => r.periodo_dias === dias).map((r: any) => r.periodo))]
    console.log(`     periodo_dias=${dias}: ${count} registros (periodos: ${periodos.join(', ')})`)
  }

  // 13. Verificar se existem registros com mesmo ensaio mas nomes diferentes (ensaio vs ensaio_normalizado)
  console.log('\n🔎 13. VERIFICAÇÃO DE NORMALIZAÇÃO DE ENSAIOS')

  const ensaioMapping = new Map<string, Set<string>>()
  dbAcel.forEach((r: any) => {
    if (!ensaioMapping.has(r.ensaio_normalizado)) {
      ensaioMapping.set(r.ensaio_normalizado, new Set())
    }
    ensaioMapping.get(r.ensaio_normalizado)!.add(r.ensaio)
  })

  for (const [normalizado, originals] of ensaioMapping) {
    if (originals.size > 1) {
      console.log(`   ensaio_normalizado="${normalizado}" ← [${[...originals].join(' | ')}]`)
    }
  }

  console.log('\n' + '='.repeat(80))
  console.log('VALIDAÇÃO CONCLUÍDA')
  console.log('='.repeat(80))
}

main().catch(console.error)
