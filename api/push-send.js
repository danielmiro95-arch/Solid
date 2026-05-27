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

  let body;
  try { body = typeof req.body === 'object' ? req.body : JSON.parse(req.body || '{}'); }
  catch (e) { return res.status(400).json({ error: 'invalid-json' }); }

  const subscription = body && body.subscription;
  const payload = body && body.payload;
  if (!subscription || !subscription.endpoint) return res.status(400).json({ error: 'missing-subscription' });

  const notif = {
    title: (payload && payload.title) || 'SolidStream',
    body: (payload && payload.body) || 'Tienes una notificación nueva',
    url: (payload && payload.url) || '/',
    icon: (payload && payload.icon) || '/beonit-logo.png',
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
