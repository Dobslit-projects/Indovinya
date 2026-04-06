import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const { sessionId, duration, pagesVisited } = await request.json()

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID é obrigatório' },
        { status: 400 }
      )
    }

    // Atualizar sessão
    const { error } = await supabase
      .from('session_tracking')
      .update({
        duration_seconds: supabase.rpc('increment_duration', {
          row_id: sessionId,
          amount: duration || 30
        }),
        pages_visited: pagesVisited || []
      })
      .eq('id', sessionId)
      .eq('user_id', user.id)

    // Fallback se RPC não existir
    if (error) {
      // Buscar duração atual
      const { data: session } = await supabase
        .from('session_tracking')
        .select('duration_seconds')
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .single()

      if (session) {
        await supabase
          .from('session_tracking')
          .update({
            duration_seconds: (session.duration_seconds || 0) + (duration || 30),
            pages_visited: pagesVisited || []
          })
          .eq('id', sessionId)
          .eq('user_id', user.id)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro no heartbeat:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
