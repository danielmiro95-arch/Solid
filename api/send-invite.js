// /api/send-invite — envía email de invitación al usuario invitado
//
// Env vars en Vercel:
//   RESEND_API_KEY        · clave de https://resend.com (free tier: 3000 emails/mes)
//   RESEND_FROM_EMAIL     · ej. "SolidStream <noreply@beonit.com>" (con dominio verificado)
//   RESEND_FROM_FALLBACK  · ej. "onboarding@resend.dev" para pruebas sin dominio propio
//   PUBLIC_BASE_URL       · ej. "https://solid.vercel.app" (para construir el link)
//
// Body POST esperado: { email, name, token, role?, team?, fromName?,
//                       workspaceName?, workspaceColor? }
// El template es genérico · sin marca de cliente · usa workspaceName si llega.

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    res.status(503).json({
      error: 'Email no configurado',
      hint: 'Añade RESEND_API_KEY en Vercel → Settings → Environment Variables.',
    });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }
  const { email, name, token, role, team, fromName, workspaceName, workspaceColor } = body || {};
  if (!email || !token) { res.status(400).json({ error: 'Faltan email o token' }); return; }

  const baseUrl = process.env.PUBLIC_BASE_URL || 'https://' + (req.headers.host || 'localhost');
  const inviteLink = baseUrl.replace(/\/$/, '') + '/?invite=' + encodeURIComponent(token);
  const from = process.env.RESEND_FROM_EMAIL || process.env.RESEND_FROM_FALLBACK || 'onboarding@resend.dev';

  // Sanitización mínima · evita inyección en HTML
  const esc = s => (s || '').toString().replace(/[<>&"]/g, c => ({ '<':'&lt;', '>':'&gt;', '&':'&amp;', '"':'&quot;' }[c]));
  const safeName  = esc(name || email.split('@')[0]);
  const safeRole  = esc(role || '');
  const safeTeam  = esc(team || '');
  const safeFrom  = esc(fromName || 'El equipo');
  const safeWs    = esc(workspaceName || 'la plataforma');
  const accent    = (workspaceColor && /^#[0-9A-Fa-f]{6}$/.test(workspaceColor)) ? workspaceColor : '#6E50EE';

  // Línea contextual con role/team solo si llegan informados
  const roleLine = (safeRole || safeTeam)
    ? `como <strong>${safeRole || 'miembro'}</strong>${safeTeam ? ' del equipo <strong>' + safeTeam + '</strong>' : ''}`
    : 'como miembro';

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Invitación a SolidStream</title></head>
<body style="margin:0;padding:0;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f3f5f8;color:#0D1117">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f5f8;padding:40px 0">
  <tr><td align="center">
    <table width="540" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.08)">
      <tr><td style="background:linear-gradient(135deg,#0D1117 0%,#1a1a2e 50%,${accent}33 100%);padding:36px 40px;color:#fff">
        <div style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;opacity:0.6;margin-bottom:8px">SolidStream · ${safeWs}</div>
        <h1 style="margin:0;font-size:28px;letter-spacing:-0.02em;font-weight:300;line-height:1.2">Hola ${safeName},<br><em style="font-style:italic;font-weight:600;color:${accent}">te han invitado</em>.</h1>
      </td></tr>
      <tr><td style="padding:36px 40px">
        <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#1C2433">${safeFrom} te ha añadido a <strong>${safeWs}</strong> en SolidStream ${roleLine}.</p>
        <p style="margin:0 0 28px;font-size:14px;line-height:1.6;color:#4A5568">Activa tu cuenta para entrar en la plataforma de formación de tu organización · catálogo de pills, rutas guiadas y asistente IA contextual.</p>
        <table cellpadding="0" cellspacing="0" style="margin:0 auto"><tr><td style="border-radius:10px;background:${accent};padding:0">
          <a href="${inviteLink}" style="display:inline-block;padding:14px 28px;font-family:'Inter',sans-serif;font-size:14px;font-weight:600;color:#fff;text-decoration:none;border-radius:10px">Activar mi cuenta →</a>
        </td></tr></table>
        <p style="margin:24px 0 0;font-size:11px;line-height:1.6;color:#94A3B8;text-align:center">Si el botón no funciona, copia y pega este link:<br><a href="${inviteLink}" style="color:${accent};word-break:break-all">${inviteLink}</a></p>
      </td></tr>
      <tr><td style="background:#f8fafd;padding:20px 40px;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.08em;text-transform:uppercase;color:#94A3B8;text-align:center">
        SolidStream · plataforma de formación · by BeonIt
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;

  try {
    const subject = workspaceName
      ? `Te han invitado a ${workspaceName} en SolidStream`
      : `Te han invitado a SolidStream`;
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
      body: JSON.stringify({ from, to: [email], subject, html }),
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
