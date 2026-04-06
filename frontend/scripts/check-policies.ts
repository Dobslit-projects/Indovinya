/**
 * Script para verificar políticas RLS
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkPolicies() {
  console.log('Verificando políticas RLS...\n')

  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
      FROM pg_policies
      WHERE tablename = 'users_profile'
      ORDER BY policyname;
    `
  })

  if (error) {
    // Se rpc não existe, tentar query direta
    const { data: policies, error: err2 } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'users_profile')

    if (err2) {
      console.log('Não foi possível verificar políticas via query.')
      console.log('Execute este SQL no Supabase para ver as políticas:')
      console.log(`
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'users_profile';
      `)
    } else {
      console.log('Políticas encontradas:', policies)
    }
  } else {
    console.log('Políticas:', data)
  }
}

checkPolicies().catch(console.error)
