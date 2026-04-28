// /api/config — expone variables de entorno seguras al frontend.
//
// El anon key de Supabase es PÚBLICA (las RLS policies son las que protegen los
// datos), así que es seguro exponerla al cliente. La service_role key NUNCA
// debe estar aquí — esa se usa solo desde el servidor con permisos elevados.
//
// El frontend hace fetch('/api/config') al arrancar para descubrir si hay
// configuración Supabase activa.

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');
  res.status(200).json({
    supabaseUrl: process.env.SUPABASE_URL || null,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || null,
    // Permite identificar visualmente qué entorno estás mirando
    env: process.env.VERCEL_ENV || 'local',
  });
}
