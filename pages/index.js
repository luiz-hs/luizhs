import { useEffect, useState } from 'react';
import Head from 'next/head';
import { MARKETPLACES, detectMarketplace, buildAffiliateLink } from '../lib/affiliates';
import { TONES, generateCopy } from '../lib/copywriter';

const EMPTY_CONFIG = { amazonTag: '', mlWord: '', mlTool: '', shopeeAppId: '', audience: '', interests: '' };

export default function Home() {
  const [config, setConfig] = useState(EMPTY_CONFIG);
  const [showConfig, setShowConfig] = useState(false);
  const [tab, setTab] = useState('dia');

  // Ofertas do dia
  const [deals, setDeals] = useState([]);
  const [dealsMsg, setDealsMsg] = useState('');
  const [dealsLoading, setDealsLoading] = useState(false);
  const [dealsDay, setDealsDay] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [batch, setBatch] = useState(null); // lista de mensagens geradas
  const [batchTone, setBatchTone] = useState('urgencia');
  const [batchCopied, setBatchCopied] = useState(-2); // -2 nada, -1 todas, n = índice

  // Busca
  const [query, setQuery] = useState('');
  const [marketplace, setMarketplace] = useState('mercadolivre');
  const [minDiscount, setMinDiscount] = useState(10);
  const [results, setResults] = useState([]);
  const [searchMsg, setSearchMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Colar link
  const [pastedUrl, setPastedUrl] = useState('');
  const [manual, setManual] = useState({ title: '', price: '', oldPrice: '', coupon: '' });

  // Gerador
  const [selected, setSelected] = useState(null); // { product, affiliate }
  const [tone, setTone] = useState('urgencia');
  const [copyText, setCopyText] = useState('');
  const [copySource, setCopySource] = useState('');
  const [copied, setCopied] = useState(false);
  const [shopeeStatus, setShopeeStatus] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ofertas-config');
      if (saved) setConfig({ ...EMPTY_CONFIG, ...JSON.parse(saved) });
      else setShowConfig(true);
    } catch {}
  }, []);

  function saveConfig(next) {
    setConfig(next);
    try {
      localStorage.setItem('ofertas-config', JSON.stringify(next));
    } catch {}
  }

  async function handleSearch(e) {
    e.preventDefault();
    setLoading(true);
    setSearchMsg('');
    setResults([]);
    try {
      const params = new URLSearchParams({ q: query, marketplace, minDiscount: String(minDiscount) });
      const res = await fetch(`/api/search?${params}`);
      const data = await res.json();
      if (data.error) setSearchMsg(`⚠️ ${data.error}`);
      else if (data.unsupported) setSearchMsg(`ℹ️ ${data.message}`);
      else if (!data.items.length) setSearchMsg('Nenhuma oferta encontrada com esse desconto mínimo. Tente reduzir o filtro.');
      setResults(data.items || []);
    } catch {
      setSearchMsg('⚠️ Falha na busca. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  async function loadDeals() {
    setDealsLoading(true);
    setDealsMsg('');
    try {
      const params = new URLSearchParams({ minDiscount: String(minDiscount) });
      if (config.interests) params.set('queries', config.interests);
      const res = await fetch(`/api/deals?${params}`);
      const data = await res.json();
      if (data.error) setDealsMsg(`⚠️ ${data.error}`);
      else if (!data.items.length)
        setDealsMsg('Nenhuma oferta encontrada hoje com esse desconto mínimo. Tente reduzir o filtro ou ajustar os interesses.');
      setDeals(data.items || []);
      setDealsDay(data.day || '');
      setSelectedIds([]);
    } catch {
      setDealsMsg('⚠️ Falha ao carregar as ofertas. Tente novamente.');
    } finally {
      setDealsLoading(false);
    }
  }

  function toggleSelect(id) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function buildBatch(items, tone) {
    return items.map((item) => {
      const affiliate = buildAffiliateLink(item.url, config, item.marketplace);
      const product = {
        ...item,
        link: affiliate.url,
        marketplaceLabel: MARKETPLACES[item.marketplace]
          ? `${MARKETPLACES[item.marketplace].emoji} ${MARKETPLACES[item.marketplace].label}`
          : '',
      };
      return { product, warning: affiliate.warning, copy: generateCopy(product, tone) };
    });
  }

  function openBatch() {
    const items = deals.filter((d) => selectedIds.includes(d.id));
    if (!items.length) return;
    setBatch(buildBatch(items, batchTone));
    setBatchCopied(-2);
  }

  function changeBatchTone(t) {
    setBatchTone(t);
    if (batch) {
      setBatch(buildBatch(batch.map((b) => b.product), t));
      setBatchCopied(-2);
    }
  }

  function updateBatchCopy(index, text) {
    setBatch((prev) => prev.map((b, i) => (i === index ? { ...b, copy: text } : b)));
  }

  async function copyBatchItem(index) {
    try {
      await navigator.clipboard.writeText(batch[index].copy);
      setBatchCopied(index);
      setTimeout(() => setBatchCopied(-2), 2000);
    } catch {}
  }

  async function copyBatchAll() {
    try {
      await navigator.clipboard.writeText(batch.map((b) => b.copy).join('\n\n➖➖➖➖➖➖\n\n'));
      setBatchCopied(-1);
      setTimeout(() => setBatchCopied(-2), 2000);
    } catch {}
  }

  function openGenerator(product) {
    const affiliate = buildAffiliateLink(product.url, config, product.marketplace);
    const withLink = {
      ...product,
      link: affiliate.url,
      marketplaceLabel: MARKETPLACES[product.marketplace]
        ? `${MARKETPLACES[product.marketplace].emoji} ${MARKETPLACES[product.marketplace].label}`
        : '',
    };
    setSelected({ product: withLink, affiliate });
    setCopyText(generateCopy(withLink, tone));
    setCopySource('template');
    setCopied(false);
    setShopeeStatus('');
  }

  function handlePastedGenerate(e) {
    e.preventDefault();
    const mp = detectMarketplace(pastedUrl);
    if (!mp) {
      setSearchMsg('⚠️ Não reconheci esse link. Cole uma URL da Amazon, Mercado Livre ou Shopee.');
      return;
    }
    setSearchMsg('');
    openGenerator({
      title: manual.title || 'Oferta imperdível',
      price: manual.price ? Number(String(manual.price).replace(',', '.')) : null,
      oldPrice: manual.oldPrice ? Number(String(manual.oldPrice).replace(',', '.')) : null,
      coupon: manual.coupon || null,
      url: pastedUrl,
      marketplace: mp,
    });
  }

  function regenerateTemplate(nextTone) {
    const t = nextTone || tone;
    setTone(t);
    if (selected) {
      setCopyText(generateCopy(selected.product, t));
      setCopySource('template');
      setCopied(false);
    }
  }

  async function regenerateWithAI() {
    if (!selected) return;
    setCopySource('carregando');
    try {
      const res = await fetch('/api/copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: selected.product, tone, audience: config.audience }),
      });
      const data = await res.json();
      setCopyText(data.copy);
      setCopySource(data.source === 'ia' ? 'ia' : 'template');
    } catch {
      setCopySource('template');
    }
    setCopied(false);
  }

  async function fetchShopeeShortlink() {
    if (!selected) return;
    setShopeeStatus('Gerando shortlink…');
    try {
      const res = await fetch('/api/shopee-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: selected.product.url }),
      });
      const data = await res.json();
      if (data.shortLink) {
        const updated = { ...selected.product, link: data.shortLink };
        setSelected({ product: updated, affiliate: { ...selected.affiliate, url: data.shortLink, warning: null } });
        setCopyText(generateCopy(updated, tone));
        setShopeeStatus('✅ Shortlink comissionado gerado!');
      } else {
        setShopeeStatus(`ℹ️ ${data.message || data.error || 'Não foi possível gerar o shortlink.'}`);
      }
    } catch {
      setShopeeStatus('⚠️ Falha ao gerar o shortlink.');
    }
  }

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(copyText)}`;

  return (
    <div className="app">
      <Head>
        <title>Garimpo de Ofertas — links de afiliado + copy pronta</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <header>
        <div>
          <h1>🛒 Garimpo de Ofertas</h1>
          <p>Encontre descontos, gere seu link de afiliado e a copy pronta para o grupo.</p>
        </div>
        <button className="ghost" onClick={() => setShowConfig((v) => !v)}>
          ⚙️ Meus IDs de afiliado
        </button>
      </header>

      {showConfig && (
        <section className="card config">
          <h2>⚙️ Configuração de afiliado</h2>
          <p className="muted">Salvo apenas no seu navegador. Os links gerados sairão com esses IDs.</p>
          <div className="grid2">
            <label>
              Tag Amazon Associados (ex: meusite-20)
              <input
                value={config.amazonTag}
                onChange={(e) => saveConfig({ ...config, amazonTag: e.target.value.trim() })}
                placeholder="sua-tag-20"
              />
            </label>
            <label>
              Mercado Livre — palavra-chave (matt_word)
              <input
                value={config.mlWord}
                onChange={(e) => saveConfig({ ...config, mlWord: e.target.value.trim() })}
                placeholder="sua-palavra"
              />
            </label>
            <label>
              Mercado Livre — ferramenta (matt_tool, opcional)
              <input
                value={config.mlTool}
                onChange={(e) => saveConfig({ ...config, mlTool: e.target.value.trim() })}
                placeholder="id da ferramenta"
              />
            </label>
            <label>
              Shopee — App ID da Open API (opcional)
              <input
                value={config.shopeeAppId}
                onChange={(e) => saveConfig({ ...config, shopeeAppId: e.target.value.trim() })}
                placeholder="ex: 17390000000"
              />
            </label>
          </div>
          <label>
            Descreva sua audiência (usado pela IA para personalizar a copy)
            <input
              value={config.audience}
              onChange={(e) => saveConfig({ ...config, audience: e.target.value })}
              placeholder="ex: mães de primeira viagem que buscam economizar em produtos de bebê"
            />
          </label>
          <label>
            Interesses do grupo para as ofertas do dia (separados por vírgula)
            <input
              value={config.interests}
              onChange={(e) => saveConfig({ ...config, interests: e.target.value })}
              placeholder="ex: air fryer, produtos de bebê, maquiagem, panela elétrica"
            />
          </label>
        </section>
      )}

      <nav className="tabs">
        <button className={tab === 'dia' ? 'active' : ''} onClick={() => setTab('dia')}>
          🔥 Ofertas do dia
        </button>
        <button className={tab === 'buscar' ? 'active' : ''} onClick={() => setTab('buscar')}>
          🔍 Buscar ofertas
        </button>
        <button className={tab === 'link' ? 'active' : ''} onClick={() => setTab('link')}>
          🔗 Colar link de produto
        </button>
      </nav>

      {tab === 'dia' && (
        <section className="card">
          <div className="dealsbar">
            <div>
              <h2>🔥 Ofertas de hoje{dealsDay ? ` — ${dealsDay.split('-').reverse().join('/')}` : ''}</h2>
              <p className="muted">
                Lista montada com os maiores descontos do Mercado Livre
                {config.interests ? ' nos seus interesses' : ' em categorias populares'}. Marque as que quer divulgar.
              </p>
            </div>
            <button onClick={loadDeals} disabled={dealsLoading}>
              {dealsLoading ? 'Garimpando…' : deals.length ? '🔄 Atualizar lista' : '⛏️ Carregar ofertas de hoje'}
            </button>
          </div>
          <label className="slider">
            Desconto mínimo: <strong>{minDiscount}%</strong>
            <input
              type="range"
              min="0"
              max="70"
              step="5"
              value={minDiscount}
              onChange={(e) => setMinDiscount(Number(e.target.value))}
            />
          </label>

          {dealsMsg && <p className="msg">{dealsMsg}</p>}

          <div className="results">
            {deals.map((item) => {
              const checked = selectedIds.includes(item.id);
              return (
                <article key={item.id} className={`product selectable${checked ? ' checked' : ''}`} onClick={() => toggleSelect(item.id)}>
                  <input
                    type="checkbox"
                    className="check"
                    checked={checked}
                    onChange={() => toggleSelect(item.id)}
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Selecionar ${item.title}`}
                  />
                  {item.discountPct > 0 && <span className="badge">-{item.discountPct}%</span>}
                  {item.thumbnail && <img src={item.thumbnail} alt="" />}
                  <h3>{item.title}</h3>
                  <p className="price">
                    {item.oldPrice && (
                      <s>{item.oldPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</s>
                    )}{' '}
                    <strong>{item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                  </p>
                  {item.freeShipping && <p className="shipping">🚚 Frete grátis</p>}
                  <button
                    className="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      openGenerator(item);
                    }}
                  >
                    ✨ Gerar individual
                  </button>
                </article>
              );
            })}
          </div>

          {deals.length > 0 && (
            <div className="selectbar">
              <span>
                <strong>{selectedIds.length}</strong> selecionada{selectedIds.length === 1 ? '' : 's'}
              </span>
              <button
                className="ghost"
                onClick={() => setSelectedIds(selectedIds.length === deals.length ? [] : deals.map((d) => d.id))}
              >
                {selectedIds.length === deals.length ? 'Desmarcar todas' : 'Marcar todas'}
              </button>
              <button disabled={!selectedIds.length} onClick={openBatch}>
                ✨ Gerar mensagens ({selectedIds.length})
              </button>
            </div>
          )}
        </section>
      )}

      {tab === 'buscar' && (
        <section className="card">
          <form onSubmit={handleSearch} className="searchbar">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="O que você quer garimpar? ex: air fryer, fone bluetooth…"
              required
            />
            <select value={marketplace} onChange={(e) => setMarketplace(e.target.value)}>
              {Object.values(MARKETPLACES).map((m) => (
                <option key={m.id} value={m.id}>
                  {m.emoji} {m.label}
                </option>
              ))}
            </select>
            <button type="submit" disabled={loading}>
              {loading ? 'Buscando…' : 'Buscar'}
            </button>
          </form>
          <label className="slider">
            Desconto mínimo: <strong>{minDiscount}%</strong>
            <input
              type="range"
              min="0"
              max="70"
              step="5"
              value={minDiscount}
              onChange={(e) => setMinDiscount(Number(e.target.value))}
            />
          </label>

          {searchMsg && <p className="msg">{searchMsg}</p>}

          <div className="results">
            {results.map((item) => (
              <article key={item.id} className="product">
                {item.discountPct > 0 && <span className="badge">-{item.discountPct}%</span>}
                {item.thumbnail && <img src={item.thumbnail} alt="" />}
                <h3>{item.title}</h3>
                <p className="price">
                  {item.oldPrice && (
                    <s>{item.oldPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</s>
                  )}{' '}
                  <strong>{item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                </p>
                {item.freeShipping && <p className="shipping">🚚 Frete grátis</p>}
                <button onClick={() => openGenerator(item)}>✨ Gerar link + copy</button>
              </article>
            ))}
          </div>
        </section>
      )}

      {tab === 'link' && (
        <section className="card">
          <form onSubmit={handlePastedGenerate} className="paste">
            <label>
              Cole o link do produto (Amazon, Mercado Livre ou Shopee)
              <input
                value={pastedUrl}
                onChange={(e) => setPastedUrl(e.target.value.trim())}
                placeholder="https://www.amazon.com.br/dp/…"
                required
              />
            </label>
            <div className="grid2">
              <label>
                Nome do produto
                <input value={manual.title} onChange={(e) => setManual({ ...manual, title: e.target.value })} placeholder="ex: Echo Dot 5ª geração" />
              </label>
              <label>
                Cupom (opcional)
                <input value={manual.coupon} onChange={(e) => setManual({ ...manual, coupon: e.target.value })} placeholder="ex: OFERTA10" />
              </label>
              <label>
                Preço atual (R$)
                <input value={manual.price} onChange={(e) => setManual({ ...manual, price: e.target.value })} placeholder="ex: 299,90" inputMode="decimal" />
              </label>
              <label>
                Preço anterior (R$, opcional)
                <input value={manual.oldPrice} onChange={(e) => setManual({ ...manual, oldPrice: e.target.value })} placeholder="ex: 399,90" inputMode="decimal" />
              </label>
            </div>
            <button type="submit">✨ Gerar link + copy</button>
          </form>
          {searchMsg && <p className="msg">{searchMsg}</p>}
        </section>
      )}

      {selected && (
        <div className="overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setSelected(null)}>✕</button>
            <h2>✨ Sua divulgação está pronta</h2>

            <div className="linkbox">
              <span className="muted">Link de afiliado:</span>
              <code>{selected.product.link}</code>
              {selected.affiliate.warning && <p className="warning">⚠️ {selected.affiliate.warning}</p>}
              {selected.product.marketplace === 'shopee' && (
                <>
                  <button className="ghost" onClick={fetchShopeeShortlink}>
                    🔶 Gerar shortlink comissionado (Open API)
                  </button>
                  {shopeeStatus && <p className="muted">{shopeeStatus}</p>}
                </>
              )}
            </div>

            <div className="tones">
              {Object.values(TONES).map((t) => (
                <button
                  key={t.id}
                  className={tone === t.id ? 'active' : ''}
                  title={t.hint}
                  onClick={() => regenerateTemplate(t.id)}
                >
                  {t.label}
                </button>
              ))}
              <button className="ghost" onClick={regenerateWithAI} disabled={copySource === 'carregando'}>
                {copySource === 'carregando' ? '🤖 Escrevendo…' : '🤖 Reescrever com IA'}
              </button>
            </div>
            {copySource === 'ia' && <p className="muted">✅ Copy personalizada pela IA para sua audiência.</p>}

            <textarea value={copyText} onChange={(e) => setCopyText(e.target.value)} rows={14} />

            <div className="actions">
              <button onClick={copyToClipboard}>{copied ? '✅ Copiado!' : '📋 Copiar mensagem'}</button>
              <a className="whatsapp" href={whatsappHref} target="_blank" rel="noreferrer">
                💬 Enviar no WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

      {batch && (
        <div className="overlay" onClick={() => setBatch(null)}>
          <div className="modal wide" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setBatch(null)}>✕</button>
            <h2>✨ {batch.length} mensagen{batch.length === 1 ? '' : 's'} pronta{batch.length === 1 ? '' : 's'}</h2>
            <p className="muted">Escolha o tom, ajuste o que quiser e copie uma a uma — ou todas de uma vez.</p>

            <div className="tones">
              {Object.values(TONES).map((t) => (
                <button
                  key={t.id}
                  className={batchTone === t.id ? 'active' : ''}
                  title={t.hint}
                  onClick={() => changeBatchTone(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="batchlist">
              {batch.map((b, i) => (
                <div key={b.product.id || i} className="batchitem">
                  <p className="batchtitle">
                    {i + 1}. {b.product.title}
                    {b.product.discountPct ? <span className="minibadge">-{b.product.discountPct}%</span> : null}
                  </p>
                  {b.warning && <p className="warning">⚠️ {b.warning}</p>}
                  <textarea value={b.copy} onChange={(e) => updateBatchCopy(i, e.target.value)} rows={9} />
                  <div className="actions">
                    <button onClick={() => copyBatchItem(i)}>
                      {batchCopied === i ? '✅ Copiada!' : '📋 Copiar'}
                    </button>
                    <a
                      className="whatsapp"
                      href={`https://wa.me/?text=${encodeURIComponent(b.copy)}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      💬 WhatsApp
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="actions sticky">
              <button onClick={copyBatchAll}>
                {batchCopied === -1 ? '✅ Todas copiadas!' : `📋 Copiar todas (${batch.length})`}
              </button>
            </div>
          </div>
        </div>
      )}

      <footer>
        <p className="muted">
          Divulgue com transparência: identifique-se como afiliado nos seus grupos. Preços mudam a qualquer momento —
          confira antes de postar.
        </p>
      </footer>

      <style jsx global>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #0f1220;
          color: #e8eaf2;
          min-height: 100vh;
        }
        .app { max-width: 1000px; margin: 0 auto; padding: 24px 16px 60px; }
        header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
        h1 { font-size: 1.7rem; }
        header p { color: #9aa0b5; margin-top: 4px; }
        h2 { font-size: 1.15rem; margin-bottom: 8px; }
        .muted { color: #9aa0b5; font-size: 0.85rem; }
        .warning { color: #ffb454; font-size: 0.85rem; margin-top: 6px; }
        .msg { margin-top: 12px; color: #ffb454; }
        .card { background: #181c2e; border: 1px solid #262b44; border-radius: 14px; padding: 20px; margin-bottom: 16px; }
        .config .grid2, .paste .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 12px 0; }
        @media (max-width: 640px) { .config .grid2, .paste .grid2 { grid-template-columns: 1fr; } }
        label { display: flex; flex-direction: column; gap: 6px; font-size: 0.85rem; color: #b9bed2; }
        input, select, textarea {
          background: #0f1220; border: 1px solid #2e3450; border-radius: 8px;
          color: #e8eaf2; padding: 10px 12px; font-size: 0.95rem; width: 100%;
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
        .tabs { display: flex; gap: 8px; margin-bottom: 16px; }
        .tabs button { background: #181c2e; border: 1px solid #262b44; color: #9aa0b5; }
        .tabs button.active { background: #6c7bff; border-color: #6c7bff; color: #fff; }
        .searchbar { display: flex; gap: 8px; flex-wrap: wrap; }
        .searchbar input { flex: 2; min-width: 220px; }
        .searchbar select { flex: 1; min-width: 160px; width: auto; }
        .slider { margin-top: 14px; max-width: 340px; }
        .results { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 14px; margin-top: 18px; }
        .product { position: relative; background: #0f1220; border: 1px solid #262b44; border-radius: 12px; padding: 14px; display: flex; flex-direction: column; gap: 8px; }
        .product img { width: 100%; height: 140px; object-fit: contain; background: #fff; border-radius: 8px; }
        .product h3 { font-size: 0.85rem; font-weight: 500; line-height: 1.35; flex: 1; }
        .product .price { font-size: 0.95rem; }
        .product .price s { color: #7c8199; font-size: 0.8rem; }
        .product .shipping { color: #58d68d; font-size: 0.8rem; }
        .badge { position: absolute; top: 10px; right: 10px; background: #e74c3c; color: #fff; font-weight: 700; font-size: 0.8rem; padding: 3px 8px; border-radius: 20px; z-index: 1; }
        .paste { display: flex; flex-direction: column; gap: 12px; }
        .dealsbar { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap; }
        .product.selectable { cursor: pointer; }
        .product.selectable:hover { border-color: #6c7bff; }
        .product.checked { border-color: #6c7bff; box-shadow: 0 0 0 1px #6c7bff; }
        .check { position: absolute; top: 10px; left: 10px; width: 20px; height: 20px; accent-color: #6c7bff; z-index: 1; cursor: pointer; }
        .selectbar {
          position: sticky; bottom: 12px; margin-top: 18px;
          display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
          background: #10131f; border: 1px solid #3a4166; border-radius: 12px;
          padding: 12px 16px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        }
        .selectbar span { color: #b9bed2; font-size: 0.9rem; }
        .selectbar button:last-child { margin-left: auto; }
        .modal.wide { max-width: 760px; }
        .batchlist { display: flex; flex-direction: column; gap: 18px; margin-top: 8px; }
        .batchitem { background: #0f1220; border: 1px solid #262b44; border-radius: 12px; padding: 14px; }
        .batchtitle { font-size: 0.9rem; font-weight: 600; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
        .minibadge { background: #e74c3c; color: #fff; font-size: 0.72rem; font-weight: 700; padding: 2px 7px; border-radius: 20px; }
        .batchitem textarea { font-size: 0.85rem; }
        .batchitem .actions { margin-top: 10px; }
        .actions.sticky { position: sticky; bottom: 0; background: #181c2e; padding: 12px 0 0; margin-top: 16px; }
        .overlay { position: fixed; inset: 0; background: rgba(5, 7, 15, 0.75); display: flex; align-items: center; justify-content: center; padding: 16px; z-index: 10; }
        .modal { background: #181c2e; border: 1px solid #2e3450; border-radius: 16px; padding: 24px; max-width: 640px; width: 100%; max-height: 90vh; overflow-y: auto; position: relative; }
        .close { position: absolute; top: 12px; right: 12px; background: transparent; border: none; color: #9aa0b5; font-size: 1.1rem; }
        .linkbox { background: #0f1220; border: 1px solid #262b44; border-radius: 10px; padding: 12px; margin: 12px 0; display: flex; flex-direction: column; gap: 8px; }
        .linkbox code { word-break: break-all; color: #8fd3ff; font-size: 0.8rem; }
        .tones { display: flex; gap: 8px; flex-wrap: wrap; margin: 12px 0; }
        .tones button { background: #0f1220; border: 1px solid #2e3450; color: #b9bed2; font-weight: 500; font-size: 0.85rem; }
        .tones button.active { background: #6c7bff; border-color: #6c7bff; color: #fff; }
        textarea { font-family: inherit; line-height: 1.5; resize: vertical; }
        .actions { display: flex; gap: 10px; margin-top: 14px; flex-wrap: wrap; }
        .whatsapp { background: #25d366; color: #fff; border-radius: 8px; padding: 10px 16px; font-weight: 600; text-decoration: none; font-size: 0.95rem; }
        .whatsapp:hover { background: #1fb958; }
        footer { margin-top: 24px; text-align: center; }
      `}</style>
    </div>
  );
}
