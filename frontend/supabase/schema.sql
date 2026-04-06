-- ============================================
-- SCHEMA DO BANCO DE DADOS - INDOVINYA DASHBOARD
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- 1. Perfil de usuários (extensão do auth.users)
CREATE TABLE IF NOT EXISTS users_profile (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  company VARCHAR(255),
  role VARCHAR(50) DEFAULT 'viewer' CHECK (role IN ('admin', 'viewer')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tracking de sessões
CREATE TABLE IF NOT EXISTS session_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_end TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER DEFAULT 0,
  pages_visited JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Eventos de página
CREATE TABLE IF NOT EXISTS page_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES session_tracking(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type VARCHAR(50),
  page_path VARCHAR(255),
  metadata JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Dados de estudo acelerado
CREATE TABLE IF NOT EXISTS dados_acelerado (
  id SERIAL PRIMARY KEY,
  item INTEGER,
  codigo_item VARCHAR(50),
  nome_produto VARCHAR(255),
  descricao_quimica TEXT,
  grau_etoxilacao VARCHAR(100),
  grupo_familia VARCHAR(255),
  familia_produtos VARCHAR(255),
  peso_molecular VARCHAR(50),
  data_inicial_estudo DATE,
  tipo_estudo VARCHAR(50),
  ensaio VARCHAR(255),
  ensaio_normalizado VARCHAR(100),
  categoria_ensaio VARCHAR(100),
  is_quantitativo BOOLEAN,
  metodo VARCHAR(100),
  especificacao VARCHAR(255),
  spec_tipo VARCHAR(20),
  spec_min NUMERIC,
  spec_max NUMERIC,
  periodo VARCHAR(20),
  valor VARCHAR(50),
  is_menor_que BOOLEAN DEFAULT false,
  periodo_dias INTEGER
);

-- 5. Dados de longa duração
CREATE TABLE IF NOT EXISTS dados_longa_duracao (
  id SERIAL PRIMARY KEY,
  item INTEGER,
  codigo_item VARCHAR(50),
  nome_produto VARCHAR(255),
  descricao_quimica TEXT,
  grau_etoxilacao VARCHAR(100),
  grupo_familia VARCHAR(255),
  familia_produtos VARCHAR(255),
  peso_molecular VARCHAR(50),
  data_inicial_estudo DATE,
  tipo_estudo VARCHAR(50),
  ensaio VARCHAR(255),
  ensaio_normalizado VARCHAR(100),
  categoria_ensaio VARCHAR(100),
  is_quantitativo BOOLEAN,
  metodo VARCHAR(100),
  especificacao VARCHAR(255),
  spec_tipo VARCHAR(20),
  spec_min NUMERIC,
  spec_max NUMERIC,
  periodo VARCHAR(20),
  valor VARCHAR(50),
  is_menor_que BOOLEAN DEFAULT false,
  periodo_dias INTEGER
);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_dados_acel_produto ON dados_acelerado(nome_produto);
CREATE INDEX IF NOT EXISTS idx_dados_acel_ensaio ON dados_acelerado(ensaio_normalizado);
CREATE INDEX IF NOT EXISTS idx_dados_acel_categoria ON dados_acelerado(categoria_ensaio);

CREATE INDEX IF NOT EXISTS idx_dados_long_produto ON dados_longa_duracao(nome_produto);
CREATE INDEX IF NOT EXISTS idx_dados_long_ensaio ON dados_longa_duracao(ensaio_normalizado);
CREATE INDEX IF NOT EXISTS idx_dados_long_categoria ON dados_longa_duracao(categoria_ensaio);

CREATE INDEX IF NOT EXISTS idx_session_user ON session_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_session_start ON session_tracking(session_start);

CREATE INDEX IF NOT EXISTS idx_events_session ON page_events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_user ON page_events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON page_events(event_type);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE dados_acelerado ENABLE ROW LEVEL SECURITY;
ALTER TABLE dados_longa_duracao ENABLE ROW LEVEL SECURITY;

-- Políticas para users_profile
CREATE POLICY "Usuários podem ver seu próprio perfil" ON users_profile
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins podem ver todos os perfis" ON users_profile
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins podem atualizar perfis" ON users_profile
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins podem inserir perfis" ON users_profile
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para session_tracking
CREATE POLICY "Usuários podem ver suas próprias sessões" ON session_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias sessões" ON session_tracking
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias sessões" ON session_tracking
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para page_events
CREATE POLICY "Usuários podem ver seus próprios eventos" ON page_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios eventos" ON page_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para dados (todos os usuários ativos podem ler)
CREATE POLICY "Usuários ativos podem ler dados acelerado" ON dados_acelerado
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Usuários ativos podem ler dados longa" ON dados_longa_duracao
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE id = auth.uid() AND is_active = true
    )
  );

-- ============================================
-- FUNÇÃO PARA CRIAR PERFIL AUTOMATICAMENTE
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users_profile (id, full_name, role, is_active)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'viewer',
    true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil ao registrar novo usuário
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- FUNÇÃO PARA ATUALIZAR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_profile_updated_at ON users_profile;
CREATE TRIGGER update_users_profile_updated_at
  BEFORE UPDATE ON users_profile
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
