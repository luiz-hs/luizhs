// Lógica de detecção de marketplace e geração de links de afiliado.
// Funciona tanto no servidor (API routes) quanto no cliente.

export const MARKETPLACES = {
  amazon: { id: 'amazon', label: 'Amazon', emoji: '🟠' },
  mercadolivre: { id: 'mercadolivre', label: 'Mercado Livre', emoji: '🟡' },
  shopee: { id: 'shopee', label: 'Shopee', emoji: '🔶' },
};

export function detectMarketplace(url) {
  let host;
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
  if (host.includes('amazon.') || host === 'amzn.to' || host === 'a.co') return 'amazon';
  if (
    host.includes('mercadolivre.com') ||
    host.includes('mercadolibre.com') ||
    host === 'produto.mercadolivre.com.br'
  )
    return 'mercadolivre';
  if (host.includes('shopee.') || host === 's.shopee.com.br' || host === 'shope.ee') return 'shopee';
  return null;
}

// Extrai o ASIN de uma URL da Amazon (/dp/XXXXXXXXXX ou /gp/product/XXXXXXXXXX)
export function extractAsin(url) {
  const match = url.match(/(?:\/dp\/|\/gp\/product\/|\/gp\/aw\/d\/)([A-Z0-9]{10})(?:[/?]|$)/i);
  return match ? match[1].toUpperCase() : null;
}

function buildAmazonLink(url, config) {
  if (!config.amazonTag) {
    return { url, warning: 'Configure sua tag de associado Amazon para monetizar este link.' };
  }
  const asin = extractAsin(url);
  if (asin) {
    // Link curto e limpo, sem parâmetros de rastreio de terceiros
    return { url: `https://www.amazon.com.br/dp/${asin}?tag=${encodeURIComponent(config.amazonTag)}` };
  }
  // Links encurtados (amzn.to) ou de listagem: só anexa a tag
  try {
    const u = new URL(url);
    u.searchParams.set('tag', config.amazonTag);
    return { url: u.toString() };
  } catch {
    return { url, warning: 'URL da Amazon inválida.' };
  }
}

function buildMercadoLivreLink(url, config) {
  if (!config.mlWord) {
    return {
      url,
      warning: 'Configure sua palavra-chave de afiliado do Mercado Livre (matt_word) para monetizar este link.',
    };
  }
  try {
    const u = new URL(url);
    u.searchParams.set('matt_word', config.mlWord);
    u.searchParams.set('matt_tool', config.mlTool || config.mlWord);
    return { url: u.toString() };
  } catch {
    return { url, warning: 'URL do Mercado Livre inválida.' };
  }
}

function buildShopeeLink(url, config) {
  // Links de afiliado da Shopee (s.shopee.com.br) só podem ser gerados
  // pela Open API de afiliados ou pelo portal. Sem credenciais, marcamos
  // a origem via utm_source para rastreio básico.
  if (url.includes('s.shopee.com.br') || url.includes('shope.ee')) {
    return { url }; // já é um link de afiliado encurtado
  }
  const warning = config.shopeeAppId
    ? null
    : 'Sem credenciais da Shopee Open API o link não é comissionado — gere o shortlink no portal de afiliados ou configure SHOPEE_APP_ID/SHOPEE_SECRET.';
  try {
    const u = new URL(url);
    if (config.shopeeAppId) u.searchParams.set('utm_source', `an_${config.shopeeAppId}`);
    u.searchParams.set('utm_medium', 'affiliates');
    return { url: u.toString(), warning };
  } catch {
    return { url, warning: 'URL da Shopee inválida.' };
  }
}

// Gera o link de afiliado. `config`: { amazonTag, mlWord, mlTool, shopeeAppId }
export function buildAffiliateLink(url, config = {}, marketplace) {
  const mp = marketplace || detectMarketplace(url);
  if (!mp) return { url, marketplace: null, warning: 'Marketplace não reconhecido — link mantido como está.' };
  const builders = {
    amazon: buildAmazonLink,
    mercadolivre: buildMercadoLivreLink,
    shopee: buildShopeeLink,
  };
  return { marketplace: mp, ...builders[mp](url, config) };
}
