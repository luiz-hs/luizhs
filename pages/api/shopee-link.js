import crypto from 'crypto';

// Gera um shortlink comissionado da Shopee via Open API de afiliados.
// Requer SHOPEE_APP_ID e SHOPEE_SECRET no .env.local (obtidos no portal
// de afiliados: affiliate.shopee.com.br → Open API).

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST.' });
  }

  const appId = process.env.SHOPEE_APP_ID;
  const secret = process.env.SHOPEE_SECRET;
  if (!appId || !secret) {
    return res.status(200).json({
      unavailable: true,
      message: 'Defina SHOPEE_APP_ID e SHOPEE_SECRET no .env.local para gerar shortlinks comissionados.',
    });
  }

  const { url, subId } = req.body || {};
  if (!url) return res.status(400).json({ error: 'Envie a URL do produto Shopee.' });

  const payload = JSON.stringify({
    query: `mutation{generateShortLink(input:{originUrl:${JSON.stringify(url)},subIds:[${JSON.stringify(
      subId || 'plataforma'
    )}]}){shortLink}}`,
  });

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = crypto
    .createHash('sha256')
    .update(`${appId}${timestamp}${payload}${secret}`)
    .digest('hex');

  try {
    const response = await fetch('https://open-api.affiliate.shopee.com.br/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `SHA256 Credential=${appId}, Timestamp=${timestamp}, Signature=${signature}`,
      },
      body: payload,
    });

    const data = await response.json();
    const shortLink =
      data && data.data && data.data.generateShortLink && data.data.generateShortLink.shortLink;

    if (!shortLink) {
      return res.status(502).json({
        error: 'A Shopee não retornou o shortlink.',
        detail: JSON.stringify(data && data.errors ? data.errors : data).slice(0, 300),
      });
    }
    return res.status(200).json({ shortLink });
  } catch (err) {
    return res.status(500).json({ error: 'Falha ao chamar a Open API da Shopee.', detail: String(err.message || err) });
  }
}
