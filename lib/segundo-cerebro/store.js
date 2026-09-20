// Armazena as notas no Supabase (tabela `segundo_cerebro_notes`, ver
// supabase/migrations/0001_segundo_cerebro_notes.sql). `empresa` ainda é só
// um texto livre — sem autenticação real (ver limitações no
// SEGUNDO-CEREBRO.md).

import { getSupabase } from './supabase';
import { AREA_BY_ID } from './areas';

function toNote(row) {
  const content = [row.summary, '', '## Nota original', '', row.raw_text].join('\n');
  return {
    id: row.id,
    area: row.area,
    title: row.title,
    tags: row.tags || [],
    createdAt: row.created_at,
    content,
  };
}

export async function listNotes(empresaId, area) {
  if (!AREA_BY_ID[area]) return [];
  const { data, error } = await getSupabase()
    .from('segundo_cerebro_notes')
    .select('*')
    .eq('empresa', empresaId)
    .eq('area', area)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(toNote);
}

export async function listAllNotes(empresaId) {
  const { data, error } = await getSupabase()
    .from('segundo_cerebro_notes')
    .select('*')
    .eq('empresa', empresaId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(toNote);
}

// structured: { title, summary, tags } — já processado pela IA (ou fallback)
export async function createNote(empresaId, area, rawText, structured) {
  if (!AREA_BY_ID[area]) throw new Error(`Área inválida: ${area}`);

  const { data, error } = await getSupabase()
    .from('segundo_cerebro_notes')
    .insert({
      empresa: empresaId,
      area,
      title: structured.title,
      summary: structured.summary || rawText,
      raw_text: rawText,
      tags: structured.tags || [],
    })
    .select('*')
    .single();
  if (error) throw error;
  return toNote(data);
}

export async function deleteNote(empresaId, area, id) {
  if (!AREA_BY_ID[area]) return false;
  const { data, error } = await getSupabase()
    .from('segundo_cerebro_notes')
    .delete()
    .eq('id', id)
    .eq('empresa', empresaId)
    .eq('area', area)
    .select('id');
  if (error) throw error;
  return Boolean(data && data.length);
}
