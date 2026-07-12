// Autenticação com o Mercado Livre.
// Com ML_CLIENT_ID e ML_CLIENT_SECRET (aplicação criada em
// developers.mercadolivre.com.br), o servidor gera e renova o token
// sozinho via client_credentials — sem precisar colar tokens que
// expiram a cada 6 horas. ML_ACCESS_TOKEN fixo continua aceito.

let cached = { token: null, expiresAt: 0 };

export async function getMlToken() {
  if (process.env.ML_ACCESS_TOKEN) return process.env.ML_ACCESS_TOKEN;

  const clientId = process.env.ML_CLIENT_ID;
  const clientSecret = process.env.ML_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  // renova 1 minuto antes de expirar
  if (cached.token && Date.now() < cached.expiresAt - 60_000) return cached.token;

  const response = await fetch('https://api.mercadolibre.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });
  if (!response.ok) return null;

  const data = await response.json();
  if (!data.access_token) return null;
  cached = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in || 21600) * 1000,
  };
  return cached.token;
}

export const ML_AUTH_HELP =
  'O Mercado Livre exige autenticação. Crie uma aplicação gratuita em developers.mercadolivre.com.br e defina ML_CLIENT_ID e ML_CLIENT_SECRET nas variáveis de ambiente (na Vercel: Settings → Environment Variables → Redeploy).';
