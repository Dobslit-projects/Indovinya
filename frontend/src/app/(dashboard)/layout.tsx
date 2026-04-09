'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useShallow } from 'zustand/react/shallow'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { Navbar } from '@/components/dashboard/Navbar'
import { useAuth } from '@/hooks/useAuth'
import { useDashboardStore } from '@/store/dashboardStore'
import { DataProvider } from '@/providers/DataProvider'
import { useSessionTracking } from '@/hooks/useSessionTracking'
import { createClient } from '@/lib/supabase/client'
import type { DadosEstudo } from '@/types'

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const lastProdutoRef = useRef<string | null>(null)
  const lastFamiliaRef = useRef<string | null>(null)

  // Tracking de sessao do usuario
  const { trackEvent } = useSessionTracking()

  const {
    modo,
    filtroTipo,
    produtoSelecionado,
    familiaSelecionada,
    ensaioSelecionado,
    produtos,
    setDadosAcelerado,
    setDadosLonga,
    setIsLoadingDados
  } = useDashboardStore(useShallow(state => ({
    modo: state.modo,
    filtroTipo: state.filtroTipo,
    produtoSelecionado: state.produtoSelecionado,
    familiaSelecionada: state.familiaSelecionada,
    ensaioSelecionado: state.ensaioSelecionado,
    produtos: state.produtos,
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
    if (!user || filtroTipo !== 'produto' || !produtoSelecionado || lastProdutoRef.current === produtoSelecionado) return
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
  }, [user, filtroTipo, produtoSelecionado, setIsLoadingDados, setDadosAcelerado, setDadosLonga])

  // Carregar dados da familia selecionada
  useEffect(() => {
    if (!user || filtroTipo !== 'familia' || !familiaSelecionada || lastFamiliaRef.current === familiaSelecionada) return
    lastFamiliaRef.current = familiaSelecionada

    const abortController = new AbortController()

    const loadDadosFamilia = async () => {
      setIsLoadingDados(true)
      const supabase = createClient()

      // Buscar nomes dos produtos desta familia
      const produtosDaFamilia = produtos
        .filter(p => p.familia_produtos === familiaSelecionada)
        .map(p => p.nome_produto)

      if (produtosDaFamilia.length === 0) {
        setDadosAcelerado([])
        setDadosLonga([])
        setIsLoadingDados(false)
        return
      }

      try {
        const [{ data: dadosAcel }, { data: dadosLong }] = await Promise.all([
          supabase
            .from('dados_acelerado')
            .select('*')
            .in('nome_produto', produtosDaFamilia)
            .order('nome_produto')
            .order('ensaio_normalizado')
            .order('periodo_dias')
            .abortSignal(abortController.signal),
          supabase
            .from('dados_longa_duracao')
            .select('*')
            .in('nome_produto', produtosDaFamilia)
            .order('nome_produto')
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
          console.error('Erro ao carregar dados da familia:', error)
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoadingDados(false)
        }
      }
    }

    loadDadosFamilia()

    return () => {
      abortController.abort()
    }
  }, [user, filtroTipo, familiaSelecionada, produtos, setIsLoadingDados, setDadosAcelerado, setDadosLonga])

  // Reset refs quando muda o tipo de filtro
  useEffect(() => {
    if (filtroTipo === 'produto') {
      lastFamiliaRef.current = null
    } else {
      lastProdutoRef.current = null
    }
  }, [filtroTipo])

  return (
    <div className="min-h-screen bg-[var(--bg-light)]">
      <Navbar />
      <Sidebar />
      <div className="ml-72 pt-16">
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

  // Redirecionar se nao autenticado
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
