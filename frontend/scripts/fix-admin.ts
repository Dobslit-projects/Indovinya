/**
 * Script para corrigir role do usuário para admin
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixAdmin() {
  console.log('Corrigindo role do usuário para admin...\n')

  const { error } = await supabase
    .from('users_profile')
    .update({ role: 'admin' })
    .eq('full_name', 'Henrique Costa')

  if (error) {
    console.log(`ERRO: ${error.message}`)
  } else {
    console.log('✓ Role atualizado para admin!')
  }

  // Verificar
  const { data } = await supabase
    .from('users_profile')
    .select('full_name, role')
    .single()

  console.log(`\nUsuário: ${data?.full_name} - Role: ${data?.role}`)
}

fixAdmin().catch(console.error)
