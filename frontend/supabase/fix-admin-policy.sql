-- ============================================
-- FIX ADMIN POLICY - EXECUTE NO SQL EDITOR DO SUPABASE
-- ============================================

-- Criar função segura para verificar se é admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users_profile
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remover políticas antigas de users_profile
DROP POLICY IF EXISTS "profile_select_self" ON users_profile;
DROP POLICY IF EXISTS "profile_insert" ON users_profile;
DROP POLICY IF EXISTS "profile_update_self" ON users_profile;

-- Nova política: usuário vê seu perfil OU admin vê todos
CREATE POLICY "profile_select" ON users_profile
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id
    OR
    public.is_admin()
  );

-- Política de insert: trigger ou admin
CREATE POLICY "profile_insert" ON users_profile
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = id
    OR
    public.is_admin()
  );

-- Política de update: próprio perfil ou admin
CREATE POLICY "profile_update" ON users_profile
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id
    OR
    public.is_admin()
  );

-- Política de delete: apenas admin
CREATE POLICY "profile_delete" ON users_profile
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

SELECT 'Políticas de admin corrigidas!' as status;
