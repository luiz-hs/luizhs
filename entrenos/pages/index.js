import { useCallback, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { CARDS, CATEGORIES, RARITIES, cardById } from '../lib/cards';
import { RARITY_UNLOCK } from '../lib/rules';
import { Card, LockedCard } from '../components/Card';

const SESSION_KEY = 'entrenos-sessao';
const POLL_MS = 5000;

async function call(action, data = {}) {
  const res = await fetch('/api/casal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...data }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(json.error || 'Falha de conexão.');
    err.status = res.status;
    throw err;
  }
  return json;
}

function readSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY)) || null;
  } catch {
    return null;
  }
}

function writeSession(session) {
  try {
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(SESSION_KEY);
  } catch {}
}

function timeAgo(iso) {
  const diff = (Date.now() - Date.parse(iso)) / 1000;
  if (diff < 60) return 'agora';
  if (diff < 3600) return `há ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `há ${Math.floor(diff / 3600)} h`;
  const days = Math.floor(diff / 86400);
  return days === 1 ? 'ontem' : `há ${days} dias`;
}

export default function Home() {
  const [session, setSession] = useState(null);
  const [state, setState] = useState(null);
  const [booted, setBooted] = useState(false);
  const [tab, setTab] = useState('inicio');
  const [toast, setToast] = useState('');
  const [busy, setBusy] = useState(false);
  const [modal, setModal] = useState(null); // { type: 'card' | 'pack' | 'newCard', ... }

  const notify = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3200);
  }, []);

  const logout = useCallback(() => {
    writeSession(null);
    setSession(null);
    setState(null);
  }, []);

  const act = useCallback(
    async (action, data = {}) => {
      if (!session) return null;
      setBusy(true);
      try {
        const result = await call(action, { ...session, ...data });
        setState(result.state);
        return result;
      } catch (err) {
        if (err.status === 401 || err.status === 404) logout();
        notify(err.message);
        return null;
      } finally {
        setBusy(false);
      }
    },
    [session, logout, notify]
  );

  // Carrega a sessão salva.
  // Carrega a sessão salva (ou a recebida por link de acesso pessoal).
  useEffect(() => {
    const access = new URLSearchParams(window.location.search).get('acesso');
    if (access) {
      try {
        const [coupleId, memberId, token] = atob(access).split(':');
        if (coupleId && memberId && token) writeSession({ coupleId, memberId, token });
      } catch {}
      window.history.replaceState(null, '', window.location.pathname);
    }
    const saved = readSession();
    if (saved) setSession(saved);
    setBooted(true);
  }, []);

  // Sincroniza com o par periodicamente.
  useEffect(() => {
    if (!session) return undefined;
    let alive = true;
    const refresh = () => {
      if (document.visibilityState === 'hidden') return;
      call('state', session)
        .then((r) => alive && setState(r.state))
        .catch((err) => {
          if (alive && (err.status === 401 || err.status === 404)) logout();
        });
    };
    refresh();
    const timer = setInterval(refresh, POLL_MS);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      alive = false;
      clearInterval(timer);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [session, logout]);

  const startSession = (result) => {
    writeSession(result.session);
    setSession(result.session);
    setState(result.state);
  };

  if (!booted) return null;

  return (
    <>
      <Head>
        <title>EntreNós</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>
      {!session || !state ? (
        session ? (
          <div className="app empty">Carregando o baralho de vocês…</div>
        ) : (
          <Welcome onStart={startSession} notify={notify} />
        )
      ) : (
        <Game
          state={state}
          tab={tab}
          setTab={setTab}
          act={act}
          busy={busy}
          modal={modal}
          setModal={setModal}
          notify={notify}
          logout={logout}
        />
      )}
      {toast && <div className="toast" role="status">{toast}</div>}
    </>
  );
}

// ---------------------------------------------------------------------------
// Boas-vindas: criar casal ou entrar com código

function Welcome({ onStart, notify }) {
  const [mode, setMode] = useState('criar');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('codigo');
    if (fromUrl) {
      setMode('entrar');
      setCode(fromUrl.toUpperCase());
    }
  }, []);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const result = mode === 'criar' ? await call('create', { name }) : await call('join', { name, code });
      window.history.replaceState(null, '', window.location.pathname);
      onStart(result);
    } catch (err) {
      notify(err.message);
    } finally {
      setBusy(false);
    }
  }

  const sample = ['ro01', 'ca01', 'av03'].map((id) => cardById(id));

  return (
    <main className="app">
      <div className="hero">
        <h1>EntreNós</h1>
        <p>Um baralho só de vocês dois. Desbloqueiem cartas, troquem vales de carinho e voltem a se aproximar — um gesto por vez.</p>
        <div className="hero-cards">
          {sample.map((card) => (
            <Card key={card.id} card={card} size="sm" />
          ))}
        </div>
      </div>

      <section className="panel">
        <div className="chips">
          <button type="button" className={`chip ${mode === 'criar' ? 'on' : ''}`} onClick={() => setMode('criar')}>
            Começar nosso baralho
          </button>
          <button type="button" className={`chip ${mode === 'entrar' ? 'on' : ''}`} onClick={() => setMode('entrar')}>
            Tenho um código
          </button>
        </div>
        <form onSubmit={submit}>
          <label className="field">
            Seu nome ou apelido
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} maxLength={30} required placeholder="Como seu par te chama?" />
          </label>
          {mode === 'entrar' && (
            <label className="field">
              Código do casal
              <input
                className="input code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={6}
                required
                placeholder="ABC123"
                style={{ fontSize: '1.2rem' }}
              />
            </label>
          )}
          <button className="btn block" disabled={busy}>
            {mode === 'criar' ? 'Criar e convidar meu par' : 'Entrar no baralho'}
          </button>
        </form>
      </section>

      <section className="panel soft small">
        <h2>Como funciona</h2>
        <p>🎴 <b>Todo dia</b> cada um abre um pacote com 3 cartas de ações: carinho, conversa, aventura, romance…</p>
        <p>🎟️ Use suas cartas para <b>pedir</b> uma ação ao seu par ou <b>dar um vale</b> de presente.</p>
        <p>❤️ Quando o vale é cumprido, o casal ganha <b>pontos de conexão</b>, sobe de nível e libera cartas mais raras.</p>
        <p>💬 Uma <b>pergunta do dia</b> para os dois — as respostas só aparecem quando ambos responderem.</p>
      </section>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Jogo

function Game({ state, tab, setTab, act, busy, modal, setModal, notify, logout }) {
  const { me, partner, level, trades } = state;
  const custom = state.customCards;
  const card = (id) => cardById(id, custom);

  const pendingForMe = trades.filter(
    (t) => (t.doerId === me.id && t.status === 'pedido') || (t.forId === me.id && t.status === 'resgatado')
  ).length;

  async function openPack() {
    const result = await act('openPack');
    if (result) setModal({ type: 'pack', drawn: result.drawn });
  }

  const tabs = [
    { id: 'inicio', ico: '🏠', label: 'Início' },
    { id: 'colecao', ico: '🃏', label: 'Coleção' },
    { id: 'vales', ico: '🎟️', label: 'Vales', count: pendingForMe },
    { id: 'nos', ico: '💞', label: 'Nós' },
  ];

  return (
    <main className="app">
      <header className="top">
        <div>
          <h1 className="logo">
            Entre<span>Nós</span>
          </h1>
          <div className="names">{partner ? `${me.name} & ${partner.name}` : `${me.name} · esperando seu par`}</div>
        </div>
        <div className="level-chip">
          Nv {level.level} · {level.name}
        </div>
      </header>

      {tab === 'inicio' && <HomeTab state={state} act={act} busy={busy} openPack={openPack} setTab={setTab} notify={notify} />}
      {tab === 'colecao' && <CollectionTab state={state} onPick={(c) => setModal({ type: 'card', card: c })} onCreate={() => setModal({ type: 'newCard' })} />}
      {tab === 'vales' && <TradesTab state={state} act={act} busy={busy} card={card} />}
      {tab === 'nos' && <UsTab state={state} logout={logout} notify={notify} />}

      <nav className="tabs">
        <div className="tabs-inner">
          {tabs.map((t) => (
            <button key={t.id} type="button" className={`tab ${tab === t.id ? 'on' : ''}`} onClick={() => setTab(t.id)}>
              <span className="ico">{t.ico}</span>
              {t.label}
              {t.count > 0 && <span className="dot">{t.count}</span>}
            </button>
          ))}
        </div>
      </nav>

      {modal && (
        <div className="overlay" onClick={() => setModal(null)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            {modal.type === 'pack' && <PackReveal drawn={modal.drawn} card={card} onClose={() => setModal(null)} goCollection={() => { setModal(null); setTab('colecao'); }} />}
            {modal.type === 'card' && (
              <CardSheet
                card={modal.card}
                partner={partner}
                act={act}
                busy={busy}
                notify={notify}
                onDone={() => {
                  setModal(null);
                  setTab('vales');
                }}
              />
            )}
            {modal.type === 'newCard' && <NewCardSheet act={act} busy={busy} notify={notify} onDone={() => setModal(null)} />}
          </div>
        </div>
      )}
    </main>
  );
}

// ---------- Início ----------

function Invite({ code, notify }) {
  const link = typeof window !== 'undefined' ? `${window.location.origin}/?codigo=${code}` : '';
  const message = `Criei nosso baralho no EntreNós 💞 Entra comigo: ${link} (código ${code})`;

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'EntreNós', text: message });
        return;
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(message);
      notify('Convite copiado!');
    } catch {
      notify(`Código: ${code}`);
    }
  }

  return (
    <section className="panel" style={{ textAlign: 'center' }}>
      <h2>Convide seu par</h2>
      <p className="muted small">Envie este código para começar a trocar cartas:</p>
      <div className="code">{code}</div>
      <div className="row" style={{ justifyContent: 'center', marginTop: 12 }}>
        <button type="button" className="btn sm" onClick={share}>
          Compartilhar convite
        </button>
        <a className="btn sm ghost" href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
          WhatsApp
        </a>
      </div>
    </section>
  );
}

function HomeTab({ state, act, busy, openPack, setTab, notify }) {
  const { partner, level, pack, today, points, history, couple } = state;
  const [answer, setAnswer] = useState('');

  async function sendAnswer(e) {
    e.preventDefault();
    const result = await act('answer', { text: answer });
    if (result) setAnswer('');
  }

  const packLabel = pack.daily ? 'Seu pacote do dia chegou!' : pack.bonus > 0 ? `Pacote bônus (${pack.bonus})` : 'Pacote aberto hoje';
  const packHint = pack.available ? 'Toque para abrir e revelar 3 cartas.' : 'Volte amanhã — ou cumpra um vale para ganhar um pacote bônus.';

  return (
    <>
      {!partner && <Invite code={couple.code} notify={notify} />}

      <button type="button" className="pack-btn" onClick={openPack} disabled={!pack.available || busy} style={{ marginBottom: 14 }}>
        <span className="big">🎁</span>
        <span>
          <strong>{packLabel}</strong>
          <span className="small">{packHint}</span>
        </span>
      </button>

      <section className="panel">
        <div className="row spread">
          <h2 style={{ margin: 0 }}>
            Nível {level.level} · {level.name}
          </h2>
          <span className="small muted">{points} pts</span>
        </div>
        <div className="bar" style={{ margin: '10px 0 6px' }}>
          <span style={{ width: `${Math.round(level.progress * 100)}%` }} />
        </div>
        <p className="small muted" style={{ margin: 0 }}>
          {level.next ? `Faltam ${level.next - points} pontos para o próximo nível.` : 'Vocês chegaram ao topo. Que lindo! ✨'}
          {level.level < RARITY_UNLOCK.epica && ' Cartas épicas aparecem no nível 3.'}
          {level.level >= RARITY_UNLOCK.epica && level.level < RARITY_UNLOCK.lendaria && ' Cartas lendárias aparecem no nível 5.'}
        </p>
      </section>

      <section className="panel">
        <h2>💬 Pergunta do dia</h2>
        <p className="serif" style={{ fontSize: '1.1rem', margin: '0 0 10px' }}>
          {today.question}
        </p>
        {today.myAnswer ? (
          <>
            <div className="answer">
              <b>Você</b>
              {today.myAnswer}
            </div>
            {today.partnerAnswer ? (
              <div className="answer">
                <b>{partner.name}</b>
                {today.partnerAnswer}
              </div>
            ) : (
              <p className="small muted">
                {partner
                  ? today.partnerAnswered
                    ? 'Carregando a resposta…'
                    : `Esperando ${partner.name} responder para revelar as respostas.`
                  : 'Assim que seu par entrar, ele(a) também responde.'}
              </p>
            )}
          </>
        ) : (
          <form onSubmit={sendAnswer} className="stack">
            <textarea className="input" rows={3} maxLength={500} value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Sua resposta fica escondida até os dois responderem." />
            <button className="btn block" disabled={busy || !answer.trim()}>
              Responder {today.partnerAnswered && partner ? `(${partner.name} já respondeu!)` : ''}
            </button>
          </form>
        )}
      </section>

      <section className="panel">
        <div className="row spread">
          <h2 style={{ margin: 0 }}>Últimos momentos</h2>
          <button type="button" className="btn sm ghost" onClick={() => setTab('nos')}>
            Ver tudo
          </button>
        </div>
        <ul className="timeline" style={{ marginTop: 10 }}>
          {history.slice(0, 4).map((h, i) => (
            <li key={i}>
              {h.text}
              <time>{timeAgo(h.at)}</time>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function PackReveal({ drawn, card, onClose, goCollection }) {
  return (
    <div className="stack" style={{ textAlign: 'center' }}>
      <h2>Cartas novas! 🎉</h2>
      <div className="reveal">
        {drawn.map((d, i) => (
          <div className="flip" key={i}>
            <Card card={card(d.id)} size="sm" badge={d.duplicate ? '+2 pts' : 'NOVA'} />
          </div>
        ))}
      </div>
      <p className="small muted">Use suas cartas para pedir ações ao seu par — ou dar um vale de presente.</p>
      <div className="row" style={{ justifyContent: 'center' }}>
        <button type="button" className="btn ghost" onClick={onClose}>
          Fechar
        </button>
        <button type="button" className="btn" onClick={goCollection}>
          Ver coleção
        </button>
      </div>
    </div>
  );
}

// ---------- Coleção ----------

function CollectionTab({ state, onPick, onCreate }) {
  const [filter, setFilter] = useState('todas');
  const owned = useMemo(() => new Set(state.collection.mine), [state.collection.mine]);
  const all = [...CARDS, ...state.customCards];
  const visible = all.filter((c) => filter === 'todas' || c.category === filter || (filter === 'nossas' && c.rarity === 'especial'));
  const sorted = [...visible].sort((a, b) => {
    const ua = owned.has(a.id) || a.rarity === 'especial';
    const ub = owned.has(b.id) || b.rarity === 'especial';
    return ua === ub ? 0 : ua ? -1 : 1;
  });

  return (
    <>
      <section className="panel soft">
        <div className="row spread">
          <div>
            <h2 style={{ margin: 0 }}>Minha coleção</h2>
            <span className="small muted">
              {owned.size} de {CARDS.length} cartas · toque numa carta para pedir ou dar
            </span>
          </div>
          <button type="button" className="btn sm" onClick={onCreate}>
            + Criar carta
          </button>
        </div>
        <div className="bar" style={{ marginTop: 10 }}>
          <span style={{ width: `${(owned.size / CARDS.length) * 100}%` }} />
        </div>
      </section>

      <div className="chips">
        <button type="button" className={`chip ${filter === 'todas' ? 'on' : ''}`} onClick={() => setFilter('todas')}>
          Todas
        </button>
        {Object.entries(CATEGORIES).map(([id, cat]) => (
          <button key={id} type="button" className={`chip ${filter === id ? 'on' : ''}`} onClick={() => setFilter(id)}>
            {cat.emoji} {cat.label}
          </button>
        ))}
        <button type="button" className={`chip ${filter === 'nossas' ? 'on' : ''}`} onClick={() => setFilter('nossas')}>
          ♥ Nossas
        </button>
      </div>

      {sorted.length === 0 ? (
        <p className="empty">Nenhuma carta aqui ainda. Criem uma carta só de vocês!</p>
      ) : (
        <div className="grid">
          {sorted.map((c) =>
            owned.has(c.id) || c.rarity === 'especial' ? (
              <Card key={c.id} card={c} size="sm" onClick={() => onPick(c)} />
            ) : (
              <LockedCard key={c.id} card={c} size="sm" />
            )
          )}
        </div>
      )}
    </>
  );
}

function CardSheet({ card, partner, act, busy, notify, onDone }) {
  const [note, setNote] = useState('');

  async function send(kind) {
    const result = await act('createTrade', { cardId: card.id, kind, note });
    if (result) {
      notify(kind === 'pedir' ? `Pedido enviado para ${partner.name} 💌` : `Vale entregue para ${partner.name} 🎁`);
      onDone();
    }
  }

  return (
    <div className="stack">
      <Card card={card} size="lg" />
      <p className="small muted" style={{ textAlign: 'center' }}>
        {RARITIES[card.rarity].label} · vale {RARITIES[card.rarity].points} pontos de conexão quando cumprida
      </p>
      {partner ? (
        <>
          <label className="field">
            Um recadinho (opcional)
            <input className="input" value={note} maxLength={200} onChange={(e) => setNote(e.target.value)} placeholder="Ex.: hoje à noite? 😊" />
          </label>
          <button type="button" className="btn block" disabled={busy} onClick={() => send('pedir')}>
            🙏 Pedir para {partner.name}
          </button>
          <button type="button" className="btn block ghost" disabled={busy} onClick={() => send('dar')}>
            🎁 Dar como vale para {partner.name}
          </button>
          <p className="small muted" style={{ textAlign: 'center' }}>
            <b>Pedir</b>: {partner.name} faz isso por você. <b>Dar</b>: você promete fazer, e {partner.name} usa quando quiser.
          </p>
        </>
      ) : (
        <p className="empty">Convide seu par para começar a trocar cartas.</p>
      )}
    </div>
  );
}

function NewCardSheet({ act, busy, notify, onDone }) {
  const [form, setForm] = useState({ title: '', desc: '', category: 'carinho' });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    const result = await act('createCard', form);
    if (result) {
      notify('Carta criada! Ela fica disponível para vocês dois.');
      onDone();
    }
  }

  const preview = { id: 'preview', rarity: 'especial', category: form.category, title: form.title || 'Sua carta', desc: form.desc || 'O que essa carta vale?' };

  return (
    <form className="stack" onSubmit={submit}>
      <h2>Criar uma carta só de vocês</h2>
      <Card card={preview} size="lg" />
      <label className="field">
        Título
        <input className="input" value={form.title} onChange={set('title')} maxLength={60} required placeholder="Ex.: Pastel da feira de domingo" />
      </label>
      <label className="field">
        Descrição
        <textarea className="input" rows={2} value={form.desc} onChange={set('desc')} maxLength={200} placeholder="Ex.: Ir juntos à feira e dividir um pastel de queijo." />
      </label>
      <label className="field">
        Categoria
        <select className="input" value={form.category} onChange={set('category')}>
          {Object.entries(CATEGORIES).map(([id, cat]) => (
            <option key={id} value={id}>
              {cat.emoji} {cat.label}
            </option>
          ))}
        </select>
      </label>
      <button className="btn block" disabled={busy}>
        Criar carta
      </button>
    </form>
  );
}

// ---------- Vales ----------

const STATUS_LABEL = {
  pedido: 'Pedido',
  guardado: 'Guardado',
  resgatado: 'Em andamento',
  cumprido: 'Cumprido ❤️',
  recusado: 'Fica para outra vez',
  cancelado: 'Cancelado',
};

function TradeRow({ trade, card, me, partner, act, busy }) {
  const c = card(trade.cardId);
  if (!c) return null;
  const iDo = trade.doerId === me.id;
  const other = partner?.name || 'seu par';
  const op = (name) => act('updateTrade', { tradeId: trade.id, op: name });

  let line = '';
  let actions = null;
  switch (trade.status) {
    case 'pedido':
      if (iDo) {
        line = `${other} pediu isso para você.`;
        actions = (
          <>
            <button type="button" className="btn sm" disabled={busy} onClick={() => op('aceitar')}>
              Topo!
            </button>
            <button type="button" className="btn sm ghost" disabled={busy} onClick={() => op('recusar')}>
              Outro dia
            </button>
          </>
        );
      } else {
        line = `Esperando ${other} topar.`;
        actions = (
          <button type="button" className="btn sm ghost" disabled={busy} onClick={() => op('cancelar')}>
            Cancelar
          </button>
        );
      }
      break;
    case 'guardado':
      if (iDo) line = `Vale que você deu. ${other} usa quando quiser.`;
      else {
        line = `Presente de ${other}. Use quando quiser!`;
        actions = (
          <button type="button" className="btn sm" disabled={busy} onClick={() => op('usar')}>
            Usar agora
          </button>
        );
      }
      break;
    case 'resgatado':
      if (iDo) line = `É sua vez de fazer! Quando acontecer, ${other} confirma.`;
      else {
        line = `${other} vai fazer isso por você.`;
        actions = (
          <button type="button" className="btn sm ok" disabled={busy} onClick={() => op('confirmar')}>
            Aconteceu ❤️
          </button>
        );
      }
      break;
    default:
      line = iDo ? `Você fez para ${other}.` : `${other} fez para você.`;
  }

  return (
    <div className="trade">
      <Card card={c} size="sm" />
      <div className="trade-body">
        <div className="trade-title">{c.title}</div>
        {trade.note && <div className="note">“{trade.note}”</div>}
        <div className="status">
          {STATUS_LABEL[trade.status]} · {line} · {timeAgo(trade.updatedAt)}
        </div>
        {actions && (
          <div className="row" style={{ marginTop: 8 }}>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

function TradesTab({ state, act, busy, card }) {
  const { me, partner, trades } = state;
  const open = ['pedido', 'guardado', 'resgatado'];
  const toDo = trades.filter((t) => t.doerId === me.id && open.includes(t.status));
  const forMe = trades.filter((t) => t.forId === me.id && open.includes(t.status));
  const done = trades.filter((t) => t.status === 'cumprido').slice(0, 20);
  const props = { card, me, partner, act, busy };

  if (!partner) return <p className="empty">Os vales aparecem aqui quando seu par entrar no baralho.</p>;

  return (
    <>
      <section className="panel">
        <h2>🫶 Para você fazer</h2>
        {toDo.length ? toDo.map((t) => <TradeRow key={t.id} trade={t} {...props} />) : <p className="empty">Nada pendente. Que tal dar um vale de surpresa?</p>}
      </section>
      <section className="panel">
        <h2>🎟️ Seus vales e pedidos</h2>
        {forMe.length ? (
          forMe.map((t) => <TradeRow key={t.id} trade={t} {...props} />)
        ) : (
          <p className="empty">Vá até a Coleção, escolha uma carta e peça para {partner.name}.</p>
        )}
      </section>
      <section className="panel soft">
        <h2>❤️ Cumpridos</h2>
        {done.length ? done.map((t) => <TradeRow key={t.id} trade={t} {...props} />) : <p className="empty">O primeiro vale cumprido vai aparecer aqui.</p>}
      </section>
    </>
  );
}

// ---------- Nós ----------

function accessLink() {
  const s = readSession();
  return s ? `${window.location.origin}/?acesso=${btoa(`${s.coupleId}:${s.memberId}:${s.token}`)}` : '';
}

function UsTab({ state, logout, notify }) {
  const { me, partner, trades, history, pastAnswers, couple, collection } = state;
  const done = trades.filter((t) => t.status === 'cumprido');
  const byMe = done.filter((t) => t.doerId === me.id).length;
  const byPartner = done.length - byMe;
  const since = new Date(couple.createdAt).toLocaleDateString('pt-BR');

  return (
    <>
      <section className="panel">
        <h2>Nosso placar de carinho</h2>
        <div className="row spread small">
          <span>
            Vales cumpridos: <b>{done.length}</b>
          </span>
          <span className="muted">desde {since}</span>
        </div>
        {partner && (
          <p className="small muted" style={{ marginBottom: 0 }}>
            Você fez {byMe} · {partner.name} fez {byPartner} · {partner.name} já tem {collection.partner.length} cartas
          </p>
        )}
      </section>

      {pastAnswers.length > 0 && (
        <section className="panel">
          <h2>💬 Respostas anteriores</h2>
          {pastAnswers.map((p) => (
            <div key={p.day} style={{ marginBottom: 14 }}>
              <div className="small muted">{new Date(`${p.day}T12:00:00`).toLocaleDateString('pt-BR')}</div>
              <div className="serif">{p.question}</div>
              <div className="answer">
                <b>Você</b>
                {p.answers[me.id]}
              </div>
              {partner && (
                <div className="answer">
                  <b>{partner.name}</b>
                  {p.answers[partner.id]}
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      <section className="panel">
        <h2>📖 Nossa história</h2>
        <ul className="timeline">
          {history.map((h, i) => (
            <li key={i}>
              {h.text}
              <time>{timeAgo(h.at)}</time>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel soft small">
        <h2>Este aparelho</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          Código do casal: <b>{couple.code}</b>. Para abrir o EntreNós em outro celular ou computador, use seu link de acesso pessoal — não
          compartilhe com ninguém (nem com seu par: cada um tem o seu).
        </p>
        <div className="row">
          <button
            type="button"
            className="btn sm"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(accessLink());
                notify('Link de acesso copiado. Guarde em lugar seguro.');
              } catch {
                window.prompt('Copie seu link de acesso:', accessLink());
              }
            }}
          >
            Copiar meu link de acesso
          </button>
          <button
            type="button"
            className="btn sm ghost"
            onClick={() => {
              if (window.confirm('Sair deste aparelho? Para voltar, você vai precisar do seu link de acesso pessoal.')) logout();
            }}
          >
            Sair
          </button>
        </div>
      </section>
    </>
  );
}
