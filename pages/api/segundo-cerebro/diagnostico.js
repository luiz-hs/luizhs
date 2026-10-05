import { getProfile, getDiagnostico, saveDiagnostico } from '../../../lib/segundo-cerebro/profile-store';
import { getResumoFinanceiro } from '../../../lib/segundo-cerebro/financeiro-store';
import { generateDiagnostico } from '../../../lib/segundo-cerebro/ai';

export default async function handler(req, res) {
  const empresa = (req.query.empresa || req.body?.empresa || '').trim();
  if (!empresa) {
    return res.status(400).json({ error: 'Informe a empresa (parâmetro "empresa").' });
  }

  try {
    if (req.method === 'GET') {
      const diagnostico = await getDiagnostico(empresa);
      return res.status(200).json({ diagnostico });
    }

    // POST: gera (ou regenera) o diagnóstico a partir do perfil + financeiro atuais
    if (req.method === 'POST') {
      const profile = await getProfile(empresa);
      if (!profile) return res.status(400).json({ error: 'Complete o onboarding antes de gerar o diagnóstico.' });

      const finance = await getResumoFinanceiro(empresa);
      const { conteudo, source } = await generateDiagnostico(profile, finance);
      const diagnostico = await saveDiagnostico(empresa, conteudo, source);
      return res.status(201).json({ diagnostico });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Método não suportado.' });
  } catch (err) {
    return res.status(500).json({ error: 'Falha ao acessar o banco de dados.', detail: String(err.message || err) });
  }
}
