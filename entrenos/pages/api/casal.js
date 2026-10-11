// API única do EntreNós. Todas as chamadas são POST { action, ...dados }.
import {
  GameError,
  answerQuestion,
  authenticate,
  createCouple,
  createCustomCard,
  createTrade,
  joinCouple,
  newCode,
  openPack,
  publicState,
  updateTrade,
} from '../../lib/game';
import { store } from '../../lib/store';

async function uniqueCode() {
  for (let i = 0; i < 10; i++) {
    const code = newCode();
    if (!(await store.idForCode(code))) return code;
  }
  throw new Error('Não foi possível gerar um código de casal.');
}

function session(member, doc) {
  return { coupleId: doc.id, memberId: member.id, token: member.token };
}

// Ações que exigem sessão: recebem (doc, member, body) e devolvem dados extras.
const ACTIONS = {
  state: () => ({}),
  openPack: (doc, member) => ({ drawn: openPack(doc, member) }),
  createCard: (doc, member, body) => ({ card: createCustomCard(doc, member, body) }),
  createTrade: (doc, member, body) => ({ trade: createTrade(doc, member, body) }),
  updateTrade: (doc, member, body) => ({ trade: updateTrade(doc, member, body) }),
  answer: (doc, member, body) => {
    answerQuestion(doc, member, body.text);
    return {};
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Use POST.' });
  }
  const body = req.body || {};

  try {
    if (body.action === 'create') {
      const { doc, member } = createCouple(body.name, await uniqueCode());
      await store.create(doc);
      return res.status(200).json({ session: session(member, doc), state: publicState(doc, member) });
    }

    if (body.action === 'join') {
      const code = String(body.code || '').trim().toUpperCase();
      const id = code && (await store.idForCode(code));
      if (!id) throw new GameError('Código não encontrado. Confira com seu par.', 404);
      const result = await store.update(id, (doc) => {
        const member = joinCouple(doc, body.name);
        return { session: session(member, doc), state: publicState(doc, member) };
      });
      return res.status(200).json(result);
    }

    const action = ACTIONS[body.action];
    if (!action) throw new GameError('Ação desconhecida.');

    const run = (doc) => {
      if (!doc) throw new GameError('Casal não encontrado.', 404);
      const member = authenticate(doc, body.memberId, body.token);
      const extra = action(doc, member, body);
      return { ...extra, state: publicState(doc, member) };
    };

    const result = body.action === 'state' ? run(await store.get(body.coupleId)) : await store.update(body.coupleId, run);
    return res.status(200).json(result);
  } catch (err) {
    if (err instanceof GameError) return res.status(err.status).json({ error: err.message });
    console.error(err);
    return res.status(500).json({ error: 'Algo deu errado. Tente de novo.' });
  }
}
