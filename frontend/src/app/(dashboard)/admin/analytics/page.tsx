'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { cn } from '@/lib/utils/cn'
import {
  BarChart3,
  Clock,
  Users,
  MousePointerClick,
  TrendingUp,
  Eye,
  Calendar,
  Activity,
  RefreshCw
} from 'lucide-react'

interface Session {
  id: string
  user_id: string
  session_start: string
  session_end: string | null
  duration_seconds: number
  pages_visited: string[]
  created_at: string
}

interface PageEvent {
  id: string
  session_id: string
  user_id: string
  event_type: string
  page_path: string
  metadata: Record<string, unknown>
  timestamp: string
}

interface AnalyticsData {
  sessions: Session[]
  events: PageEvent[]
  userNames: Record<string, string>
  userEmails: Record<string, string>
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${h}h ${m}m`
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'agora'
  if (minutes < 60) return `${minutes}min atras`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h atras`
  const days = Math.floor(hours / 24)
  return `${days}d atras`
}

export default function AnalyticsPage() {
  const router = useRouter()
  const { isAdmin, isLoading: authLoading } = useAuth()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/dashboard')
    }
  }, [isAdmin, authLoading, router])

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/analytics')
      const result = await response.json()
      if (result.sessions) {
        setData(result)
      }
    } catch (error) {
      console.error('Erro ao carregar analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isAdmin) return
    loadData()
  }, [isAdmin, loadData])

  // Metricas calculadas
  const metrics = useMemo(() => {
    if (!data) return null

    const { sessions, events, userNames } = data

    // Usuarios unicos
    const uniqueUsers = new Set(sessions.map(s => s.user_id))

    // Tempo total e medio
    const totalDuration = sessions.reduce((sum, s) => sum + s.duration_seconds, 0)
    const avgDuration = sessions.length > 0 ? Math.round(totalDuration / sessions.length) : 0

    // Sessoes ativas (sem session_end ou nos ultimos 5 min)
    const now = new Date()
    const activeSessions = sessions.filter(s => {
      if (!s.session_end) return true
      const end = new Date(s.session_end)
      return now.getTime() - end.getTime() < 300000
    })

    // Produtos mais acessados
    const productEvents = events.filter(e => e.event_type === 'product_select')
    const productCounts = new Map<string, number>()
    productEvents.forEach(e => {
      const product = (e.metadata?.product as string) || (e.metadata?.produto as string) || 'N/A'
      productCounts.set(product, (productCounts.get(product) || 0) + 1)
    })
    const topProducts = Array.from(productCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)

    // Modos mais usados
    const modeEvents = events.filter(e => e.event_type === 'mode_change')
    const modeCounts = new Map<string, number>()
    modeEvents.forEach(e => {
      const mode = (e.metadata?.mode as string) || (e.metadata?.modo as string) || 'N/A'
      modeCounts.set(mode, (modeCounts.get(mode) || 0) + 1)
    })

    // Sessoes por usuario
    const sessionsByUser = new Map<string, Session[]>()
    sessions.forEach(s => {
      if (!sessionsByUser.has(s.user_id)) {
        sessionsByUser.set(s.user_id, [])
      }
      sessionsByUser.get(s.user_id)!.push(s)
    })

    const userStats = Array.from(sessionsByUser.entries()).map(([userId, userSessions]) => {
      const totalTime = userSessions.reduce((sum, s) => sum + s.duration_seconds, 0)
      const lastSession = userSessions[0]
      return {
        userId,
        name: userNames[userId] || userId.slice(0, 8),
        email: data.userEmails[userId] || '',
        sessionCount: userSessions.length,
        totalTime,
        avgTime: Math.round(totalTime / userSessions.length),
        lastActive: lastSession?.session_start || ''
      }
    }).sort((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime())

    // Sessoes por dia (ultimos 30 dias)
    const dailySessions = new Map<string, number>()
    sessions.forEach(s => {
      const day = new Date(s.session_start).toISOString().split('T')[0]
      dailySessions.set(day, (dailySessions.get(day) || 0) + 1)
    })

    // Eventos por tipo
    const eventTypeCounts = new Map<string, number>()
    events.forEach(e => {
      eventTypeCounts.set(e.event_type, (eventTypeCounts.get(e.event_type) || 0) + 1)
    })

    return {
      totalSessions: sessions.length,
      uniqueUsers: uniqueUsers.size,
      totalDuration,
      avgDuration,
      activeSessions: activeSessions.length,
      topProducts,
      modeCounts: Object.fromEntries(modeCounts),
      userStats,
      dailySessions: Object.fromEntries(dailySessions),
      eventTypeCounts: Object.fromEntries(eventTypeCounts),
      recentSessions: sessions.slice(0, 15)
    }
  }, [data])

  if (authLoading || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (isLoading || !metrics) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Analytics</h2>
        </div>
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
            <p className="text-[var(--text-secondary)]">Carregando dados de uso...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">
            Analytics de Uso
          </h2>
          <p className="text-[var(--text-secondary)]">
            Observabilidade do comportamento dos usuarios
          </p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--bg-light)] text-[var(--text-secondary)] hover:bg-gray-100 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Atualizar
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Sessoes Ativas',
            value: metrics.activeSessions,
            icon: Activity,
            color: 'text-green-600',
            bg: 'bg-green-50'
          },
          {
            label: 'Total de Sessoes',
            value: metrics.totalSessions,
            icon: BarChart3,
            color: 'text-blue-600',
            bg: 'bg-blue-50'
          },
          {
            label: 'Usuarios Unicos',
            value: metrics.uniqueUsers,
            icon: Users,
            color: 'text-purple-600',
            bg: 'bg-purple-50'
          },
          {
            label: 'Tempo Medio',
            value: formatDuration(metrics.avgDuration),
            icon: Clock,
            color: 'text-orange-600',
            bg: 'bg-orange-50'
          }
        ].map((kpi, idx) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card variant="bordered">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[var(--text-muted)]">{kpi.label}</p>
                    <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">
                      {kpi.value}
                    </p>
                  </div>
                  <div className={cn('p-3 rounded-xl', kpi.bg)}>
                    <kpi.icon className={cn('w-6 h-6', kpi.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Uso por usuario */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card variant="bordered">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Uso por Usuario
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {metrics.userStats.length === 0 ? (
                <div className="p-8 text-center text-[var(--text-muted)]">
                  Nenhuma sessao registrada ainda
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-[var(--bg-light)]">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase">Usuario</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-[var(--text-secondary)] uppercase">Sessoes</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-[var(--text-secondary)] uppercase">Tempo Total</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--text-secondary)] uppercase">Ultimo Acesso</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-light)]">
                    {metrics.userStats.map((user) => (
                      <tr key={user.userId} className="hover:bg-[var(--bg-light)]/50">
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-[var(--text-primary)]">{user.name}</p>
                            <p className="text-xs text-[var(--text-muted)]">{user.email}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                            {user.sessionCount}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-[var(--text-secondary)]">
                          {formatDuration(user.totalTime)}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-[var(--text-muted)]">
                          {user.lastActive ? timeAgo(user.lastActive) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Produtos mais acessados */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card variant="bordered">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Produtos Mais Consultados
              </CardTitle>
            </CardHeader>
            <CardContent>
              {metrics.topProducts.length === 0 ? (
                <div className="py-8 text-center text-[var(--text-muted)]">
                  Nenhum evento de produto registrado ainda.
                  Os dados aparecerao conforme os usuarios navegam.
                </div>
              ) : (
                <div className="space-y-3">
                  {metrics.topProducts.map(([product, count], idx) => {
                    const maxCount = metrics.topProducts[0][1]
                    const width = Math.max(10, (count / maxCount) * 100)

                    return (
                      <div key={product} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[var(--text-primary)] font-medium truncate mr-2">
                            {idx + 1}. {product}
                          </span>
                          <span className="text-[var(--text-muted)] whitespace-nowrap">
                            {count}x
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <motion.div
                            className="h-2 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]"
                            initial={{ width: 0 }}
                            animate={{ width: `${width}%` }}
                            transition={{ duration: 0.5, delay: idx * 0.05 }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Modos de visualizacao */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card variant="bordered">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Modos de Visualizacao
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(metrics.modeCounts).length === 0 ? (
                <div className="py-8 text-center text-[var(--text-muted)]">
                  Nenhum evento de modo registrado
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(metrics.modeCounts)
                    .sort((a, b) => b[1] - a[1])
                    .map(([mode, count]) => (
                      <div key={mode} className="flex items-center justify-between p-3 bg-[var(--bg-light)] rounded-lg">
                        <span className="text-sm font-medium text-[var(--text-primary)] capitalize">{mode}</span>
                        <span className="text-sm text-[var(--text-muted)]">{count}x</span>
                      </div>
                    ))
                  }
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Tipos de evento */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card variant="bordered">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MousePointerClick className="w-5 h-5" />
                Tipos de Eventos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(metrics.eventTypeCounts).length === 0 ? (
                <div className="py-8 text-center text-[var(--text-muted)]">
                  Nenhum evento registrado
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(metrics.eventTypeCounts)
                    .sort((a, b) => b[1] - a[1])
                    .map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between p-3 bg-[var(--bg-light)] rounded-lg">
                        <span className="text-sm font-medium text-[var(--text-primary)]">{type}</span>
                        <span className="text-sm text-[var(--text-muted)]">{count}</span>
                      </div>
                    ))
                  }
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Sessoes recentes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card variant="bordered">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Sessoes Recentes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {metrics.recentSessions.length === 0 ? (
                <div className="p-8 text-center text-[var(--text-muted)]">
                  Nenhuma sessao registrada
                </div>
              ) : (
                <div className="divide-y divide-[var(--border-light)]">
                  {metrics.recentSessions.map((session) => {
                    const isActive = !session.session_end
                    return (
                      <div key={session.id} className="px-4 py-3 hover:bg-[var(--bg-light)]/50">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-[var(--text-primary)]">
                            {data?.userNames[session.user_id] || session.user_id.slice(0, 8)}
                          </span>
                          {isActive ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                              Ativa
                            </span>
                          ) : (
                            <span className="text-xs text-[var(--text-muted)]">
                              {formatDuration(session.duration_seconds)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[var(--text-muted)]">
                          {formatDate(session.session_start)}
                        </p>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
