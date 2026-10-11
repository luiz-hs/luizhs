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
| **Semanal** | Um desafio de encontro, o "Foco da semana" na trilha mais fraca e o resumo da semana |
| **Mensal** | Reavaliação das trilhas, retrospectiva "Nosso mês" e subida de nível |

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
   - Escolher **o que fazer com isso**:
     - "Quero conversar" (o par é avisado com cuidado);
     - "Guardar para a conversa da semana";
     - "Só registrar para mim" (privado).
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
- **Intimidade** usa um registro discreto: ícone neutro e sem detalhes. Cada casal decide se usa esse contador.
- Quando um contador passa da meta, o app sugere uma ação (uma carta, um desafio de encontro), sem culpar ninguém.

#### c) Encontros como desafios do jogo 🎯
- **Planejar um encontro:** data, ideia, local. O convite chega ao par, que aceita, e o encontro vai para o calendário (com exportação para Google/Apple Calendar).
- **Desafios de encontro** (catálogo do jogo), com raridade e trilha associada:
  - "Encontro sem celular" (Comunicação)
  - "Um lugar onde nunca foram" (Tempo juntos)
  - "Recriem o primeiro encontro" (Memórias/Intimidade)
  - "Cozinhem uma receita de outro país" (Parceria)
  - "Planejem uma viagem dos sonhos, mesmo que não façam agora" (Sonhos & Futuro)
- **Registrar um encontro realizado:** foto (opcional), nota de cada um (1–5), "o melhor momento foi…".
- **Prova cooperativa:** o encontro só conta quando **os dois confirmam**. Isso gera XP na trilha do desafio e reinicia o contador "tempo sem sair".
- O **Álbum de encontros** vira a linha do tempo visual do casal.

### 3.4 Cartas e vales 🃏 (o jogo de cartas)
O que já foi validado no protótipo:
- **Pacote do dia** com 3 cartas, em raridades comum, rara, épica e lendária.
- **Coleção / álbum** com cartas bloqueadas e desbloqueadas.
- **Pedir** uma ação ao par ou **dar um vale**. Quem recebe confirma quando a ação acontece.
- **Cartas criadas pelo casal.**

Novidades:
- Cada carta pertence a uma **trilha** e dá XP nela.
- O **heartbeat influencia as sugestões**: quem disse "preciso de carinho" faz as cartas de Carinho aparecerem para o par.
- **QR code nas cartas físicas:** escanear desbloqueia a carta no app. Comprar o baralho físico destrava uma expansão digital.

### 3.5 Progressão: trilhas e níveis 📈

#### Trilhas
Inspiradas em pilares de relacionamentos saudáveis (por exemplo, o trabalho de John Gottman). Cada trilha tem **nível próprio**.

| Trilha | O que mede | Exemplos de ação que dão XP |
|---|---|---|
| 💬 **Comunicação** | Conversar, escutar, resolver conflitos | Heartbeat em sequência, conversas guiadas, pergunta do dia |
| 🔥 **Intimidade & Carinho** | Afeto físico, desejo, sexualidade | Cartas de Carinho/Ousadia, registro de intimidade |
| 🧭 **Tempo juntos** | Encontros, diversão, rotina a dois | Encontros e desafios realizados |
| 🤝 **Parceria & Cuidado** | Divisão de tarefas, apoio, carga mental, dinheiro | Vales de Cuidado, missões de divisão de tarefas |
| 🌱 **Sonhos & Futuro** | Planos, metas, propósito em comum | Perguntas de futuro, desafio "planejar a viagem" |

#### Níveis (iguais para todas as trilhas)
1. **Distantes**
2. **Reaproximando**
3. **Conectados**
4. **Cúmplices**
5. **Inabaláveis**

O **nível geral do casal** é uma combinação das trilhas, com um nome e uma "árvore" visual que cresce.

#### Como o casal "cai" em um nível: a avaliação inicial
- Logo após o pareamento, **cada um responde sozinho** cerca de 4 perguntas por trilha (cerca de 20 no total, em 5 minutos), numa escala de concordância de 1 a 5.
- Exemplos:
  - *Comunicação:* "Quando algo me incomoda, consigo falar sem virar briga."
  - *Intimidade:* "Me sinto desejado(a) pelo meu par."
  - *Tempo juntos:* "Temos momentos a dois que são só nossos, sem telas."
  - *Parceria:* "Sinto que as responsabilidades da casa são bem divididas."
  - *Sonhos:* "Sei quais são os grandes sonhos do meu par."
- **Pontuação da trilha** = média dos dois (0–100), que define o nível inicial. Por exemplo: menos de 40 = nível 1; 40–55 = 2; 55–70 = 3; 70–85 = 4; acima de 85 = 5.
- **Divergência:** se um dá nota alta e o outro baixa na mesma trilha, o app mostra "Vocês enxergam isso de forma diferente" e sugere uma conversa guiada. Esse costuma ser o insight mais valioso.
- O resultado é mostrado como um **mapa do casal** (gráfico de radar com as 5 trilhas), nunca como nota de aprovação ou reprovação.

#### Como subir de nível
Um modelo híbrido, para unir esforço e mudança real:
1. **XP de ações:** cada ação gera XP na trilha correspondente (cartas, encontros, heartbeats, conversas).
2. **Marcos (missões de passagem):** para passar de nível, além do XP, o casal cumpre uma missão-chave da trilha. Exemplo, Comunicação 2 → 3: "Façam 3 conversas guiadas e 14 dias de heartbeat juntos".
3. **Reavaliação mensal:** as perguntas são respondidas de novo. Se a percepção melhorou, isso confirma o nível. Se piorou, a trilha ganha **foco da semana**.

