/**
 * Script para criar usuário admin no Supabase
 *
 * Uso: npx tsx scripts/create-admin.ts
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Carregar variáveis de ambiente do .env.local
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Erro: Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createAdminUser() {
  console.log('=========================================')
  console.log('CRIANDO USUÁRIO ADMIN')
  console.log('=========================================\n')

  const email = 'henriquedelli2020@gmail.com'
  const password = 'dobslitAdm'
  const fullName = 'Henrique Costa'

  try {
    // 1. Criar usuário no Auth
    console.log('1. Criando usuário no Supabase Auth...')
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Confirma email automaticamente
      user_metadata: {
        full_name: fullName
      }
    })

    if (authError) {
      console.error('Erro ao criar usuário:', authError.message)
      process.exit(1)
    }

    console.log(`   ✓ Usuário criado com ID: ${authData.user.id}`)

    // 2. Criar perfil na tabela users_profile
    console.log('\n2. Criando perfil de admin...')
    const { error: profileError } = await supabase
      .from('users_profile')
      .insert({
        id: authData.user.id,
        full_name: fullName,
        company: 'Indorama',
        role: 'admin',
        is_active: true
      })

    if (profileError) {
      console.error('Erro ao criar perfil:', profileError.message)
      // Usuário já foi criado, então continua
    } else {
      console.log('   ✓ Perfil de admin criado')
    }

    console.log('\n=========================================')
    console.log('USUÁRIO ADMIN CRIADO COM SUCESSO!')
    console.log('=========================================')
    console.log(`\nCredenciais de acesso:`)
    console.log(`  Email: ${email}`)
    console.log(`  Senha: ${password}`)
    console.log(`\nAcesse: http://localhost:3001/login`)

  } catch (error) {
    console.error('Erro inesperado:', error)
    process.exit(1)
  }
}

createAdminUser()
