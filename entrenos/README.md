# 💞 EntreNós

Aplicativo para casais que querem se reaproximar. É a versão digital do jogo de cartas **EntreNós**: cada um desbloqueia e coleciona cartas de ações (carinho, conversa, cuidado, aventura, memórias, romance, ousadia) e troca **vales** com o par.

## Como funciona

1. **Pareamento** — um cria o baralho e recebe um código de 6 letras (ou link de convite). O par entra com o código.
2. **Pacote do dia** — todo dia cada um abre um pacote com 3 cartas. As novas vão para a coleção; as repetidas viram +2 pontos.
3. **Vales** — com uma carta da coleção você pode:
   - **Pedir**: seu par faz a ação para você (ele topa ou deixa para outro dia);
   - **Dar**: você promete fazer, e seu par usa o vale quando quiser.

   Quando a ação acontece, **quem recebeu confirma** ("Aconteceu ❤️"). O casal ganha pontos de conexão e quem fez ganha um **pacote bônus**.
4. **Níveis** — os pontos sobem o nível do casal (Reencontro → Faísca → Sintonia → … → Lenda). Cartas **épicas** aparecem no nível 3 e **lendárias** no nível 5.
5. **Pergunta do dia** — os dois respondem; as respostas só aparecem quando ambos responderem (+15 pontos).
6. **Cartas nossas** — o casal pode criar cartas personalizadas, disponíveis para os dois.
7. **Nossa história** — linha do tempo, placar de vales cumpridos e respostas anteriores.

| Raridade | Pontos ao cumprir | Aparece a partir do |
|---|---|---|
| ★ Comum | 10 | nível 1 |
| ★★ Rara | 20 | nível 1 |
| ★★★ Épica | 40 | nível 3 |
| ★★★★ Lendária | 80 | nível 5 |
| ♥ Nossa (criada pelo casal) | 25 | — |

## Rodando

```bash
cd entrenos
npm install
npm run dev      # http://localhost:3000
npm test         # testes da lógica do jogo
```

Abra em dois navegadores (ou um normal + uma aba anônima) para simular o casal. O app sincroniza a cada 5 segundos.

## Dados e hospedagem

- **Padrão:** os dados ficam em `data/entrenos.json` — funciona localmente ou em qualquer servidor Node com disco (Railway, Render, VPS).
- **Vercel:** como lá não há disco persistente, crie um banco **Upstash Redis / Vercel KV** e defina `KV_REST_API_URL` e `KV_REST_API_TOKEN` (veja `.env.example`).

Não há cadastro com e-mail/senha: cada pessoa recebe um token salvo no aparelho. Em **Nós → Este aparelho** dá para copiar um *link de acesso pessoal* para abrir em outro dispositivo.

## Estrutura

- `lib/cards.js` — catálogo com 54 cartas (fácil de editar — pode espelhar o baralho físico)
- `lib/questions.js` — perguntas do dia
- `lib/rules.js` — níveis, raridades e chances dos pacotes
- `lib/game.js` — regras do jogo no servidor (pacotes, vales, perguntas)
- `lib/store.js` — armazenamento (arquivo JSON ou Upstash)
- `pages/api/casal.js` — API única (`POST { action, ... }`)
- `pages/index.js` — o app (Início, Coleção, Vales, Nós)

## Próximos passos possíveis

- Notificações push quando o par pede algo ou responde a pergunta
- QR code nas cartas físicas que desbloqueia a carta no app
- Login com e-mail para recuperar a conta
- Baralhos temáticos (aniversário de namoro, viagem, fim de semana)
