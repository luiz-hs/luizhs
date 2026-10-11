// Testes da lógica do jogo: node --test scripts/
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  answerQuestion, authenticate, createCouple, createCustomCard, createTrade,
  joinCouple, openPack, publicState, updateTrade,
} from '../lib/game.js';
import { CARDS } from '../lib/cards.js';

function couple() {
  const { doc, member: ana } = createCouple('Ana', 'ABC234');
  const bia = joinCouple(doc, 'Bia');
  return { doc, ana, bia };
}

test('pareamento e autenticação', () => {
  const { doc, ana } = couple();
  assert.equal(doc.members.length, 2);
  assert.throws(() => joinCouple(doc, 'Terceiro'), /completo/);
  assert.equal(authenticate(doc, ana.id, ana.token).name, 'Ana');
  assert.throws(() => authenticate(doc, ana.id, 'errado'), /inválida/);
});

test('pacote diário: 3 cartas únicas, uma vez por dia', () => {
  const { doc, ana } = couple();
  const drawn = openPack(doc, ana, '2026-10-11');
  assert.equal(drawn.length, 3);
  assert.equal(new Set(drawn.map((d) => d.id)).size, 3);
  assert.equal(doc.collection[ana.id].length, 3);
  // nível 1 só tem comuns e raras
  for (const d of drawn) assert.ok(['comum', 'rara'].includes(CARDS.find((c) => c.id === d.id).rarity));
  assert.throws(() => openPack(doc, ana, '2026-10-11'), /já abriu/);
  openPack(doc, ana, '2026-10-12');
});

test('pedir -> aceitar -> confirmar dá pontos e pacote bônus para quem fez', () => {
  const { doc, ana, bia } = couple();
  const [first] = openPack(doc, ana, '2026-10-11');
  const trade = createTrade(doc, ana, { cardId: first.id, kind: 'pedir', note: 'hoje?' });
  assert.equal(trade.doerId, bia.id);
  assert.throws(() => updateTrade(doc, ana, { tradeId: trade.id, op: 'aceitar' }), /não está disponível/);
  updateTrade(doc, bia, { tradeId: trade.id, op: 'aceitar' });
  assert.throws(() => updateTrade(doc, bia, { tradeId: trade.id, op: 'confirmar' }), /não está disponível/);
  updateTrade(doc, ana, { tradeId: trade.id, op: 'confirmar' });
  assert.equal(trade.status, 'cumprido');
  assert.ok(doc.points >= 10);
  assert.equal(doc.bonusPacks[bia.id], 1);
  openPack(doc, bia, '2026-10-11'); // diário
  openPack(doc, bia, '2026-10-11'); // bônus
  assert.equal(doc.bonusPacks[bia.id], 0);
});

test('dar vale -> usar -> confirmar', () => {
  const { doc, ana, bia } = couple();
  const [first] = openPack(doc, ana, '2026-10-11');
  const trade = createTrade(doc, ana, { cardId: first.id, kind: 'dar' });
  assert.equal(trade.status, 'guardado');
  updateTrade(doc, bia, { tradeId: trade.id, op: 'usar' });
  updateTrade(doc, bia, { tradeId: trade.id, op: 'confirmar' });
  assert.equal(doc.bonusPacks[ana.id], 1);
});

test('não pode usar carta que não desbloqueou', () => {
  const { doc, ana } = couple();
  assert.throws(() => createTrade(doc, ana, { cardId: 'av06', kind: 'pedir' }), /desbloqueou/);
  const custom = createCustomCard(doc, ana, { title: 'Pastel da feira', desc: '', category: 'aventura' });
  createTrade(doc, ana, { cardId: custom.id, kind: 'pedir' });
});

test('pergunta do dia só revela quando os dois respondem', () => {
  const { doc, ana, bia } = couple();
  answerQuestion(doc, ana, 'Nossa viagem', '2026-10-11');
  let s = publicState(doc, bia, '2026-10-11');
  assert.equal(s.today.partnerAnswered, true);
  assert.equal(s.today.partnerAnswer, null);
  answerQuestion(doc, bia, 'O primeiro beijo', '2026-10-11');
  s = publicState(doc, bia, '2026-10-11');
  assert.equal(s.today.partnerAnswer, 'Nossa viagem');
  assert.equal(doc.points, 15);
  assert.ok(!JSON.stringify(s).includes(ana.token), 'não vaza token');
});
