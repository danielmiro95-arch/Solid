// api/kb/ingest.js — Recibe un documento (título + contenido) desde el
// bookmarklet del browser y lo añade al knowledge_docs de la config BeonAI
// del workspace activo del user.
//
// Auth: header `X-Ingest-Token: <uuid>` (token personal del user, generado
// vía /api/kb/token). Esto permite usarlo desde una página externa (Loop)
// sin tener una sesión Supabase activa en ese origen.
//
// Body JSON:
//   - title       string  · obligatorio (nombre del documento en KB)
//   - content     string  · obligatorio (texto extraído de la página)
//   - source_url  string  · opcional (URL original, se añade al final del doc)
//   - workspace_id string · opcional (si no, usa el current_workspace_id del user)

import { createClient } from '@supabase/supabase-js';

const SUPA_URL = process.env.SUPABASE_URL;
const SUPA_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supa = (SUPA_URL && SUPA_SERVICE)
  ? createClient(SUPA_URL, SUPA_SERVICE, { auth: { persistSession: false, autoRefreshToken: false } })
  : null;

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Ingest-Token');
  res.setHeader('Access-Control-Max-Age', '86400');
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') { setCors(res); return res.status(200).end(); }
  setCors(res);
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!supa) return res.status(503).json({ error: 'Supabase not configured' });

  const token = req.headers['x-ingest-token'];
  if (!token) return res.status(401).json({ error: 'Missing X-Ingest-Token header' });

  // Resolver token → user
  const { data: prof, error: profErr } = await supa
    .from('profiles')
    .select('id,current_workspace_id,system_role,name')
    .eq('ingest_token', token)
    .maybeSingle();
  if (profErr) return res.status(500).json({ error: profErr.message });
  if (!prof) return res.status(401).json({ error: 'Invalid ingest token' });

  const body = req.body || {};
  const title = String(body.title || '').trim();
  const content = String(body.content || '').trim();
  if (!title || !content) return res.status(400).json({ error: 'title and content required' });

  const workspaceId = body.workspace_id || prof.current_workspace_id;
  if (!workspaceId) return res.status(400).json({ error: 'No workspace_id and user has no current_workspace_id' });

  // Validar que el user es admin del workspace destino
  let isAdmin = prof.system_role === 'admin';
  if (!isAdmin) {
    const { data: mem } = await supa.from('workspace_members').select('role').eq('user_id', prof.id).eq('workspace_id', workspaceId).maybeSingle();
    isAdmin = !!(mem && (mem.role === 'owner' || mem.role === 'admin'));
  }
  if (!isAdmin) return res.status(403).json({ error: 'Not a workspace admin' });

  // Cargar config existente y append doc
  const { data: existing, error: getErr } = await supa
    .from('beonai_config').select('knowledge_docs').eq('workspace_id', workspaceId).maybeSingle();
  if (getErr) return res.status(500).json({ error: getErr.message });

  const docs = Array.isArray(existing?.knowledge_docs) ? existing.knowledge_docs.slice() : [];
  const sourceUrl = String(body.source_url || '').trim();
  const docContent = sourceUrl ? `${content}\n\n---\nFuente: ${sourceUrl}` : content;
  // Si ya existe un doc con el mismo título, lo reemplazamos (re-ingest del mismo Loop page).
  const idx = docs.findIndex(d => d.name === title);
  if (idx >= 0) docs[idx] = { name: title, content: docContent, ingested_at: new Date().toISOString() };
  else docs.push({ name: title, content: docContent, ingested_at: new Date().toISOString() });

  const upsertRow = existing
    ? { workspace_id: workspaceId, knowledge_docs: docs, updated_by: prof.id }
    : { workspace_id: workspaceId, knowledge_docs: docs, updated_by: prof.id, system_prompt: '' };
  const { error: upErr } = await supa.from('beonai_config').upsert(upsertRow, { onConflict: 'workspace_id' });
  if (upErr) return res.status(500).json({ error: upErr.message });

  return res.status(200).json({
    ok: true,
    title,
    replaced: idx >= 0,
    doc_count: docs.length,
    chars: docContent.length,
  });
}
