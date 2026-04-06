/**
 * Script para verificar produtos únicos no banco
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkProdutos() {
  console.log('Verificando produtos únicos...\n')

  // Buscar todos os registros de dados_acelerado
  const { data: dadosAcel, error: err1 } = await supabase
    .from('dados_acelerado')
    .select('nome_produto')

  if (err1) {
    console.log('Erro dados_acelerado:', err1.message)
    return
  }

  console.log(`Total registros dados_acelerado: ${dadosAcel?.length || 0}`)

  // Produtos únicos
  const produtosUnicos = [...new Set(dadosAcel?.map(d => d.nome_produto) || [])]
  console.log(`\nProdutos únicos: ${produtosUnicos.length}`)

  produtosUnicos.sort().forEach((p, i) => {
    console.log(`  ${i + 1}. ${p}`)
  })

  // Buscar longa duracao
  const { data: dadosLong, error: err2 } = await supabase
    .from('dados_longa_duracao')
    .select('nome_produto')

  if (err2) {
    console.log('\nErro dados_longa_duracao:', err2.message)
    return
  }

  console.log(`\nTotal registros dados_longa_duracao: ${dadosLong?.length || 0}`)

  const produtosLonga = [...new Set(dadosLong?.map(d => d.nome_produto) || [])]
  console.log(`Produtos únicos longa: ${produtosLonga.length}`)
}

checkProdutos().catch(console.error)
