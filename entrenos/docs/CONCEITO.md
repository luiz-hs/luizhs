# EntreNós — Conceito, features e arquitetura

> Status: proposta de produto (ainda sem desenvolvimento). O protótipo em `entrenos/` serviu só para validar a mecânica de cartas e vales.

## 1. A ideia

**EntreNós** é um app para casais que sentem que estão se afastando. Ele cria **pequenos rituais diários** e transforma o esforço de se reaproximar em um **jogo cooperativo**: o casal joga junto contra a distância, e não um contra o outro.

O app é a versão digital do **jogo de cartas EntreNós**, e os dois se complementam: as cartas físicas destravam conteúdo no app, e o app dá continuidade ao que acontece na mesa.

### Princípios

1. **Cooperativo, nunca competitivo.** Não há placar de "quem faz mais". O progresso é do casal.
2. **Pouco esforço, todo dia.** O ritual diário leva menos de 1 minuto.
3. **Seguro para ser honesto.** Cada pessoa decide o que o par vê. Um incômodo é um sinal para conversar, não uma arma.
4. **Do digital para o real.** O app só ganha quando o casal faz algo fora da tela: um encontro, uma conversa, um carinho.
5. **Inclusivo.** Serve para qualquer casal. O acompanhamento de ciclo é opcional e é de quem menstrua.

---

## 2. Os ciclos de uso

| Frequência | O que acontece |
|---|---|
| **Diário (~1 min)** | Heartbeat de cada um, carta/pacote do dia e pergunta do dia |
| **Semanal** | Um desafio de encontro, o "Foco da semana" no pilar mais fraco e o resumo da semana |
| **Mensal** | Reavaliação dos pilares, avanço na trilha temática, retrospectiva "Nosso mês" e subida de nível |

---

## 3. Features

### 3.1 Pareamento e perfil
- Um cria o casal e convida o outro por código ou link (WhatsApp).
- Perfil de cada um: nome, data de início da relação, aniversários e horário preferido para o lembrete diário.
- **Metas do casal**, configuradas juntos. Exemplos: "sair a dois a cada 14 dias", "intimidade pelo menos 1x por semana". As metas alimentam os contadores (3.3).

### 3.2 Heartbeat diário ❤️ (check-in de sentimentos)

Todo dia, cada um faz um check-in rápido. É o batimento do casal.

**Perguntas (cinco toques e, se quiser, um texto):**
1. **Como estou me sentindo hoje?** Escala de 5 emojis (😞 → 😄).
2. **Minha energia:** baixa, média ou alta.
3. **Como sinto a nossa relação hoje?** Termômetro de 1 a 5, de "distante" a "muito conectados".
4. **Algo está me incomodando na relação?** Não / Um pouco / Sim.
   - Se for "um pouco" ou "sim": escolher o **tema** (tempo juntos, tarefas de casa, dinheiro, intimidade, comunicação, família, trabalho, ciúmes, outro) e, opcionalmente, escrever.
   - O app **sempre pergunta** o que fazer com isso:
     - **"Avisar agora"**: o par é avisado com cuidado;
     - **"Deixar para a conversa da semana"**: o tema entra na pauta da conversa semanal do casal.
5. **Hoje eu preciso de…:** carinho, espaço, conversa, ajuda ou diversão.
6. *(opcional)* **Gratidão do dia:** "Algo que gostei em você hoje".

**Mecânicas:**
- **Revelação mútua:** o par só vê o heartbeat do outro depois de fazer o seu. Isso incentiva os dois a responder.
- **Sequência do casal:** quantos dias seguidos *os dois* fizeram o heartbeat. A sequência pode ser pausada uma vez por semana, para não punir.
- **Gráfico de "eletrocardiograma":** as duas linhas (humor e termômetro) ao longo da semana e do mês.
- **Sinais automáticos, sempre gentis:**
  - Mesmo tema de incômodo por 3 dias ou mais → sugerir uma **Conversa guiada** (3.6) sobre o tema.
  - Termômetros muito diferentes (por exemplo, 5 contra 2) → "Vocês estão sentindo a relação de jeitos diferentes hoje".
  - "Hoje eu preciso de carinho" → sugerir ao par uma carta de Carinho.
- **Segurança:** se o texto ou as respostas indicarem violência ou risco, o app mostra recursos de ajuda (Ligue 180, CVV 188, 190) de forma discreta, **só para quem escreveu**.

### 3.3 Calendário do casal 📅

Uma visão única com **camadas** que podem ser ligadas e desligadas:

