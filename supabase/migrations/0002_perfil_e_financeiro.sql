-- Perfil de negócio capturado no onboarding (ver lib/segundo-cerebro/onboarding.js)
-- e lançamentos financeiros estruturados (receitas/despesas) — complementam
-- as notas livres de segundo_cerebro_notes com dados que alimentam o
-- diagnóstico por IA e o painel de faturamento.

create table if not exists public.business_profile (
  empresa text primary key,
  modelo_negocio text not null,
  segmento text not null,
  tempo_mercado text not null,
  faturamento_mensal text not null,
  numero_funcionarios text not null,
  principal_desafio text not null,
  objetivo_12_meses text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.business_diagnostico (
  empresa text primary key references public.business_profile (empresa) on delete cascade,
  conteudo text not null,
  source text not null default 'template',
  created_at timestamptz not null default now()
);

create table if not exists public.financeiro_lancamentos (
  id uuid primary key default gen_random_uuid(),
  empresa text not null,
  tipo text not null check (tipo in ('receita', 'despesa')),
  categoria text not null,
  descricao text not null,
  valor numeric(12, 2) not null check (valor > 0),
  data date not null,
  created_at timestamptz not null default now()
);

create index if not exists financeiro_lancamentos_empresa_data_idx
  on public.financeiro_lancamentos (empresa, data desc);

-- RLS ligado, sem policies — mesmo racional de 0001: o app acessa via
-- service_role (ignora RLS) porque ainda não há autenticação real.
alter table public.business_profile enable row level security;
alter table public.business_diagnostico enable row level security;
alter table public.financeiro_lancamentos enable row level security;
