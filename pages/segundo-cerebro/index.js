import { useEffect, useState } from 'react';
import Head from 'next/head';
import { AREAS, AREA_BY_ID } from '../../lib/segundo-cerebro/areas';

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

export default function SegundoCerebro() {
  const [empresa, setEmpresa] = useState('');
  const [empresaInput, setEmpresaInput] = useState('');
  const [tab, setTab] = useState(AREAS[0].id);

  const [notesByArea, setNotesByArea] = useState({});
  const [loadingArea, setLoadingArea] = useState(false);
  const [captureText, setCaptureText] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const [question, setQuestion] = useState('');
  const [asking, setAsking] = useState(false);
  const [conversation, setConversation] = useState([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('segundo-cerebro-empresa');
      if (saved) setEmpresa(saved);
    } catch {}
  }, []);

  useEffect(() => {
    if (empresa && tab !== 'perguntar') loadNotes(tab);
  }, [empresa, tab]);

  function saveEmpresa(e) {
    e.preventDefault();
    const name = empresaInput.trim();
    if (!name) return;
    setEmpresa(name);
    try {
      localStorage.setItem('segundo-cerebro-empresa', name);
    } catch {}
  }

  function trocarEmpresa() {
    setEmpresa('');
    setEmpresaInput('');
    setNotesByArea({});
    try {
      localStorage.removeItem('segundo-cerebro-empresa');
    } catch {}
  }

  async function loadNotes(area) {
    setLoadingArea(true);
    try {
      const params = new URLSearchParams({ empresa, area });
      const res = await fetch(`/api/segundo-cerebro/notes?${params}`);
      const data = await res.json();
      setNotesByArea((prev) => ({ ...prev, [area]: data.notes || [] }));
    } catch {
      setNotesByArea((prev) => ({ ...prev, [area]: [] }));
    } finally {
      setLoadingArea(false);
    }
  }

  async function handleCapture(e) {
    e.preventDefault();
    if (!captureText.trim()) return;
    setSaving(true);
    setSaveMsg('');
    try {
      const res = await fetch('/api/segundo-cerebro/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empresa, area: tab, text: captureText.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveMsg(`⚠️ ${data.error || 'Falha ao salvar.'}`);
        return;
      }
      setNotesByArea((prev) => ({ ...prev, [tab]: [data.note, ...(prev[tab] || [])] }));
      setCaptureText('');
      setSaveMsg(data.source === 'ia' ? '✅ Nota organizada pela IA e salva.' : '✅ Nota salva.');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch {
      setSaveMsg('⚠️ Falha ao salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(area, id) {
    try {
      await fetch('/api/segundo-cerebro/notes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empresa, area, id }),
      });
      setNotesByArea((prev) => ({ ...prev, [area]: (prev[area] || []).filter((n) => n.id !== id) }));
    } catch {}
  }

  async function handleAsk(e) {
    e.preventDefault();
    const q = question.trim();
    if (!q) return;
    setAsking(true);
    setQuestion('');
    setConversation((prev) => [...prev, { question: q, answer: null }]);
    try {
      const res = await fetch('/api/segundo-cerebro/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empresa, question: q }),
      });
      const data = await res.json();
      setConversation((prev) =>
        prev.map((c, i) => (i === prev.length - 1 ? { ...c, answer: data.answer, source: data.source } : c))
      );
    } catch {
      setConversation((prev) =>
        prev.map((c, i) => (i === prev.length - 1 ? { ...c, answer: '⚠️ Falha ao consultar. Tente de novo.' } : c))
      );
    } finally {
      setAsking(false);
    }
  }

  const area = AREA_BY_ID[tab];
  const notes = notesByArea[tab] || [];

  return (
    <div className="app">
      <Head>
        <title>🧠 Segundo Cérebro — memória da sua empresa</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <header>
        <div>
          <h1>🧠 Segundo Cérebro</h1>
          <p>Registre o que acontece na empresa por área e pergunte quando precisar lembrar.</p>
        </div>
        {empresa && (
          <button className="ghost" onClick={trocarEmpresa}>
            🏢 {empresa} — trocar
          </button>
        )}
      </header>

      {!empresa ? (
        <section className="card config">
          <h2>Para começar, qual o nome da sua empresa?</h2>
          <p className="muted">Cada empresa tem sua própria memória, guardada separadamente. Fica salvo só no seu navegador.</p>
          <form onSubmit={saveEmpresa} className="searchbar">
            <input
              value={empresaInput}
              onChange={(e) => setEmpresaInput(e.target.value)}
              placeholder="ex: Padaria do Zé"
              required
            />
            <button type="submit">Começar</button>
          </form>
        </section>
      ) : (
        <>
          <nav className="tabs">
            {AREAS.map((a) => (
              <button key={a.id} className={tab === a.id ? 'active' : ''} onClick={() => setTab(a.id)}>
                {a.emoji} {a.label}
              </button>
            ))}
            <button className={tab === 'perguntar' ? 'active' : ''} onClick={() => setTab('perguntar')}>
              💬 Perguntar
            </button>
          </nav>

          {tab !== 'perguntar' ? (
            <section className="card">
              <h2>
                {area.emoji} {area.label}
              </h2>
              <p className="muted">{area.hint}</p>

              <form onSubmit={handleCapture} className="capture">
                <textarea
                  value={captureText}
                  onChange={(e) => setCaptureText(e.target.value)}
                  placeholder={`Anote qualquer coisa sobre ${area.label.toLowerCase()}… a IA organiza pra você.`}
                  rows={4}
                />
                <button type="submit" disabled={saving || !captureText.trim()}>
                  {saving ? 'Organizando…' : '💾 Salvar nota'}
                </button>
              </form>
              {saveMsg && <p className="msg">{saveMsg}</p>}

              <div className="notes">
                {loadingArea && <p className="muted">Carregando…</p>}
                {!loadingArea && notes.length === 0 && <p className="muted">Nenhuma nota ainda nessa área.</p>}
                {notes.map((n) => (
                  <article key={n.id} className="note">
                    <div className="note-head">
                      <h3>{n.title}</h3>
                      <button className="close" onClick={() => handleDelete(tab, n.id)} title="Excluir">
                        ✕
                      </button>
                    </div>
                    <p className="note-body">{n.content.split('## Nota original')[0].trim()}</p>
                    {n.tags?.length > 0 && (
                      <div className="tags">
                        {n.tags.map((t) => (
                          <span key={t} className="tag">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="muted small">{formatDate(n.createdAt)}</p>
                  </article>
                ))}
              </div>
            </section>
          ) : (
            <section className="card">
              <h2>💬 Pergunte para o segundo cérebro</h2>
              <p className="muted">A resposta usa as notas salvas em todas as áreas.</p>

              <div className="chat">
                {conversation.length === 0 && (
                  <p className="muted">ex: "o que já anotei sobre o fornecedor X?" ou "como está o financeiro este mês?"</p>
                )}
                {conversation.map((c, i) => (
                  <div key={i} className="chat-item">
                    <p className="chat-q">🙋 {c.question}</p>
                    <p className="chat-a">{c.answer === null ? '🤖 pensando…' : `🤖 ${c.answer}`}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAsk} className="searchbar">
                <input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Digite sua pergunta…"
                  required
                />
                <button type="submit" disabled={asking}>
                  {asking ? 'Perguntando…' : 'Perguntar'}
                </button>
              </form>
            </section>
          )}
        </>
      )}

      <style jsx global>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #0f1220;
          color: #e8eaf2;
          min-height: 100vh;
        }
        .app { max-width: 900px; margin: 0 auto; padding: 24px 16px 60px; }
        header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
        h1 { font-size: 1.7rem; }
        header p { color: #9aa0b5; margin-top: 4px; }
        h2 { font-size: 1.15rem; margin-bottom: 8px; }
        .muted { color: #9aa0b5; font-size: 0.85rem; }
        .muted.small { font-size: 0.75rem; margin-top: 8px; }
        .msg { margin-top: 12px; color: #58d68d; }
        .card { background: #181c2e; border: 1px solid #262b44; border-radius: 14px; padding: 20px; margin-bottom: 16px; }
        input, select, textarea {
          background: #0f1220; border: 1px solid #2e3450; border-radius: 8px;
          color: #e8eaf2; padding: 10px 12px; font-size: 0.95rem; width: 100%; font-family: inherit;
        }
        input:focus, select:focus, textarea:focus { outline: none; border-color: #6c7bff; }
        button {
          background: #6c7bff; color: #fff; border: none; border-radius: 8px;
          padding: 10px 16px; font-size: 0.95rem; cursor: pointer; font-weight: 600;
        }
        button:hover { background: #5a68e8; }
        button:disabled { opacity: 0.6; cursor: wait; }
        button.ghost { background: transparent; border: 1px solid #3a4166; color: #b9bed2; font-weight: 500; }
        button.ghost:hover { border-color: #6c7bff; color: #fff; }
        .tabs { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
        .tabs button { background: #181c2e; border: 1px solid #262b44; color: #9aa0b5; }
        .tabs button.active { background: #6c7bff; border-color: #6c7bff; color: #fff; }
        .searchbar { display: flex; gap: 8px; flex-wrap: wrap; }
        .searchbar input { flex: 2; min-width: 220px; }
        .capture { display: flex; flex-direction: column; gap: 10px; margin-top: 12px; }
        .capture textarea { resize: vertical; }
        .capture button { align-self: flex-start; }
        .notes { display: flex; flex-direction: column; gap: 12px; margin-top: 20px; }
        .note { background: #0f1220; border: 1px solid #262b44; border-radius: 10px; padding: 14px; }
        .note-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
        .note h3 { font-size: 0.95rem; }
        .note-body { color: #cbd0e6; font-size: 0.88rem; margin-top: 6px; white-space: pre-wrap; line-height: 1.5; }
        .close { background: transparent; border: none; color: #7c8199; padding: 0; font-size: 0.9rem; }
        .close:hover { color: #e74c3c; }
        .tags { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px; }
        .tag { background: #1c2140; color: #8fd3ff; font-size: 0.72rem; padding: 2px 8px; border-radius: 20px; }
        .chat { display: flex; flex-direction: column; gap: 14px; margin: 16px 0; max-height: 420px; overflow-y: auto; }
        .chat-item { background: #0f1220; border: 1px solid #262b44; border-radius: 10px; padding: 12px; }
        .chat-q { font-weight: 600; font-size: 0.9rem; }
        .chat-a { color: #cbd0e6; font-size: 0.9rem; margin-top: 8px; white-space: pre-wrap; line-height: 1.5; }
      `}</style>
    </div>
  );
}
