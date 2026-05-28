// prototype-home.jsx — SOLID · Repsol × BeonIt

const { useState, useEffect } = React;

// ── Repsol · Sprinklr · 41 Think Pills (currículum real) ──────────────────
const PILLS = [
  // Bloque 1 · Introducción
  { id: 'p0',  pill: 0,  title: 'Importancia de este programa',                                                              one: 'Transforma cada interacción en valor de negocio.',                                   teacher: 'Equipo BeonIt',  duration: '3 min', tone: 'teal',  format: 'módulo', progress: 100, level: 'principiante', rating: 4.9, enrolled: 247, category: 'Fundamentos' },
  // Bloque 2 · Sprinklr en Repsol
  { id: 'p1',  pill: 1,  title: 'Cómo realizar el registro en el entorno REPSOL',                                            one: 'Asegura un registro efectivo antes de ingresar en nuestro entorno.',                teacher: 'IT Repsol',      duration: '4 min', tone: 'teal',  format: 'módulo', progress: 100, level: 'principiante', rating: 4.8, enrolled: 247, category: 'Fundamentos' },
  { id: 'p2',  pill: 2,  title: 'El impacto de Sprinklr como plataforma unificada',                                          one: 'Proyecta una voz única y coherente de nuestra marca.',                             teacher: 'Carlos Vega',   duration: '3 min', tone: 'plum',  format: 'módulo', progress: 100, level: 'principiante', rating: 4.9, enrolled: 247, category: 'Fundamentos' },
  { id: 'p3',  pill: 3,  title: 'Qué canales hay dentro de Sprinklr',                                                        one: 'Identifica qué canales componen tu negocio.',                                      teacher: 'Sara Molina',   duration: '4 min', tone: 'teal',  format: 'módulo', progress: 75,  level: 'principiante', rating: 4.7, enrolled: 230, category: 'Fundamentos' },
  { id: 'p4',  pill: 4,  title: 'Qué posibilidades operativas presentan los distintos canales',                              one: 'Maximiza el impacto de cada interacción.',                                         teacher: 'Sara Molina',   duration: '5 min', tone: 'plum',  format: 'módulo', progress: 40,  level: 'principiante', rating: 4.8, enrolled: 215, category: 'Fundamentos' },
  { id: 'p5',  pill: 5,  title: 'Qué activos se gestionan a través de Sprinklr',                                             one: 'Conoce cada activo para proyectar una marca sólida.',                              teacher: 'Carlos Vega',   duration: '4 min', tone: 'olive', format: 'módulo', progress: 0,   level: 'principiante', rating: 4.7, enrolled: 200, category: 'Fundamentos' },
  // Bloque 2 · Estructura de módulos y gobernanza
  { id: 'p6',  pill: 6,  title: 'Cuáles son los módulos y submódulos de Sprinklr',                                           one: 'Utiliza el módulo exacto que requiere tu tarea.',                                  teacher: 'Carlos Vega',   duration: '4 min', tone: 'olive', format: 'módulo', progress: 0,   level: 'principiante', rating: 4.8, enrolled: 195, category: 'Estructura' },
  { id: 'p7',  pill: 7,  title: 'Cómo impacta cada módulo en cada negocio',                                                  one: 'Vincula las capacidades de tu módulo con los objetivos del negocio.',               teacher: 'Ana García',    duration: '3 min', tone: 'clay',  format: 'módulo', progress: 0,   level: 'intermedio',  rating: 4.7, enrolled: 180, category: 'Estructura' },
  { id: 'p8',  pill: 8,  title: 'Cómo es la comunicación entre los módulos',                                                 one: 'Conecta los flujos entre módulos para optimizar la gestión.',                     teacher: 'Carlos Vega',   duration: '4 min', tone: 'warm',  format: 'módulo', progress: 0,   level: 'intermedio',  rating: 4.6, enrolled: 175, category: 'Estructura' },
  { id: 'p9',  pill: 9,  title: 'Cómo es el funcionamiento de los roles y los permisos',                                     one: 'Identifica el rol que te corresponde.',                                            teacher: 'Equipo Legal',  duration: '3 min', tone: 'noir',  format: 'módulo', progress: 0,   level: 'principiante', rating: 4.9, enrolled: 220, category: 'Gobernanza' },
  { id: 'p10', pill: 10, title: 'Cómo se estructuran los equipos dentro de cada módulo',                                     one: 'Organízate para ganar agilidad.',                                                  teacher: 'Equipo Legal',  duration: '4 min', tone: 'noir',  format: 'módulo', progress: 0,   level: 'principiante', rating: 4.8, enrolled: 215, category: 'Gobernanza' },
  // Bloque 3 · Gestión estructural y operativa de campañas en Social Publish
  { id: 'p11', pill: 11, title: 'Qué es el calendario editorial dentro de Social Publish',                                   one: 'Visualiza de manera personalizada el contenido para RRSS.',                       teacher: 'Sara Molina',   duration: '3 min', tone: 'clay',  format: 'módulo', progress: 0,   level: 'intermedio',  rating: 4.8, enrolled: 190, category: 'Social Publish' },
  { id: 'p12', pill: 12, title: 'Para qué sirve el DAM en la gestión y reutilización de recursos digitales',                 one: 'Ahorra tiempo reutilizando recursos digitales.',                                   teacher: 'Luis Romero',   duration: '4 min', tone: 'teal',  format: 'módulo', progress: 0,   level: 'principiante', rating: 4.7, enrolled: 185, category: 'Activos' },
  { id: 'p13', pill: 13, title: 'Cómo se estructuran las campañas para organizar la planificación de contenidos',            one: 'Organiza eficientemente el contenido de tus publicaciones.',                       teacher: 'Sara Molina',   duration: '5 min', tone: 'plum',  format: 'módulo', progress: 0,   level: 'intermedio',  rating: 4.8, enrolled: 182, category: 'Social Publish' },
  { id: 'p14', pill: 14, title: 'Cómo las subcampañas organizan y segmentan la actividad de publicación',                   one: 'Súmale un nivel a la estructura del contenido.',                                   teacher: 'Sara Molina',   duration: '3 min', tone: 'clay',  format: 'módulo', progress: 0,   level: 'intermedio',  rating: 4.7, enrolled: 175, category: 'Social Publish' },
  { id: 'p15', pill: 15, title: 'Identifica quién crea, gestiona y aprueba las campañas dentro de Social Publish',          one: 'Saber quién hace qué evita errores en la gestión de campañas.',                    teacher: 'Carlos Vega',   duration: '4 min', tone: 'warm',  format: 'módulo', progress: 0,   level: 'intermedio',  rating: 4.8, enrolled: 190, category: 'Gobernanza' },
  { id: 'p16', pill: 16, title: 'Comprende para qué sirve el etiquetado de campañas dentro de la operativa de publicación', one: 'Etiquetar bien convierte campañas en información trazable.',                       teacher: 'Carlos Vega',   duration: '3 min', tone: 'olive', format: 'módulo', progress: 0,   level: 'principiante', rating: 4.7, enrolled: 170, category: 'Social Publish' },
  // Bloque 4 · Operativa Editorial
  { id: 'p17', pill: 17, title: 'Cómo gestiona la publicación de contenidos en múltiples canales desde Social Publish',     one: 'Publicar el contenido correcto en el canal adecuado.',                             teacher: 'Carlos Vega',   duration: '5 min', tone: 'teal',  format: 'módulo', progress: 0,   level: 'intermedio',  rating: 4.9, enrolled: 200, category: 'Social Publish' },
  { id: 'p18', pill: 18, title: 'Cómo adaptar los contenidos al formato y dinámica de cada red social',                     one: 'Cada red tiene su lenguaje: adaptar el contenido marca la diferencia.',             teacher: 'Sara Molina',   duration: '4 min', tone: 'plum',  format: 'módulo', progress: 0,   level: 'intermedio',  rating: 4.8, enrolled: 195, category: 'Social Publish' },
  { id: 'p19', pill: 19, title: 'Cómo utilizar la plataforma para optimizar la gestión multicanal de contenidos',           one: 'Centralizar canales optimiza los objetivos de la publicación.',                    teacher: 'Carlos Vega',   duration: '4 min', tone: 'clay',  format: 'módulo', progress: 0,   level: 'intermedio',  rating: 4.7, enrolled: 185, category: 'Social Publish' },
  { id: 'p20', pill: 20, title: 'Cómo son los flujos de aprobación dentro de la operativa de publicación',                  one: 'Identificar el tipo de aprobación agiliza el flujo editorial.',                    teacher: 'Sara Molina',   duration: '3 min', tone: 'warm',  format: 'módulo', progress: 0,   level: 'principiante', rating: 4.9, enrolled: 220, category: 'Aprobaciones' },
  { id: 'p21', pill: 21, title: 'Cómo aplicar los procesos de revisión y validación establecidos en Sprinklr',              one: 'Seguir el proceso de revisión asegura calidad antes de publicar.',                  teacher: 'Carlos Vega',   duration: '4 min', tone: 'olive', format: 'módulo', progress: 0,   level: 'principiante', rating: 4.8, enrolled: 210, category: 'Aprobaciones' },
  { id: 'p22', pill: 22, title: 'Cuáles son los mecanismos de control para reducir riesgos operativos en la publicación',   one: 'Reduce riesgos operativos mediante una gestión estructurada del contenido.',        teacher: 'Equipo Legal',  duration: '5 min', tone: 'noir',  format: 'módulo', progress: 0,   level: 'avanzado',    rating: 4.8, enrolled: 200, category: 'Compliance' },
  // Bloque 5 · Calendario editorial
  { id: 'p23', pill: 23, title: 'Cómo visualizar y planificar el contenido a través del calendario editorial',              one: 'Utiliza el calendario para tener una visión clara de la planificación.',           teacher: 'Sara Molina',   duration: '4 min', tone: 'teal',  format: 'módulo', progress: 0,   level: 'principiante', rating: 4.7, enrolled: 180, category: 'Calendario' },
  { id: 'p24', pill: 24, title: 'Cómo filtrar y organizar campañas en el calendario',                                        one: 'Organiza el contenido para facilitar la coordinación entre equipos.',               teacher: 'Sara Molina',   duration: '3 min', tone: 'plum',  format: 'módulo', progress: 0,   level: 'principiante', rating: 4.8, enrolled: 190, category: 'Calendario' },
  // Bloque 6 · Reporting
  { id: 'p25', pill: 25, title: 'Cómo visualizar el rendimiento de campañas y publicaciones en los reportes',               one: 'Analiza el rendimiento de las campañas para entender su impacto.',                  teacher: 'Ana García',    duration: '5 min', tone: 'clay',  format: 'módulo', progress: 0,   level: 'intermedio',  rating: 4.8, enrolled: 175, category: 'Analytics' },
  { id: 'p26', pill: 26, title: 'Cuáles son las métricas clave para evaluar la performance del contenido publicado',        one: 'Utiliza las métricas para mejorar la estrategia de publicación.',                   teacher: 'Ana García',    duration: '4 min', tone: 'olive', format: 'módulo', progress: 0,   level: 'intermedio',  rating: 4.7, enrolled: 170, category: 'Analytics' },
  // Bloque 7 · Operativa Community Manager · Care
  { id: 'p27', pill: 27, title: 'Cuál es la diferencia entre mensaje y caso dentro de la gestión de conversaciones en Care', one: 'Distinguir mensaje y caso significa entender la conversación.',                   teacher: 'Luis Romero',   duration: '3 min', tone: 'warm',  format: 'módulo', progress: 0,   level: 'principiante', rating: 4.8, enrolled: 160, category: 'Care' },
  { id: 'p28', pill: 28, title: 'Cómo los mensajes se agrupan en casos para gestionar la interacción completa con el usuario', one: 'Gestionar una conversación es seguir todo el caso, no solo responder.',          teacher: 'Luis Romero',   duration: '4 min', tone: 'teal',  format: 'módulo', progress: 0,   level: 'principiante', rating: 4.7, enrolled: 155, category: 'Care' },
  { id: 'p29', pill: 29, title: 'Cómo gestionar las conversaciones entrantes dentro de la operativa diaria de Care',        one: 'Cada interacción bien gestionada mejora la experiencia del cliente.',               teacher: 'Luis Romero',   duration: '5 min', tone: 'plum',  format: 'módulo', progress: 0,   level: 'intermedio',  rating: 4.9, enrolled: 165, category: 'Care' },
  { id: 'p30', pill: 30, title: 'Cómo utilizar Care Console para centralizar la gestión de conversaciones',                 one: 'Mantén una visión 360 de la conversación.',                                        teacher: 'Luis Romero',   duration: '4 min', tone: 'clay',  format: 'módulo', progress: 0,   level: 'intermedio',  rating: 4.8, enrolled: 160, category: 'Care' },
  { id: 'p31', pill: 31, title: 'Cómo se utiliza Engagement Dashboard para visualizar y priorizar las interacciones',       one: 'El estatus del caso te posibilita priorizar la gestión.',                          teacher: 'Ana García',    duration: '4 min', tone: 'olive', format: 'módulo', progress: 0,   level: 'intermedio',  rating: 4.7, enrolled: 150, category: 'Care' },
  { id: 'p32', pill: 32, title: 'Cuál es la importancia del etiquetado en la clasificación de conversaciones',              one: 'Etiquetar interacciones convierte conversaciones en conocimiento.',                 teacher: 'Luis Romero',   duration: '3 min', tone: 'warm',  format: 'módulo', progress: 0,   level: 'principiante', rating: 4.8, enrolled: 155, category: 'Care' },
  { id: 'p33', pill: 33, title: 'Cuáles son los tipos de mensajes para clasificar correctamente las interacciones',         one: 'Clasificar bien los mensajes mejora la gestión del servicio.',                     teacher: 'Luis Romero',   duration: '4 min', tone: 'noir',  format: 'módulo', progress: 0,   level: 'principiante', rating: 4.7, enrolled: 150, category: 'Care' },
  { id: 'p34', pill: 34, title: 'Cuáles son las líneas de negocio y negocios asociados a las conversaciones',               one: 'Conectar cada interacción con el negocio mejora el análisis del servicio.',        teacher: 'Carlos Vega',   duration: '4 min', tone: 'teal',  format: 'módulo', progress: 0,   level: 'intermedio',  rating: 4.8, enrolled: 145, category: 'Care' },
  { id: 'p35', pill: 35, title: 'Cuándo y cómo transferir conversaciones desde Sprinklr a Salesforce',                     one: 'Escalar a Salesforce asegura que el caso siga su camino hasta resolverse.',        teacher: 'IT Repsol',     duration: '5 min', tone: 'plum',  format: 'módulo', progress: 0,   level: 'avanzado',    rating: 4.9, enrolled: 140, category: 'Integraciones' },
  { id: 'p36', pill: 36, title: 'Cómo se realiza el flujo de transferencia de casos entre Sprinklr y Salesforce',          one: 'El seguimiento oportuno asegura la correcta gestión del caso.',                    teacher: 'IT Repsol',     duration: '4 min', tone: 'clay',  format: 'módulo', progress: 0,   level: 'avanzado',    rating: 4.8, enrolled: 138, category: 'Integraciones' },
  // Bloque 8 · SLA y paneles de Care
  { id: 'p37', pill: 37, title: 'Qué son los SLA y su impacto en la gestión de conversaciones',                             one: 'Responder a tiempo es parte esencial de la experiencia del cliente.',              teacher: 'Luis Romero',   duration: '3 min', tone: 'olive', format: 'módulo', progress: 0,   level: 'intermedio',  rating: 4.8, enrolled: 142, category: 'Care' },
  { id: 'p38', pill: 38, title: 'Cómo utilizar los indicadores de SLA para priorizar la gestión de mensajes',               one: 'Priorizar correctamente mantiene el nivel de servicio.',                           teacher: 'Luis Romero',   duration: '4 min', tone: 'warm',  format: 'módulo', progress: 0,   level: 'intermedio',  rating: 4.7, enrolled: 140, category: 'Care' },
  { id: 'p39', pill: 39, title: 'Cómo visualizar las conversaciones a través de los paneles de Care',                       one: 'Los paneles ofrecen una versión clara y ampliada de la conversación.',             teacher: 'Ana García',    duration: '4 min', tone: 'noir',  format: 'módulo', progress: 0,   level: 'principiante', rating: 4.8, enrolled: 138, category: 'Care' },
  { id: 'p40', pill: 40, title: 'Cómo interpretar la información de los paneles para priorizar la operativa',               one: 'Analizar los widgets te permite decidir qué atender primero.',                     teacher: 'Ana García',    duration: '5 min', tone: 'teal',  format: 'módulo', progress: 0,   level: 'intermedio',  rating: 4.9, enrolled: 135, category: 'Analytics' },
  // ── Think Pills con vídeo real (YouTube) ─────────────────────────────────
  { id: 'p41', pill: 41, title: 'Qué es una macro',                                                                          one: 'Una macro automatiza respuestas repetitivas y acelera la atención al cliente.',    teacher: 'Luis Romero',   duration: '3 min', tone: 'warm',  format: 'módulo', progress: 0,   level: 'principiante', rating: 4.9, enrolled: 0,   category: 'Care',         yt: 'PGGFv3FXQc4' },
  { id: 'p42', pill: 42, title: 'Uso de macros en Sprinklr Service',                                                         one: 'Aplicar macros en el flujo diario reduce tiempos y mejora la consistencia.',       teacher: 'Luis Romero',   duration: '4 min', tone: 'noir',  format: 'módulo', progress: 0,   level: 'intermedio',  rating: 4.9, enrolled: 0,   category: 'Care',         yt: '-ztcftORQRg', featured: true },
  { id: 'p43', pill: 43, title: 'Publicar añadiendo emojis y etiquetando a terceros',                                        one: 'Los emojis y etiquetas aumentan el alcance orgánico de cada publicación.',         teacher: 'Sara Molina',   duration: '3 min', tone: 'plum',  format: 'módulo', progress: 0,   level: 'principiante', rating: 4.9, enrolled: 0,   category: 'Social Publish', yt: 'Fsdm5GzEu-8' },
  // ── Nuevos vídeos (catálogo Sprinklr Repsol, abril 2026) ─────────────────
  { id: 'p44', pill: 44, title: 'Ping ID',                                                                                   one: 'El sistema de autenticación corporativa que da acceso a Sprinklr en Repsol.',      teacher: 'IT Repsol',     duration: '2 min', tone: 'teal',  format: 'módulo', progress: 0,   level: 'principiante', rating: 4.8, enrolled: 0,   category: 'Integraciones', yt: 'hSof6jg5N1I' },
  { id: 'p45', pill: 45, title: 'Navegar Sprinklr',                                                                          one: 'Aprende a moverte por los módulos principales de la plataforma.',                  teacher: 'Equipo BeonIt', duration: '3 min', tone: 'plum',  format: 'módulo', progress: 0,   level: 'principiante', rating: 4.8, enrolled: 0,   category: 'Fundamentos',   yt: 'rF-yW2mEhN0' },
  { id: 'p46', pill: 46, title: 'Iniciar sesión en Sprinklr App Mobile',                                                     one: 'Configura el acceso desde tu móvil para publicar y monitorizar desde cualquier lugar.', teacher: 'IT Repsol',  duration: '2 min', tone: 'teal',  format: 'módulo', progress: 0,   level: 'principiante', rating: 4.7, enrolled: 0,   category: 'Fundamentos',   yt: 'IvFKEFdHx1w' },
  { id: 'p47', pill: 47, title: 'Flujo de publicación vía App para vídeos en TikTok',                                        one: 'Publica vídeos en TikTok desde la app móvil sin pasar por el escritorio.',          teacher: 'Sara Molina',   duration: '4 min', tone: 'warm',  format: 'módulo', progress: 0,   level: 'intermedio',  rating: 4.9, enrolled: 0,   category: 'Social Publish', yt: 'c6PfbvDsglA' },
  { id: 'p48', pill: 48, title: 'Flujo de publicación vía App para Stories y Reels en Instagram',                            one: 'Crea y programa Stories y Reels de Instagram directamente desde la app móvil.',     teacher: 'Sara Molina',   duration: '4 min', tone: 'plum',  format: 'módulo', progress: 0,   level: 'intermedio',  rating: 4.9, enrolled: 0,   category: 'Social Publish', yt: 'zmHtcIXj-rM' },
  { id: 'p49', pill: 49, title: 'Flujo de publicación para colaboraciones en Instagram',                                     one: 'Lanza contenido colaborativo entre cuentas para multiplicar el alcance.',           teacher: 'Sara Molina',   duration: '3 min', tone: 'noir',  format: 'módulo', progress: 0,   level: 'intermedio',  rating: 4.9, enrolled: 0,   category: 'Social Publish', yt: 'JpyD0rJYoj4' },
  { id: 'p50', pill: 50, title: 'Campaña y subcampaña',                                                                      one: 'Organiza tu actividad en campañas jerárquicas para medir impacto agregado.',        teacher: 'Equipo BeonIt', duration: '3 min', tone: 'teal',  format: 'módulo', progress: 0,   level: 'intermedio',  rating: 4.8, enrolled: 0,   category: 'Estructura',    yt: 'eHrZf1d43d0' },
];

