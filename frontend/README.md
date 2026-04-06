# Dashboard de Estabilidade - Indovinya

Dashboard de análise de estabilidade de produtos químicos para Indorama Ventures.

## Stack Tecnológico

- **Framework:** Next.js 14 (App Router)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS
- **Gráficos:** Recharts
- **Animações:** Framer Motion
- **Estado:** Zustand
- **Backend:** Supabase (Auth + PostgreSQL)
- **Deploy:** Vercel

## Pré-requisitos

1. Node.js 18+
2. Conta no [Supabase](https://supabase.com)
3. Conta na [Vercel](https://vercel.com) (para deploy)

## Configuração do Supabase

### 1. Criar projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um novo projeto
2. Anote a **URL do projeto** e a **anon key** (em Settings > API)
3. Anote também a **service_role key** (necessária para criar usuários)

### 2. Executar o schema SQL

1. Vá em SQL Editor no dashboard do Supabase
2. Cole e execute o conteúdo do arquivo `supabase/schema.sql`

### 3. Criar o primeiro usuário admin

No SQL Editor do Supabase, execute:

```sql
-- Após criar o primeiro usuário via Auth > Users
UPDATE users_profile
SET role = 'admin'
WHERE id = 'UUID_DO_USUARIO';
```

## Configuração Local

### 1. Instalar dependências

```bash
cd indorama-next
npm install
```

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
```

### 3. Migrar dados do Excel para Supabase

Certifique-se de que os arquivos `dados_acelerado.xlsx` e `dados_longa_duracao.xlsx` estão na pasta pai do projeto:

```bash
npm run migrate-data
```

### 4. Executar em desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## Deploy na Vercel

### 1. Push para GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/seu-usuario/indorama-dashboard.git
git push -u origin main
```

### 2. Importar no Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Clique em "Add New Project"
3. Importe o repositório do GitHub
4. Configure as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Clique em "Deploy"

## Estrutura do Projeto

```
indorama-next/
├── src/
│   ├── app/                    # App Router pages
│   │   ├── (auth)/            # Páginas de autenticação
│   │   │   └── login/
│   │   ├── (dashboard)/       # Páginas protegidas
│   │   │   ├── dashboard/
│   │   │   └── admin/
│   │   └── api/               # API Routes
│   │       ├── admin/users/
│   │       └── track/
│   ├── components/
│   │   ├── ui/                # Componentes base
│   │   ├── charts/            # Gráficos Recharts
│   │   └── dashboard/         # Componentes do dashboard
│   ├── hooks/                 # Custom hooks
│   ├── lib/                   # Utilitários
│   │   ├── supabase/          # Clients Supabase
│   │   └── utils/
│   ├── store/                 # Zustand store
│   └── types/                 # TypeScript types
├── public/                    # Assets estáticos
├── supabase/                  # SQL schemas
└── scripts/                   # Scripts de migração
```

## Funcionalidades

### Autenticação
- Login com email/senha via Supabase Auth
- Proteção de rotas via middleware
- Sessões persistentes

### Dashboard
- 4 modos de visualização:
  - **Acelerado:** Dados de estudo acelerado
  - **Longa Duração:** Dados de longa duração
  - **Comparar:** Gráficos lado a lado
  - **Mesclar:** Dados sobrepostos com normalização (×4)
- Métricas em tempo real (conformidade, alertas)
- Gráficos interativos com Recharts
- Tabelas por categoria de ensaio

### Admin
- Criar/editar usuários
- Ativar/desativar contas
- Definir roles (admin/viewer)

### Tracking
- Registro de sessões de uso
- Tracking de eventos (mudança de página, produto, modo)
- Heartbeat a cada 30 segundos
- Detecção de inatividade

## Tema e Cores

```css
--primary: #003366      /* Azul Indorama */
--secondary: #0055a4
--accent: #00a3e0       /* Azul Dobslit */
--success: #00a651      /* Verde */
--warning: #f59e0b
--danger: #c8102e       /* Vermelho Indorama */
```

## Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Inicia servidor de produção |
| `npm run lint` | Executa ESLint |
| `npm run migrate-data` | Migra dados Excel → Supabase |

## Troubleshooting

### Erro de autenticação
- Verifique se as variáveis de ambiente estão corretas
- Confirme que o schema SQL foi executado no Supabase

### Dados não aparecem
- Execute `npm run migrate-data` para importar os dados
- Verifique se o usuário tem `is_active = true` no perfil

### Erro ao criar usuário
- Certifique-se de que `SUPABASE_SERVICE_ROLE_KEY` está configurada
- Verifique se o usuário logado tem role `admin`

## Desenvolvido por

**Dobslit** - Especialistas em soluções de dados
