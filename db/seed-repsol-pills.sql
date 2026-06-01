-- =====================================================================
-- Seed · pills de Repsol (Sprinklr curriculum)
-- =====================================================================
-- Generado por scripts/seed-pills-sql.js a partir del array hardcoded en
-- docs/prototype-home.jsx. Inserta las 52 pills en el workspace
-- llamado 'Repsol' (busca por slug o name). Idempotente: ON CONFLICT
-- (workspace_id, pill_number) DO NOTHING.
--
-- Ejecuta este SQL UNA VEZ en Supabase SQL Editor tras crear la tabla
-- public.pills (sección 32a de schema.sql).
-- =====================================================================
do $$
declare ws_id uuid;
begin
  select id into ws_id from public.workspaces
    where lower(slug) = 'repsol' or lower(name) = 'repsol'
    order by created_at asc limit 1;
  if ws_id is null then
    raise notice 'No se encontró un workspace Repsol. Crea uno primero o renombra el existente.';
    return;
  end if;

  insert into public.pills (
    workspace_id, pill_number, slug, title, one_liner, teacher, duration, tone, format,
    level, rating, enrolled, category, yt, mp4, poster, featured, new_badge, position
  ) values
    (ws_id, 0, 'p0', 'Importancia de este programa', 'Transforma cada interacción en valor de negocio.', 'Equipo BeonIt', '3 min', 'teal', 'módulo', 'principiante', 4.9, 247, 'Fundamentos', NULL, NULL, NULL, false, false, 0),
    (ws_id, 1, 'p1', 'Cómo realizar el registro en el entorno REPSOL', 'Asegura un registro efectivo antes de ingresar en nuestro entorno.', 'IT Repsol', '4 min', 'teal', 'módulo', 'principiante', 4.8, 247, 'Fundamentos', NULL, NULL, NULL, false, false, 1),
    (ws_id, 2, 'p2', 'El impacto de Sprinklr como plataforma unificada', 'Proyecta una voz única y coherente de nuestra marca.', 'Carlos Vega', '3 min', 'plum', 'módulo', 'principiante', 4.9, 247, 'Fundamentos', NULL, NULL, NULL, false, false, 2),
    (ws_id, 3, 'p3', 'Qué canales hay dentro de Sprinklr', 'Identifica qué canales componen tu negocio.', 'Sara Molina', '4 min', 'teal', 'módulo', 'principiante', 4.7, 230, 'Fundamentos', NULL, NULL, NULL, false, false, 3),
    (ws_id, 4, 'p4', 'Qué posibilidades operativas presentan los distintos canales', 'Maximiza el impacto de cada interacción.', 'Sara Molina', '5 min', 'plum', 'módulo', 'principiante', 4.8, 215, 'Fundamentos', NULL, NULL, NULL, false, false, 4),
    (ws_id, 5, 'p5', 'Qué activos se gestionan a través de Sprinklr', 'Conoce cada activo para proyectar una marca sólida.', 'Carlos Vega', '4 min', 'olive', 'módulo', 'principiante', 4.7, 200, 'Fundamentos', NULL, NULL, NULL, false, false, 5),
    (ws_id, 6, 'p6', 'Cuáles son los módulos y submódulos de Sprinklr', 'Utiliza el módulo exacto que requiere tu tarea.', 'Carlos Vega', '4 min', 'olive', 'módulo', 'principiante', 4.8, 195, 'Estructura', NULL, NULL, NULL, false, false, 6),
    (ws_id, 7, 'p7', 'Cómo impacta cada módulo en cada negocio', 'Vincula las capacidades de tu módulo con los objetivos del negocio.', 'Ana García', '3 min', 'clay', 'módulo', 'intermedio', 4.7, 180, 'Estructura', NULL, NULL, NULL, false, false, 7),
    (ws_id, 8, 'p8', 'Cómo es la comunicación entre los módulos', 'Conecta los flujos entre módulos para optimizar la gestión.', 'Carlos Vega', '4 min', 'warm', 'módulo', 'intermedio', 4.6, 175, 'Estructura', NULL, NULL, NULL, false, false, 8),
    (ws_id, 9, 'p9', 'Cómo es el funcionamiento de los roles y los permisos', 'Identifica el rol que te corresponde.', 'Equipo Legal', '3 min', 'noir', 'módulo', 'principiante', 4.9, 220, 'Gobernanza', NULL, NULL, NULL, false, false, 9),
    (ws_id, 10, 'p10', 'Cómo se estructuran los equipos dentro de cada módulo', 'Organízate para ganar agilidad.', 'Equipo Legal', '4 min', 'noir', 'módulo', 'principiante', 4.8, 215, 'Gobernanza', NULL, NULL, NULL, false, false, 10),
    (ws_id, 11, 'p11', 'Qué es el calendario editorial dentro de Social Publish', 'Visualiza de manera personalizada el contenido para RRSS.', 'Sara Molina', '3 min', 'clay', 'módulo', 'intermedio', 4.8, 190, 'Social Publish', NULL, NULL, NULL, false, false, 11),
    (ws_id, 12, 'p12', 'Para qué sirve el DAM en la gestión y reutilización de recursos digitales', 'Ahorra tiempo reutilizando recursos digitales.', 'Luis Romero', '4 min', 'teal', 'módulo', 'principiante', 4.7, 185, 'Activos', NULL, NULL, NULL, false, false, 12),
    (ws_id, 13, 'p13', 'Cómo se estructuran las campañas para organizar la planificación de contenidos', 'Organiza eficientemente el contenido de tus publicaciones.', 'Sara Molina', '5 min', 'plum', 'módulo', 'intermedio', 4.8, 182, 'Social Publish', NULL, NULL, NULL, false, false, 13),
    (ws_id, 14, 'p14', 'Cómo las subcampañas organizan y segmentan la actividad de publicación', 'Súmale un nivel a la estructura del contenido.', 'Sara Molina', '3 min', 'clay', 'módulo', 'intermedio', 4.7, 175, 'Social Publish', NULL, NULL, NULL, false, false, 14),
    (ws_id, 15, 'p15', 'Identifica quién crea, gestiona y aprueba las campañas dentro de Social Publish', 'Saber quién hace qué evita errores en la gestión de campañas.', 'Carlos Vega', '4 min', 'warm', 'módulo', 'intermedio', 4.8, 190, 'Gobernanza', NULL, NULL, NULL, false, false, 15),
    (ws_id, 16, 'p16', 'Comprende para qué sirve el etiquetado de campañas dentro de la operativa de publicación', 'Etiquetar bien convierte campañas en información trazable.', 'Carlos Vega', '3 min', 'olive', 'módulo', 'principiante', 4.7, 170, 'Social Publish', NULL, NULL, NULL, false, false, 16),
    (ws_id, 17, 'p17', 'Cómo gestiona la publicación de contenidos en múltiples canales desde Social Publish', 'Publicar el contenido correcto en el canal adecuado.', 'Carlos Vega', '5 min', 'teal', 'módulo', 'intermedio', 4.9, 200, 'Social Publish', NULL, NULL, NULL, false, false, 17),
    (ws_id, 18, 'p18', 'Cómo adaptar los contenidos al formato y dinámica de cada red social', 'Cada red tiene su lenguaje: adaptar el contenido marca la diferencia.', 'Sara Molina', '4 min', 'plum', 'módulo', 'intermedio', 4.8, 195, 'Social Publish', NULL, NULL, NULL, false, false, 18),
    (ws_id, 19, 'p19', 'Cómo utilizar la plataforma para optimizar la gestión multicanal de contenidos', 'Centralizar canales optimiza los objetivos de la publicación.', 'Carlos Vega', '4 min', 'clay', 'módulo', 'intermedio', 4.7, 185, 'Social Publish', NULL, NULL, NULL, false, false, 19),
    (ws_id, 20, 'p20', 'Cómo son los flujos de aprobación dentro de la operativa de publicación', 'Identificar el tipo de aprobación agiliza el flujo editorial.', 'Sara Molina', '3 min', 'warm', 'módulo', 'principiante', 4.9, 220, 'Aprobaciones', NULL, NULL, NULL, false, false, 20),
    (ws_id, 21, 'p21', 'Cómo aplicar los procesos de revisión y validación establecidos en Sprinklr', 'Seguir el proceso de revisión asegura calidad antes de publicar.', 'Carlos Vega', '4 min', 'olive', 'módulo', 'principiante', 4.8, 210, 'Aprobaciones', NULL, NULL, NULL, false, false, 21),
    (ws_id, 22, 'p22', 'Cuáles son los mecanismos de control para reducir riesgos operativos en la publicación', 'Reduce riesgos operativos mediante una gestión estructurada del contenido.', 'Equipo Legal', '5 min', 'noir', 'módulo', 'avanzado', 4.8, 200, 'Compliance', NULL, NULL, NULL, false, false, 22),
    (ws_id, 23, 'p23', 'Cómo visualizar y planificar el contenido a través del calendario editorial', 'Utiliza el calendario para tener una visión clara de la planificación.', 'Sara Molina', '4 min', 'teal', 'módulo', 'principiante', 4.7, 180, 'Calendario', NULL, NULL, NULL, false, false, 23),
    (ws_id, 24, 'p24', 'Cómo filtrar y organizar campañas en el calendario', 'Organiza el contenido para facilitar la coordinación entre equipos.', 'Sara Molina', '3 min', 'plum', 'módulo', 'principiante', 4.8, 190, 'Calendario', NULL, NULL, NULL, false, false, 24),
    (ws_id, 25, 'p25', 'Cómo visualizar el rendimiento de campañas y publicaciones en los reportes', 'Analiza el rendimiento de las campañas para entender su impacto.', 'Ana García', '5 min', 'clay', 'módulo', 'intermedio', 4.8, 175, 'Analytics', NULL, NULL, NULL, false, false, 25),
    (ws_id, 26, 'p26', 'Cuáles son las métricas clave para evaluar la performance del contenido publicado', 'Utiliza las métricas para mejorar la estrategia de publicación.', 'Ana García', '4 min', 'olive', 'módulo', 'intermedio', 4.7, 170, 'Analytics', NULL, NULL, NULL, false, false, 26),
    (ws_id, 27, 'p27', 'Cuál es la diferencia entre mensaje y caso dentro de la gestión de conversaciones en Care', 'Distinguir mensaje y caso significa entender la conversación.', 'Luis Romero', '3 min', 'warm', 'módulo', 'principiante', 4.8, 160, 'Care', NULL, NULL, NULL, false, false, 27),
    (ws_id, 28, 'p28', 'Cómo los mensajes se agrupan en casos para gestionar la interacción completa con el usuario', 'Gestionar una conversación es seguir todo el caso, no solo responder.', 'Luis Romero', '4 min', 'teal', 'módulo', 'principiante', 4.7, 155, 'Care', NULL, NULL, NULL, false, false, 28),
    (ws_id, 29, 'p29', 'Cómo gestionar las conversaciones entrantes dentro de la operativa diaria de Care', 'Cada interacción bien gestionada mejora la experiencia del cliente.', 'Luis Romero', '5 min', 'plum', 'módulo', 'intermedio', 4.9, 165, 'Care', NULL, NULL, NULL, false, false, 29),
    (ws_id, 30, 'p30', 'Cómo utilizar Care Console para centralizar la gestión de conversaciones', 'Mantén una visión 360 de la conversación.', 'Luis Romero', '4 min', 'clay', 'módulo', 'intermedio', 4.8, 160, 'Care', NULL, NULL, NULL, false, false, 30),
    (ws_id, 31, 'p31', 'Cómo se utiliza Engagement Dashboard para visualizar y priorizar las interacciones', 'El estatus del caso te posibilita priorizar la gestión.', 'Ana García', '4 min', 'olive', 'módulo', 'intermedio', 4.7, 150, 'Care', NULL, NULL, NULL, false, false, 31),
    (ws_id, 32, 'p32', 'Cuál es la importancia del etiquetado en la clasificación de conversaciones', 'Etiquetar interacciones convierte conversaciones en conocimiento.', 'Luis Romero', '3 min', 'warm', 'módulo', 'principiante', 4.8, 155, 'Care', NULL, NULL, NULL, false, false, 32),
    (ws_id, 33, 'p33', 'Cuáles son los tipos de mensajes para clasificar correctamente las interacciones', 'Clasificar bien los mensajes mejora la gestión del servicio.', 'Luis Romero', '4 min', 'noir', 'módulo', 'principiante', 4.7, 150, 'Care', NULL, NULL, NULL, false, false, 33),
    (ws_id, 34, 'p34', 'Cuáles son las líneas de negocio y negocios asociados a las conversaciones', 'Conectar cada interacción con el negocio mejora el análisis del servicio.', 'Carlos Vega', '4 min', 'teal', 'módulo', 'intermedio', 4.8, 145, 'Care', NULL, NULL, NULL, false, false, 34),
    (ws_id, 35, 'p35', 'Cuándo y cómo transferir conversaciones desde Sprinklr a Salesforce', 'Escalar a Salesforce asegura que el caso siga su camino hasta resolverse.', 'IT Repsol', '5 min', 'plum', 'módulo', 'avanzado', 4.9, 140, 'Integraciones', NULL, NULL, NULL, false, false, 35),
    (ws_id, 36, 'p36', 'Cómo se realiza el flujo de transferencia de casos entre Sprinklr y Salesforce', 'El seguimiento oportuno asegura la correcta gestión del caso.', 'IT Repsol', '4 min', 'clay', 'módulo', 'avanzado', 4.8, 138, 'Integraciones', NULL, NULL, NULL, false, false, 36),
    (ws_id, 37, 'p37', 'Qué son los SLA y su impacto en la gestión de conversaciones', 'Responder a tiempo es parte esencial de la experiencia del cliente.', 'Luis Romero', '3 min', 'olive', 'módulo', 'intermedio', 4.8, 142, 'Care', NULL, NULL, NULL, false, false, 37),
    (ws_id, 38, 'p38', 'Cómo utilizar los indicadores de SLA para priorizar la gestión de mensajes', 'Priorizar correctamente mantiene el nivel de servicio.', 'Luis Romero', '4 min', 'warm', 'módulo', 'intermedio', 4.7, 140, 'Care', NULL, NULL, NULL, false, false, 38),
    (ws_id, 39, 'p39', 'Cómo visualizar las conversaciones a través de los paneles de Care', 'Los paneles ofrecen una versión clara y ampliada de la conversación.', 'Ana García', '4 min', 'noir', 'módulo', 'principiante', 4.8, 138, 'Care', NULL, NULL, NULL, false, false, 39),
    (ws_id, 40, 'p40', 'Cómo interpretar la información de los paneles para priorizar la operativa', 'Analizar los widgets te permite decidir qué atender primero.', 'Ana García', '5 min', 'teal', 'módulo', 'intermedio', 4.9, 135, 'Analytics', NULL, NULL, NULL, false, false, 40),
    (ws_id, 41, 'p41', 'Qué es una macro', 'Una macro automatiza respuestas repetitivas y acelera la atención al cliente.', 'Luis Romero', '3 min', 'warm', 'módulo', 'principiante', 4.9, 0, 'Care', 'PGGFv3FXQc4', NULL, NULL, false, false, 41),
    (ws_id, 42, 'p42', 'Uso de macros en Sprinklr Service', 'Aplicar macros en el flujo diario reduce tiempos y mejora la consistencia.', 'Luis Romero', '4 min', 'noir', 'módulo', 'intermedio', 4.9, 0, 'Care', '-ztcftORQRg', NULL, NULL, false, false, 42),
    (ws_id, 43, 'p43', 'Publicar añadiendo emojis y etiquetando a terceros', 'Los emojis y etiquetas aumentan el alcance orgánico de cada publicación.', 'Sara Molina', '3 min', 'plum', 'módulo', 'principiante', 4.9, 0, 'Social Publish', 'Fsdm5GzEu-8', NULL, NULL, false, false, 43),
    (ws_id, 44, 'p44', 'Ping ID', 'El sistema de autenticación corporativa que da acceso a Sprinklr en Repsol.', 'IT Repsol', '2 min', 'teal', 'módulo', 'principiante', 4.8, 0, 'Integraciones', 'hSof6jg5N1I', NULL, NULL, false, false, 44),
    (ws_id, 45, 'p45', 'Navegar Sprinklr', 'Aprende a moverte por los módulos principales de la plataforma.', 'Equipo BeonIt', '3 min', 'plum', 'módulo', 'principiante', 4.8, 0, 'Fundamentos', 'rF-yW2mEhN0', NULL, NULL, false, false, 45),
    (ws_id, 46, 'p46', 'Iniciar sesión en Sprinklr App Mobile', 'Configura el acceso desde tu móvil para publicar y monitorizar desde cualquier lugar.', 'IT Repsol', '2 min', 'teal', 'módulo', 'principiante', 4.7, 0, 'Fundamentos', 'IvFKEFdHx1w', NULL, NULL, false, false, 46),
    (ws_id, 47, 'p47', 'Flujo de publicación vía App para vídeos en TikTok', 'Publica vídeos en TikTok desde la app móvil sin pasar por el escritorio.', 'Sara Molina', '4 min', 'warm', 'módulo', 'intermedio', 4.9, 0, 'Social Publish', 'c6PfbvDsglA', NULL, NULL, false, false, 47),
    (ws_id, 48, 'p48', 'Flujo de publicación vía App para Stories y Reels en Instagram', 'Crea y programa Stories y Reels de Instagram directamente desde la app móvil.', 'Sara Molina', '4 min', 'plum', 'módulo', 'intermedio', 4.9, 0, 'Social Publish', 'zmHtcIXj-rM', NULL, NULL, false, false, 48),
    (ws_id, 49, 'p49', 'Flujo de publicación para colaboraciones en Instagram', 'Lanza contenido colaborativo entre cuentas para multiplicar el alcance.', 'Sara Molina', '3 min', 'noir', 'módulo', 'intermedio', 4.9, 0, 'Social Publish', 'JpyD0rJYoj4', NULL, NULL, false, false, 49),
    (ws_id, 50, 'p50', 'Campaña y subcampaña', 'Organiza tu actividad en campañas jerárquicas para medir impacto agregado.', 'Equipo BeonIt', '3 min', 'teal', 'módulo', 'intermedio', 4.8, 0, 'Estructura', 'eHrZf1d43d0', NULL, NULL, false, false, 50),
    (ws_id, 51, 'p51', 'Release', 'Lo último de Sprinklr en Repsol: novedades y mejoras del último release.', 'Equipo BeonIt', '2 min', 'plum', 'módulo', 'principiante', 5, 0, 'Fundamentos', NULL, 'https://ymhwsdmbddyudepbjfpk.supabase.co/storage/v1/object/public/pill-videos/Release.mp4', NULL, true, false, 51)
  on conflict (workspace_id, pill_number) do nothing;

  raise notice 'Seed pills Repsol completado · workspace_id=%', ws_id;
end $$;
