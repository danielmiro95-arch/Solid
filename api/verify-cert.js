// /api/verify-cert — endpoint PÚBLICO de verificación de certificados.
//
// Devuelve datos NO sensibles de un certificado emitido. Diseñado para que
// alguien (Repsol, BBVA, Recursos Humanos externo) escanee el QR del PDF y
// confirme que es genuino. No expone email, ni metadata, ni otros certs del
// user · solo nombre + título de la ruta + workspace + fecha + nº cert.
//
// GET  /api/verify-cert?id=<uuid>
//   200 → { ok:true, certificate: { cert_number, user_name, route_title,
//                                    workspace_name, completed_at } }
//   400 → { ok:false, error:'invalid id' }
//   404 → { ok:false, error:'not found' }
//
// Usa SUPABASE_SERVICE_ROLE_KEY para saltar RLS y leer la fila aunque el
// verificador no esté autenticado. Es seguro porque solo devolvemos campos
// no sensibles y solo si se conoce el UUID exacto (no enumerable).

import { createClient } from '@supabase/supabase-js';

const supa = (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function handler(req, res) {
  // CORS · GET público desde verify.html servido desde el mismo dominio.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'GET') { res.status(405).json({ ok:false, error:'method not allowed' }); return; }

  const id = (req.query && req.query.id) || '';
  if (!UUID_RE.test(id)) { res.status(400).json({ ok:false, error:'invalid id' }); return; }

  if (!supa) { res.status(503).json({ ok:false, error:'verification offline' }); return; }

  // Lee cert + nombre del user + nombre del workspace via embed FK.
  const { data, error } = await supa
    .from('certificates')
    .select('id, cert_number, route_title, completed_at, profiles!user_id(name), workspaces!workspace_id(name)')
    .eq('id', id)
    .maybeSingle();

  if (error) { res.status(500).json({ ok:false, error: error.message }); return; }
  if (!data) { res.status(404).json({ ok:false, error:'not found' }); return; }

  // Cache 10 min · los certs son inmutables.
  res.setHeader('Cache-Control', 'public, max-age=600, s-maxage=600');
  res.status(200).json({
    ok: true,
    certificate: {
      cert_number: data.cert_number || null,
      user_name: (data.profiles && data.profiles.name) || 'Alumno',
      route_title: data.route_title || 'Curso',
      workspace_name: (data.workspaces && data.workspaces.name) || 'Plataforma',
      completed_at: data.completed_at,
    },
  });
}
