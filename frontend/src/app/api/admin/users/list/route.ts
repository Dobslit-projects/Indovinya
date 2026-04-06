import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

export async function GET() {
  try {
    // Verificar autenticacao
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })
    }

    const adminClient = getAdminClient()

    // Verificar se e admin
    const { data: profile } = await adminClient
      .from('users_profile')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Sem permissao' }, { status: 403 })
    }

    // Buscar todos os perfis
    const { data: profiles } = await adminClient
      .from('users_profile')
      .select('*')
      .order('created_at', { ascending: false })

    // Buscar emails dos usuarios via admin API
    const { data: { users: authUsers } } = await adminClient.auth.admin.listUsers()

    const emailMap = new Map<string, string>()
    authUsers?.forEach(u => {
      if (u.email) emailMap.set(u.id, u.email)
    })

    // Combinar perfis com emails
    const usersWithEmail = (profiles || []).map(p => ({
      ...p,
      email: emailMap.get(p.id) || null
    }))

    return NextResponse.json({ users: usersWithEmail })
  } catch (error) {
    console.error('Erro ao listar usuarios:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
