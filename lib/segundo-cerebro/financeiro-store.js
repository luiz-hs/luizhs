// Lançamentos financeiros estruturados (receita/despesa) — tabela
// financeiro_lancamentos (ver supabase/migrations/0002_perfil_e_financeiro.sql).
// Complementa as notas livres da área "financeiro" com números que
// alimentam o painel de faturamento e o diagnóstico por IA.

import { getSupabase } from './supabase';

function toLancamento(row) {
  return {
    id: row.id,
    tipo: row.tipo,
    categoria: row.categoria,
    descricao: row.descricao,
    valor: Number(row.valor),
    data: row.data,
    createdAt: row.created_at,
  };
}

export async function listLancamentos(empresaId, { limit = 200 } = {}) {
  const { data, error } = await getSupabase()
    .from('financeiro_lancamentos')
    .select('*')
    .eq('empresa', empresaId)
    .order('data', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []).map(toLancamento);
}

export async function createLancamento(empresaId, { tipo, categoria, descricao, valor, data }) {
  if (tipo !== 'receita' && tipo !== 'despesa') throw new Error('Tipo inválido.');
  const valorNum = Number(valor);
  if (!valorNum || valorNum <= 0) throw new Error('Informe um valor maior que zero.');

  const { data: row, error } = await getSupabase()
    .from('financeiro_lancamentos')
    .insert({
      empresa: empresaId,
      tipo,
      categoria: categoria || (tipo === 'receita' ? 'outras_receitas' : 'outras_despesas'),
      descricao: descricao || '',
      valor: valorNum,
      data,
    })
    .select('*')
    .single();
  if (error) throw error;
  return toLancamento(row);
}

export async function deleteLancamento(empresaId, id) {
  const { data, error } = await getSupabase()
    .from('financeiro_lancamentos')
    .delete()
    .eq('id', id)
    .eq('empresa', empresaId)
    .select('id');
  if (error) throw error;
  return Boolean(data && data.length);
}

export function summarize(lancamentos) {
  const totalReceitas = lancamentos.filter((l) => l.tipo === 'receita').reduce((s, l) => s + l.valor, 0);
  const totalDespesas = lancamentos.filter((l) => l.tipo === 'despesa').reduce((s, l) => s + l.valor, 0);
  return { totalReceitas, totalDespesas, saldo: totalReceitas - totalDespesas };
}

export async function getResumoFinanceiro(empresaId) {
  const lancamentos = await listLancamentos(empresaId);
  if (!lancamentos.length) return null;
  return summarize(lancamentos);
}