// ── Bloques formativos (series) ───────────────────────────────────────────
const SERIES = [
  { id: 's1', title: 'Bloque 1+2 · Sprinklr en Repsol',                         teacher: '6 think pills · Carlos Vega',  duration: '22 min', tone: 'teal',  format: 'serie', level: 'principiante', rating: 4.9, enrolled: 247, category: 'Fundamentos'   },
  { id: 's2', title: 'Bloque 2 · Estructura, roles y gobernanza',                teacher: '5 think pills · Equipo Legal', duration: '18 min', tone: 'noir',  format: 'serie', level: 'principiante', rating: 4.8, enrolled: 220, category: 'Gobernanza'    },
  { id: 's3', title: 'Bloque 3 · Gestión estructural de campañas en Social Publish', teacher: '6 think pills · Sara Molina',  duration: '22 min', tone: 'clay',  format: 'serie', level: 'intermedio',  rating: 4.8, enrolled: 190, category: 'Social Publish'},
  { id: 's4', title: 'Bloque 4 · Operativa editorial y control de contenidos',   teacher: '6 think pills · Carlos Vega',  duration: '25 min', tone: 'warm',  format: 'serie', level: 'intermedio',  rating: 4.8, enrolled: 200, category: 'Social Publish'},
  { id: 's5', title: 'Bloque 5 · Calendario editorial',                          teacher: '2 think pills · Sara Molina',  duration: '7 min',  tone: 'plum',  format: 'serie', level: 'principiante', rating: 4.7, enrolled: 185, category: 'Calendario'    },
  { id: 's6', title: 'Bloque 6 · Reporting de campañas y performance',           teacher: '2 think pills · Ana García',   duration: '9 min',  tone: 'olive', format: 'serie', level: 'intermedio',  rating: 4.8, enrolled: 170, category: 'Analytics'     },
  { id: 's7', title: 'Bloque 7 · Operativa Community Manager en Care',           teacher: '10 think pills · Luis Romero', duration: '40 min', tone: 'teal',  format: 'serie', level: 'intermedio',  rating: 4.9, enrolled: 155, category: 'Care'          },
  { id: 's8', title: 'Bloque 8 · SLA y paneles de atención al cliente',          teacher: '4 think pills · Ana García',   duration: '16 min', tone: 'plum',  format: 'serie', level: 'intermedio',  rating: 4.8, enrolled: 140, category: 'Care'          },
];

