import { listAllNotes } from '../../../lib/segundo-cerebro/store';
import { answerQuestion } from '../../../lib/segundo-cerebro/ai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Use POST.' });
  }

  const { empresa, question } = req.body || {};
  if (!empresa || !empresa.trim()) return res.status(400).json({ error: 'Informe a empresa.' });
  if (!question || !question.trim()) return res.status(400).json({ error: 'Escreva uma pergunta.' });

  try {
    const notes = await listAllNotes(empresa.trim());
    const result = await answerQuestion(question.trim(), notes);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: 'Falha ao acessar o banco de dados.', detail: String(err.message || err) });
  }
}
