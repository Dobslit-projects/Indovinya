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

    let sessionId: string

    // Tentar ler como JSON ou como texto (sendBeacon envia como text/plain)
    const contentType = request.headers.get('content-type')

    if (contentType?.includes('application/json')) {
      const body = await request.json()
      sessionId = body.sessionId
    } else {
      const text = await request.text()
      try {
        const body = JSON.parse(text)
        sessionId = body.sessionId
      } catch {
        return NextResponse.json(
          { error: 'Formato inválido' },
          { status: 400 }
        )
      }
    }

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID é obrigatório' },
        { status: 400 }
      )
    }

    // Finalizar sessão
    const { error } = await supabase
      .from('session_tracking')
      .update({
        session_end: new Date().toISOString()
      })
      .eq('id', sessionId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Erro ao finalizar sessão:', error)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao finalizar tracking:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
