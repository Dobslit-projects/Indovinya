'use client'

import { createContext, useContext, useEffect, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useDashboardStore } from '@/store/dashboardStore'
import { useAuth } from '@/hooks/useAuth'
import type { Produto } from '@/types'

const DataContext = createContext<{ loaded: boolean }>({ loaded: false })

export function useDataContext() {
  return useContext(DataContext)
}

// Cache global para evitar recarregar
let produtosLoaded = false

/** Busca todos os registros de uma tabela com paginacao (Supabase limita a 1000 por request) */
async function fetchAll<T>(
  supabase: ReturnType<typeof createClient>,
  table: string,
  select: string
): Promise<T[]> {
  const PAGE_SIZE = 1000
  const all: T[] = []
  let offset = 0

  while (true) {
    const { data } = await supabase
      .from(table)
      .select(select)
      .range(offset, offset + PAGE_SIZE - 1)

    if (!data || data.length === 0) break
    all.push(...(data as T[]))
    if (data.length < PAGE_SIZE) break
    offset += PAGE_SIZE
  }

  return all
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()

  const produtos = useDashboardStore(state => state.produtos)
  const setProdutos = useDashboardStore(state => state.setProdutos)
  const setIsLoadingProdutos = useDashboardStore(state => state.setIsLoadingProdutos)
  const setProdutoSelecionado = useDashboardStore(state => state.setProdutoSelecionado)

  useEffect(() => {
    // Ja carregou ou nao tem user
    if (!user || produtosLoaded || produtos.length > 0) {
      setIsLoadingProdutos(false)
      return
    }

    produtosLoaded = true
    setIsLoadingProdutos(true)

    const supabase = createClient()

    const loadProdutos = async () => {
      try {
        console.log('[DataProvider] Carregando produtos...')

        const [dadosAcel, dadosLong] = await Promise.all([
          fetchAll<{
            nome_produto: string
            codigo_item: string
            descricao_quimica: string | null
            familia_produtos: string | null
            grau_etoxilacao: string | null
            data_inicial_estudo: string | null
          }>(
            supabase,
            'dados_acelerado',
            'nome_produto, codigo_item, descricao_quimica, familia_produtos, grau_etoxilacao, data_inicial_estudo'
          ),
          fetchAll<{ nome_produto: string }>(
            supabase,
            'dados_longa_duracao',
            'nome_produto'
          )
        ])

        const produtosLong = new Set(dadosLong.map(d => d.nome_produto))

        const produtosMap = new Map<string, Produto>()

        dadosAcel.forEach(d => {
          if (!produtosMap.has(d.nome_produto)) {
            produtosMap.set(d.nome_produto, {
              nome_produto: d.nome_produto,
              codigo_item: d.codigo_item,
              descricao_quimica: d.descricao_quimica,
              familia_produtos: d.familia_produtos,
              grau_etoxilacao: d.grau_etoxilacao,
              data_inicial_estudo: d.data_inicial_estudo,
              tem_acelerado: true,
              tem_longa: produtosLong.has(d.nome_produto)
            })
          }
        })

        // Incluir produtos que existem apenas em longa duracao
        dadosLong.forEach(d => {
          if (!produtosMap.has(d.nome_produto)) {
            produtosMap.set(d.nome_produto, {
              nome_produto: d.nome_produto,
              codigo_item: '',
              descricao_quimica: null,
              familia_produtos: null,
              grau_etoxilacao: null,
              data_inicial_estudo: null,
              tem_acelerado: false,
              tem_longa: true
            })
          }
        })

        const produtosList = Array.from(produtosMap.values()).sort((a, b) =>
          a.nome_produto.localeCompare(b.nome_produto)
        )

        console.log(`[DataProvider] Carregados ${produtosList.length} produtos`)

        setProdutos(produtosList)

        if (produtosList.length > 0) {
          setProdutoSelecionado(produtosList[0].nome_produto)
        }
      } catch (error) {
        console.error('[DataProvider] Erro:', error)
        produtosLoaded = false
      } finally {
        setIsLoadingProdutos(false)
      }
    }

    loadProdutos()
  }, [user, produtos.length, setProdutos, setIsLoadingProdutos, setProdutoSelecionado])

  return (
    <DataContext.Provider value={{ loaded: produtosLoaded }}>
      {children}
    </DataContext.Provider>
  )
}
