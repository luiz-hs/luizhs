# 🧠 Segundo Cérebro

MVP de um "segundo cérebro" para dono de pequena/média empresa: captura
rápida de anotações soltas, organizadas por IA em áreas fixas de negócio, e
um chat que responde perguntas puxando contexto dessas anotações.

## Como rodar

```bash
npm install
cp .env.example .env.local   # opcional — preencha ANTHROPIC_API_KEY
npm run dev                  # abre em http://localhost:3000/segundo-cerebro
```

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
- `lib/segundo-cerebro/store.js` — armazenamento em arquivos `.md` com
  frontmatter (um "vault" compatível com Obsidian por baixo da interface);
- `lib/segundo-cerebro/ai.js` — organização de notas e resposta a perguntas
  via Claude (com fallback sem IA).

Cada nota vira um arquivo em `data/segundo-cerebro/<empresa>/<área>/*.md`
(pasta ignorada pelo git — é dado do cliente, não código).

## Limitações do MVP (o que falta pra produção)

- **Sem autenticação** — o "empresa" é só um nome salvo no navegador, não
  uma conta real. Qualquer pessoa que souber o nome da empresa acessa as
  mesmas notas pelo mesmo navegador/domínio.
- **Armazenamento em disco local** — funciona rodando local ou num servidor
  com disco persistente (ex: um VPS). Numa serverless (Vercel), os arquivos
  não persistem entre deploys/invocações — para produção multi-cliente,
  trocar `lib/segundo-cerebro/store.js` por Postgres/Supabase mantendo o
  mesmo formato de nota (título, área, tags, corpo).
  Vale considerar Supabase já que a infra do usuário tem esse serviço
  disponível.
- **Busca por contexto simples** — usa sobreposição de palavras, não
  embeddings. Funciona bem em baixo volume (dezenas/centenas de notas);
  cresceu além disso, migrar para busca vetorial.
- **Sem export real pro Obsidian** — os arquivos `.md` já são compatíveis
  (frontmatter + markdown), mas falta um botão de download do vault
  completo (zip) para o cliente abrir no Obsidian dele.