**O nível não cai.** Uma trilha parada fica **"esfriando"** (visual mais apagado, com sugestões de ações), porque perder nível desanimaria justamente quem já está afastado.

#### O que subir de nível destrava
- Cartas épicas e lendárias da trilha
- Desafios de encontro mais ousados
- Conversas guiadas mais profundas
- Itens visuais (árvore do casal, molduras de cartas)

#### Foco da semana
Toda segunda-feira, o app escolhe a **trilha mais fraca** (ou a mais divergente) e propõe 3 missões curtas para ela.

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
│  App mobile (Expo / RN) │        │               Supabase               │
│  iOS + Android (+ web)  │◄──────►│  Auth  ·  Postgres + RLS  ·  Storage │
│  - telas e jogo         │  HTTPS │  Realtime (par vê na hora)           │
│  - cache offline        │  + WS  │  Edge Functions (regras do jogo)     │
│  - PIN/biometria        │        │  pg_cron (lembretes, contadores,     │
│  - widget do heartbeat  │        │           resumos, previsões)        │
└──────────┬──────────────┘        └───────────────┬──────────────────────┘
           │ push                                  │
           ▼                                       ▼
   Expo Push / APNs / FCM                Conteúdo do jogo (cartas, perguntas,
                                         desafios, roteiros) versionado no repo
                                         e publicado em tabelas de catálogo
```

### 4.2 Escolhas e motivos

| Camada | Escolha | Por quê |
|---|---|---|
| App | **React Native com Expo** (TypeScript) | Um código para iOS e Android; push, biometria, widget e câmera (QR das cartas e fotos dos encontros). Também roda na web, se for preciso. |
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
desafios           id, titulo, descricao, trilha_id, raridade, nivel_minimo   (catálogo)
encontros          id, casal_id, desafio_id, status (planejado|realizado|cancelado),
                   data, local, foto_path, melhor_momento
encontro_avaliacoes encontro_id, usuario_id, nota, confirmado_em

-- Progressão
trilhas            id, nome, descricao                                  (catálogo)
niveis             trilha_id, nivel, xp_minimo, marco_id                (catálogo)
perguntas_avaliacao id, trilha_id, texto, invertida                     (catálogo)
avaliacoes         id, casal_id, usuario_id, rodada, respostas (jsonb), feita_em
progresso_trilha   casal_id, trilha_id, pontuacao_avaliacao, xp, nivel, divergencia
eventos_xp         id, casal_id, trilha_id, origem_tipo, origem_id, xp, criado_em
marcos / marcos_casal   missões de passagem de nível e seu andamento

-- Cartas
cartas             id, titulo, descricao, categoria, trilha_id, raridade, qr_codigo  (catálogo)
cartas_casal       id, casal_id, ... (cartas criadas pelo casal)
colecao            usuario_id, carta_id, obtida_em, origem (pacote|qr|bonus)
vales              id, casal_id, carta_id, quem_faz, para_quem, status, recado, ...

-- Conversas
roteiros           id, tema, trilha_id, passos (jsonb)                  (catálogo)
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
| **1 – MVP** (~8–10 semanas) | Pareamento, **heartbeat diário**, avaliação inicial + **trilhas e níveis** (XP simples), cartas e vales, contadores de "tempo sem sair" e "tempo sem intimidade", registro de encontros, notificações | Validar se os casais voltam todo dia (retenção) |
| **2 – Calendário completo** | **Ciclo menstrual**, calendário com camadas, **desafios de encontro**, conversas guiadas, marcos de nível, reavaliação mensal, resumo semanal | Aprofundar o engajamento e o valor percebido |
| **3 – Ponte com o físico** | QR das cartas físicas, expansões, retrospectiva "Nosso mês", integrações (Google/Apple Calendar, Apple Health/Health Connect para o ciclo) | Unir app e baralho; abrir a monetização |

**Monetização (ideia):** freemium. O ritual diário e as trilhas básicas são gratuitos. Uma assinatura "EntreNós+" (do casal, não de cada um) libera desafios e conversas premium, a retrospectiva e as expansões. A compra do baralho físico dá meses de "+" grátis.

### Métricas de sucesso
- % de casais com **os dois** ativos no D7 e no D30
- Sequência média de heartbeat do casal
- Evolução do **termômetro médio** e das **pontuações das trilhas** entre reavaliações
- Encontros realizados por mês e % de incômodos que viraram conversa guiada

---

## 6. Decisões em aberto
1. **Incômodo no heartbeat:** o padrão deve ser "quero conversar" (visível) ou "guardar para a conversa da semana"?
2. **Níveis:** confirmamos que nunca caem (só "esfriam")?
3. **Plataforma do MVP:** app nativo (Expo) desde o início ou um PWA primeiro para validar mais rápido?
4. **Contador de intimidade:** vem ligado por padrão ou o casal ativa?
5. **Avaliação inicial:** a pontuação da trilha usa a **média** dos dois ou a **menor nota** (mais conservadora)?
6. **Protótipo atual (`entrenos/`):** usar como base de regras e conteúdo ou descartar ao migrar para Expo + Supabase?
