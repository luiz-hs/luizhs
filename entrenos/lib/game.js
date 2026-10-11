// Lógica do jogo (somente servidor). Todas as funções recebem o documento do casal
// e o modificam no lugar; quem chama é responsável por salvar.
import { randomBytes, randomInt, randomUUID } from 'crypto';
import { CARDS, CATEGORIES, RARITIES, cardById } from './cards.js';
import { QUESTIONS } from './questions.js';
import {
  DUPLICATE_POINTS,
  PACK_SIZE,
  QUESTION_POINTS,
  RARITY_UNLOCK,
  RARITY_WEIGHT,
  dayKey,
  dayNumber,
  levelFor,
} from './rules.js';

export class GameError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const HISTORY_LIMIT = 200;

export function newCode() {
  let code = '';
  for (let i = 0; i < 6; i++) code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  return code;
}

function newMember(name) {
  const clean = String(name || '').trim().slice(0, 30);
  if (!clean) throw new GameError('Diga seu nome (ou apelido).');
  return { id: randomUUID(), name: clean, token: randomBytes(24).toString('hex') };
}

function log(doc, text) {
  doc.history.unshift({ at: new Date().toISOString(), text });
  doc.history.length = Math.min(doc.history.length, HISTORY_LIMIT);
}

export function createCouple(name, code) {
  const member = newMember(name);
  const doc = {
    id: randomUUID(),
    code,
    createdAt: new Date().toISOString(),
    members: [member],
    points: 0,
    collection: { [member.id]: [] },
    lastPack: {},
    bonusPacks: { [member.id]: 0 },
    customCards: [],
    trades: [],
    answers: {},
    history: [],
  };
  log(doc, `${member.name} criou o baralho de vocês.`);
  return { doc, member };
}

export function joinCouple(doc, name) {
  if (doc.members.length >= 2) throw new GameError('Esse casal já está completo.', 409);
  const member = newMember(name);
  doc.members.push(member);
  doc.collection[member.id] = [];
  doc.bonusPacks[member.id] = 0;
  log(doc, `${member.name} entrou. Agora o baralho é de vocês dois 💞`);
  return member;
}

export function authenticate(doc, memberId, token) {
  const member = doc?.members.find((m) => m.id === memberId);
  if (!member || member.token !== token) throw new GameError('Sessão inválida. Entre de novo.', 401);
  return member;
}

function partnerOf(doc, member) {
  return doc.members.find((m) => m.id !== member.id) || null;
}

function requirePartner(doc, member) {
  const partner = partnerOf(doc, member);
  if (!partner) throw new GameError('Convide seu par primeiro — compartilhe o código do casal.');
  return partner;
}

// ---------- Pacotes ----------

function pickWeighted(weights) {
  const entries = Object.entries(weights).filter(([, w]) => w > 0);
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let roll = randomInt(total);
  for (const [key, w] of entries) {
    if (roll < w) return key;
    roll -= w;
  }
  return entries[entries.length - 1][0];
}

export function packStatus(doc, member, today = dayKey()) {
  const daily = doc.lastPack[member.id] !== today;
  const bonus = doc.bonusPacks[member.id] || 0;
  return { daily, bonus, available: daily || bonus > 0 };
}