| Camada | O que mostra |
|---|---|
| Heartbeat | A cor do dia de cada um (humor/termômetro) |
| Ciclo | Fases do ciclo menstrual (se compartilhado) |
| Encontros | Encontros planejados e realizados |
| Intimidade | Marcador discreto (ícone neutro) |
| Vales e cartas | Vales cumpridos |
| Datas especiais | Aniversário de namoro, aniversários, datas que o casal criar |

#### a) Ciclo menstrual (opcional)
- Quem menstrua registra o início e o fim da menstruação, o fluxo, os sintomas (cólica, dor de cabeça, inchaço…) e o humor.
- O app **prevê as fases**: menstrual, folicular, ovulatória e lútea/TPM, além da próxima menstruação, com base na média dos ciclos registrados.
- **Compartilhamento controlado pela dona do ciclo**, em três níveis:
  1. O par não vê nada.
  2. O par vê só a fase.
  3. O par vê a fase e os sintomas do dia.
- **Dicas para o par**, conforme a fase. Exemplo: "Fase lútea: mais paciência e cuidado; que tal a carta *Banho preparado*?". As cartas de Cuidado aparecem com mais frequência nesses dias.
- Aviso claro: **não é método contraceptivo** nem diagnóstico médico.

#### b) Contadores ("tempo sem…")
Termômetros que mudam de verde para vermelho conforme se aproximam da meta do casal:
- ⏱️ Dias sem **sair juntos** (encontro a dois)
- ⏱️ Dias sem **intimidade/sexo**
- ⏱️ Dias sem uma **conversa profunda** (conversa guiada ou pergunta do dia respondida pelos dois)
- ⏱️ Contadores personalizados (ex.: "dias sem jantar sem celular")

**Regras:**
- Qualquer um registra, e o par confirma com um toque. Isso evita discussões sobre o que conta.
- **Intimidade** usa um registro discreto: ícone neutro e sem detalhes. O contador vem **ligado por padrão**, e o casal pode desligar.
- Quando um contador passa da meta, o app sugere uma ação (uma carta, um desafio de encontro), sem culpar ninguém.

#### c) Encontros como desafios do jogo 🎯
- **Planejar um encontro:** data, ideia, local. O convite chega ao par, que aceita, e o encontro vai para o calendário (com exportação para Google/Apple Calendar).
- **Desafios de encontro** (catálogo do jogo), com raridade e pilar associado (e podem ser missões das trilhas temáticas):
  - "Encontro sem celular" (Comunicação)
  - "Um lugar onde nunca foram" (Tempo juntos)
  - "Recriem o primeiro encontro" (Memórias/Intimidade)
  - "Cozinhem uma receita de outro país" (Parceria)
  - "Planejem uma viagem dos sonhos, mesmo que não façam agora" (Sonhos & Futuro)
- **Registrar um encontro realizado:** foto (opcional), nota de cada um (1–5), "o melhor momento foi…".
- **Prova cooperativa:** o encontro só conta quando **os dois confirmam**. Isso gera XP no pilar do desafio e reinicia o contador "tempo sem sair".
- O **Álbum de encontros** vira a linha do tempo visual do casal.

### 3.4 Cartas e vales 🃏 (o jogo de cartas)
O que já foi validado no protótipo:
- **Pacote do dia** com 3 cartas, em raridades comum, rara, épica e lendária.
- **Coleção / álbum** com cartas bloqueadas e desbloqueadas.
- **Pedir** uma ação ao par ou **dar um vale**. Quem recebe confirma quando a ação acontece.
- **Cartas criadas pelo casal.**

Novidades:
- Cada carta pertence a um **pilar** e dá XP nele. As trilhas temáticas trazem **cartas míticas exclusivas**.
- O **heartbeat influencia as sugestões**: quem disse "preciso de carinho" faz as cartas de Carinho aparecerem para o par.
- **QR code nas cartas físicas:** escanear desbloqueia a carta no app. Comprar o baralho físico destrava uma expansão digital.

### 3.5 Progressão: pilares, níveis e trilhas temáticas 📈

> Detalhamento completo das trilhas em **[TRILHAS.md](TRILHAS.md)**.

**O mapa mostra onde vocês estão. A trilha é o caminho para subir.**

#### Pilares (o Mapa do casal)
São 5 pilares, inspirados em estudos sobre relacionamentos saudáveis (por exemplo, o trabalho de John Gottman):

