import { generateCopy, TONES } from '../../lib/copywriter';

// Gera a descrição persuasiva. Se ANTHROPIC_API_KEY estiver configurada,
// usa a API do Claude para uma copy sob medida; senão, usa os templates locais.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST.' });
  }

  const { product, tone = 'urgencia', audience } = req.body || {};
  if (!product || !product.link) {
    return res.status(400).json({ error: 'Envie o produto com o link de afiliado.' });
  }

  const fallback = generateCopy(product, TONES[tone] ? tone : 'urgencia');

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(200).json({ copy: fallback, source: 'template' });
  }

  try {
    const priceInfo = [
      product.price ? `Preço atual: R$ ${product.price}` : null,
      product.oldPrice ? `Preço anterior: R$ ${product.oldPrice}` : null,
      product.discountPct ? `Desconto: ${product.discountPct}%` : null,
      product.coupon ? `Cupom: ${product.coupon}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: `Escreva uma mensagem curta de divulgação de oferta para um grupo de WhatsApp no Brasil.

Produto: ${product.title || 'não informado'}
Marketplace: ${product.marketplaceLabel || 'não informado'}
${priceInfo}
Link (inclua exatamente como está, em linha própria): ${product.link}
Tom desejado: ${TONES[tone] ? TONES[tone].label : 'urgência'}
${audience ? `Perfil da audiência: ${audience}` : ''}

Regras:
- Use formatação do WhatsApp (*negrito*, ~riscado~) e emojis com moderação.
- Gere desejo e senso de oportunidade sem inventar informações (não crie preços, avaliações ou prazos falsos).
- Máximo de 10 linhas. Termine com um aviso de que o preço pode mudar.
- Responda SOMENTE com a mensagem pronta, sem comentários.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      return res.status(200).json({ copy: fallback, source: 'template', warning: 'IA indisponível, usei template.' });
    }

    const data = await response.json();
    const text = data.content && data.content[0] && data.content[0].text;
    return res.status(200).json({ copy: text || fallback, source: text ? 'ia' : 'template' });
  } catch {
    return res.status(200).json({ copy: fallback, source: 'template', warning: 'IA indisponível, usei template.' });
  }
}
