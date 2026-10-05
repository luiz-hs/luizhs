// Perfil de negócio (onboarding) e diagnóstico gerado por IA — tabelas
// business_profile e business_diagnostico (ver
// supabase/migrations/0002_perfil_e_financeiro.sql).

import { getSupabase } from './supabase';
import { ONBOARDING_STEPS } from './onboarding';

export async function getProfile(empresaId) {
  const { data, error } = await getSupabase()
    .from('business_profile')
    .select('*')
    .eq('empresa', empresaId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// answers: { [field]: value } — um valor por passo de ONBOARDING_STEPS
export async function saveProfile(empresaId, answers) {
  const row = { empresa: empresaId, updated_at: new Date().toISOString() };
  for (const step of ONBOARDING_STEPS) {
    const value = (answers[step.field] || '').trim();
    if (!value) throw new Error(`Resposta faltando: ${step.field}`);
    row[step.field] = value;
  }

  const { data, error } = await getSupabase()
    .from('business_profile')
    .upsert(row, { onConflict: 'empresa' })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function getDiagnostico(empresaId) {
  const { data, error } = await getSupabase()
    .from('business_diagnostico')
    .select('*')
    .eq('empresa', empresaId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function saveDiagnostico(empresaId, conteudo, source) {
  const { data, error } = await getSupabase()
    .from('business_diagnostico')
    .upsert(
      { empresa: empresaId, conteudo, source, created_at: new Date().toISOString() },
      { onConflict: 'empresa' }
    )
    .select('*')
    .single();
  if (error) throw error;
  return data;
}
