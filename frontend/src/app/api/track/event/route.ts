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

    const { sessionId, eventType, pagePath, metadata } = await request.json()

    if (!sessionId || !eventType) {
      return NextResponse.json(
        { error: 'sessionId e eventType são obrigatórios' },
        { status: 400 }
      )
    }

    // Registrar evento
    const { error } = await supabase
      .from('page_events')
      .insert({
        session_id: sessionId,
        user_id: user.id,
        event_type: eventType,
        page_path: pagePath || '/',
        metadata: metadata || {},
        timestamp: new Date().toISOString()
      })

    if (error) {
      console.error('Erro ao registrar evento:', error)
      return NextResponse.json(
        { error: 'Erro ao registrar evento' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao registrar evento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
