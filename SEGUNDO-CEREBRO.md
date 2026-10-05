# 🧠 Segundo Cérebro

Produto de IA pra dono de pequena/média empresa: um onboarding que
mapeia o modelo de negócio, um diagnóstico gerado por IA a partir dele, um
painel de faturamento (receitas/despesas) e um "segundo cérebro" de notas
por área que alimenta um chat de perguntas e respostas.

## Como rodar

```bash
npm install
cp .env.example .env.local
# preencha SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY (obrigatórios) e
# ANTHROPIC_API_KEY (opcional)
npm run dev                  # abre em http://localhost:3000/segundo-cerebro
```

Antes de rodar, crie as tabelas no seu projeto Supabase: cole o conteúdo de
`supabase/migrations/0001_segundo_cerebro_notes.sql` e
`supabase/migrations/0002_perfil_e_financeiro.sql` (nessa ordem) no SQL
Editor do painel Supabase (ou rode via `supabase db push` se usar a CLI).

## Como usar

1. Na primeira visita, informe o nome da empresa (fica salvo só no seu
   navegador — cada empresa tem sua própria memória) e responda o
   onboarding: modelo de negócio (franquia/marca própria), segmento, tempo
   de mercado, faixa de faturamento, tamanho da equipe e maior desafio.
2. Ao final, a IA gera um **diagnóstico inicial** (resumo do negócio, pontos
   de atenção e prioridades para 90 dias) com base nas respostas — pode
   gerar de novo quando quiser.
3. Na aba **💰 Faturamento**, lance receitas e despesas (categoria, valor,
   data) e acompanhe o saldo; esses números entram no próximo diagnóstico.
4. Nas demais abas (Visão & Estratégia, Financeiro, Marketing & Vendas,
   Operações, Pessoas & Equipe, Clientes), escreva anotações soltas — a IA
   organiza em título + resumo + tags.
5. Na aba **💬 Perguntar**, faça perguntas em linguagem natural — a resposta
   usa as notas salvas em todas as áreas como contexto.

## O que funciona sem credenciais

`SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` são obrigatórios — sem eles a
página carrega mas as rotas de API retornam erro 500 (mensagem clara
pedindo pra configurar). `ANTHROPIC_API_KEY` é opcional:

| Recurso | Sem `ANTHROPIC_API_KEY` | Com `ANTHROPIC_API_KEY` |
|---|---|---|
| Onboarding, faturamento, captura e listagem de notas | ✅ | ✅ |
| Diagnóstico inicial | ⚠️ gerado por regras simples (desafio → conselho fixo) | ✅ análise personalizada |
| Organização da nota (título/resumo/tags) | ⚠️ nota salva sem organizar | ✅ |
| Perguntar ao segundo cérebro | ⚠️ lista as notas mais recentes | ✅ resposta gerada com contexto |

## Estrutura

- `pages/segundo-cerebro/index.js` — interface (onboarding, diagnóstico,
  faturamento, áreas de captura e chat);
- `pages/api/segundo-cerebro/profile.js` — perfil de negócio (`GET`/`POST`);
- `pages/api/segundo-cerebro/diagnostico.js` — diagnóstico por IA
  (`GET` busca o salvo, `POST` gera/regenera);
- `pages/api/segundo-cerebro/financeiro.js` — lançamentos financeiros
  (`GET`/`POST`/`DELETE`, com totais agregados);
- `pages/api/segundo-cerebro/notes.js` — CRUD de notas (`GET`/`POST`/`DELETE`);
- `pages/api/segundo-cerebro/ask.js` — pergunta ao segundo cérebro;
- `lib/segundo-cerebro/areas.js` — as 6 áreas fixas do framework de captura;
- `lib/segundo-cerebro/onboarding.js` — as perguntas do onboarding;
- `lib/segundo-cerebro/categorias.js` — categorias de receita/despesa
  (compartilhado entre API e UI, sem dependência de servidor);
- `lib/segundo-cerebro/supabase.js` — cliente Supabase server-side (service
  role key — nunca importar fora das rotas `/api`);
- `lib/segundo-cerebro/store.js` — CRUD de notas na tabela
  `segundo_cerebro_notes`;
- `lib/segundo-cerebro/profile-store.js` — CRUD de `business_profile` e
  `business_diagnostico`;
- `lib/segundo-cerebro/financeiro-store.js` — CRUD de
  `financeiro_lancamentos` e cálculo de totais;
- `lib/segundo-cerebro/ai.js` — organização de notas, resposta a perguntas e
  geração do diagnóstico via Claude (com fallback sem IA);
- `supabase/migrations/0001_segundo_cerebro_notes.sql` e
  `0002_perfil_e_financeiro.sql` — schema das tabelas.

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
- **Faturamento é lançamento manual** — sem integração com banco/Pix/NF-e;
  cada receita/despesa é digitada. Pra reduzir fricção, o próximo passo
  natural é importar extrato (CSV/OFX) ou conectar via open finance, em vez
  de pedir que o dono digite tudo.
- **Diagnóstico é só a "primeira foto"** — gerado uma vez no onboarding
  (ou quando o dono clica em regenerar), não reage automaticamente a cada
  novo lançamento financeiro ou nota. Para virar algo "vivo", a próxima
  evolução é recalcular quando houver dado novo relevante (ex: X
  lançamentos desde o último diagnóstico) em vez de depender de o dono
  clicar.
