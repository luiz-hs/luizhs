import { listLancamentos, createLancamento, deleteLancamento, summarize } from '../../../lib/segundo-cerebro/financeiro-store';

export default async function handler(req, res) {
  const empresa = (req.query.empresa || req.body?.empresa || '').trim();
  if (!empresa) {
    return res.status(400).json({ error: 'Informe a empresa (parâmetro "empresa").' });
  }

  try {
    if (req.method === 'GET') {
      const lancamentos = await listLancamentos(empresa);
      return res.status(200).json({ lancamentos, resumo: summarize(lancamentos) });
    }

    if (req.method === 'POST') {
      const { tipo, categoria, descricao, valor, data } = req.body || {};
      if (!data) return res.status(400).json({ error: 'Informe a data.' });
      try {
        const lancamento = await createLancamento(empresa, { tipo, categoria, descricao, valor, data });
        return res.status(201).json({ lancamento });
      } catch (err) {
        return res.status(400).json({ error: err.message || 'Falha ao salvar o lançamento.' });
      }
    }

    if (req.method === 'DELETE') {
      const { id } = req.body || {};
      if (!id) return res.status(400).json({ error: 'Informe o id.' });
      const ok = await deleteLancamento(empresa, id);
      return res.status(ok ? 200 : 404).json({ ok });
    }

    res.setHeader('Allow', 'GET, POST, DELETE');
    return res.status(405).json({ error: 'Método não suportado.' });
  } catch (err) {
    return res.status(500).json({ error: 'Falha ao acessar o banco de dados.', detail: String(err.message || err) });
  }
}
