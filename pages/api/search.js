import { getMlToken, ML_AUTH_HELP } from '../../lib/ml-auth';

// Busca de produtos com desconto.
// Mercado Livre: usa token gerado automaticamente com ML_CLIENT_ID/ML_CLIENT_SECRET
// (ou ML_ACCESS_TOKEN fixo); sem credenciais tenta a busca pública.
// Amazon/Shopee: exigem credenciais oficiais (PA-API / Open API de afiliados),
// então a busca automática fica indisponível sem elas — use o fluxo "Colar link".

export default async function handler(req, res) {
  const { q, marketplace = 'mercadolivre', minDiscount = '0' } = req.query;

  if (!q || !q.trim()) {
    return res.status(400).json({ error: 'Informe um termo de busca.' });
  }

  if (marketplace !== 'mercadolivre') {
    return res.status(200).json({
      items: [],
      unsupported: true,
      message:
        marketplace === 'amazon'
          ? 'A busca automática na Amazon exige credenciais da PA-API (Product Advertising API). Use a aba "Colar link" com qualquer produto da Amazon.'
          : 'A busca automática na Shopee exige credenciais da Open API de afiliados. Use a aba "Colar link" com qualquer produto da Shopee.',
    });
  }

  try {
    const url = new URL('https://api.mercadolibre.com/sites/MLB/search');
    url.searchParams.set('q', q.trim());
    url.searchParams.set('limit', '30');

    const headers = { 'User-Agent': 'ofertas-platform/1.0' };
    try {
      const token = await getMlToken();
      if (token) headers.Authorization = `Bearer ${token}`;
    } catch {}

    const response = await fetch(url.toString(), { headers });
    if (!response.ok) {
      const body = await response.text();
      const needsAuth = response.status === 401 || response.status === 403;
      return res.status(502).json({
        error: needsAuth ? ML_AUTH_HELP : `Erro na API do Mercado Livre (${response.status}).`,
        detail: body.slice(0, 300),
      });
    }

    const data = await response.json();
    const min = Number(minDiscount) || 0;

    const items = (data.results || [])
      .map((r) => {
        const oldPrice = r.original_price || null;
        const discountPct = oldPrice ? Math.round((1 - r.price / oldPrice) * 100) : 0;
        return {
          id: r.id,
          title: r.title,
          price: r.price,
          oldPrice,
          discountPct,
          thumbnail: (r.thumbnail || '').replace(/^http:/, 'https:'),
          url: r.permalink,
          marketplace: 'mercadolivre',
          freeShipping: Boolean(r.shipping && r.shipping.free_shipping),
        };
      })
      .filter((item) => item.discountPct >= min)
      .sort((a, b) => b.discountPct - a.discountPct);

    return res.status(200).json({ items });
  } catch (err) {
    return res.status(500).json({ error: 'Falha ao buscar ofertas.', detail: String(err.message || err) });
  }
}
