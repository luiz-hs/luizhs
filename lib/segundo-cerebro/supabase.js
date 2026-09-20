// Cliente Supabase server-side (usado só dentro das rotas /api). Usa a
// service role key — que ignora RLS — porque ainda não há autenticação
// real de usuário; nunca importar este arquivo em código que roda no
// browser.

import { createClient } from '@supabase/supabase-js';

let client = null;

export function getSupabase() {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      'Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY (Supabase → Project Settings → API) para usar o Segundo Cérebro.'
    );
  }

  client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}
