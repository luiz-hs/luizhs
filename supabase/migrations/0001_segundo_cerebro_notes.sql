-- Tabela de notas do Segundo Cérebro.
-- "empresa" é hoje só um texto livre (sem autenticação real ainda — ver
-- limitações no SEGUNDO-CEREBRO.md); quando entrar auth de verdade, trocar
-- por uma FK pra tabela de empresas/contas.

create extension if not exists pgcrypto;

create table if not exists public.segundo_cerebro_notes (
  id uuid primary key default gen_random_uuid(),
  empresa text not null,
  area text not null,
  title text not null,
  summary text not null,
  raw_text text not null,
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists segundo_cerebro_notes_empresa_idx
  on public.segundo_cerebro_notes (empresa, created_at desc);

create index if not exists segundo_cerebro_notes_empresa_area_idx
  on public.segundo_cerebro_notes (empresa, area, created_at desc);

-- RLS ligado, sem policies: bloqueia qualquer acesso via chave anon/pública.
-- O app acessa via service role key (só no servidor, nunca no browser),
-- que ignora RLS por padrão.
alter table public.segundo_cerebro_notes enable row level security;
