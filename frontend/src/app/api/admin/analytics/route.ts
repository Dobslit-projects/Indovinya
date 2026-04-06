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
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })
    }

    const adminClient = getAdminClient()

    // Verificar admin
    const { data: profile } = await adminClient
      .from('users_profile')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Sem permissao' }, { status: 403 })
    }

    // Buscar todas as sessoes
    const { data: sessions } = await adminClient
      .from('session_tracking')
      .select('*')
      .order('session_start', { ascending: false })
      .limit(500)

    // Buscar todos os eventos
    const { data: events } = await adminClient
      .from('page_events')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(2000)

    // Buscar perfis
    const { data: profiles } = await adminClient
      .from('users_profile')
      .select('id, full_name, company, role')

    // Buscar emails
    const { data: { users: authUsers } } = await adminClient.auth.admin.listUsers()

    const emailMap = new Map<string, string>()
    const nameMap = new Map<string, string>()
    authUsers?.forEach(u => {
      if (u.email) emailMap.set(u.id, u.email)
    })
    profiles?.forEach(p => {
      nameMap.set(p.id, p.full_name || emailMap.get(p.id) || p.id.slice(0, 8))
    })

    return NextResponse.json({
      sessions: sessions || [],
      events: events || [],
      userNames: Object.fromEntries(nameMap),
      userEmails: Object.fromEntries(emailMap)
    })
  } catch (error) {
    console.error('Erro ao buscar analytics:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
