// api/kb/token.js — Gestiona el ingest_token personal del usuario.
// El token sirve para que el bookmarklet (un script en favoritos del browser)
// pueda autenticar el envío de contenido de Loop / cualquier web a la KB de
// BeonAI sin tener que iniciar sesión OAuth desde la página de origen.
//
// GET   · obtiene o genera el token del user actual (Bearer access_token)
// POST  · rota (genera uno nuevo, invalida el anterior)
//
// El token nunca se expone a usuarios no-admin (sólo platform admin u admin
// del workspace pueden usar el ingest endpoint).

import { createClient } from '@supabase/supabase-js';

const SUPA_URL = process.env.SUPABASE_URL;
const SUPA_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supa = (SUPA_URL && SUPA_SERVICE)
  ? createClient(SUPA_URL, SUPA_SERVICE, { auth: { persistSession: false, autoRefreshToken: false } })
  : null;

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

async function getCallerUserId(req) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token || !supa) return null;
  const { data, error } = await supa.auth.getUser(token);
  if (error) return null;
  return data?.user?.id || null;
}

async function isAnyWorkspaceAdmin(userId) {
  const { data: prof } = await supa.from('profiles').select('system_role').eq('id', userId).maybeSingle();
  if (prof?.system_role === 'admin') return true;
  const { data: mems } = await supa.from('workspace_members').select('role').eq('user_id', userId);
  return (mems || []).some(m => m.role === 'owner' || m.role === 'admin');
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') { setCors(res); return res.status(200).end(); }
  setCors(res);
  if (!supa) return res.status(503).json({ error: 'Supabase not configured' });

  const userId = await getCallerUserId(req);
  if (!userId) return res.status(401).json({ error: 'Auth required' });
  if (!(await isAnyWorkspaceAdmin(userId))) return res.status(403).json({ error: 'Only workspace admins can use KB ingest' });

  if (req.method === 'GET') {
    const { data } = await supa.from('profiles').select('ingest_token,ingest_token_created_at').eq('id', userId).maybeSingle();
    if (data?.ingest_token) return res.status(200).json({ token: data.ingest_token, created_at: data.ingest_token_created_at });
    // Lazy generation: si no había uno, lo creamos al primer GET.
    const newToken = crypto.randomUUID();
    const { error: updErr } = await supa.from('profiles')
      .update({ ingest_token: newToken, ingest_token_created_at: new Date().toISOString() })
      .eq('id', userId);
    if (updErr) return res.status(500).json({ error: updErr.message });
    return res.status(200).json({ token: newToken, created_at: new Date().toISOString() });
  }

  if (req.method === 'POST') {
    // Rotate: nuevo UUID, sobrescribe el anterior (los bookmarklets viejos dejan de funcionar).
    const newToken = crypto.randomUUID();
    const { error: updErr } = await supa.from('profiles')
      .update({ ingest_token: newToken, ingest_token_created_at: new Date().toISOString() })
      .eq('id', userId);
    if (updErr) return res.status(500).json({ error: updErr.message });
    return res.status(200).json({ token: newToken, created_at: new Date().toISOString() });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
