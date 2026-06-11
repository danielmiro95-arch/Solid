-- ============================================================================
-- SolidStream · Backfill de posters faltantes en pills
-- ============================================================================
-- Para todas las pills que tienen un YouTube ID (`yt`) pero el campo `poster`
-- está vacío o NULL · asigna automáticamente la miniatura oficial de YouTube
-- (`https://i.ytimg.com/vi/<id>/hqdefault.jpg`).
--
-- Es idempotente: solo actualiza filas donde `poster` está vacío. Reejecutar
-- la sentencia no afecta a pills que ya tienen poster.
--
-- Para pills con mp4 (sin YT) que sigan sin poster: el frontend tiene un
-- panel admin con botón "Generar posters faltantes" que genera un SVG con
-- el título + color del workspace y lo guarda como data URL en `poster`.
-- Eso lo dispara el admin desde la app, no este SQL.
--
-- Ejecutar en SQL Editor.
-- ============================================================================

update public.pills
   set poster = 'https://i.ytimg.com/vi/' || yt || '/hqdefault.jpg'
 where yt is not null
   and yt <> ''
   and (poster is null or poster = '');

-- Report · cuántas filas quedan sin poster tras el backfill (los admin las
-- tienen que arreglar manualmente desde la UI · subir imagen o generar SVG).
do $$
declare
  remaining int;
begin
  select count(*) into remaining from public.pills
   where poster is null or poster = '';
  raise notice 'Pills sin poster tras el backfill: %', remaining;
end $$;

-- ============================================================================
-- FIN · todas las pills con YouTube quedan con thumb. El resto las completa
-- el admin desde el panel de pills (botón "Generar posters faltantes").
-- ============================================================================
