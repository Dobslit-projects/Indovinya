-- ============================================
-- FIX FINAL - EXECUTE NO SQL EDITOR DO SUPABASE
-- ============================================

-- 1. Remover função problemática
DROP FUNCTION IF EXISTS public.is_admin();

-- 2. Desabilitar RLS em users_profile
ALTER TABLE users_profile DISABLE ROW LEVEL SECURITY;

-- 3. Remover todas as políticas de users_profile
DROP POLICY IF EXISTS "profile_select" ON users_profile;
DROP POLICY IF EXISTS "profile_select_self" ON users_profile;
DROP POLICY IF EXISTS "profile_insert" ON users_profile;
DROP POLICY IF EXISTS "profile_update" ON users_profile;
DROP POLICY IF EXISTS "profile_update_self" ON users_profile;
DROP POLICY IF EXISTS "profile_delete" ON users_profile;

-- 4. Re-habilitar RLS
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;

-- 5. Criar política ÚNICA e SIMPLES para users_profile
-- Qualquer usuário autenticado pode ler qualquer perfil (necessário para admin)
CREATE POLICY "allow_authenticated_read" ON users_profile
  FOR SELECT
  TO authenticated
  USING (true);

-- Usuário pode inserir seu próprio perfil
CREATE POLICY "allow_self_insert" ON users_profile
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Usuário pode atualizar seu próprio perfil
CREATE POLICY "allow_self_update" ON users_profile
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- 6. Verificação
SELECT 'FIX FINAL aplicado com sucesso!' as status;