| Pilar | O que mede |
|---|---|
| 💬 **Comunicação** | Conversar, escutar, resolver conflitos |
| 🔥 **Intimidade & Carinho** | Afeto físico, desejo, sexualidade |
| 🧭 **Tempo juntos** | Encontros, diversão, rotina a dois |
| 🤝 **Parceria & Cuidado** | Divisão de tarefas, apoio, carga mental, dinheiro |
| 🌱 **Sonhos & Futuro** | Planos, metas, conhecer o outro |

#### Avaliação inicial: onde o casal "cai"
- **Cada um responde sozinho** cerca de 4 perguntas por pilar (umas 20 no total), numa escala de concordância de 1 a 5. Exemplos:
  - *Comunicação:* "Quando algo me incomoda, consigo falar sem virar briga."
  - *Intimidade:* "Me sinto desejado(a) pelo meu par."
- **Pontuação de cada pilar = média dos dois** (0–100). O **nível geral** do casal é a média dos pilares:

  | Pontuação | Nível |
  |---|---|
  | menos de 40 | 1 · Distantes |
  | 40–55 | 2 · Reaproximando |
  | 55–70 | 3 · Conectados |
  | 70–85 | 4 · Cúmplices |
  | acima de 85 | 5 · Inabaláveis |

- **Divergência:** se um dá nota alta e o outro baixa no mesmo pilar, o app mostra "Vocês enxergam isso de forma diferente" e sugere uma conversa guiada.
- O resultado aparece como um **gráfico de radar**, nunca como nota de aprovação ou reprovação.

#### Trilhas temáticas: o caminho para subir
- Cada trilha é uma **jornada narrativa** com 5 etapas (os 5 níveis). Cada etapa tem **fases**, que são lendas ou personagens com um símbolo, uma lição e 3 missões.
- O **nível do casal define a etapa de entrada**. As etapas anteriores ficam abertas como opcionais.
- **Trilha I — Olimpo, "Do Submundo às Estrelas":** mitologia grega, do Submundo ao Olimpo. O casal forma a própria constelação.
- **Trilha II — Arcanos, "A Jornada do Louco":** os 22 Arcanos Maiores do tarô como jornada simbólica, liberada depois do Olimpo ou a partir do nível 3.
- Três camadas de profundidade em cada fase: **jogar** (a lição em uma frase), **a lenda** (a história) e **mergulhar** (simbolismo, psicologia, fontes).
- **O nível nunca cai.** Uma trilha parada "esfria" e o app sugere uma missão leve.
- **Foco da semana:** toda segunda-feira, o app recomenda a fase ou missão da trilha ativa que mais ajuda o pilar mais fraco.

### 3.6 Conversas guiadas 🗣️
O caminho para tratar os incômodos do heartbeat sem brigar:
- Roteiros por tema: tarefas de casa, dinheiro, intimidade, tempo juntos, família…
- Formato estruturado:
  - Cada um fala por um tempo marcado e o outro **repete com as próprias palavras** o que ouviu.
  - No fim, os dois combinam **uma ação pequena**.
- Botão **"pausa"**: se esquentar, o casal pausa e marca para depois.
- A ação combinada pode virar um **vale** ou uma meta, fechando o ciclo com o jogo.

### 3.7 Resumo semanal e "Nosso mês"
- **Semanal:**
  - Média dos termômetros
  - Dias de sequência
  - Encontros realizados
  - Vales cumpridos
  - Temas de incômodo que surgiram (sem expor textos privados)
- **Mensal:** retrospectiva visual (fotos dos encontros, gráfico do heartbeat, evolução das trilhas), que pode ser compartilhada só entre os dois.

### 3.8 Notificações
- Lembrete do heartbeat, no horário que cada um escolher
- "Seu par fez o heartbeat. Faça o seu para ver o dele(a)"
- Pedidos de vale e convites de encontro
- Contador perto de passar da meta
- Mudança de fase do ciclo (só se a dona do ciclo autorizar)
- Tudo pode ser silenciado. Há também o **modo discreto**: textos neutros, sem conteúdo íntimo na tela bloqueada.

### 3.9 Privacidade e segurança
- **Bloqueio do app** com PIN ou biometria e **modo discreto** (ícone e nome neutros).
- **Controle granular**: cada dado tem visibilidade "só eu", "o par" ou "o casal".
- **LGPD:** dados de saúde (ciclo) e de vida sexual são **dados sensíveis** (art. 5º, II, e art. 11). Por isso:
  - consentimento explícito e separado para cada um;
  - criptografia;
  - exportação e exclusão a qualquer momento.
