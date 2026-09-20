# 🧠 Segundo Cérebro

MVP de um "segundo cérebro" para dono de pequena/média empresa: captura
rápida de anotações soltas, organizadas por IA em áreas fixas de negócio, e
um chat que responde perguntas puxando contexto dessas anotações.

## Como rodar

```bash
npm install
cp .env.example .env.local
# preencha SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY (obrigatórios) e
# ANTHROPIC_API_KEY (opcional)
npm run dev                  # abre em http://localhost:3000/segundo-cerebro
```

Antes de rodar, crie a tabela no seu projeto Supabase: cole o conteúdo de
`supabase/migrations/0001_segundo_cerebro_notes.sql` no SQL Editor do painel
Supabase (ou rode via `supabase db push` se usar a CLI).

## Como usar

1. Na primeira visita, informe o nome da empresa (fica salvo só no seu
   navegador — cada empresa tem sua própria memória).
2. Escolha uma área (Visão & Estratégia, Financeiro, Marketing & Vendas,
   Operações, Pessoas & Equipe, Clientes) e escreva qualquer anotação solta.
   Com `ANTHROPIC_API_KEY` configurada, a IA organiza em título + resumo +
   tags; sem ela, a nota é salva como veio (sem organização).
3. Na aba **💬 Perguntar**, faça perguntas em linguagem natural — a resposta
   usa as notas salvas em todas as áreas como contexto.

## O que funciona sem credenciais

`SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` são obrigatórios — sem eles a
página carrega mas as rotas de API retornam erro 500 (mensagem clara
pedindo pra configurar). `ANTHROPIC_API_KEY` é opcional:

| Recurso | Sem `ANTHROPIC_API_KEY` | Com `ANTHROPIC_API_KEY` |
|---|---|---|
| Captura e listagem de notas | ✅ | ✅ |
| Organização da nota (título/resumo/tags) | ⚠️ nota salva sem organizar | ✅ |
| Perguntar ao segundo cérebro | ⚠️ lista as notas mais recentes | ✅ resposta gerada com contexto |

## Estrutura

- `pages/segundo-cerebro/index.js` — interface (áreas de captura + chat);
- `pages/api/segundo-cerebro/notes.js` — CRUD de notas (`GET`/`POST`/`DELETE`);
- `pages/api/segundo-cerebro/ask.js` — pergunta ao segundo cérebro;
- `lib/segundo-cerebro/areas.js` — as 6 áreas fixas do framework de captura;
- `lib/segundo-cerebro/supabase.js` — cliente Supabase server-side (service
  role key — nunca importar fora das rotas `/api`);
- `lib/segundo-cerebro/store.js` — CRUD de notas na tabela
  `segundo_cerebro_notes`;
- `lib/segundo-cerebro/ai.js` — organização de notas e resposta a perguntas
  via Claude (com fallback sem IA);
- `supabase/migrations/0001_segundo_cerebro_notes.sql` — schema da tabela.

## Limitações do MVP (o que falta pra produção)

- **Sem autenticação** — o "empresa" é só um nome salvo no navegador, não
  uma conta real: qualquer pessoa que souber o nome da empresa lê/escreve
  as mesmas notas. A tabela tem RLS ligado mas sem policies porque o app
  acessa via `service_role` (ignora RLS); quando entrar auth de verdade
  (ex: Supabase Auth), trocar a coluna `empresa` por uma FK de conta e
  escrever policies por dono, e aí sim o client pode usar a `anon`/
  publishable key direto do browser em vez de passar pela API.
- **Busca por contexto simples** — usa sobreposição de palavras, não
  embeddings. Funciona bem em baixo volume (dezenas/centenas de notas);
  crescendo além disso, migrar para `pgvector` (o Supabase já suporta
  nativamente).
- **Sem export real pro Obsidian** — a nota tem título/resumo/tags/corpo
  estruturados na tabela, mas falta um endpoint que monte um `.zip` de
  arquivos `.md` com frontmatter pro cliente baixar e abrir no Obsidian
  dele.