export function openPack(doc, member, today = dayKey()) {
  const status = packStatus(doc, member, today);
  if (!status.available) throw new GameError('Você já abriu o pacote de hoje. Volte amanhã — ou cumpra um vale para ganhar um bônus!');
  if (status.daily) doc.lastPack[member.id] = today;
  else doc.bonusPacks[member.id] -= 1;

  const { level } = levelFor(doc.points);
  const owned = new Set(doc.collection[member.id]);
  const weights = Object.fromEntries(
    Object.entries(RARITY_WEIGHT).filter(([rarity]) => level >= RARITY_UNLOCK[rarity])
  );

  const drawn = [];
  for (let i = 0; i < PACK_SIZE; i++) {
    const rarity = pickWeighted(weights);
    const pool = CARDS.filter((card) => card.rarity === rarity);
    const fresh = pool.filter((card) => !owned.has(card.id));
    // Prefere cartas novas; se a raridade já está completa, busca em qualquer raridade liberada.
    const anyFresh = CARDS.filter((card) => weights[card.rarity] && !owned.has(card.id));
    const source = fresh.length ? fresh : anyFresh.length ? anyFresh : pool;
    const card = source[randomInt(source.length)];
    const duplicate = owned.has(card.id);
    if (duplicate) doc.points += DUPLICATE_POINTS;
    else {
      owned.add(card.id);
      doc.collection[member.id].push(card.id);
    }
    drawn.push({ id: card.id, duplicate });
  }

  const novas = drawn.filter((d) => !d.duplicate).length;
  log(doc, `${member.name} abriu um pacote e ganhou ${novas} carta${novas === 1 ? '' : 's'} nova${novas === 1 ? '' : 's'}.`);
  return drawn;
}

// ---------- Cartas do casal ----------

export function createCustomCard(doc, member, { title, desc, category }) {
  const t = String(title || '').trim().slice(0, 60);
  const d = String(desc || '').trim().slice(0, 200);
  if (!t) throw new GameError('Dê um título para a carta.');
  if (!CATEGORIES[category]) throw new GameError('Categoria inválida.');
  if (doc.customCards.length >= 100) throw new GameError('Limite de cartas personalizadas atingido.');
  const card = { id: `x-${randomUUID().slice(0, 8)}`, category, rarity: 'especial', title: t, desc: d, authorId: member.id };
  doc.customCards.push(card);
  log(doc, `${member.name} criou a carta "${t}".`);
  return card;
}

function canUseCard(doc, member, cardId) {
  return doc.collection[member.id].includes(cardId) || doc.customCards.some((card) => card.id === cardId);
}

// ---------- Vales (trocas) ----------
// Um vale tem quem FAZ a ação (doerId) e quem RECEBE (forId).
//  - "dar":   eu ofereço a carta ao meu par  -> status "guardado" (ele usa quando quiser)
//  - "pedir": eu peço a carta ao meu par      -> status "pedido"   (ele aceita ou recusa)
//  guardado --usar--> resgatado ; pedido --aceitar--> resgatado ; pedido --recusar--> recusado
//  resgatado --confirmar (quem recebe)--> cumprido  => pontos + pacote bônus para quem fez

export function createTrade(doc, member, { cardId, kind, note }) {
  const partner = requirePartner(doc, member);
  const card = cardById(cardId, doc.customCards);
  if (!card) throw new GameError('Carta não encontrada.', 404);
  if (!canUseCard(doc, member, cardId)) throw new GameError('Você ainda não desbloqueou essa carta.');
  if (kind !== 'dar' && kind !== 'pedir') throw new GameError('Tipo de vale inválido.');

  const open = doc.trades.filter((t) => ['pedido', 'guardado', 'resgatado'].includes(t.status));
  if (open.length >= 50) throw new GameError('Vocês já têm vales demais em aberto. Cumpram alguns antes!');

  const now = new Date().toISOString();
  const trade = {
    id: randomUUID(),
    cardId,
    doerId: kind === 'dar' ? member.id : partner.id,
    forId: kind === 'dar' ? partner.id : member.id,
    createdBy: member.id,
    status: kind === 'dar' ? 'guardado' : 'pedido',
    note: String(note || '').trim().slice(0, 200),
    createdAt: now,
    updatedAt: now,
  };
  doc.trades.unshift(trade);
  log(
    doc,
    kind === 'dar'
      ? `${member.name} deu o vale "${card.title}" para ${partner.name} 🎁`
      : `${member.name} pediu "${card.title}" para ${partner.name} 🙏`
  );
  return trade;
}

