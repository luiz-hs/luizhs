// Catálogo de cartas do EntreNós.
// Cada carta é uma ação que um pode pedir ao outro (ou oferecer como "vale").

export const CATEGORIES = {
  carinho: { label: 'Carinho', emoji: '🤗', color: '#f28b82' },
  conversa: { label: 'Conversa', emoji: '💬', color: '#7aa7e8' },
  cuidado: { label: 'Cuidado', emoji: '🫖', color: '#7cc4a4' },
  aventura: { label: 'Aventura', emoji: '🧭', color: '#f0b45a' },
  memorias: { label: 'Memórias', emoji: '📸', color: '#b39ddb' },
  romance: { label: 'Romance', emoji: '🌹', color: '#e0607e' },
  ousadia: { label: 'Ousadia', emoji: '🔥', color: '#d9534f' },
};

export const RARITIES = {
  comum: { label: 'Comum', stars: 1, points: 10 },
  rara: { label: 'Rara', stars: 2, points: 20 },
  epica: { label: 'Épica', stars: 3, points: 40 },
  lendaria: { label: 'Lendária', stars: 4, points: 80 },
  especial: { label: 'Nossa', stars: 0, points: 25 }, // cartas criadas pelo casal
};

const c = (id, category, rarity, title, desc) => ({ id, category, rarity, title, desc });