// ── Quick tips ─────────────────────────────────────────────────────────────
const REELS = [
  { id: 'r1', title: 'Regístrate en Sprinklr con SSO en 30 segundos', teacher: '@solid', duration: ':30', tone: 'teal',  format: 'tip' },
  { id: 'r2', title: 'Crea una campaña rápida en Social Publish',      teacher: '@solid', duration: ':45', tone: 'clay',  format: 'tip' },
  { id: 'r3', title: 'Filtra activos en el DAM',                       teacher: '@solid', duration: ':38', tone: 'olive', format: 'tip' },
  { id: 'r4', title: 'Aprueba un post en 30 segundos',                 teacher: '@solid', duration: ':30', tone: 'warm',  format: 'tip' },
  { id: 'r5', title: 'Ve las métricas de rendimiento de una campaña',  teacher: '@solid', duration: ':41', tone: 'plum',  format: 'tip' },
  { id: 'r6', title: 'Transfiere un caso a Salesforce',                teacher: '@solid', duration: ':52', tone: 'noir',  format: 'tip' },
];

// ── Charlas ────────────────────────────────────────────────────────────────
const PODCASTS = [
  { id: 'c1', title: 'Estrategia digital de Repsol en Sprinklr 2026',           teacher: 'Dirección Comms · 22 min', duration: '22 min', tone: 'noir', format: 'charla', level: 'avanzado',    rating: 4.8, enrolled: 247, category: 'Fundamentos'   },
  { id: 'c2', title: 'Por qué Sprinklr transforma el equipo de comunicación', teacher: 'Carlos Vega · 18 min',     duration: '18 min', tone: 'teal', format: 'charla', level: 'principiante', rating: 4.7, enrolled: 220, category: 'Fundamentos'   },
];

