# Indorama — Plataforma de Análise de Shelf Life

Sistema web para análise estatística de shelf life de produtos, com fitting de modelos de degradação e cálculo de vida útil.

## Arquitetura

```
├── backend/          → API REST (FastAPI + Python)
├── frontend/         → Interface web (Next.js 16 + React 19)
├── data/             → Datasets de ensaios (CSV/XLSX)
├── legacy/           → App Streamlit (descontinuado)
└── docker-compose.yml
```

**Stack:**

| Camada     | Tecnologia                              |
|------------|----------------------------------------|
| Frontend   | Next.js 16, React 19, Tailwind CSS 4, Recharts, Zustand |
| Backend    | FastAPI, Pydantic v2, NumPy, SciPy, Statsmodels |
| Banco      | Supabase (PostgreSQL + Auth)           |
| Infra      | Docker Compose                         |

## Pré-requisitos

- Docker e Docker Compose
- Node.js 20+ (desenvolvimento local do frontend)
- Python 3.11+ (desenvolvimento local do backend)

## Setup

### 1. Variáveis de ambiente

Crie um arquivo `.env` na raiz com:

```env
SUPABASE_URL=<url-do-projeto-supabase>
SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

### 2. Subir com Docker

```bash
docker compose up --build
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- Health check: `http://localhost:8000/health`

### 3. Desenvolvimento local

**Backend:**

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

## Testes

```bash
# Backend
cd backend && pytest

# Frontend
cd frontend && npm test
```

## Módulos principais

### Backend (`backend/app/`)

- `routers/analysis.py` — Endpoints da API de análise
- `services/fitting.py` — Fitting de modelos estatísticos (regressão, degradação)
- `services/shelf_life.py` — Cálculo de shelf life a partir dos modelos ajustados
- `services/supabase_client.py` — Cliente Supabase para persistência

### Frontend (`frontend/src/`)

- `app/(auth)/` — Fluxo de autenticação
- `app/(dashboard)/` — Páginas do dashboard
- `app/api/` — Route handlers (BFF)
- `components/` — Componentes React reutilizáveis
- `store/` — Estado global (Zustand)
- `hooks/` — Custom hooks
- `lib/` — Utilitários e clients
