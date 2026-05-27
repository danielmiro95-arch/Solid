// /api/config — expone variables de entorno PÚBLICAS al frontend.
//
// IMPORTANTE:
// - El anon key de Supabase es público (las RLS policies son las que protegen
//   los datos), así que es seguro exponerlo al cliente.
// - El VAPID public key es público por design (es para que el navegador firme
//   las suscripciones push).
// - service_role key, VAPID private key y ANTHROPIC_API_KEY NUNCA aquí.
//
// El frontend hace fetch('/api/config') al arrancar para descubrir si hay
// configuración Supabase / Web Push activa.

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');
  res.status(200).json({
    supabaseUrl: process.env.SUPABASE_URL || null,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || null,
    vapidPublicKey: process.env.VAPID_PUBLIC_KEY || null,
    // Permite identificar visualmente qué entorno estás mirando
    env: process.env.VERCEL_ENV || 'local',
  });
}
