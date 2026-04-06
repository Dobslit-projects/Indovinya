'use client'

import { useEffect, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './useAuth'

const HEARTBEAT_INTERVAL = 30000 // 30 segundos

export function useSessionTracking() {
  const { user } = useAuth()
  const pathname = usePathname()
  const sessionIdRef = useRef<string | null>(null)
  const lastActivityRef = useRef<Date>(new Date())
  const pagesVisitedRef = useRef<string[]>([])

  // Iniciar sessão
  const startSession = useCallback(async () => {
    if (!user || sessionIdRef.current) return

    try {
      const response = await fetch('/api/track/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await response.json()
      if (data.sessionId) {
        sessionIdRef.current = data.sessionId
        pagesVisitedRef.current = [pathname]
      }
    } catch (error) {
      console.error('Erro ao iniciar sessão:', error)
    }
  }, [user, pathname])

  // Enviar heartbeat
  const sendHeartbeat = useCallback(async () => {
    if (!sessionIdRef.current) return

    const now = new Date()
    const lastActivity = lastActivityRef.current
    const inactiveTime = now.getTime() - lastActivity.getTime()

    // Se inativo por mais de 5 minutos, não contar o tempo
    const duration = inactiveTime > 300000 ? 0 : HEARTBEAT_INTERVAL / 1000

    try {
      await fetch('/api/track/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          duration,
          pagesVisited: pagesVisitedRef.current
        })
      })
    } catch (error) {
      console.error('Erro no heartbeat:', error)
    }
  }, [])

  // Registrar evento
  const trackEvent = useCallback(async (
    eventType: string,
    metadata: Record<string, unknown> = {}
  ) => {
    if (!sessionIdRef.current || !user) return

    try {
      await fetch('/api/track/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          eventType,
          pagePath: pathname,
          metadata
        })
      })
    } catch (error) {
      console.error('Erro ao registrar evento:', error)
    }
  }, [user, pathname])

  // Finalizar sessão
  const endSession = useCallback(async () => {
    if (!sessionIdRef.current) return

    try {
      // Usar sendBeacon para garantir que a requisição seja enviada
      const data = JSON.stringify({ sessionId: sessionIdRef.current })
      navigator.sendBeacon('/api/track/end', data)
    } catch {
      // Fallback para fetch
      try {
        await fetch('/api/track/end', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: sessionIdRef.current }),
          keepalive: true
        })
      } catch (error) {
        console.error('Erro ao finalizar sessão:', error)
      }
    }

    sessionIdRef.current = null
  }, [])

  // Iniciar sessão quando usuário logar
  useEffect(() => {
    if (user) {
      startSession()
    }

    return () => {
      if (sessionIdRef.current) {
        endSession()
      }
    }
  }, [user, startSession, endSession])

  // Registrar mudança de página
  useEffect(() => {
    if (sessionIdRef.current && !pagesVisitedRef.current.includes(pathname)) {
      pagesVisitedRef.current.push(pathname)
      trackEvent('page_view', { page: pathname })
    }
  }, [pathname, trackEvent])

  // Heartbeat periódico
  useEffect(() => {
    const interval = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL)
    return () => clearInterval(interval)
  }, [sendHeartbeat])

  // Detectar atividade do usuário
  useEffect(() => {
    const updateActivity = () => {
      lastActivityRef.current = new Date()
    }

    window.addEventListener('mousemove', updateActivity)
    window.addEventListener('keypress', updateActivity)
    window.addEventListener('click', updateActivity)
    window.addEventListener('scroll', updateActivity)

    return () => {
      window.removeEventListener('mousemove', updateActivity)
      window.removeEventListener('keypress', updateActivity)
      window.removeEventListener('click', updateActivity)
      window.removeEventListener('scroll', updateActivity)
    }
  }, [])

  // Finalizar sessão ao fechar página
  useEffect(() => {
    const handleBeforeUnload = () => {
      endSession()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [endSession])

  return {
    trackEvent,
    sessionId: sessionIdRef.current
  }
}
