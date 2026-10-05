import { useEffect, useState } from 'react';
import Head from 'next/head';
import { AREAS, AREA_BY_ID } from '../../lib/segundo-cerebro/areas';
import { ONBOARDING_STEPS } from '../../lib/segundo-cerebro/onboarding';
import { CATEGORIAS } from '../../lib/segundo-cerebro/categorias';

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

function formatBRL(value) {
  return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function SegundoCerebro() {
  const [empresa, setEmpresa] = useState('');
  const [empresaInput, setEmpresaInput] = useState('');
  const [tab, setTab] = useState(AREAS[0].id);

  // Onboarding / perfil de negócio
  const [profile, setProfile] = useState(null);
  const [profileChecked, setProfileChecked] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [wizardAnswers, setWizardAnswers] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);

  // Diagnóstico por IA
  const [diagnostico, setDiagnostico] = useState(null);
  const [diagnosticoLoading, setDiagnosticoLoading] = useState(false);

  // Captura de notas por área
  const [notesByArea, setNotesByArea] = useState({});
  const [loadingArea, setLoadingArea] = useState(false);
  const [captureText, setCaptureText] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // Chat
  const [question, setQuestion] = useState('');
  const [asking, setAsking] = useState(false);
  const [conversation, setConversation] = useState([]);

  // Faturamento
  const [lancamentos, setLancamentos] = useState([]);
  const [resumo, setResumo] = useState({ totalReceitas: 0, totalDespesas: 0, saldo: 0 });
  const [loadingFin, setLoadingFin] = useState(false);
  const [finForm, setFinForm] = useState({ tipo: 'receita', categoria: 'vendas', descricao: '', valor: '', data: todayISO() });
  const [finSaving, setFinSaving] = useState(false);
  const [finMsg, setFinMsg] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('segundo-cerebro-empresa');
      if (saved) setEmpresa(saved);
    } catch {}
  }, []);

  useEffect(() => {
    if (empresa) loadProfile();
  }, [empresa]);

  useEffect(() => {
    if (empresa && profile && tab !== 'perguntar' && tab !== 'faturamento') loadNotes(tab);
    if (empresa && profile && tab === 'faturamento') loadFinanceiro();
  }, [empresa, profile, tab]);

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
    setProfile(null);
    setProfileChecked(false);
    setWizardStep(0);
    setWizardAnswers({});
    setDiagnostico(null);
    setNotesByArea({});
    try {
      localStorage.removeItem('segundo-cerebro-empresa');
    } catch {}
  }

  async function loadProfile() {
    try {
      const res = await fetch(`/api/segundo-cerebro/profile?${new URLSearchParams({ empresa })}`);
      const data = await res.json();
      setProfile(data.profile || null);
      if (data.profile) loadDiagnostico();
    } catch {
      setProfile(null);
    } finally {
      setProfileChecked(true);
    }
  }

  async function loadDiagnostico() {
    try {
      const res = await fetch(`/api/segundo-cerebro/diagnostico?${new URLSearchParams({ empresa })}`);
      const data = await res.json();
      if (data.diagnostico) {
        setDiagnostico(data.diagnostico);
      } else {
        gerarDiagnostico();
      }
    } catch {}
  }

  async function gerarDiagnostico() {
    setDiagnosticoLoading(true);
    try {
      const res = await fetch('/api/segundo-cerebro/diagnostico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empresa }),
      });
      const data = await res.json();
      if (data.diagnostico) setDiagnostico(data.diagnostico);
    } catch {
    } finally {
      setDiagnosticoLoading(false);
    }
  }

  function chooseWizardOption(field, value) {
    const next = { ...wizardAnswers, [field]: value };
    setWizardAnswers(next);
    if (wizardStep < ONBOARDING_STEPS.length - 1) {
      setWizardStep(wizardStep + 1);
    }
  }

  async function submitProfile(e) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch('/api/segundo-cerebro/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empresa, answers: wizardAnswers }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Falha ao salvar o perfil.');
        return;
      }
      setProfile(data.profile);
      gerarDiagnostico();
    } catch {
      alert('Falha ao salvar o perfil. Tente novamente.');
    } finally {
      setSavingProfile(false);
    }
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

  async function loadFinanceiro() {
    setLoadingFin(true);
    try {
      const res = await fetch(`/api/segundo-cerebro/financeiro?${new URLSearchParams({ empresa })}`);
      const data = await res.json();
      setLancamentos(data.lancamentos || []);
      setResumo(data.resumo || { totalReceitas: 0, totalDespesas: 0, saldo: 0 });
    } catch {
    } finally {
      setLoadingFin(false);
    }
  }

  async function handleAddLancamento(e) {
    e.preventDefault();
    if (!finForm.valor || Number(finForm.valor) <= 0) {
      setFinMsg('⚠️ Informe um valor maior que zero.');
      return;
    }
    setFinSaving(true);
    setFinMsg('');
    try {
      const res = await fetch('/api/segundo-cerebro/financeiro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empresa, ...finForm }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFinMsg(`⚠️ ${data.error || 'Falha ao salvar.'}`);
        return;
      }
      setFinForm((f) => ({ ...f, descricao: '', valor: '' }));
      setFinMsg('✅ Lançamento salvo.');
      setTimeout(() => setFinMsg(''), 2500);
      loadFinanceiro();
    } catch {
      setFinMsg('⚠️ Falha ao salvar. Tente novamente.');
    } finally {
      setFinSaving(false);
    }
  }

  async function handleDeleteLancamento(id) {
    try {
      await fetch('/api/segundo-cerebro/financeiro', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empresa, id }),
      });
      loadFinanceiro();
    } catch {}
  }

  const area = AREA_BY_ID[tab];
  const notes = notesByArea[tab] || [];
  const wizardDone = wizardStep >= ONBOARDING_STEPS.length;
  const currentStep = ONBOARDING_STEPS[wizardStep];

  return (
    <div className="app">
      <Head>
        <title>🧠 Segundo Cérebro — memória da sua empresa</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <header>
        <div>
          <h1>🧠 Segundo Cérebro</h1>
          <p>Registre o que acontece na empresa, controle o financeiro e pergunte quando precisar lembrar.</p>
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
      ) : !profileChecked ? (
        <section className="card">
          <p className="muted">Carregando…</p>
        </section>
      ) : !profile ? (
        <section className="card wizard">
          <p className="muted">
            Passo {wizardStep + 1} de {ONBOARDING_STEPS.length}
          </p>
          <div className="progress">
            <div className="progress-bar" style={{ width: `${((wizardStep + (wizardDone ? 1 : 0)) / ONBOARDING_STEPS.length) * 100}%` }} />
          </div>

          {!wizardDone ? (
            <>
              <h2>{currentStep.question}</h2>
              {currentStep.type === 'choice' ? (
                <div className="options">
                  {currentStep.options.map((opt) => (
                    <button key={opt.value} className="option" onClick={() => chooseWizardOption(currentStep.field, opt.value)}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              ) : (
                <form
                  className="capture"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setWizardStep(wizardStep + 1);
                  }}
                >
                  <textarea
                    value={wizardAnswers[currentStep.field] || ''}
                    onChange={(e) => setWizardAnswers({ ...wizardAnswers, [currentStep.field]: e.target.value })}
                    placeholder={currentStep.placeholder}
                    rows={3}
                    required
                  />
                  <button type="submit">Continuar</button>
                </form>
              )}
              {wizardStep > 0 && (
                <button className="ghost back" onClick={() => setWizardStep(wizardStep - 1)}>
                  ← Voltar
                </button>
              )}
            </>
          ) : (
            <>
              <h2>Pronto para montar seu diagnóstico</h2>
              <p className="muted">Confirme as respostas abaixo (ou volte pra corrigir algo) e gere seu diagnóstico inicial.</p>
              <ul className="summary">
                {ONBOARDING_STEPS.map((s) => (
                  <li key={s.field}>
                    <strong>{s.question}</strong>
                    <span>{wizardAnswers[s.field]}</span>
                  </li>
                ))}
              </ul>
              <div className="actions">
                <button className="ghost" onClick={() => setWizardStep(ONBOARDING_STEPS.length - 1)}>
                  ← Corrigir
                </button>
                <button onClick={submitProfile} disabled={savingProfile}>
                  {savingProfile ? 'Salvando…' : '✅ Gerar meu diagnóstico'}
                </button>
              </div>
            </>
          )}
        </section>
      ) : (
        <>
          {(diagnostico || diagnosticoLoading) && (
            <section className="card diagnostico">
              <div className="diag-head">
                <h2>📊 Diagnóstico do negócio</h2>
                {diagnostico && (
                  <button className="ghost" onClick={gerarDiagnostico} disabled={diagnosticoLoading}>
                    {diagnosticoLoading ? 'Gerando…' : '🔄 Gerar de novo'}
                  </button>
                )}
              </div>
              {diagnosticoLoading && !diagnostico ? (
                <p className="muted">Analisando seu perfil…</p>
              ) : (
                <div className="diag-body">
                  {diagnostico.conteudo.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              )}
              {diagnostico?.source === 'template' && (
                <p className="muted small">⚠️ Diagnóstico gerado por template (configure ANTHROPIC_API_KEY para uma análise por IA).</p>
              )}
            </section>
          )}

          <nav className="tabs">
            {AREAS.map((a) => (
              <button key={a.id} className={tab === a.id ? 'active' : ''} onClick={() => setTab(a.id)}>
                {a.emoji} {a.label}
              </button>
            ))}
            <button className={tab === 'faturamento' ? 'active' : ''} onClick={() => setTab('faturamento')}>
              💰 Faturamento
            </button>
            <button className={tab === 'perguntar' ? 'active' : ''} onClick={() => setTab('perguntar')}>
              💬 Perguntar
            </button>
          </nav>

          {tab === 'faturamento' ? (
            <section className="card">
              <h2>💰 Faturamento</h2>
              <p className="muted">Lance suas receitas e despesas para acompanhar o saldo e alimentar o diagnóstico.</p>

              <div className="resumo">
                <div className="resumo-item receita">
                  <span className="muted">Receitas</span>
                  <strong>{formatBRL(resumo.totalReceitas)}</strong>
                </div>
                <div className="resumo-item despesa">
                  <span className="muted">Despesas</span>
                  <strong>{formatBRL(resumo.totalDespesas)}</strong>
                </div>
                <div className="resumo-item saldo">
                  <span className="muted">Saldo</span>
                  <strong>{formatBRL(resumo.saldo)}</strong>
                </div>
              </div>

              <form onSubmit={handleAddLancamento} className="fin-form">
                <select
                  value={finForm.tipo}
                  onChange={(e) =>
                    setFinForm({ ...finForm, tipo: e.target.value, categoria: CATEGORIAS[e.target.value][0].value })
                  }
                >
                  <option value="receita">Receita</option>
                  <option value="despesa">Despesa</option>
                </select>
                <select value={finForm.categoria} onChange={(e) => setFinForm({ ...finForm, categoria: e.target.value })}>
                  {CATEGORIAS[finForm.tipo].map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <input
                  value={finForm.descricao}
                  onChange={(e) => setFinForm({ ...finForm, descricao: e.target.value })}
                  placeholder="Descrição (opcional)"
                />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={finForm.valor}
                  onChange={(e) => setFinForm({ ...finForm, valor: e.target.value })}
                  placeholder="Valor (R$)"
                  required
                />
                <input type="date" value={finForm.data} onChange={(e) => setFinForm({ ...finForm, data: e.target.value })} required />
                <button type="submit" disabled={finSaving}>
                  {finSaving ? 'Salvando…' : '+ Lançar'}
                </button>
              </form>
              {finMsg && <p className="msg">{finMsg}</p>}

              <div className="lancamentos">
                {loadingFin && <p className="muted">Carregando…</p>}
                {!loadingFin && lancamentos.length === 0 && <p className="muted">Nenhum lançamento ainda.</p>}
                {lancamentos.map((l) => (
                  <div key={l.id} className={`lancamento ${l.tipo}`}>
                    <div>
                      <strong>{l.descricao || (l.tipo === 'receita' ? 'Receita' : 'Despesa')}</strong>
                      <p className="muted small">
                        {new Date(l.data).toLocaleDateString('pt-BR')} · {l.categoria.replace(/_/g, ' ')}
                      </p>
                    </div>
                    <div className="lancamento-right">
                      <span className={l.tipo === 'receita' ? 'valor-receita' : 'valor-despesa'}>
                        {l.tipo === 'receita' ? '+' : '-'} {formatBRL(l.valor)}
                      </span>
                      <button className="close" onClick={() => handleDeleteLancamento(l.id)} title="Excluir">
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : tab !== 'perguntar' ? (
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

        .wizard .progress { background: #0f1220; border-radius: 20px; height: 6px; margin: 12px 0 20px; overflow: hidden; }
        .wizard .progress-bar { background: #6c7bff; height: 100%; transition: width 0.3s ease; }
        .wizard h2 { font-size: 1.25rem; margin-bottom: 16px; }
        .options { display: flex; flex-direction: column; gap: 10px; }
        .option { background: #0f1220; border: 1px solid #2e3450; color: #e8eaf2; text-align: left; font-weight: 500; }
        .option:hover { border-color: #6c7bff; background: #141935; }
        .wizard .back { margin-top: 16px; }
        .summary { list-style: none; display: flex; flex-direction: column; gap: 10px; margin: 16px 0; }
        .summary li { display: flex; flex-direction: column; gap: 2px; background: #0f1220; border: 1px solid #262b44; border-radius: 8px; padding: 10px 12px; }
        .summary li strong { font-size: 0.82rem; color: #9aa0b5; }
        .summary li span { font-size: 0.95rem; }
        .wizard .actions { display: flex; gap: 10px; margin-top: 8px; }

        .diagnostico .diag-head { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; }
        .diag-body { margin-top: 12px; color: #cbd0e6; font-size: 0.92rem; line-height: 1.6; }
        .diag-body p { margin-bottom: 4px; }

        .resumo { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 16px 0; }
        @media (max-width: 640px) { .resumo { grid-template-columns: 1fr; } }
        .resumo-item { background: #0f1220; border: 1px solid #262b44; border-radius: 10px; padding: 14px; display: flex; flex-direction: column; gap: 6px; }
        .resumo-item strong { font-size: 1.15rem; }
        .resumo-item.receita strong { color: #58d68d; }
        .resumo-item.despesa strong { color: #e74c3c; }
        .fin-form { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
        .fin-form select { flex: 1; min-width: 140px; }
        .fin-form input[type='text'], .fin-form input:not([type]) { flex: 2; min-width: 160px; }
        .fin-form input[type='number'] { flex: 1; min-width: 120px; }
        .fin-form input[type='date'] { flex: 1; min-width: 150px; }
        .lancamentos { display: flex; flex-direction: column; gap: 10px; margin-top: 18px; }
        .lancamento { display: flex; justify-content: space-between; align-items: center; gap: 12px; background: #0f1220; border: 1px solid #262b44; border-radius: 10px; padding: 12px 14px; }
        .lancamento-right { display: flex; align-items: center; gap: 12px; }
        .valor-receita { color: #58d68d; font-weight: 600; }
        .valor-despesa { color: #e74c3c; font-weight: 600; }
      `}</style>
    </div>
  );
}
