-- ============================================================
-- COX · convertir a modo "demo simplificado" como Hijos de Rivera demo
-- ----------------------------------------------------------------
-- Cliente · "IMPORTANTE: era un workspace parecido al de Hijos de
-- Rivera que solo tuviera Inicio, Catálogo y Mi Lista".
--
-- Settings clonados EXACTAMENTE de la fila Hijos de Rivera Demo:
--   demo_mode: true                    → activa todo el preset demo
--   path_label: 'Curso'                → "Curso" en vez de "Pill" en UI
--   path_label_plural: 'Cursos'
--   allowSignup: false                 → sin signup público
--   defaultLang: 'es'
--   hide_beonai: true                  → fuera del sidebar
--   hide_analytics: true               → fuera del sidebar
--   hide_resources: true               → fuera del sidebar
--   hide_recommendations: true         → "Recomendados para ti" oculto
--   simplified_profile: true           → perfil minimal
--   simplified_settings: true          → settings minimal
--   simplified_avatar_menu: true       → solo Perfil + Channels + Certificados
--                                        en el dropdown del avatar
--
-- Sidebar resultante en COX: Inicio · Catálogo · Mi Lista
-- (igual que HdR demo). Sin BeonAI, sin Analytics, sin Recursos.
-- ============================================================

UPDATE public.workspaces
   SET settings = jsonb_build_object(
     'demo_mode',              true,
     'path_label',             'Curso',
     'path_label_plural',      'Cursos',
     'allowSignup',            false,
     'defaultLang',            'es',
     'hide_beonai',            true,
     'hide_analytics',         true,
     'hide_resources',         true,
     'hide_recommendations',   true,
     'simplified_profile',     true,
     'simplified_settings',    true,
     'simplified_avatar_menu', true
   )
 WHERE slug = 'cox';

-- Verificar:
-- SELECT name, slug, settings FROM workspaces WHERE slug = 'cox';