- **Fim da relação:** qualquer um pode **desvincular o casal**. Cada um leva os seus próprios dados, e os dados compartilhados são apagados após um prazo, com aviso.

---

## 4. Arquitetura proposta

### 4.1 Visão geral

```
┌─────────────────────────┐        ┌──────────────────────────────────────┐
│  App web (Next.js PWA)  │        │               Supabase               │
│  instalável no celular  │◄──────►│  Auth  ·  Postgres + RLS  ·  Storage │
│  - telas e jogo         │  HTTPS │  Realtime (par vê na hora)           │
│  - cache offline        │  + WS  │  Edge Functions (regras do jogo)     │
│  - PIN (WebAuthn)       │        │  pg_cron (lembretes, contadores,     │
│                         │        │           resumos, previsões)        │
└──────────┬──────────────┘        └───────────────┬──────────────────────┘
           │ push                                  │
           ▼                                       ▼
   Web Push (VAPID)                      Conteúdo do jogo (cartas, perguntas,
                                         desafios, roteiros) versionado no repo
                                         e publicado em tabelas de catálogo
```

### 4.2 Escolhas e motivos

| Camada | Escolha | Por quê |
|---|---|---|
| App | **Web: Next.js + TypeScript, como PWA** | Valida mais rápido, sem lojas de apps. Instalável na tela inicial, com notificações (Web Push; no iPhone só com o app instalado, iOS 16.4+), câmera para o QR das cartas e fotos, bloqueio por PIN/biometria (WebAuthn). Aproveita o protótipo em Next.js. Se precisar de widget ou recursos nativos, dá para empacotar depois (Capacitor) ou migrar para Expo. |
| Backend | **Supabase** | Postgres com **Row Level Security** (cada casal só enxerga os próprios dados), Auth (e-mail, Google, Apple), **Realtime** (o par vê as atualizações na hora), Storage (fotos) e Edge Functions. Menos infraestrutura para manter. |
| Regras do jogo | **Edge Functions + funções SQL** | XP, níveis, revelação mútua e validação de vales ficam no servidor, para ninguém "trapacear" pelo app. |
| Rotinas agendadas | **pg_cron** | Lembretes diários, foco da semana, resumos, previsão de ciclo, alertas de contadores. |
| Conteúdo | Arquivos no repositório → tabelas de catálogo | Cartas, perguntas, desafios e roteiros são editados sem publicar o app de novo. Fica fácil espelhar o baralho físico. |
| Analytics | PostHog (ou similar) **sem conteúdo sensível** | Medir retenção e uso das features sem nunca enviar textos, ciclo ou intimidade. |

### 4.3 Modelo de dados (principais tabelas)

```
usuarios           id, nome, fuso, horario_lembrete, criado_em
casais             id, codigo_convite, inicio_relacao, metas (jsonb), criado_em
membros            casal_id, usuario_id, entrou_em

-- Heartbeat
heartbeats         id, casal_id, usuario_id, dia, humor, energia, termometro,
                   incomodo (nao|pouco|sim), incomodo_tema, incomodo_texto,
                   incomodo_acao (conversar|guardar|privado), necessidade, gratidao

-- Calendário
ciclo_config       usuario_id, duracao_media, compartilhamento (nada|fase|fase_sintomas)
ciclos             id, usuario_id, inicio, fim, fluxo
ciclo_dias         usuario_id, dia, sintomas[], humor
registros          id, casal_id, tipo (intimidade|saida|conversa|personalizado),
                   dia, criado_por, confirmado_por, confirmado_em
datas_especiais    id, casal_id, titulo, dia, recorrente

-- Encontros e desafios
desafios           id, titulo, descricao, pilar_id, raridade, nivel_minimo   (catálogo)
encontros          id, casal_id, desafio_id, status (planejado|realizado|cancelado),
                   data, local, foto_path, melhor_momento
encontro_avaliacoes encontro_id, usuario_id, nota, confirmado_em

-- Progressão
pilares            id, nome, descricao                                  (catálogo)
perguntas_avaliacao id, pilar_id, texto, invertida                      (catálogo)
avaliacoes         id, casal_id, usuario_id, rodada, respostas (jsonb), feita_em
mapa_pilares       casal_id, pilar_id, pontuacao_avaliacao, xp, divergencia
eventos_xp         id, casal_id, pilar_id, origem_tipo, origem_id, xp, criado_em

-- Trilhas temáticas (conteúdo de catálogo: Olimpo, Arcanos…)
trilhas            id, nome, tema, nivel_liberacao, visual (jsonb)
etapas             id, trilha_id, ordem, nivel, nome, prova_missao_id
fases              id, etapa_id, ordem, nome, simbolo, licao, pilar_id,
                   lenda_md, mergulho_md, carta_mitica_id
missoes            id, fase_id, tipo (conversa|gesto|vivencia|prova), descricao, regra (jsonb)
casal_trilhas      casal_id, trilha_id, ativa, etapa_atual, iniciada_em, concluida_em
casal_missoes      casal_id, missao_id, status, confirmado_por (array), concluida_em
casais.nivel       nível geral (só sobe)

-- Cartas
cartas             id, titulo, descricao, categoria, pilar_id, raridade, qr_codigo  (catálogo)
cartas_casal       id, casal_id, ... (cartas criadas pelo casal)
colecao            usuario_id, carta_id, obtida_em, origem (pacote|qr|bonus)
vales              id, casal_id, carta_id, quem_faz, para_quem, status, recado, ...

-- Conversas
roteiros           id, tema, pilar_id, passos (jsonb)                  (catálogo)
conversas          id, casal_id, roteiro_id, iniciada_por, status, acordo, criada_em
```

