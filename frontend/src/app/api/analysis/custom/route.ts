import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getFastapiUrl } from '@/lib/config'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const { data_points, spec_min, spec_max, spec_tipo, especificacao, model_name } = body

    if (!data_points || !Array.isArray(data_points) || data_points.length < 3) {
      return NextResponse.json(
        { error: 'Minimo 3 datapoints necessarios' },
        { status: 400 }
      )
    }

    const fastapiUrl = getFastapiUrl()

    const response = await fetch(`${fastapiUrl}/api/analysis/custom`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data_points,
        spec_min: spec_min ?? null,
        spec_max: spec_max ?? null,
        spec_tipo: spec_tipo ?? null,
        especificacao: especificacao ?? null,
        model_name: model_name ?? null,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro na analise custom:', error)
    return NextResponse.json(
      { error: 'Erro ao conectar com o servico de analise' },
      { status: 503 }
    )
  }
}
