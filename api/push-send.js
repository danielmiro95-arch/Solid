// /api/push-send — envía una notificación push a una suscripción Web Push
//
// Body esperado: {
//   subscription: { endpoint, keys: {p256dh, auth} },
//   payload: { title, body, url, icon, tag }
// }
//
// Requiere env vars:
//   VAPID_PUBLIC_KEY  (también expuesto al cliente via /api/config)
//   VAPID_PRIVATE_KEY (NO exponer al cliente · solo aquí)
//   VAPID_SUBJECT     (mailto:contact@beonit.com)
//
// Para generar las VAPID keys una vez:
//   npx web-push generate-vapid-keys
//
// Luego añade en Vercel → Environment Variables ambas y redeploy.

import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

const supa = (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

// Verifica el JWT y devuelve el userId, o null. Sin Supabase configurado no se
// puede verificar · el endpoint queda inutilizable (correcto · necesita backend).
async function _authUser(req) {
  if (!supa) return null;
  const h = req.headers.authorization || req.headers.Authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return null;
  const { data, error } = await supa.auth.getUser(token);
  if (error || !data || !data.user) return null;
  return data.user.id;
}

function _setVapid() {
  const pub = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const subj = process.env.VAPID_SUBJECT || 'mailto:contact@beonit.com';
  if (!pub || !priv) return false;
  webpush.setVapidDetails(subj, pub, priv);
  return true;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method-not-allowed' });

  if (!_setVapid()) {
    return res.status(500).json({
      error: 'no-vapid-keys',
      hint: 'Setea VAPID_PUBLIC_KEY y VAPID_PRIVATE_KEY en Vercel → Environment Variables. Genera con: npx web-push generate-vapid-keys',
    });
  }

  // Auth · exige JWT válido (sin esto cualquiera relayaba push a cualquier
  // suscripción capturada · vector de phishing con tu dominio/VAPID).
  const userId = await _authUser(req);
  if (!userId) return res.status(401).json({ error: 'unauthorized' });

  let body;
  try { body = typeof req.body === 'object' ? req.body : JSON.parse(req.body || '{}'); }
  catch (e) { return res.status(400).json({ error: 'invalid-json' }); }

  const subscription = body && body.subscription;
  const payload = body && body.payload;
  if (!subscription || !subscription.endpoint) return res.status(400).json({ error: 'missing-subscription' });

  // La suscripción debe pertenecer al usuario autenticado · no se puede enviar
  // a un endpoint ajeno.
  const { data: owner, error: ownErr } = await supa
    .from('push_subscriptions')
    .select('user_id')
    .eq('endpoint', subscription.endpoint)
    .maybeSingle();
  if (ownErr || !owner || owner.user_id !== userId) {
    return res.status(403).json({ error: 'forbidden: subscription not owned by caller' });
  }

  // url restringida a ruta relativa same-origin · evita redirecciones a phishing.
  let safeUrl = (payload && payload.url) || '/';
  if (typeof safeUrl !== 'string' || !safeUrl.startsWith('/') || safeUrl.startsWith('//')) safeUrl = '/';

  const notif = {
    title: (payload && payload.title) || 'SolidStream',
    body: (payload && payload.body) || 'Tienes una notificación nueva',
    url: safeUrl,
    icon: '/beonit-logo.png',
    tag: (payload && payload.tag) || 'solid',
  };

  try {
    const result = await webpush.sendNotification(subscription, JSON.stringify(notif), { TTL: 60 });
    return res.status(200).json({ ok: true, statusCode: result.statusCode });
  } catch (err) {
    // Si el endpoint ha expirado o el user revocó, marcar subscription como inactive
    if (err.statusCode === 404 || err.statusCode === 410) {
      return res.status(410).json({ error: 'subscription-expired', endpoint: subscription.endpoint });
    }
    return res.status(500).json({ error: 'send-failed', message: err.message, statusCode: err.statusCode });
  }
}
