/**
 * Script para verificar conexão com banco de dados
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkDatabase() {
  console.log('Verificando conexão com Supabase...\n')

  // 1. Verificar dados_acelerado
  console.log('1. Tabela dados_acelerado:')
  const { data: acel, error: acelError, count: acelCount } = await supabase
    .from('dados_acelerado')
    .select('*', { count: 'exact', head: true })

  if (acelError) {
    console.log(`   ERRO: ${acelError.message}`)
  } else {
    console.log(`   ✓ Total de registros: ${acelCount}`)
  }

  // 2. Verificar dados_longa_duracao
  console.log('\n2. Tabela dados_longa_duracao:')
  const { data: long, error: longError, count: longCount } = await supabase
    .from('dados_longa_duracao')
    .select('*', { count: 'exact', head: true })

  if (longError) {
    console.log(`   ERRO: ${longError.message}`)
  } else {
    console.log(`   ✓ Total de registros: ${longCount}`)
  }

  // 3. Verificar users_profile
  console.log('\n3. Tabela users_profile:')
  const { data: profiles, error: profileError } = await supabase
    .from('users_profile')
    .select('id, full_name, role, is_active')

  if (profileError) {
    console.log(`   ERRO: ${profileError.message}`)
  } else {
    console.log(`   ✓ Usuários: ${profiles?.length || 0}`)
    profiles?.forEach(p => {
      console.log(`     - ${p.full_name} (${p.role}) - ${p.is_active ? 'Ativo' : 'Inativo'}`)
    })
  }

  // 4. Verificar produtos únicos
  console.log('\n4. Produtos disponíveis:')
  const { data: produtos } = await supabase
    .from('dados_acelerado')
    .select('nome_produto')

  const produtosUnicos = [...new Set(produtos?.map(p => p.nome_produto) || [])]
  console.log(`   ✓ ${produtosUnicos.length} produtos únicos`)

  if (produtosUnicos.length <= 10) {
    produtosUnicos.forEach(p => console.log(`     - ${p}`))
  } else {
    produtosUnicos.slice(0, 5).forEach(p => console.log(`     - ${p}`))
    console.log(`     ... e mais ${produtosUnicos.length - 5} produtos`)
  }

  console.log('\n✓ Verificação concluída!')
}

checkDatabase().catch(console.error)
