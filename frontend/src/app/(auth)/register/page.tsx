'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react'
import { Suspense } from 'react'

type PageState = 'loading' | 'form' | 'error' | 'success'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [pageState, setPageState] = useState<PageState>('loading')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pageError, setPageError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const handleInviteToken = async () => {
      const supabase = createClient()

      // Ler token_hash e type dos query params
      // Link tem formato: /register?token_hash=HASH&type=invite&email=EMAIL
      const tokenHash = searchParams.get('token_hash')
      const type = searchParams.get('type')
      const emailParam = searchParams.get('email')

      if (!tokenHash || type !== 'invite') {
        setPageError('Link de convite invalido ou expirado. Solicite um novo convite ao administrador.')
        setPageState('error')
        return
      }

      // Verificar o token de convite diretamente (sem passar pelo redirect do Supabase)
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: 'invite'
      })

      if (verifyError || !data.user) {
        console.error('Erro ao verificar convite:', verifyError)
        setPageError(
          verifyError?.message?.includes('expired')
            ? 'O link de convite expirou. Solicite um novo convite ao administrador.'
            : 'Nao foi possivel validar o convite. O link pode ter expirado.'
        )
        setPageState('error')
        return
      }

      setEmail(data.user.email || emailParam || '')
      setPageState('form')
    }

    handleInviteToken()
  }, [searchParams])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      return
    }

    if (password !== confirmPassword) {
      setError('As senhas nao coincidem')
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()

      // Atualizar senha do usuario convidado
      const { error: updateError } = await supabase.auth.updateUser({
        password
      })

      if (updateError) {
        setError(updateError.message)
        return
      }

      setPageState('success')

      // Redirecionar para o dashboard apos 2 segundos
      setTimeout(() => {
        router.push('/dashboard')
        router.refresh()
      }, 2000)
    } catch {
      setError('Erro ao finalizar cadastro. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card variant="elevated" className="animate-fade-in">
      <CardContent className="p-8">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="relative w-48 h-16">
            <Image
              src="/logo-indorama.png"
              alt="Indorama Ventures"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Loading */}
        {pageState === 'loading' && (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-3 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[var(--text-secondary)]">Validando convite...</p>
          </div>
        )}

        {/* Error */}
        {pageState === 'error' && (
          <div className="text-center py-4">
            <div className="flex items-center justify-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-[var(--danger)] text-sm mb-6">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{pageError}</span>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push('/login')}
            >
              Ir para Login
            </Button>
          </div>
        )}

        {/* Success */}
        {pageState === 'success' && (
          <div className="text-center py-4">
            <div className="flex items-center justify-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm mb-4">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>Cadastro realizado com sucesso! Redirecionando...</span>
            </div>
          </div>
        )}

        {/* Form */}
        {pageState === 'form' && (
          <>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                Finalizar Cadastro
              </h1>
              <p className="text-[var(--text-secondary)]">
                Defina sua senha para acessar o dashboard
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-5">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={() => {}}
                icon={<Mail className="w-5 h-5" />}
                disabled
                className="opacity-70"
              />

              <Input
                label="Senha"
                type="password"
                placeholder="Minimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-5 h-5" />}
                required
                minLength={6}
                autoFocus
              />

              <Input
                label="Confirmar Senha"
                type="password"
                placeholder="Repita a senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                icon={<Lock className="w-5 h-5" />}
                required
                minLength={6}
              />

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-[var(--danger)] text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isLoading}
              >
                {isLoading ? 'Finalizando...' : 'Criar Conta'}
              </Button>
            </form>
          </>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-[var(--border-light)] text-center">
          <p className="text-xs text-[var(--text-muted)]">
            Desenvolvido por{' '}
            <span className="font-semibold text-[var(--accent)]">Dobslit</span>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <Card variant="elevated" className="animate-fade-in">
        <CardContent className="p-8">
          <div className="flex justify-center mb-8">
            <div className="relative w-48 h-16">
              <Image
                src="/logo-indorama.png"
                alt="Indorama Ventures"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
          <div className="text-center py-8">
            <div className="w-8 h-8 border-3 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[var(--text-secondary)]">Carregando...</p>
          </div>
        </CardContent>
      </Card>
    }>
      <RegisterForm />
    </Suspense>
  )
}
