-- ============================================================
-- COX · 30 títulos de pills + lock de cursos 5 y 6
-- ----------------------------------------------------------------
-- 30 títulos exactos pasados por el cliente · 1 UPDATE por pill_number.
-- Cursos 5 (Tu día a día) y 6 (Construye tu futuro con nosotros)
-- marcados como bloqueados + "Próximamente" en metadata · el adapter
-- (sgson-adapter.jsx) los leerá y pondrá forceLocked + badge.
-- ============================================================

DO $$
DECLARE
  v_ws uuid;
BEGIN
  SELECT id INTO v_ws FROM public.workspaces WHERE slug = 'cox';
  IF v_ws IS NULL THEN
    RAISE EXCEPTION 'Workspace COX no existe';
  END IF;

  -- ── Programa 1 · Bienvenido a COX (pills 1-5) ──
  UPDATE public.pills SET title = 'Conoce COX'                   WHERE workspace_id = v_ws AND pill_number = 1;
  UPDATE public.pills SET title = 'Nuestra historia'             WHERE workspace_id = v_ws AND pill_number = 2;
  UPDATE public.pills SET title = 'Presencia y negocio'          WHERE workspace_id = v_ws AND pill_number = 3;
  UPDATE public.pills SET title = 'Cómo nos organizamos'         WHERE workspace_id = v_ws AND pill_number = 4;
  UPDATE public.pills SET title = 'Primeros pasos en la compañía' WHERE workspace_id = v_ws AND pill_number = 5;

  -- ── Programa 2 · Nuestros valores y cultura (pills 6-10) ──
  UPDATE public.pills SET title = 'Nuestros valores'             WHERE workspace_id = v_ws AND pill_number = 6;
  UPDATE public.pills SET title = 'Cómo trabajamos'              WHERE workspace_id = v_ws AND pill_number = 7;
  UPDATE public.pills SET title = 'Cultura de colaboración'      WHERE workspace_id = v_ws AND pill_number = 8;
  UPDATE public.pills SET title = 'Diversidad e inclusión'       WHERE workspace_id = v_ws AND pill_number = 9;
  UPDATE public.pills SET title = 'Viviendo la cultura COX'      WHERE workspace_id = v_ws AND pill_number = 10;

  -- ── Programa 3 · Nuestra estrategia (pills 11-15) ──
  UPDATE public.pills SET title = 'Visión y propósito'           WHERE workspace_id = v_ws AND pill_number = 11;
  UPDATE public.pills SET title = 'Objetivos estratégicos'       WHERE workspace_id = v_ws AND pill_number = 12;
  UPDATE public.pills SET title = 'Mercados y crecimiento'       WHERE workspace_id = v_ws AND pill_number = 13;
  UPDATE public.pills SET title = 'Sostenibilidad e innovación'  WHERE workspace_id = v_ws AND pill_number = 14;
  UPDATE public.pills SET title = 'El papel de cada empleado'    WHERE workspace_id = v_ws AND pill_number = 15;

  -- ── Programa 4 · Procesos clave (pills 16-20) ──
  UPDATE public.pills SET title = 'Procesos internos'            WHERE workspace_id = v_ws AND pill_number = 16;
  UPDATE public.pills SET title = 'Herramientas corporativas'    WHERE workspace_id = v_ws AND pill_number = 17;
  UPDATE public.pills SET title = 'Calidad y cumplimiento'       WHERE workspace_id = v_ws AND pill_number = 18;
  UPDATE public.pills SET title = 'Seguridad y buenas prácticas' WHERE workspace_id = v_ws AND pill_number = 19;
  UPDATE public.pills SET title = 'Cómo solicitar ayuda y soporte' WHERE workspace_id = v_ws AND pill_number = 20;

  -- ── Programa 5 · Tu día a día (pills 21-25) · BLOQUEADO ──
  UPDATE public.pills SET title = 'Organización del trabajo'     WHERE workspace_id = v_ws AND pill_number = 21;
  UPDATE public.pills SET title = 'Comunicación interna'         WHERE workspace_id = v_ws AND pill_number = 22;
  UPDATE public.pills SET title = 'Trabajo en equipo'            WHERE workspace_id = v_ws AND pill_number = 23;
  UPDATE public.pills SET title = 'Gestión del tiempo'           WHERE workspace_id = v_ws AND pill_number = 24;
  UPDATE public.pills SET title = 'Consejos para el éxito'       WHERE workspace_id = v_ws AND pill_number = 25;

  -- ── Programa 6 · Construye tu futuro con nosotros (pills 26-30) · BLOQUEADO ──
  UPDATE public.pills SET title = 'Desarrollo profesional'       WHERE workspace_id = v_ws AND pill_number = 26;
  UPDATE public.pills SET title = 'Formación continua'           WHERE workspace_id = v_ws AND pill_number = 27;
  UPDATE public.pills SET title = 'Movilidad y oportunidades'    WHERE workspace_id = v_ws AND pill_number = 28;
  UPDATE public.pills SET title = 'Liderazgo y crecimiento'      WHERE workspace_id = v_ws AND pill_number = 29;
  UPDATE public.pills SET title = 'Tu carrera en COX'            WHERE workspace_id = v_ws AND pill_number = 30;

  -- ── BLOQUEAR cursos 5 y 6 · metadata.locked = true · metadata.coming_soon = true ──
  -- El adapter front (sgson-adapter.jsx, cambio en mismo deploy) lee estas
  -- flags y expone path.forceLocked + path.badge = 'Próximamente' en NxPathCard.
  UPDATE public.workspace_content
     SET metadata = COALESCE(metadata, '{}'::jsonb)
                  || jsonb_build_object('locked', true, 'coming_soon', true)
   WHERE workspace_id = v_ws AND slug IN ('cox-5-dia-a-dia', 'cox-6-futuro');

  RAISE NOTICE 'COX · 30 títulos actualizados · cursos 5 y 6 marcados como locked + coming_soon';
END $$;

-- Verificar:
-- SELECT pill_number, title FROM pills
-- WHERE workspace_id = (SELECT id FROM workspaces WHERE slug = 'cox')
-- ORDER BY pill_number;
--
-- SELECT slug, title, metadata FROM workspace_content
-- WHERE workspace_id = (SELECT id FROM workspaces WHERE slug = 'cox')
--   AND slug LIKE 'cox-%' ORDER BY position;
