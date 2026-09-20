import { AREA_BY_ID } from '../../../lib/segundo-cerebro/areas';
import { listNotes, listAllNotes, createNote, deleteNote } from '../../../lib/segundo-cerebro/store';
import { structureNote } from '../../../lib/segundo-cerebro/ai';

export default async function handler(req, res) {
  const empresa = (req.query.empresa || req.body?.empresa || '').trim();
  if (!empresa) {
    return res.status(400).json({ error: 'Informe a empresa (parâmetro "empresa").' });
  }

  if (req.method === 'GET') {
    const area = req.query.area;
    if (area && !AREA_BY_ID[area]) return res.status(400).json({ error: 'Área inválida.' });
    const notes = area ? listNotes(empresa, area) : listAllNotes(empresa);
    return res.status(200).json({ notes });
  }

  if (req.method === 'POST') {
    const { area, text } = req.body || {};
    if (!area || !AREA_BY_ID[area]) return res.status(400).json({ error: 'Área inválida.' });
    if (!text || !text.trim()) return res.status(400).json({ error: 'Escreva algo antes de salvar.' });

    const structured = await structureNote(text.trim(), AREA_BY_ID[area].label);
    const note = createNote(empresa, area, text.trim(), structured);
    return res.status(201).json({ note, source: structured.source });
  }

  if (req.method === 'DELETE') {
    const { area, id } = req.body || {};
    if (!area || !AREA_BY_ID[area] || !id) return res.status(400).json({ error: 'Informe área e id.' });
    const ok = deleteNote(empresa, area, id);
    return res.status(ok ? 200 : 404).json({ ok });
  }

  res.setHeader('Allow', 'GET, POST, DELETE');
  return res.status(405).json({ error: 'Método não suportado.' });
}
