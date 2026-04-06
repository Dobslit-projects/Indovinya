/**
 * Script para verificar quantas linhas cada produto possui
 * nas tabelas dados_acelerado e dados_longa_duracao.
 * Pagina 1000 registros por vez, agrupa por nome_produto.
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fetchAllRows(table: string): Promise<{ nome_produto: string }[]> {
  const PAGE_SIZE = 1000
  const allRows: { nome_produto: string }[] = []
  let offset = 0
  let hasMore = true

  while (hasMore) {
    const { data, error } = await supabase
      .from(table)
      .select('nome_produto')
      .range(offset, offset + PAGE_SIZE - 1)

    if (error) {
      console.error(String.raw`Erro ao buscar ` + table + String.raw` offset ` + offset + String.raw`: ` + error.message)
      break
    }

    if (!data || data.length === 0) {
      hasMore = false
    } else {
      allRows.push(...data)
      offset += PAGE_SIZE
      if (data.length < PAGE_SIZE) hasMore = false
    }
  }
  return allRows
}

function groupByProduct(rows: { nome_produto: string }[]): Map<string, number> {
  const counts = new Map<string, number>()
  for (const row of rows) {
    const name = row.nome_produto ?? "(null)"
    counts.set(name, (counts.get(name) ?? 0) + 1)
  }
  return counts
}

function printReport(label: string, counts: Map<string, number>) {
  console.log(`
=== ${label} ===`)
  const total = Array.from(counts.values()).reduce((a, b) => a + b, 0)
  console.log(`Total de registros: ${total}`)
  console.log(`Produtos distintos: ${counts.size}`)
  console.log()

  const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])

  console.log("Produto".padEnd(50) + "Linhas")
  console.log("-".repeat(60))
  for (const [name, count] of sorted) {
    const marker = count > 1000 ? " ** ACIMA DE 1000 **" : ""
    console.log(`${name.padEnd(50)}${String(count).padStart(6)}${marker}`)
  }

  const top = sorted[0]
  if (top) {
    console.log(`
Produto com MAIS linhas: "${top[0]}" => ${top[1]} linhas`)
  }

  const over1000 = sorted.filter(([, c]) => c > 1000)
  if (over1000.length > 0) {
    console.log(`ATENCAO: ${over1000.length} produto(s) excedem 1000 linhas:`)
    for (const [n, c] of over1000) {
      console.log(`  - "${n}" com ${c} linhas`)
    }
  } else {
    console.log("Nenhum produto excede 1000 linhas.")
  }
}

async function main() {
  console.log("Buscando dados de dados_acelerado...")
  const acelRows = await fetchAllRows("dados_acelerado")
  const acelCounts = groupByProduct(acelRows)
  printReport("dados_acelerado", acelCounts)

  console.log("")
  console.log("Buscando dados de dados_longa_duracao...")
  const longRows = await fetchAllRows("dados_longa_duracao")
  const longCounts = groupByProduct(longRows)
  printReport("dados_longa_duracao", longCounts)

  // Combined view
  console.log()
  console.log("=== COMBINADO (ambas as tabelas) ===")
  const combined = new Map<string, number>()
  for (const [name, count] of acelCounts) {
    combined.set(name, (combined.get(name) ?? 0) + count)
  }
  for (const [name, count] of longCounts) {
    combined.set(name, (combined.get(name) ?? 0) + count)
  }

  const sortedCombined = Array.from(combined.entries()).sort((a, b) => b[1] - a[1])
  console.log("Produto".padEnd(50) + "Linhas (total)")
  console.log("-".repeat(65))
  for (const [name, count] of sortedCombined) {
    const marker = count > 1000 ? " ** ACIMA DE 1000 **" : ""
    console.log(`${name.padEnd(50)}${String(count).padStart(6)}${marker}`)
  }

  const topC = sortedCombined[0]
  if (topC) {
    console.log(`
Produto com MAIS linhas (combinado): "${topC[0]}" => ${topC[1]} linhas`)
  }

  const over1000c = sortedCombined.filter(([, c]) => c > 1000)
  if (over1000c.length > 0) {
    console.log(`ATENCAO: ${over1000c.length} produto(s) excedem 1000 linhas no total:`)
    for (const [n, c] of over1000c) {
      console.log(`  - "${n}" com ${c} linhas`)
    }
  } else {
    console.log("Nenhum produto excede 1000 linhas no total combinado.")
  }

  console.log("")
  console.log("Concluido!")
}

main().catch(console.error)
