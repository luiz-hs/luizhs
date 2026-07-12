// Lista diária de ofertas: varre buscas populares no Mercado Livre e
// devolve os produtos com maior desconto, deduplificados e ordenados.
// Aceita `queries` (termos separados por vírgula) para personalizar os
// interesses da audiência e `minDiscount` (% mínimo, padrão 20).

const DEFAULT_QUERIES = [
  'air fryer',
  'fone de ouvido bluetooth',
  'smartwatch',
  'robô aspirador',
  'cafeteira expresso',
  'echo dot alexa',
  'panela elétrica',
  'perfume importado',
];

// Cache simples por dia para não repetir a varredura a cada clique.
let cache = { day: null, key: null, items: null };

async function searchTerm(q, headers) {
  const url = new URL('https://api.mercadolibre.com/sites/MLB/search');
  url.searchParams.set('q', q);
  url.searchParams.set('limit', '25');
  const response = await fetch(url.toString(), { headers });
  if (!response.ok) {
    const err = new Error(`Mercado Livre respondeu ${response.status}`);
    err.status = response.status;
    throw err;
  }
  const data = await response.json();
  return data.results || [];
}

export default async function handler(req, res) {
  const minDiscount = Number(req.query.minDiscount) || 20;
  const queries = (req.query.queries || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 10);
  const terms = queries.length ? queries : DEFAULT_QUERIES;

  const today = new Date().toISOString().slice(0, 10);
  const cacheKey = `${terms.join('|')}::${minDiscount}`;
  if (cache.day === today && cache.key === cacheKey && cache.items) {
    return res.status(200).json({ items: cache.items, cached: true, day: today });
  }

  const headers = { 'User-Agent': 'ofertas-platform/1.0' };
  if (process.env.ML_ACCESS_TOKEN) {
    headers.Authorization = `Bearer ${process.env.ML_ACCESS_TOKEN}`;
  }

  try {
    const settled = await Promise.allSettled(terms.map((t) => searchTerm(t, headers)));
    const failures = settled.filter((s) => s.status === 'rejected');
    if (failures.length === settled.length) {
      const first = failures[0].reason;
      const needsAuth = first && (first.status === 401 || first.status === 403);
      return res.status(502).json({
        error: needsAuth
          ? 'O Mercado Livre exigiu autenticação. Gere um token em developers.mercadolivre.com.br e defina ML_ACCESS_TOKEN no .env.local.'
          : 'Não consegui consultar o Mercado Livre agora. Tente de novo em instantes.',
      });
    }

    const seen = new Set();
    const items = [];
    for (const result of settled) {
      if (result.status !== 'fulfilled') continue;
      for (const r of result.value) {
        if (seen.has(r.id) || !r.original_price || r.original_price <= r.price) continue;
        seen.add(r.id);
        const discountPct = Math.round((1 - r.price / r.original_price) * 100);
        if (discountPct < minDiscount) continue;
        items.push({
          id: r.id,
          title: r.title,
          price: r.price,
          oldPrice: r.original_price,
          discountPct,
          thumbnail: (r.thumbnail || '').replace(/^http:/, 'https:'),
          url: r.permalink,
          marketplace: 'mercadolivre',
          freeShipping: Boolean(r.shipping && r.shipping.free_shipping),
        });
      }
    }
    items.sort((a, b) => b.discountPct - a.discountPct);
    const top = items.slice(0, 40);

    cache = { day: today, key: cacheKey, items: top };
    return res.status(200).json({ items: top, cached: false, day: today, partial: failures.length > 0 });
  } catch (err) {
    return res.status(500).json({ error: 'Falha ao montar a lista de ofertas.', detail: String(err.message || err) });
  }
}