// ── Rutas de certificación ─────────────────────────────────────────────────
const PATHS = [
  { id: 'pa1', title: 'Sprinklr Fundamentals · Certificación base',    teacher: '2 semanas · 11 think pills', duration: '45 min',  tone: 'teal',  format: 'ruta', level: 'principiante', rating: 4.9, enrolled: 247, category: 'Certificación' },
  { id: 'pa2', title: 'Rol Publish Agent · Certificación completa',    teacher: '4 semanas · 27 think pills', duration: '1h 50m',  tone: 'clay',  format: 'ruta', level: 'intermedio',  rating: 4.8, enrolled: 200, category: 'Certificación' },
  { id: 'pa3', title: 'Rol Care Agent · Certificación completa',       teacher: '3 semanas · 25 think pills', duration: '1h 40m',  tone: 'olive', format: 'ruta', level: 'intermedio',  rating: 4.8, enrolled: 155, category: 'Certificación' },
];

const CATEGORIES = ['Todo', 'Fundamentos', 'Estructura', 'Gobernanza', 'Social Publish', 'Aprobaciones', 'Calendario', 'Analytics', 'Care', 'Activos', 'Integraciones', 'Compliance', 'Certificación'];

// ── Components ────────────────────────────────────────────────────────────
function CategoryBar({ active, setActive }) {
  return (
    <div className="cat-bar">
      {CATEGORIES.map(c => (
        <button key={c} className={`cat-pill ${active === c ? 'active' : ''}`} onClick={() => setActive(c)}>{c}</button>
      ))}
    </div>
  );
}
// ============================================================
// REDESIGN · TopNav · Hero · Card · PathCard · Row · HomeView
// Adaptación del mockup `redesign/sgson-home.jsx` al SaaS actual.
// Usa window.SGS_DATA (alimentado por sgson-adapter.jsx).
// ============================================================

const _catSlugFix = (s) => {
  const x = String(s || '').toLowerCase().replace(/\s+/g, '-');
  if (x === 'analytics') return 'analytics-real';
  if (x === 'care') return 'care-real';
  return x;
};

