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

async function requireAdmin() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: NextResponse.json({ error: 'Nao autenticado' }, { status: 401 }) }
  }

  const adminClient = getAdminClient()
  const { data: profile } = await adminClient
    .from('users_profile')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: NextResponse.json({ error: 'Sem permissao' }, { status: 403 }) }
  }

  return { user }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin()
    if ('error' in auth && auth.error) return auth.error

    const { email, full_name, company, role } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email e obrigatorio' },
        { status: 400 }
      )
    }

    const adminClient = getAdminClient()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://189.126.105.45:3000'

    // Gerar link de convite via Supabase Admin API
    const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
      type: 'invite',
      email,
      options: {
        redirectTo: `${appUrl}/register`
      }
    })

    if (linkError) {
      return NextResponse.json(
        { error: linkError.message },
        { status: 400 }
      )
    }

    // Criar perfil do usuario convidado
    const { error: profileError } = await adminClient
      .from('users_profile')
      .insert({
        id: linkData.user.id,
        full_name: full_name || null,
        company: company || null,
        role: role || 'viewer',
        is_active: true
      })

    if (profileError) {
      // Se o perfil ja existe (usuario re-convidado), atualizar
      if (profileError.code === '23505') {
        await adminClient
          .from('users_profile')
          .update({
            full_name: full_name || null,
            company: company || null,
            role: role || 'viewer',
            updated_at: new Date().toISOString()
          })
          .eq('id', linkData.user.id)
      } else {
        await adminClient.auth.admin.deleteUser(linkData.user.id)
        return NextResponse.json(
          { error: 'Erro ao criar perfil: ' + profileError.message },
          { status: 400 }
        )
      }
    }

    // Construir link direto para /register com token_hash
    // Isso evita depender do SITE_URL do Supabase (que pode ser localhost)
    // O registro usa verifyOtp() no client-side para validar o token
    const properties = linkData.properties
    const actionLink = properties?.action_link || ''

    // Extrair token_hash da action_link do Supabase
    let tokenHash = ''
    if (actionLink) {
      const actionUrl = new URL(actionLink)
      tokenHash = actionUrl.searchParams.get('token') || ''
    }

    if (!tokenHash) {
      return NextResponse.json(
        { error: 'Erro ao gerar token de convite' },
        { status: 500 }
      )
    }

    // Link direto para nossa pagina de registro (sem passar pelo Supabase redirect)
    const inviteLink = `${appUrl}/register?token_hash=${encodeURIComponent(tokenHash)}&type=invite&email=${encodeURIComponent(email)}`

    return NextResponse.json({
      success: true,
      invite_link: inviteLink,
      user: {
        id: linkData.user.id,
        email: linkData.user.email
      }
    })
  } catch (error) {
    console.error('Erro ao convidar usuario:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
