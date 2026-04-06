'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useShallow } from 'zustand/react/shallow'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { Header } from '@/components/dashboard/Header'
import { useAuth } from '@/hooks/useAuth'
import { useDashboardStore } from '@/store/dashboardStore'
import { DataProvider } from '@/providers/DataProvider'
import { useSessionTracking } from '@/hooks/useSessionTracking'
import { createClient } from '@/lib/supabase/client'
import type { DadosEstudo } from '@/types'

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const lastProdutoRef = useRef<string | null>(null)

  // Tracking de sessao do usuario
  const { trackEvent } = useSessionTracking()

  const {
    modo,
    produtoSelecionado,
    ensaioSelecionado,
    setDadosAcelerado,
    setDadosLonga,
    setIsLoadingDados
  } = useDashboardStore(useShallow(state => ({
    modo: state.modo,
    produtoSelecionado: state.produtoSelecionado,
    ensaioSelecionado: state.ensaioSelecionado,
    setDadosAcelerado: state.setDadosAcelerado,
    setDadosLonga: state.setDadosLonga,
    setIsLoadingDados: state.setIsLoadingDados
  })))

  // Rastrear mudancas de produto
  const prevProdutoTrack = useRef<string | null>(null)
  useEffect(() => {
    if (produtoSelecionado && produtoSelecionado !== prevProdutoTrack.current) {
      prevProdutoTrack.current = produtoSelecionado
      trackEvent('product_select', { product: produtoSelecionado })
    }
  }, [produtoSelecionado, trackEvent])

  // Rastrear mudancas de modo
  const prevModoTrack = useRef<string | null>(null)
  useEffect(() => {
    if (modo && modo !== prevModoTrack.current) {
      prevModoTrack.current = modo
      trackEvent('mode_change', { mode: modo })
    }
  }, [modo, trackEvent])

  // Rastrear mudancas de ensaio
  const prevEnsaioTrack = useRef<string | null>(null)
  useEffect(() => {
    if (ensaioSelecionado && ensaioSelecionado !== prevEnsaioTrack.current) {
      prevEnsaioTrack.current = ensaioSelecionado
      trackEvent('test_select', { test: ensaioSelecionado })
    }
  }, [ensaioSelecionado, trackEvent])

  // Carregar dados do produto selecionado
  useEffect(() => {
    if (!user || !produtoSelecionado || lastProdutoRef.current === produtoSelecionado) return
    lastProdutoRef.current = produtoSelecionado

    const abortController = new AbortController()

    const loadDados = async () => {
      setIsLoadingDados(true)
      const supabase = createClient()

      try {
        const [{ data: dadosAcel }, { data: dadosLong }] = await Promise.all([
          supabase
            .from('dados_acelerado')
            .select('*')
            .eq('nome_produto', produtoSelecionado)
            .order('ensaio_normalizado')
            .order('periodo_dias')
            .abortSignal(abortController.signal),
          supabase
            .from('dados_longa_duracao')
            .select('*')
            .eq('nome_produto', produtoSelecionado)
            .order('ensaio_normalizado')
            .order('periodo_dias')
            .abortSignal(abortController.signal)
        ])

        if (!abortController.signal.aborted) {
          setDadosAcelerado((dadosAcel as DadosEstudo[]) || [])
          setDadosLonga((dadosLong as DadosEstudo[]) || [])
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Erro ao carregar dados:', error)
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoadingDados(false)
        }
      }
    }

    loadDados()

    return () => {
      abortController.abort()
    }
  }, [user, produtoSelecionado, setIsLoadingDados, setDadosAcelerado, setDadosLonga])

  return (
    <div className="min-h-screen bg-[var(--bg-light)]">
      <Sidebar />
      <div className="ml-72">
        <Header />
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()

  // Redirecionar se não autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-light)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
          <p className="text-[var(--text-secondary)]">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <DataProvider>
      <DashboardContent>{children}</DashboardContent>
    </DataProvider>
  )
}
