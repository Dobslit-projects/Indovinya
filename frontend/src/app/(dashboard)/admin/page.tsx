'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { cn } from '@/lib/utils/cn'
import type { UserProfile } from '@/types'
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  CheckCircle,
  XCircle,
  Pencil,
  Trash2,
  X,
  AlertTriangle
} from 'lucide-react'

interface UserWithEmail extends UserProfile {
  email?: string
}

export default function AdminPage() {
  const router = useRouter()
  const { isAdmin, isLoading: authLoading } = useAuth()
  const [users, setUsers] = useState<UserWithEmail[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<UserWithEmail | null>(null)
  const [deletingUser, setDeletingUser] = useState<UserWithEmail | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    company: '',
    role: 'viewer' as 'admin' | 'viewer'
  })
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirecionar se nao for admin
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/dashboard')
    }
  }, [isAdmin, authLoading, router])

  // Carregar usuarios
  const loadUsers = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/users/list')
      const data = await response.json()
      if (data.users) {
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Erro ao carregar usuarios:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isAdmin) return
    loadUsers()
  }, [isAdmin, loadUsers])

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar usuario')
      }

      await loadUsers()
      setShowModal(false)
      resetForm()
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Erro desconhecido')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    setFormError(null)
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingUser.id,
          full_name: formData.full_name,
          company: formData.company,
          role: formData.role
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao atualizar usuario')
      }

      await loadUsers()
      setEditingUser(null)
      setShowModal(false)
      resetForm()
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Erro ao atualizar')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleActive = async (user: UserWithEmail) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          is_active: !user.is_active
        })
      })

      if (response.ok) {
        setUsers(users.map(u =>
          u.id === user.id ? { ...u, is_active: !u.is_active } : u
        ))
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error)
    }
  }

  const handleDeleteUser = async () => {
    if (!deletingUser) return
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/admin/users?id=${deletingUser.id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao deletar usuario')
      }

      setUsers(users.filter(u => u.id !== deletingUser.id))
      setDeletingUser(null)
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Erro ao deletar')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      full_name: '',
      company: '',
      role: 'viewer'
    })
    setFormError(null)
  }

  const openCreateModal = () => {
    setEditingUser(null)
    resetForm()
    setShowModal(true)
  }

  const openEditModal = (user: UserWithEmail) => {
    setEditingUser(user)
    setFormData({
      email: user.email || '',
      password: '',
      full_name: user.full_name || '',
      company: user.company || '',
      role: user.role
    })
    setShowModal(true)
  }

  if (authLoading || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">
            Administracao de Usuarios
          </h2>
          <p className="text-[var(--text-secondary)]">
            Gerencie os usuarios que tem acesso ao dashboard
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <UserPlus className="w-4 h-4" />
          Novo Usuario
        </Button>
      </div>

      {/* Lista de usuarios */}
      <Card variant="bordered">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Usuarios ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-3 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-[var(--text-muted)]">
              Nenhum usuario cadastrado
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--bg-light)]">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase">
                    Empresa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase">
                    Funcao
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-[var(--text-secondary)] uppercase">
                    Acoes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-light)]">
                {users.map((user, idx) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-[var(--bg-light)]/50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] font-semibold">
                          {user.full_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">
                            {user.full_name || 'Sem nome'}
                          </p>
                          <p className="text-sm text-[var(--text-muted)]">
                            {user.email || user.id.slice(0, 8)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[var(--text-secondary)]">
                      {user.company || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      )}>
                        <Shield className="w-3 h-3" />
                        {user.role === 'admin' ? 'Admin' : 'Viewer'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(user)}
                        className={cn(
                          'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors',
                          user.is_active
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        )}
                      >
                        {user.is_active ? (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            Ativo
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" />
                            Inativo
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-2 text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--bg-light)] rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingUser(user)}
                          className="p-2 text-[var(--text-muted)] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Modal de criacao/edicao */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4"
            >
              <div className="flex items-center justify-between p-6 border-b border-[var(--border-light)]">
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                  {editingUser ? 'Editar Usuario' : 'Novo Usuario'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-[var(--bg-light)] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-[var(--text-muted)]" />
                </button>
              </div>

              <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser}>
                <div className="p-6 space-y-4">
                  {!editingUser && (
                    <>
                      <Input
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        icon={<Mail className="w-5 h-5" />}
                        required
                      />
                      <Input
                        label="Senha"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        minLength={6}
                      />
                    </>
                  )}

                  <Input
                    label="Nome completo"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                  />

                  <Input
                    label="Empresa"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  />

                  <Select
                    label="Funcao"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'viewer' })}
                    options={[
                      { value: 'viewer', label: 'Viewer - Apenas visualizacao' },
                      { value: 'admin', label: 'Admin - Acesso total' }
                    ]}
                  />

                  {formError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                      {formError}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 p-6 border-t border-[var(--border-light)]">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowModal(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" isLoading={isSubmitting}>
                    {editingUser ? 'Salvar' : 'Criar Usuario'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de confirmacao de exclusao */}
      <AnimatePresence>
        {deletingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50"
              onClick={() => setDeletingUser(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6"
            >
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                    Excluir usuario
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">
                    Tem certeza que deseja excluir <strong>{deletingUser.full_name || deletingUser.email}</strong>? Esta acao nao pode ser desfeita.
                  </p>
                </div>
                {formError && (
                  <div className="w-full p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {formError}
                  </div>
                )}
                <div className="flex gap-3 w-full">
                  <Button
                    variant="ghost"
                    className="flex-1"
                    onClick={() => { setDeletingUser(null); setFormError(null) }}
                  >
                    Cancelar
                  </Button>
                  <button
                    onClick={handleDeleteUser}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-sm font-medium"
                  >
                    {isSubmitting ? 'Excluindo...' : 'Excluir'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
