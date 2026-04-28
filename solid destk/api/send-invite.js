// /api/send-invite — envía email de invitación al usuario invitado
//
// Necesita estas env vars en Vercel:
//   RESEND_API_KEY        · clave de https://resend.com (free tier: 3000 emails/mes)
//   RESEND_FROM_EMAIL     · ej. "SGS|on <noreply@beonit.com>" (con dominio verificado)
//   RESEND_FROM_FALLBACK  · ej. "onboarding@resend.dev" para pruebas sin dominio propio
//   PUBLIC_BASE_URL       · ej. "https://solid.vercel.app" (para construir el link)
//
// Si no hay RESEND_API_KEY, devuelve 503 con instrucciones.
// Llamado desde el frontend cuando el admin pulsa "Enviar email" en una invitación.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    res.status(503).json({
      error: 'Email no configurado',
      hint: 'Añade RESEND_API_KEY en Vercel → Settings → Environment Variables. Lee docs/EMAIL-SETUP.md',
    });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }
  const { email, name, token, role, team, fromName } = body || {};
  if (!email || !token) {
    res.status(400).json({ error: 'Faltan email o token' });
    return;
  }

  const baseUrl = process.env.PUBLIC_BASE_URL || 'https://' + (req.headers.host || 'localhost');
  const inviteLink = baseUrl.replace(/\/$/, '') + '/?invite=' + encodeURIComponent(token);
  const from = process.env.RESEND_FROM_EMAIL || process.env.RESEND_FROM_FALLBACK || 'onboarding@resend.dev';
  const safeName = (name || email.split('@')[0]).replace(/[<>]/g, '');
  const safeRole = (role || 'Publish Agent').replace(/[<>]/g, '');
  const safeTeam = (team || 'Repsol').replace(/[<>]/g, '');
  const safeFrom = (fromName || 'Equipo BeonIt').replace(/[<>]/g, '');

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Invitación a SGS|on</title></head>
<body style="margin:0;padding:0;font-family:'Manrope',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f3f5f8;color:#0D1117">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f5f8;padding:40px 0">
  <tr><td align="center">
    <table width="540" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 8px 32px rgba(0,89,150,0.08)">
      <tr><td style="background:linear-gradient(135deg,#0D1117 0%,#1a2940 50%,#2a1f4d 100%);padding:36px 40px;color:#fff">
        <div style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;opacity:0.6;margin-bottom:8px">SGS|on · BeonIt × Repsol</div>
        <h1 style="margin:0;font-size:28px;letter-spacing:-0.02em;font-weight:300;line-height:1.2">Hola ${safeName},<br><em style="font-style:italic;font-weight:600;background:linear-gradient(135deg,#BCD630,#66C7C2);-webkit-background-clip:text;background-clip:text;color:transparent">te han invitado</em>.</h1>
      </td></tr>
      <tr><td style="padding:36px 40px">
        <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#1C2433">${safeFrom} te ha añadido a la plataforma de formación <strong>SGS|on</strong> como <strong>${safeRole}</strong> del equipo <strong>${safeTeam}</strong>.</p>
        <p style="margin:0 0 28px;font-size:14px;line-height:1.6;color:#4A5568">Vas a aprender Sprinklr con 41 Think Pills, 3 talleres prácticos y un asistente IA personal (MENTOR-IA). Al completar la ruta obtienes el certificado oficial Repsol × BeonIt.</p>
        <table cellpadding="0" cellspacing="0" style="margin:0 auto"><tr><td style="border-radius:10px;background:#0072BE;padding:0">
          <a href="${inviteLink}" style="display:inline-block;padding:14px 28px;font-family:'Manrope',sans-serif;font-size:14px;font-weight:600;color:#fff;text-decoration:none;border-radius:10px">Activar mi cuenta →</a>
        </td></tr></table>
        <p style="margin:24px 0 0;font-size:11px;line-height:1.6;color:#94A3B8;text-align:center">Si el botón no funciona, copia y pega este link:<br><a href="${inviteLink}" style="color:#0072BE;word-break:break-all">${inviteLink}</a></p>
      </td></tr>
      <tr><td style="background:#f8fafd;padding:20px 40px;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.08em;text-transform:uppercase;color:#94A3B8;text-align:center">
        SGS|on · Plataforma de formación · BeonIt × Repsol
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
      body: JSON.stringify({
        from,
        to: [email],
        subject: 'Te han invitado a SGS|on · ' + safeName,
        html,
      }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      console.error('[send-invite] Resend error', data);
      res.status(502).json({ error: 'Resend no aceptó el email', detail: data });
      return;
    }
    res.status(200).json({ ok: true, id: data.id, email });
  } catch (err) {
    console.error('[send-invite] fetch error', err);
    res.status(500).json({ error: err.message });
  }
}