### 4.4 Pontos importantes de arquitetura
- **Revelação mútua no banco, não no app:** o heartbeat (e a pergunta do dia) do par só é retornado por uma função/visão que verifica se quem pede já respondeu naquele dia. A RLS impede a leitura direta.
- **Visibilidade por campo:** os textos de incômodo marcados como "privado" e os dados de ciclo fora do nível de compartilhamento escolhido **nunca saem do servidor** para o par.
- **Dados sensíveis criptografados:** ciclo, intimidade e textos privados são criptografados em repouso (Supabase Vault/pgsodium). O ideal no futuro é criptografar os textos já no aparelho.
- **XP como eventos:** todo progresso é um registro em `eventos_xp`. O nível é calculado a partir dos eventos, o que permite **rebalancear o jogo** sem perder histórico e auditar de onde veio cada ponto.
- **Fuso horário:** o "dia" do heartbeat e dos pacotes é calculado no fuso de cada pessoa.
- **Offline:** o heartbeat pode ser feito sem internet e é sincronizado depois.

---

## 5. Roadmap sugerido

| Fase | Entrega | Objetivo |
|---|---|---|
| **1 – MVP web** (~8–10 semanas) | Pareamento, **heartbeat diário**, avaliação inicial + **Trilha Olimpo** (Reinos I e II), cartas e vales, contadores de "tempo sem sair" e "tempo sem intimidade", registro de encontros, notificações | Validar se os casais voltam todo dia (retenção) |
| **2 – Calendário completo** | **Ciclo menstrual**, calendário com camadas, **desafios de encontro**, conversas guiadas, marcos de nível, reavaliação mensal, resumo semanal | Aprofundar o engajamento e o valor percebido |
| **3 – Ponte com o físico** | QR das cartas físicas, expansões, retrospectiva "Nosso mês", integrações (Google/Apple Calendar, Apple Health/Health Connect para o ciclo) | Unir app e baralho; abrir a monetização |

**Monetização (ideia):** freemium. O ritual diário e a Trilha Olimpo são gratuitos. Uma assinatura "EntreNós+" (do casal, não de cada um) libera novas trilhas (Arcanos…), desafios e conversas premium, a retrospectiva e as expansões. A compra do baralho físico dá meses de "+" grátis.

### Métricas de sucesso
- % de casais com **os dois** ativos no D7 e no D30
- Sequência média de heartbeat do casal
- Evolução do **termômetro médio** e das **pontuações dos pilares** entre reavaliações
- Encontros realizados por mês e % de incômodos que viraram conversa guiada

---

## 6. Decisões tomadas
| # | Tema | Decisão |
|---|---|---|
| 1 | Incômodo no heartbeat | O app **pergunta toda vez**: avisar o par agora ou deixar para a conversa da semana |
| 2 | Níveis | **Nunca caem**; trilhas paradas só "esfriam" |
| 3 | Plataforma do MVP | **Versão web** (PWA instalável) |
| 4 | Contador de intimidade | **Ligado por padrão** (pode ser desligado) |
| 5 | Pontuação da avaliação | **Média** dos dois |
| 6 | Protótipo `entrenos/` | **Guardado** como referência de regras e conteúdo |
| 7 | Progressão | **Trilhas temáticas** (Olimpo, Arcanos…) sobre o Mapa de pilares — em validação, ver [TRILHAS.md](TRILHAS.md) |
