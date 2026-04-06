import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getFastapiUrl } from '@/lib/config'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { nome_produto, ensaio_normalizado, tipo_estudo, model_name } = body

    if (!nome_produto || !ensaio_normalizado || !tipo_estudo) {
      return NextResponse.json(
        { error: 'Parâmetros obrigatórios: nome_produto, ensaio_normalizado, tipo_estudo' },
        { status: 400 }
      )
    }

    const fastapiUrl = getFastapiUrl()

    const response = await fetch(`${fastapiUrl}/api/analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome_produto, ensaio_normalizado, tipo_estudo, model_name: model_name ?? null }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro na análise:', error)
    return NextResponse.json(
      { error: 'Erro ao conectar com o serviço de análise' },
      { status: 503 }
    )
  }
}
