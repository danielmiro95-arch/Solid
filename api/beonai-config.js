// api/beonai-config.js — CRUD de la config del agente BeonAI.
// El panel admin de la app (BeonAIConfigView) escribe aquí. Sólo admins
// pueden modificar. La verificación de admin se hace contra Supabase:
// se valida el access_token del usuario y luego se chequea que tenga rol
// owner/admin en el workspace que está editando.

import { createClient } from '@supabase/supabase-js';

const SUPA_URL = process.env.SUPABASE_URL;
const SUPA_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supaAdmin = (SUPA_URL && SUPA_SERVICE)
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
  if (!token || !supaAdmin) return null;
  const { data, error } = await supaAdmin.auth.getUser(token);
  if (error) return null;
  return data?.user?.id || null;
}

async function isWorkspaceAdmin(userId, workspaceId) {
  if (!supaAdmin || !userId || !workspaceId) return false;
  // platform admin
  const { data: prof } = await supaAdmin.from('profiles').select('system_role').eq('id', userId).maybeSingle();
  if (prof?.system_role === 'admin') return true;
  // workspace owner/admin
  const { data: mem } = await supaAdmin
    .from('workspace_members')
    .select('role')
    .eq('user_id', userId)
    .eq('workspace_id', workspaceId)
    .maybeSingle();
  return mem && (mem.role === 'owner' || mem.role === 'admin');
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') { setCors(res); return res.status(200).end(); }
  setCors(res);

  if (!supaAdmin) return res.status(503).json({ error: 'Supabase not configured' });

  if (req.method === 'GET') {
    const workspaceId = req.query?.workspaceId || (req.query && req.query.workspace_id);
    if (!workspaceId) return res.status(400).json({ error: 'workspaceId required' });
    const { data, error } = await supaAdmin.from('beonai_config').select('*').eq('workspace_id', workspaceId).maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ config: data || null });
  }

  if (req.method === 'POST') {
    const userId = await getCallerUserId(req);
    if (!userId) return res.status(401).json({ error: 'Auth required' });
    const body = req.body || {};
    const { workspaceId, system_prompt, model, temperature, max_tokens, knowledge_docs, guardrails, tools_enabled } = body;
    if (!workspaceId) return res.status(400).json({ error: 'workspaceId required' });

    const allowed = await isWorkspaceAdmin(userId, workspaceId);
    if (!allowed) return res.status(403).json({ error: 'Only workspace admins can edit BeonAI config' });

    const patch = {
      workspace_id: workspaceId,
      updated_by: userId,
      ...(typeof system_prompt === 'string' ? { system_prompt } : {}),
      ...(typeof model === 'string' ? { model } : {}),
      ...(typeof temperature === 'number' ? { temperature } : {}),
      ...(typeof max_tokens === 'number' ? { max_tokens } : {}),
      ...(Array.isArray(knowledge_docs) ? { knowledge_docs } : {}),
      ...(guardrails && typeof guardrails === 'object' ? { guardrails } : {}),
      ...(tools_enabled && typeof tools_enabled === 'object' ? { tools_enabled } : {}),
    };

    const { data, error } = await supaAdmin
      .from('beonai_config')
      .upsert(patch, { onConflict: 'workspace_id' })
      .select()
      .maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ config: data });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
