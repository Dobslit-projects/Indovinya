/**
 * Script para testar autenticação e RLS
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function testAuth() {
  console.log('Testando autenticação e RLS...\n')

  // Usar anon key (como o cliente faria)
  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  // 1. Fazer login
  console.log('1. Fazendo login...')
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'henriquedelli2020@gmail.com',
    password: 'dobslitAdm'
  })

  if (authError) {
    console.log(`   ERRO: ${authError.message}`)
    return
  }

  console.log(`   ✓ Login OK - User ID: ${authData.user?.id}`)

  // 2. Buscar perfil
  console.log('\n2. Buscando perfil...')
  const { data: profile, error: profileError } = await supabase
    .from('users_profile')
    .select('*')
    .eq('id', authData.user?.id)
    .single()

  if (profileError) {
    console.log(`   ERRO: ${profileError.message}`)
    console.log(`   Código: ${profileError.code}`)
    console.log(`   Detalhes: ${profileError.details}`)
  } else {
    console.log(`   ✓ Perfil: ${profile?.full_name} (${profile?.role})`)
  }

  // 3. Buscar dados
  console.log('\n3. Buscando dados acelerado...')
  const { data: dados, error: dadosError, count } = await supabase
    .from('dados_acelerado')
    .select('nome_produto', { count: 'exact', head: true })

  if (dadosError) {
    console.log(`   ERRO: ${dadosError.message}`)
    console.log(`   Código: ${dadosError.code}`)
  } else {
    console.log(`   ✓ Total registros acessíveis: ${count}`)
  }

  // 4. Logout
  await supabase.auth.signOut()
  console.log('\n✓ Teste concluído!')
}

testAuth().catch(console.error)
