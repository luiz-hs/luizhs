import { getProfile, saveProfile } from '../../../lib/segundo-cerebro/profile-store';

export default async function handler(req, res) {
  const empresa = (req.query.empresa || req.body?.empresa || '').trim();
  if (!empresa) {
    return res.status(400).json({ error: 'Informe a empresa (parâmetro "empresa").' });
  }

  try {
    if (req.method === 'GET') {
      const profile = await getProfile(empresa);
      return res.status(200).json({ profile });
    }

    if (req.method === 'POST') {
      const { answers } = req.body || {};
      if (!answers || typeof answers !== 'object') {
        return res.status(400).json({ error: 'Envie as respostas do onboarding.' });
      }
      const profile = await saveProfile(empresa, answers);
      return res.status(201).json({ profile });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Método não suportado.' });
  } catch (err) {
    return res.status(500).json({ error: 'Falha ao acessar o banco de dados.', detail: String(err.message || err) });
  }
}
