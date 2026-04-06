-- ============================================
-- FIX RLS - EXECUTE NO SQL EDITOR DO SUPABASE
-- ============================================

-- Desabilitar RLS temporariamente para limpar
ALTER TABLE users_profile DISABLE ROW LEVEL SECURITY;
ALTER TABLE session_tracking DISABLE ROW LEVEL SECURITY;
ALTER TABLE page_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE dados_acelerado DISABLE ROW LEVEL SECURITY;
ALTER TABLE dados_longa_duracao DISABLE ROW LEVEL SECURITY;

-- Remover TODAS as políticas existentes
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON users_profile;
DROP POLICY IF EXISTS "Admins podem ver todos os perfis" ON users_profile;
DROP POLICY IF EXISTS "Admins podem atualizar perfis" ON users_profile;
DROP POLICY IF EXISTS "Admins podem inserir perfis" ON users_profile;
DROP POLICY IF EXISTS "users_profile_select_own" ON users_profile;
DROP POLICY IF EXISTS "users_profile_admin_all" ON users_profile;
DROP POLICY IF EXISTS "Usuários ativos podem ler dados acelerado" ON dados_acelerado;
DROP POLICY IF EXISTS "Usuários ativos podem ler dados longa" ON dados_longa_duracao;
DROP POLICY IF EXISTS "dados_acelerado_select" ON dados_acelerado;
DROP POLICY IF EXISTS "dados_longa_duracao_select" ON dados_longa_duracao;
DROP POLICY IF EXISTS "Usuários podem ver suas próprias sessões" ON session_tracking;
DROP POLICY IF EXISTS "Usuários podem inserir suas próprias sessões" ON session_tracking;
DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias sessões" ON session_tracking;
DROP POLICY IF EXISTS "Usuários podem ver seus próprios eventos" ON page_events;
DROP POLICY IF EXISTS "Usuários podem inserir seus próprios eventos" ON page_events;

-- Re-habilitar RLS
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE dados_acelerado ENABLE ROW LEVEL SECURITY;
ALTER TABLE dados_longa_duracao ENABLE ROW LEVEL SECURITY;

-- ============================================
-- NOVAS POLÍTICAS SIMPLES (SEM RECURSÃO)
-- ============================================

-- users_profile: usuário vê apenas seu próprio perfil
CREATE POLICY "profile_select_self" ON users_profile
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- users_profile: qualquer usuário autenticado pode inserir (para trigger)
CREATE POLICY "profile_insert" ON users_profile
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- users_profile: usuário pode atualizar seu próprio perfil
CREATE POLICY "profile_update_self" ON users_profile
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- session_tracking: políticas para usuário autenticado
CREATE POLICY "session_select" ON session_tracking
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "session_insert" ON session_tracking
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "session_update" ON session_tracking
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- page_events: políticas para usuário autenticado
CREATE POLICY "events_select" ON page_events
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "events_insert" ON page_events
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- dados: qualquer usuário autenticado pode ler
CREATE POLICY "dados_acel_select" ON dados_acelerado
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "dados_long_select" ON dados_longa_duracao
  FOR SELECT TO authenticated
  USING (true);

SELECT 'RLS corrigido com sucesso!' as status;