export const CARDS = [
  // Carinho
  c('ca01', 'carinho', 'comum', 'Cafuné sem pressa', '15 minutos de cafuné, sem celular por perto.'),
  c('ca02', 'carinho', 'comum', 'Abraço de 20 segundos', 'Um abraço longo, daqueles que acalmam. Contando até 20.'),
  c('ca03', 'carinho', 'comum', 'Bom dia caprichado', 'Acordar com beijo, carinho e um "bom dia" de verdade.'),
  c('ca04', 'carinho', 'rara', 'Massagem nos pés', '20 minutos de massagem nos pés, com creme e sem reclamar.'),
  c('ca05', 'carinho', 'rara', 'Massagem nas costas', 'Massagem relaxante nas costas e ombros, com óleo.'),
  c('ca06', 'carinho', 'comum', 'Conchinha de domingo', 'Ficar de conchinha na cama até alguém precisar levantar.'),
  c('ca07', 'carinho', 'epica', 'Dia do mimo', 'Um dia inteiro em que eu sou mimado(a): você decide tudo pensando em mim.'),
  c('ca08', 'carinho', 'comum', 'Beijo de cinema', 'Um beijo demorado, no meio da sala, sem motivo nenhum.'),

  // Conversa
  c('co01', 'conversa', 'comum', 'Como foi seu dia, de verdade?', '20 minutos ouvindo sobre o meu dia, sem conselhos — só escuta.'),
  c('co02', 'conversa', 'comum', 'Três coisas que admiro', 'Me diga três coisas que você admira em mim, olhando nos olhos.'),
  c('co03', 'conversa', 'rara', 'Papo sem telas', 'Uma hora de conversa com os celulares em outro cômodo.'),
  c('co04', 'conversa', 'rara', 'Carta escrita à mão', 'Uma carta escrita à mão, para eu guardar.'),
  c('co05', 'conversa', 'comum', 'Áudio surpresa', 'Um áudio no meio do dia dizendo por que você gosta de mim.'),
  c('co06', 'conversa', 'epica', 'Nossos sonhos', 'Uma noite para falar de planos: onde queremos estar daqui a 5 anos.'),
  c('co07', 'conversa', 'rara', 'Pedido de desculpas sincero', 'Aquele pedido de desculpas que ficou pendente, sem "mas".'),
  c('co08', 'conversa', 'comum', 'Elogio em público', 'Me elogiar na frente de alguém (amigos, família, garçom...).'),
  c('co09', 'conversa', 'lendaria', 'Votos renovados', 'Escrever e ler em voz alta novos votos/promessas para nós dois.'),

  // Cuidado
  c('cu01', 'cuidado', 'comum', 'Café na cama', 'Café da manhã servido na cama, do jeito que eu gosto.'),
  c('cu02', 'cuidado', 'comum', 'Louça é comigo', 'Você lava a louça hoje, inteira, e eu descanso.'),
  c('cu03', 'cuidado', 'rara', 'Folga das tarefas', 'Um dia sem nenhuma tarefa de casa para mim. Você cobre tudo.'),
  c('cu04', 'cuidado', 'comum', 'Meu prato favorito', 'Cozinhar (ou pedir) meu prato favorito.'),
  c('cu05', 'cuidado', 'rara', 'Tarde livre', 'Uma tarde só para mim, enquanto você cuida do resto.'),
  c('cu06', 'cuidado', 'comum', 'Banho preparado', 'Preparar um banho quentinho/relaxante, com toalha esperando.'),
  c('cu07', 'cuidado', 'epica', 'Missão chata resolvida', 'Resolver aquela pendência chata que estou adiando (banco, conserto, ligação...).'),
  c('cu08', 'cuidado', 'comum', 'Sobremesa surpresa', 'Aparecer com uma sobremesa que eu adoro, sem eu pedir.'),

  // Aventura
  c('av01', 'aventura', 'comum', 'Passeio sem destino', 'Sair a pé ou de carro sem destino por uma hora.'),
  c('av02', 'aventura', 'rara', 'Lugar nunca visitado', 'Conhecer juntos um restaurante, bar ou parque novo.'),
  c('av03', 'aventura', 'rara', 'Piquenique', 'Um piquenique organizado por você, com tudo pronto.'),
  c('av04', 'aventura', 'epica', 'Bate-volta surpresa', 'Um bate-volta para uma cidade próxima, planejado por você.'),
  c('av05', 'aventura', 'comum', 'Aula juntos', 'Fazer uma aula experimental juntos: dança, cerâmica, culinária...'),
  c('av06', 'aventura', 'lendaria', 'Viagem a dois', 'Um fim de semana fora, só nós dois. Você organiza.'),
  c('av07', 'aventura', 'comum', 'Nascer ou pôr do sol', 'Assistir ao nascer ou pôr do sol juntos.'),
  c('av08', 'aventura', 'rara', 'Noite de jogos', 'Uma noite de jogos de tabuleiro/cartas, valendo prenda.'),

  // Memórias
  c('me01', 'memorias', 'comum', 'Álbum aberto', 'Ver fotos antigas nossas e contar o que lembramos de cada uma.'),
  c('me02', 'memorias', 'rara', 'Primeiro encontro', 'Recriar nosso primeiro encontro (lugar, roupa ou comida).'),
  c('me03', 'memorias', 'comum', 'Nossa música', 'Colocar nossa música e dançar na sala.'),
  c('me04', 'memorias', 'rara', 'Playlist do casal', 'Montar uma playlist com músicas que marcaram nossa história.'),
  c('me05', 'memorias', 'epica', 'Linha do tempo', 'Montar juntos a linha do tempo do nosso relacionamento.'),
  c('me06', 'memorias', 'comum', 'Quando eu soube', 'Me contar o momento em que você soube que gostava de mim.'),
  c('me07', 'memorias', 'lendaria', 'Caixa de memórias', 'Criar uma caixa com ingressos, bilhetes e lembranças nossas.'),

  // Romance
  c('ro01', 'romance', 'rara', 'Jantar à luz de velas', 'Um jantar com velas, mesa posta e roupa bonita — mesmo em casa.'),
  c('ro02', 'romance', 'comum', 'Bilhete escondido', 'Esconder bilhetes carinhosos para eu achar ao longo do dia.'),
  c('ro03', 'romance', 'rara', 'Encontro de verdade', 'Me convidar para um encontro, como se estivéssemos começando.'),
  c('ro04', 'romance', 'comum', 'Flores sem data', 'Flores (ou uma planta) sem ter data especial.'),
  c('ro05', 'romance', 'epica', 'Noite planejada', 'Uma noite inteira planejada por você, do início ao fim.'),
  c('ro06', 'romance', 'comum', 'Dança lenta', 'Uma dança lenta, abraçados, onde estivermos.'),
  c('ro07', 'romance', 'lendaria', 'Surpresa inesquecível', 'Uma surpresa grande, daquelas que eu vou contar para todo mundo.'),
  c('ro08', 'romance', 'rara', 'Cinema em casa', 'Sessão de cinema com pipoca, coberta e o filme que eu escolher.'),

  // Ousadia (picante leve — o casal decide até onde ir)
  c('ou01', 'ousadia', 'rara', 'Beijo no pescoço', 'Beijos no pescoço quando eu menos esperar.'),
  c('ou02', 'ousadia', 'epica', 'Noite sem pressa', 'Uma noite a dois com tempo, clima e nenhuma interrupção.'),
  c('ou03', 'ousadia', 'rara', 'Mensagem provocante', 'Uma mensagem provocante no meio do expediente.'),
  c('ou04', 'ousadia', 'epica', 'Banho a dois', 'Um banho juntos, com calma.'),
  c('ou05', 'ousadia', 'lendaria', 'Fantasia combinada', 'Realizar uma fantasia combinada antes entre nós dois.'),
  c('ou06', 'ousadia', 'rara', 'Você escolhe', 'Hoje à noite, quem escolhe o clima sou eu.'),
];

const CARD_MAP = Object.fromEntries(CARDS.map((card) => [card.id, card]));

export function cardById(id, customCards = []) {
  return CARD_MAP[id] || customCards.find((card) => card.id === id) || null;
}
