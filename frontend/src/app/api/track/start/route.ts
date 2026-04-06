import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    // Criar nova sessão
    const { data: session, error } = await supabase
      .from('session_tracking')
      .insert({
        user_id: user.id,
        session_start: new Date().toISOString(),
        duration_seconds: 0,
        pages_visited: []
      })
      .select('id')
      .single()

    if (error) {
      console.error('Erro ao criar sessão:', error)
      return NextResponse.json(
        { error: 'Erro ao criar sessão' },
        { status: 500 }
      )
    }

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error('Erro ao iniciar tracking:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
