import { useEffect, useState } from 'react';
import Head from 'next/head';
import { MARKETPLACES, detectMarketplace, buildAffiliateLink } from '../lib/affiliates';
import { TONES, generateCopy } from '../lib/copywriter';

const EMPTY_CONFIG = { amazonTag: '', mlWord: '', mlTool: '', shopeeAppId: '', audience: '' };

export default function Home() {
  const [config, setConfig] = useState(EMPTY_CONFIG);
  const [showConfig, setShowConfig] = useState(false);
  const [tab, setTab] = useState('buscar');

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
        </section>
      )}

      <nav className="tabs">
        <button className={tab === 'buscar' ? 'active' : ''} onClick={() => setTab('buscar')}>
          🔍 Buscar ofertas
        </button>
        <button className={tab === 'link' ? 'active' : ''} onClick={() => setTab('link')}>
          🔗 Colar link de produto
        </button>
      </nav>

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
