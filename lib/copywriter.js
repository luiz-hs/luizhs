// Gerador de copy persuasiva para grupos de WhatsApp/Telegram.
// Usa formatação nativa do WhatsApp: *negrito*, ~riscado~, _itálico_.

export const TONES = {
  urgencia: { id: 'urgencia', label: '⏰ Urgência', hint: 'preço pode subir a qualquer momento' },
  desejo: { id: 'desejo', label: '🤩 Desejo', hint: 'foca no prazer de ter o produto' },
  economia: { id: 'economia', label: '💰 Economia', hint: 'foca no dinheiro que a pessoa poupa' },
  exclusividade: { id: 'exclusividade', label: '🔒 Exclusividade', hint: 'achado que poucos viram' },
};

function formatBRL(value) {
  if (value == null || isNaN(value)) return null;
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function pick(arr, seed) {
  return arr[Math.abs(seed) % arr.length];
}

// Gera a mensagem pronta para colar no grupo.
// product: { title, price, oldPrice, discountPct, coupon, link, marketplaceLabel }
export function generateCopy(product, tone = 'urgencia') {
  const seed = (product.title || '').length + (product.link || '').length;
  const price = formatBRL(product.price);
  const oldPrice = formatBRL(product.oldPrice);
  const pct =
    product.discountPct ||
    (product.price && product.oldPrice
      ? Math.round((1 - product.price / product.oldPrice) * 100)
      : null);

  const headlines = {
    urgencia: [
      `🚨 *CORRE QUE ACABA!* 🚨`,
      `⏰ *ÚLTIMAS UNIDADES NESSE PREÇO!*`,
      `🔥 *RELÂMPAGO! Vi agora e já tá voando*`,
    ],
    desejo: [
      `😍 *Você MERECE isso hoje*`,
      `✨ *Aquele mimo que você tava esperando*`,
      `🤩 *Olha o que eu achei pra você…*`,
    ],
    economia: [
      `💸 *SEU BOLSO AGRADECE*`,
      `🧮 *Fiz a conta: é o menor preço que já vi*`,
      `💰 *Economia de verdade, sem pegadinha*`,
    ],
    exclusividade: [
      `🔒 *SÓ AQUI NO GRUPO*`,
      `🤫 *Achado secreto — não espalha (ou espalha rs)*`,
      `🎯 *Garimpei isso só pra quem tá aqui dentro*`,
    ],
  };

  const closers = {
    urgencia: [`👉 Garanta antes que o preço volte:`, `⚡ Toca aqui AGORA:`],
    desejo: [`🛒 Se presenteia, vai:`, `💝 Seu clique de felicidade:`],
    economia: [`✅ Pega o desconto aqui:`, `🏷️ Link com o preço baixo:`],
    exclusividade: [`🔑 Link exclusivo do grupo:`, `🎁 Só clicar e aproveitar:`],
  };

  const lines = [];
  lines.push(pick(headlines[tone] || headlines.urgencia, seed));
  lines.push('');
  if (product.marketplaceLabel) lines.push(`🛍️ ${product.marketplaceLabel}`);
  lines.push(`*${product.title || 'Oferta imperdível'}*`);
  lines.push('');

  if (oldPrice && price) {
    lines.push(`❌ De: ~${oldPrice}~`);
    lines.push(`✅ Por: *${price}*${pct ? `  (*-${pct}%* 🤯)` : ''}`);
  } else if (price) {
    lines.push(`💵 Apenas *${price}*`);
  }
  if (product.coupon) {
    lines.push(`🎟️ Cupom: *${product.coupon}*`);
  }
  lines.push('');
  lines.push(pick(closers[tone] || closers.urgencia, seed + 1));
  lines.push(product.link || '');
  lines.push('');
  lines.push('_⚠️ Preço sujeito a alteração a qualquer momento._');

  return lines.join('\n');
}
