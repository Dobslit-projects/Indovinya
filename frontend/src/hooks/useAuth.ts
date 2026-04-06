'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { UserProfile } from '@/types'

export function useAuth() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    // Checar sessão inicial
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      console.log('[useAuth] Session:', session?.user?.id)
      setUser(session?.user ?? null)

      if (session?.user) {
        supabase
          .from('users_profile')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data }: any) => {
            console.log('[useAuth] Profile loaded:', data?.role)
            setProfile(data as UserProfile)
            setIsLoading(false)
          })
      } else {
        setIsLoading(false)
      }
    })

    // Listener de mudanças
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: any, session: any) => {
        console.log('[useAuth] Event:', event)
        setUser(session?.user ?? null)

        if (session?.user) {
          supabase
            .from('users_profile')
            .select('*')
            .eq('id', session.user.id)
            .single()
            .then(({ data }: any) => {
              setProfile(data as UserProfile)
            })
        } else {
          setProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signOut = useCallback(async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }, [router])

  return {
    user,
    profile,
    isLoading,
    isAdmin: profile?.role === 'admin',
    signOut,
  }
}
