// /api/diag — endpoint de diagnóstico de env vars en runtime.
// Reporta si las variables esperadas existen y muestra prefix/suffix (sin
// exponer secretos enteros). Útil para confirmar que el redeploy de Vercel
// capturó los valores que se configuraron en el dashboard.
//
// Borrar tras debug terminado.

function safePeek(value) {
  if (!value) return { exists: false };
  return {
    exists: true,
    length: value.length,
    prefix: value.slice(0, 10),
    suffix: value.slice(-4),
    starts_with_sk_ant: value.startsWith('sk-ant-'),
    has_leading_or_trailing_space: value !== value.trim(),
  };
}

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({
    timestamp: new Date().toISOString(),
    node_version: process.version,
    vercel_env: process.env.VERCEL_ENV || 'unknown',
    vercel_region: process.env.VERCEL_REGION || 'unknown',
    anthropic_api_key: safePeek(process.env.ANTHROPIC_API_KEY),
    supabase_url: {
      exists: !!process.env.SUPABASE_URL,
      value: process.env.SUPABASE_URL || null,
    },
    supabase_anon_key: safePeek(process.env.SUPABASE_ANON_KEY),
    supabase_service_role_key: safePeek(process.env.SUPABASE_SERVICE_ROLE_KEY),
    vapid_public: { exists: !!process.env.VAPID_PUBLIC_KEY },
  });
}