// ── WorkspaceSwitcher · chip con dropdown para cambiar de tenant ──────────
function WorkspaceSwitcher() {
  const [open, setOpen] = useState(false);
  const [tick, setTick] = useState(0);
  const ref = React.useRef(null);
  useEffect(() => {
    const refresh = () => setTick(x => x + 1);
    window.addEventListener('workspaces-changed', refresh);
    window.addEventListener('workspace-changed', refresh);
    window.addEventListener('auth-changed', refresh);
    return () => {
      window.removeEventListener('workspaces-changed', refresh);
      window.removeEventListener('workspace-changed', refresh);
      window.removeEventListener('auth-changed', refresh);
    };
  }, []);
  useEffect(() => {
    if (!open) return;
    const onClickOut = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClickOut);
    return () => document.removeEventListener('mousedown', onClickOut);
  }, [open]);

  if (!window.Workspaces) return null;
  const current = window.Workspaces.current();
  const mine = window.Workspaces.listMine();
  if (!current || mine.length === 0) return null;

  const T = (k, f) => (window.I18n ? window.I18n.t(k, f) : (f || k));
  const T_ALL = T('workspaces.allWorkspaces','Todos los workspaces');
  const T_SWITCH = T('workspaces.switch','Cambiar workspace');

  return (
    <div ref={ref} className="workspace-switcher" style={{ position:'relative', marginLeft: 10 }}>
      <button onClick={() => setOpen(o => !o)}
        title={T_SWITCH}
        style={{
          display:'inline-flex', alignItems:'center', gap: 6,
          padding:'5px 10px',
          background:'rgba(255,255,255,0.04)',
          border:'1px solid rgba(255,255,255,0.10)',
          borderRadius: 999,
          fontFamily:'var(--font-mono, "JetBrains Mono", monospace)',
          fontSize: 10.5, letterSpacing:'0.06em', fontWeight: 600,
          color:'#F5F4F1',
          cursor:'pointer',
          maxWidth: 220, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
        }}>
        <span style={{ width: 6, height: 6, borderRadius:'50%', background: current.primaryColor || 'var(--accent)' }}/>
        {current.name}
        <span style={{ fontSize: 9, opacity: 0.7 }}>▼</span>
      </button>
      {open && (
        <div style={{
          position:'absolute', top:'calc(100% + 6px)', left: 0, zIndex: 80,
          minWidth: 260,
          background:'rgba(14,14,18,0.96)',
          backdropFilter:'blur(20px)',
          WebkitBackdropFilter:'blur(20px)',
          border:'1px solid rgba(255,255,255,0.10)',
          borderRadius: 10, padding: 6,
          boxShadow:'0 20px 60px rgba(0,0,0,0.40)',
        }}>
          <div style={{ padding:'8px 12px', fontFamily:'var(--font-mono, monospace)', fontSize: 10, letterSpacing:'0.08em', textTransform:'uppercase', color:'rgba(245,244,241,0.6)', fontWeight: 700 }}>
            {T_ALL}
          </div>
          {mine.map(w => (
            <button key={w.id} onClick={() => { window.Workspaces.setCurrent(w.id); setOpen(false); }}
              style={{
                display:'flex', alignItems:'center', gap: 10, width:'100%',
                padding:'8px 12px', border:'none', background: w.id === current.id ? 'rgba(110,80,238,0.16)' : 'transparent',
                cursor:'pointer', textAlign:'left', borderRadius: 6,
                fontFamily:'var(--font-sans, Inter)', fontSize: 13, color:'#F5F4F1',
              }}>
              <span style={{ width: 24, height: 24, borderRadius: 6, background: w.primaryColor || 'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
                {(w.name || '?').slice(0, 2).toUpperCase()}
              </span>
              <span style={{ flex: 1, minWidth: 0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{w.name}</span>
              {w._membership && (
                <span style={{ fontFamily:'var(--font-mono, monospace)', fontSize: 9, color:'rgba(245,244,241,0.6)', textTransform:'uppercase', letterSpacing:'0.06em' }}>{w._membership.role}</span>
              )}
              {w.id === current.id && <span style={{ color:'var(--accent)', fontSize: 14 }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function TopNav({ view, onView, onSearch, onLogout }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  // Close mobile nav al navegar
  useEffect(() => { setMobileNavOpen(false); }, [view]);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [inboxCount, setInboxCount] = useState(() => (window.Inbox && window.Inbox.unreadCount && window.Inbox.unreadCount()) || 0);
  const menuRef = React.useRef(null);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  // Click fuera cierra el dropdown
  useEffect(() => {
    if (!menuOpen) return;
    const onClickOut = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', onClickOut);
    return () => document.removeEventListener('mousedown', onClickOut);
  }, [menuOpen]);
  // Badge de bandeja se mantiene reactivo a cambios del Inbox
  useEffect(() => {
    const refresh = () => setInboxCount((window.Inbox && window.Inbox.unreadCount && window.Inbox.unreadCount()) || 0);
    refresh();
    window.addEventListener('inbox-changed', refresh);
    return () => window.removeEventListener('inbox-changed', refresh);
  }, []);

  // Re-render cuando cambia el idioma
  const { t: T } = (window.useI18n ? window.useI18n() : { t: (k) => k });

  const items = [
    { k:'home',      label:T('nav.home') },
    { k:'browse',    label:T('nav.browse') },
    { k:'rutas',     label:T('nav.rutas') },
    { k:'path',      label:T('nav.path') },
    { k:'resources', label:T('nav.resources','Recursos') },
    { k:'dashboard', label:T('nav.dashboard') },
    { k:'coach',     label:T('nav.coach') },
  ];

  const D = (typeof window !== 'undefined' && window.SGS_DATA) || null;
  const initials = (D && D.USER && D.USER.initials) || 'U';
  const userName = (D && D.USER && D.USER.name) || 'Usuario';
  const userRole = (D && D.USER && D.USER.role) || '';
  const isAdmin = !!(D && D.USER && D.USER.isAdmin);
  const canManager = !!(window.Auth && window.Auth.hasRole && window.Auth.hasRole('manager'));
  const canAdmin   = !!(window.Auth && window.Auth.can     && window.Auth.can('admin.viewPanel'));

  // Items del dropdown del avatar · ANTES estaban en la sidebar
  const menuItems = [
    { k:'profile',  label:T('nav.profile'),  icon:'user' },
    { k:'saved',    label:T('nav.saved'),    icon:'bookmark' },
    { k:'wa',       label:T('nav.wa'),       icon:'broadcast' },
    { k:'inbox',    label:T('nav.inbox'),    icon:'inbox', badge: inboxCount },
    { k:'settings', label:T('nav.settings'), icon:'gear' },
  ];
  if (canManager) menuItems.push({ k:'manager', label: T('nav.manager','Mi equipo'), icon:'users' });
  if (canAdmin)   menuItems.push({ k:'admin',   label: T('nav.admin'),               icon:'shield' });

  return (
    <nav className={`topnav ${scrolled ? 'scrolled' : ''}`}>
      <div className="topnav-left">
        {window.Wordmark
          ? <Wordmark variant="v1"/>
          : <span style={{display:'inline-flex', alignItems:'center', gap:8}}><img src={`beonit-logo.png?v=${window.SOLID_VERSION || 'init'}`} alt="" style={{height:32}}/><span style={{fontFamily:'Inter, sans-serif', fontWeight:700, fontSize:18, letterSpacing:'-0.02em'}}>SolidStream</span></span>
        }
        {/* Workspace switcher · chip al lado del logo si hay workspaces */}
        <WorkspaceSwitcher/>
      </div>

      <div className="topnav-center">
        {items.map(it => (
          <button
            key={it.k}
            className={`nav-item ${view === it.k ? 'active' : ''}`}
            onClick={() => onView(it.k)}>
            {it.label}
          </button>
        ))}
      </div>

      <div className="topnav-right" ref={menuRef} style={{position:'relative'}}>
        {/* Hamburger · solo visible en mobile via CSS */}
        <button className="topnav-hamburger icon-btn" onClick={() => setMobileNavOpen(o => !o)} aria-label="Menú" title="Menú">
          <Ico name={mobileNavOpen ? 'close' : 'menu'} size={20}/>
        </button>
        <button className="icon-btn" onClick={onSearch} aria-label="Buscar"><Ico name="search" size={18}/></button>
        <button className="icon-btn" aria-label="Notificaciones" onClick={() => onView('inbox')}>
          <Ico name="bell" size={18}/>
          {inboxCount ? <span className="badge">{inboxCount}</span> : null}
        </button>
        <button className="avatar" aria-label="Menú de usuario" onClick={() => setMenuOpen(o => !o)}>{initials}</button>

        {/* Dropdown del avatar · contiene lo que antes estaba en sidebar */}
        {menuOpen && (
          <div className="avatar-menu" style={{
            position:'absolute', top:'calc(100% + 12px)', right:0, zIndex:1100,
            minWidth:280,
            background:'rgba(14,14,18,0.96)',
            backdropFilter:'blur(20px) saturate(140%)',
            WebkitBackdropFilter:'blur(20px) saturate(140%)',
            border:'1px solid rgba(255,255,255,0.1)',
            borderRadius:12,
            boxShadow:'0 20px 60px rgba(0,0,0,0.6)',
            padding:8,
            animation:'fadeIn .15s ease',
            color:'#F5F4F1',
          }}>
            {/* Header con usuario */}
            <div style={{
              display:'flex', alignItems:'center', gap:12, padding:'12px 14px 14px',
              borderBottom:'1px solid rgba(255,255,255,0.08)', marginBottom:6,
            }}>
              <div style={{width:42, height:42, borderRadius:'50%', background:'linear-gradient(135deg, var(--accent, #6E50EE), var(--accent-deep, #4E36C5))', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700}}>{initials}</div>
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontSize:14, fontWeight:700, color:'#F5F4F1', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{userName}</div>
                {userRole && <div style={{fontSize:11, color:'rgba(245,244,241,0.7)', fontFamily:'var(--font-mono, monospace)', letterSpacing:'0.06em', textTransform:'uppercase'}}>{userRole}</div>}
              </div>
            </div>

            {/* Items */}
            {menuItems.map(item => (
              <button key={item.k}
                onClick={() => { setMenuOpen(false); onView(item.k); }}
                style={{
                  display:'flex', alignItems:'center', gap:12, width:'100%', padding:'10px 14px',
                  background: view === item.k ? 'rgba(255,255,255,0.08)' : 'transparent',
                  border:'none', borderRadius:8, cursor:'pointer',
                  color:'#F5F4F1', textAlign:'left',
                  fontFamily:'var(--font-sans, Inter)', fontSize:13, fontWeight:500,
                  transition:'background .12s',
                }}
                onMouseEnter={e => { if (view !== item.k) e.currentTarget.style.background='rgba(255,255,255,0.04)'; }}
                onMouseLeave={e => { if (view !== item.k) e.currentTarget.style.background='transparent'; }}>
                <span style={{display:'flex', alignItems:'center', justifyContent:'center', width:18, color:'rgba(245,244,241,0.7)'}}>
                  <Ico name={item.icon} size={16}/>
                </span>
                <span style={{flex:1}}>{item.label}</span>
                {item.badge ? <span style={{padding:'2px 7px', fontSize:10, fontWeight:700, background:'var(--accent, #6E50EE)', color:'#fff', borderRadius:999, fontFamily:'var(--font-mono, monospace)'}}>{item.badge}</span> : null}
              </button>
            ))}

            {/* Separador */}
            <div style={{height:1, background:'rgba(255,255,255,0.08)', margin:'6px 6px'}}/>

            {/* Logout */}
            <button data-logout="true" onClick={() => { setMenuOpen(false); onLogout && onLogout(); }}
              style={{
                display:'flex', alignItems:'center', gap:12, width:'100%', padding:'10px 14px',
                background:'transparent', border:'none', borderRadius:8, cursor:'pointer',
                color:'var(--accent, #6E50EE)', textAlign:'left',
                fontFamily:'var(--font-sans, Inter)', fontSize:13, fontWeight:600,
              }}
              onMouseEnter={e => e.currentTarget.style.background='rgba(110,80,238,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background='transparent'}>
              <span style={{display:'flex', alignItems:'center', justifyContent:'center', width:18}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
              </span>
              <span style={{flex:1}}>Cerrar sesión</span>
            </button>
          </div>
        )}
      </div>

      {/* Mobile nav drawer · visible solo en móvil cuando hamburger está abierto */}
      {mobileNavOpen && (
        <div className="topnav-mobile-drawer" onClick={() => setMobileNavOpen(false)}>
          <div className="topnav-mobile-panel" onClick={e => e.stopPropagation()}>
            {items.map(it => (
              <button key={it.k} className={`mobile-nav-item ${view === it.k ? 'active' : ''}`} onClick={() => { onView(it.k); setMobileNavOpen(false); }}>
                {it.label}
              </button>
            ))}
            <div className="mobile-nav-divider"/>
            {menuItems.map(mi => (
              <button key={mi.k} className={`mobile-nav-item ${view === mi.k ? 'active' : ''}`} onClick={() => { onView(mi.k); setMobileNavOpen(false); }}>
                {mi.label} {mi.badge ? <span className="mobile-nav-badge">{mi.badge}</span> : null}
              </button>
            ))}
            <div className="mobile-nav-divider"/>
            <button className="mobile-nav-item mobile-nav-logout" onClick={() => { onLogout && onLogout(); setMobileNavOpen(false); }}>
              {(window.I18n ? window.I18n.t('common.logout') : 'Cerrar sesión')}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

function HomeHero({ onPlay, onMore }) {
  const { t: T } = (window.useI18n ? window.useI18n() : { t: (k) => k });
  const D = window.SGS_DATA;
  const PILLS = (D && D.PILLS) || [];
  const [muted, setMuted] = React.useState(true);

  const featured = React.useMemo(() => {
    // Pills con flag `featured: true` van primero (decisión del admin sobre
    // cuál destacar en el hero). El resto se rellena con pills con vídeo y,
    // si no hay suficientes, las más populares por `enrolled`.
    const withVid = PILLS.filter(p => p.yt)
      .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    if (withVid.length >= 4) return withVid.slice(0, 4);
    const fill = PILLS.slice().sort((a,b) => (b.enrolled||0)-(a.enrolled||0));
    const ids = new Set(withVid.map(p => p.id));
    for (const p of fill) {
      if (!ids.has(p.id)) { withVid.push(p); ids.add(p.id); }
      if (withVid.length >= 4) break;
    }
    return withVid.slice(0, 4);
  }, [PILLS.length]);

  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (featured.length <= 1 || paused) return;
    const t = setInterval(() => setIdx(i => (i + 1) % featured.length), 12000);
    return () => clearInterval(t);
  }, [featured.length, paused]);

  const p = featured[idx];
  if (!p) return null;

  const slug = _catSlugFix(p.category);
  const cat = (D && D.CATS && (D.CATS[p.category] || D.CATS[slug])) || { label: p.category };

  return (
    <section className="hero"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      data-screen-label="Hero">
      <div className="hero-media">
        <div className={`hero-media-placeholder cover-${slug}`}/>
        {p.yt && (
          <img
            key={'thumb-'+p.id}
            src={`https://img.youtube.com/vi/${p.yt}/maxresdefault.jpg`}
            alt=""
            aria-hidden="true"
            style={{position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:0.85}}
            onError={e => {
              if (!e.currentTarget.dataset.fb) { e.currentTarget.dataset.fb='1'; e.currentTarget.src = `https://img.youtube.com/vi/${p.yt}/hqdefault.jpg`; }
              else { e.currentTarget.style.display = 'none'; }
            }}
          />
        )}
        {p.yt && (
          <iframe
            key={'video-'+p.id}
            src={`https://www.youtube.com/embed/${p.yt}?autoplay=1&mute=${muted ? 1 : 0}&controls=0&modestbranding=1&rel=0&showinfo=0&loop=1&playlist=${p.yt}&playsinline=1&start=45&iv_load_policy=3&disablekb=1`}
            style={{position:'absolute', inset:0, width:'100%', height:'100%', border:'none', pointerEvents:'none', transform:'scale(1.3)'}}
            allow="autoplay; encrypted-media"
            aria-hidden="true"
            tabIndex={-1}
            title=""
          />
        )}
      </div>
      <div className="hero-overlay"/>

      <div className="hero-badge">
        <span className="label">Top esta semana</span>
        <span className="value">en Repsol</span>
        <span className="stroke"/>
      </div>

      <div className="hero-content" key={p.id}>
        <div className="hero-eyebrow">
          <span className="pillmark">Think Pill · {p.pill}</span>
          <span className="sep"/>
          <span className="meta">{cat.label}</span>
        </div>

        <h1 className="hero-title">{p.title}</h1>
        {p.one && p.one !== p.title && <p className="hero-quote">"{p.one}."</p>}

        <div className="hero-meta">
          <span className="tag">{p.level}</span>
          <span className="sep">/</span>
          <span>{p.duration}</span>
          <span className="sep">/</span>
          <span>{p.teacher}</span>
          {p.rating ? (<><span className="sep">/</span><span>★ {Number(p.rating).toFixed(1)} · {(p.enrolled||0).toLocaleString('es-ES')}</span></>) : null}
        </div>

        <div className="hero-actions">
          <button className="btn btn-primary" onClick={() => onPlay(p)}>
            <Ico name="play" size={16}/> {T('hero.play')}
          </button>
          <button className="btn btn-secondary" onClick={() => onMore(p)}>
            <Ico name="info" size={16}/> {T('hero.more')}
          </button>
          <button className="btn btn-icon btn-ghost" aria-label={muted ? 'Activar sonido' : 'Silenciar'} title={muted ? 'Activar sonido' : 'Silenciar'} onClick={() => setMuted(m => !m)}>
            <Ico name={muted ? 'mute' : 'volume'} size={16}/>
          </button>
        </div>
      </div>

      <div className="hero-dots">
        {featured.map((_, i) => (
          <span key={i} className={`hero-dot ${i === idx ? 'active' : ''}`} onClick={() => setIdx(i)} style={{cursor:'pointer'}}/>
        ))}
      </div>
    </section>
  );
}

function NxCard({ pill, onOpen, showProgress, newBadge }) {
  const D = window.SGS_DATA;
  const cat = (D && D.CATS && (D.CATS[pill.category] || D.CATS[_catSlugFix(pill.category)])) || { label: pill.category || 'Módulo' };
  const slug = _catSlugFix(pill.category);

  const [saved, setSaved] = React.useState(() => window.Bookmarks ? window.Bookmarks.has(pill.id) : false);
  const [rated, setRated]  = React.useState(() => {
    const r = window.Ratings && window.Ratings.get && window.Ratings.get(pill.id);
    return typeof r === 'number' ? r >= 4 : !!(r && r.stars >= 4);
  });
  React.useEffect(() => {
    const onB = () => setSaved(window.Bookmarks ? window.Bookmarks.has(pill.id) : false);
    const onR = (e) => { if (e && e.detail && e.detail.pillId === pill.id) setRated(e.detail.stars >= 4); };
    window.addEventListener('bookmarks-changed', onB);
    window.addEventListener('ratings-changed', onR);
    return () => { window.removeEventListener('bookmarks-changed', onB); window.removeEventListener('ratings-changed', onR); };
  }, [pill.id]);

  const toggleSave = (e) => {
    e.stopPropagation();
    if (window.Bookmarks) {
      const isNowSaved = window.Bookmarks.toggle(pill.id);
      if (window.Toast) window.Toast[isNowSaved ? 'success' : 'info'](isNowSaved ? 'Añadido a tu lista' : 'Quitado de tu lista', { icon: isNowSaved ? '➕' : '➖' });
    }
  };
  const toggleLike = (e) => {
    e.stopPropagation();
    if (window.Ratings) {
      const next = rated ? 0 : 5;
      window.Ratings.set(pill.id, next);
      if (window.Toast) window.Toast[next ? 'success' : 'info'](next ? '👍 Me gusta' : 'Sin valoración', { icon: next ? '👍' : '○' });
    }
  };

  return (
    <article className="card" onClick={() => onOpen(pill)} data-screen-label={`Card · ${pill.pill}`}>
      <div className={`card-cover cat-${slug}`}/>
      {pill.yt && (
        <img
          src={`https://img.youtube.com/vi/${pill.yt}/hqdefault.jpg`}
          alt=""
          style={{position:'absolute', inset:0, width:'100%', height:'56.25%', objectFit:'cover'}}
          onError={e => { e.currentTarget.style.display='none'; }}
        />
      )}
      <div className="card-grad"/>

      <span className="card-pill-num">{String(cat.label).toUpperCase()} · {pill.pill}</span>
      {(newBadge || pill.newBadge) && <span className="card-badge">Nuevo</span>}

      <div className="card-body">
        <h3 className="card-title">{pill.title}</h3>
        <div className="card-meta">
          <span>{pill.duration}</span>
          <span className="sep">·</span>
          <span>{pill.level}</span>
        </div>
      </div>

      <div className="card-actions">
        <button className="card-action primary" aria-label="Reproducir" onClick={(e) => { e.stopPropagation(); onOpen(pill); }}>
          <Ico name="play" size={12}/>
        </button>
        <button className={`card-action${saved ? ' is-active' : ''}`} aria-label={saved ? 'Quitar de mi lista' : 'Añadir a mi lista'} title={saved ? 'Quitar de mi lista' : 'Añadir a mi lista'} onClick={toggleSave}>
          <Ico name={saved ? 'check' : 'plus'} size={14}/>
        </button>
        <button className={`card-action${rated ? ' is-active' : ''}`} aria-label={rated ? 'Quitar Me gusta' : 'Me gusta'} title={rated ? 'Quitar Me gusta' : 'Me gusta'} onClick={toggleLike}>
          <Ico name="thumb" size={13}/>
        </button>
        <button className="card-action" aria-label="Más info" onClick={(e) => { e.stopPropagation(); onOpen(pill); }}>
          <Ico name="chev-down" size={14}/>
        </button>
        <span className="card-match">{Math.round(78 + ((parseInt(String(pill.id).replace(/\D/g, ''), 10) || 0) * 17) % 22)}% match</span>
      </div>

      {showProgress && pill.progress > 0 && (
        <div className="card-progress">
          <div className="fill" style={{ width: `${Math.round(pill.progress * 100)}%` }}/>
        </div>
      )}
    </article>
  );
}

function NxPathCard({ path, onOpen }) {
  return (
    <article className="card" onClick={() => onOpen && onOpen(path)}>
      <div className={`card-cover ${path.accent || 'cat-publish'}`}/>
      <div className="card-grad"/>
      <span className="card-pill-num">RUTA · {path.pills} pills</span>
      <div className="card-body" style={{ left: 16, right: 16 }}>
        <h3 className="card-title" style={{ fontSize: 17, fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400 }}>
          {path.title}
        </h3>
        <div className="card-meta">
          <span>{path.hours}</span>
          <span className="sep">·</span>
          <span>{(path.desc || '').slice(0, 38)}…</span>
        </div>
      </div>
    </article>
  );
}

function NxRow({ row, onOpen, onOpenPath, onSeeAll }) {
  const railRef = React.useRef(null);
  const D = window.SGS_DATA;

  const scroll = (dir) => {
    const el = railRef.current; if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' });
  };

  if (row.isPaths) {
    const paths = (D && D.LEARNING_PATHS) || [];
    if (paths.length === 0) return null;
    return (
      <section className="row" data-screen-label={`Row · ${row.key}`}>
        <header className="row-header">
          <h2 className="row-title">{row.title}</h2>
          <span className="row-sub">— {row.sub}</span>
          <button className="row-explore" onClick={() => onOpenPath && onOpenPath()}>Explorar todas <Ico name="chev-right" size={12}/></button>
        </header>
        <div className="rail no-scrollbar" ref={railRef}>
          <div className="rail-track">
            {paths.map(p => <NxPathCard key={p.id} path={p} onOpen={() => onOpenPath && onOpenPath(p)}/>)}
          </div>
        </div>
        <button className="rail-arrow left" onClick={() => scroll(-1)}><Ico name="chev-left" size={28}/></button>
        <button className="rail-arrow right" onClick={() => scroll(1)}><Ico name="chev-right" size={28}/></button>
      </section>
    );
  }

  const pillById = (id) => (D && D.pillById && D.pillById(id)) || null;

  if (row.trending) {
    return (
      <section className="row row-trending" data-screen-label={`Row · ${row.key}`}>
        <header className="row-header">
          <h2 className="row-title">{row.title}</h2>
          <span className="row-sub">— {row.sub}</span>
          <button className="row-explore" onClick={() => onSeeAll && onSeeAll(row)}>Ranking completo <Ico name="chev-right" size={12}/></button>
        </header>
        <div className="rail no-scrollbar" ref={railRef}>
          <div className="rail-track">
            {row.pillIds.map((id, i) => {
              const p = pillById(id);
              if (!p) return null;
              return (
                <div className="trending-cell" key={id}>
                  <span className="trending-num">{String(i+1).padStart(2,'0')}</span>
                  <NxCard pill={p} onOpen={onOpen}/>
                </div>
              );
            })}
          </div>
        </div>
        <button className="rail-arrow left" onClick={() => scroll(-1)}><Ico name="chev-left" size={28}/></button>
        <button className="rail-arrow right" onClick={() => scroll(1)}><Ico name="chev-right" size={28}/></button>
      </section>
    );
  }

  return (
    <section className="row" data-screen-label={`Row · ${row.key}`}>
      <header className="row-header">
        <h2 className="row-title">{row.title}</h2>
        <span className="row-sub">— {row.sub}</span>
        <button className="row-explore" onClick={() => onSeeAll && onSeeAll(row)}>Ver todo <Ico name="chev-right" size={12}/></button>
      </header>
      <div className="rail no-scrollbar" ref={railRef}>
        <div className="rail-track">
          {row.pillIds.map(id => {
            const p = pillById(id);
            if (!p) return null;
            return <NxCard key={id} pill={p} onOpen={onOpen} showProgress={row.showProgress} newBadge={row.newRow}/>;
          })}
        </div>
      </div>
      <button className="rail-arrow left" onClick={() => scroll(-1)}><Ico name="chev-left" size={28}/></button>
      <button className="rail-arrow right" onClick={() => scroll(1)}><Ico name="chev-right" size={28}/></button>
    </section>
  );
}

function Home({ openDetail, openPlayer, setView, openPath }) {
  const [, force] = useState(0);
  useEffect(() => {
    const refresh = () => force(x => x + 1);
    window.addEventListener('sgs-data-ready', refresh);
    return () => window.removeEventListener('sgs-data-ready', refresh);
  }, []);

  const D = window.SGS_DATA;
  if (!D || !D.ROWS) {
    return (
      <div style={{padding:'120px 64px', color:'var(--fg-muted, #A8A6A0)', fontFamily:'var(--font-sans, Inter)', textAlign:'center'}}>
        <div style={{fontFamily:'var(--font-mono)', fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--fg-dim, #6F6D67)', marginBottom:12}}>SolidStream · cargando data del catálogo</div>
        <div style={{fontSize:14}}>Preparando Think Pills…</div>
      </div>
    );
  }

  const onOpenPath = (p) => { if (p && p.id && openPath) openPath(p.id); else setView('rutas'); };
  const onSeeAll = () => setView('browse');

  return (
    <div data-screen-label="Home">
      <HomeHero onPlay={(p) => openPlayer(p)} onMore={(p) => openDetail(p)}/>
      <div className="rows">
        {D.ROWS.map(row => (
          <NxRow key={row.key} row={row} onOpen={openDetail} onOpenPath={onOpenPath} onSeeAll={onSeeAll}/>
        ))}
      </div>
      <footer className="footer-strip">
        <div className="cobranding">
          <span><b>SolidStream</b></span>
          <span>·</span>
          <span>BeonIt × Repsol</span>
          <span>·</span>
          <span>Sprinklr Internal Learning</span>
        </div>
        <div>v 2.0 · MAY 2026</div>
      </footer>
    </div>
  );
}

window.TopNav = TopNav;
window.HomeHero = HomeHero;
window.NxCard = NxCard;
window.NxPathCard = NxPathCard;
window.NxRow = NxRow;
window.Home = Home;

// ── CineRow · fila horizontal scrolleable (legacy, usado por otras vistas) ──
function CineRow({ title, emTitle, children, onSeeAll, extraClass }) {
  const scrollRef = React.useRef(null);
  const [canL, setCanL] = useState(false);
  const [canR, setCanR] = useState(true);

  const updateArrows = React.useCallback(() => {
    const el = scrollRef.current; if (!el) return;
    setCanL(el.scrollLeft > 8);
    setCanR(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = scrollRef.current; if (!el) return;
    el.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);
    return () => {
      el.removeEventListener('scroll', updateArrows);
      window.removeEventListener('resize', updateArrows);
    };
  }, [updateArrows]);

  const scroll = (dir) => {
    const el = scrollRef.current; if (!el) return;
    const amt = Math.max(320, el.clientWidth * 0.85);
    el.scrollBy({ left: dir * amt, behavior: 'smooth' });
  };

  return (
    <section className={`cine-row ${extraClass || ''}`}>
      <div className="row-head">
        <h2>{title}{emTitle && <> <em>{emTitle}</em></>}</h2>
        {onSeeAll && <button className="link-btn" onClick={onSeeAll}>Ver todo →</button>}
      </div>
      <div className="cine-row-wrap">
        {canL && (
          <button className="cine-arrow cine-arrow-l" onClick={() => scroll(-1)} aria-label="Anterior">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
        )}
        <div className="cine-row-scroll" ref={scrollRef}>
          {children}
        </div>
        {canR && (
          <button className="cine-arrow cine-arrow-r" onClick={() => scroll(1)} aria-label="Siguiente">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>
          </button>
        )}
      </div>
    </section>
  );
}

window.CineRow = CineRow;
window.PILLS = PILLS; window.SERIES = SERIES; window.REELS = REELS; window.PODCASTS = PODCASTS; window.PATHS = PATHS;