export function updateTrade(doc, member, { tradeId, op }) {
  const trade = doc.trades.find((t) => t.id === tradeId);
  if (!trade) throw new GameError('Vale não encontrado.', 404);
  const card = cardById(trade.cardId, doc.customCards);
  const title = card ? card.title : 'carta';
  const isDoer = trade.doerId === member.id;
  const isFor = trade.forId === member.id;
  const other = doc.members.find((m) => m.id !== member.id);
  const deny = () => {
    throw new GameError('Essa ação não está disponível para este vale agora.', 409);
  };

  switch (op) {
    case 'aceitar':
      if (!isDoer || trade.status !== 'pedido') deny();
      trade.status = 'resgatado';
      log(doc, `${member.name} topou "${title}" 💪`);
      break;
    case 'recusar':
      if (!isDoer || trade.status !== 'pedido') deny();
      trade.status = 'recusado';
      log(doc, `${member.name} deixou "${title}" para outro momento.`);
      break;
    case 'cancelar':
      if (trade.createdBy !== member.id || trade.status !== 'pedido') deny();
      trade.status = 'cancelado';
      break;
    case 'usar':
      if (!isFor || trade.status !== 'guardado') deny();
      trade.status = 'resgatado';
      log(doc, `${member.name} usou o vale "${title}" — ${other?.name || 'seu par'}, é com você! ✨`);
      break;
    case 'confirmar': {
      if (!isFor || trade.status !== 'resgatado') deny();
      trade.status = 'cumprido';
      trade.doneAt = new Date().toISOString();
      const points = RARITIES[card?.rarity || 'comum'].points;
      doc.points += points;
      doc.bonusPacks[trade.doerId] = (doc.bonusPacks[trade.doerId] || 0) + 1;
      const doer = doc.members.find((m) => m.id === trade.doerId);
      log(doc, `"${title}" foi cumprida por ${doer?.name}! +${points} pontos de conexão ❤️`);
      break;
    }
    default:
      deny();
  }
  trade.updatedAt = new Date().toISOString();
  return trade;
}

// ---------- Pergunta do dia ----------

export function questionFor(today = dayKey()) {
  return QUESTIONS[((dayNumber(today) % QUESTIONS.length) + QUESTIONS.length) % QUESTIONS.length];
}

export function answerQuestion(doc, member, text, today = dayKey()) {
  const answer = String(text || '').trim().slice(0, 500);
  if (!answer) throw new GameError('Escreva sua resposta.');
  const day = (doc.answers[today] ||= {});
  if (day[member.id]) throw new GameError('Você já respondeu hoje.');
  day[member.id] = answer;
  const bothAnswered = doc.members.length === 2 && doc.members.every((m) => day[m.id]);
  if (bothAnswered) {
    doc.points += QUESTION_POINTS;
    log(doc, `Vocês dois responderam a pergunta do dia. +${QUESTION_POINTS} pontos 💬`);
  }
  // Mantém só os últimos 60 dias de respostas.
  const days = Object.keys(doc.answers).sort();
  for (const old of days.slice(0, Math.max(0, days.length - 60))) delete doc.answers[old];
}

// ---------- Estado público ----------

export function publicState(doc, member, today = dayKey()) {
  const partner = partnerOf(doc, member);
  const day = doc.answers[today] || {};
  const bothAnswered = partner && day[member.id] && day[partner.id];
  const pastAnswers = Object.entries(doc.answers)
    .filter(([key, answers]) => key !== today && doc.members.every((m) => answers[m.id]))
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .slice(0, 14)
    .map(([key, answers]) => ({ day: key, question: questionFor(key), answers }));

  return {
    me: { id: member.id, name: member.name },
    partner: partner ? { id: partner.id, name: partner.name } : null,
    couple: { id: doc.id, code: doc.code, createdAt: doc.createdAt },
    points: doc.points,
    level: levelFor(doc.points),
    collection: {
      mine: doc.collection[member.id],
      partner: partner ? doc.collection[partner.id] : [],
    },
    pack: packStatus(doc, member, today),
    customCards: doc.customCards,
    trades: doc.trades.slice(0, 100),
    today: {
      day: today,
      question: questionFor(today),
      myAnswer: day[member.id] || null,
      partnerAnswered: Boolean(partner && day[partner.id]),
      partnerAnswer: bothAnswered ? day[partner.id] : null,
    },
    pastAnswers,
    history: doc.history.slice(0, 40),
  };
}
