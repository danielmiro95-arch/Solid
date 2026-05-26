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
  { id: 'p41', pill: 41, title: 'Qué es una macro',                                                                          one: 'Una macro automatiza respuestas repetitivas y acelera la atención al cliente.',    teacher: 'Luis Romero',   duration: '3 min', tone: 'warm',  format: 'módulo', progress: 0,   level: 'principiante', rating: 4.9, enrolled: 0,   category: 'Care',         yt: 'JpyD0rJYoj4' },
  { id: 'p42', pill: 42, title: 'Uso de macros en Sprinklr Service',                                                         one: 'Aplicar macros en el flujo diario reduce tiempos y mejora la consistencia.',       teacher: 'Luis Romero',   duration: '4 min', tone: 'noir',  format: 'módulo', progress: 0,   level: 'intermedio',  rating: 4.9, enrolled: 0,   category: 'Care',         yt: 'eHrZf1d43d0' },
  { id: 'p43', pill: 43, title: 'Publicar añadiendo emojis y etiquetando a terceros',                                        one: 'Los emojis y etiquetas aumentan el alcance orgánico de cada publicación.',         teacher: 'Sara Molina',   duration: '3 min', tone: 'plum',  format: 'módulo', progress: 0,   level: 'principiante', rating: 4.9, enrolled: 0,   category: 'Social Publish', yt: 'zmHtcIXj-rM' },
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

function Sidebar({ view, setView }) {
  const [profile, setProfile] = useState(window.UserProfile ? window.UserProfile.get() : { name:'Sin sesión', role:'—', team:'—', avatarColor:'var(--ink-3)', isAdmin:false });
  const [unread, setUnread] = useState(window.Inbox ? window.Inbox.unreadCount() : 0);
  useEffect(() => {
    const h = () => setProfile(window.UserProfile.get());
    const refreshUnread = () => setUnread(window.Inbox ? window.Inbox.unreadCount() : 0);
    window.addEventListener('user-profile-changed', h);
    window.addEventListener('auth-changed', () => { h(); refreshUnread(); });
    window.addEventListener('inbox-changed', refreshUnread);
    refreshUnread();
    return () => {
      window.removeEventListener('user-profile-changed', h);
      window.removeEventListener('auth-changed', h);
      window.removeEventListener('inbox-changed', refreshUnread);
    };
  }, []);

  const items = [
    { id: 'home',      label: 'Inicio',      icon: 'home' },
    { id: 'inbox',     label: 'Bandeja',     icon: 'chat', badge: unread > 0 ? String(unread) : null },
    { id: 'browse',    label: 'Catálogo',    icon: 'compass' },
    { id: 'path',      label: 'Mi ruta',     icon: 'book' },
    { id: 'rutas',     label: 'Rutas',       icon: 'compass' },
    { id: 'dashboard', label: 'Analytics',   icon: 'trend' },
    { id: 'coach',     label: 'MENTOR-IA',   icon: 'sparkle', badge: 'BETA' },
    { id: 'wa',        label: 'Channels',    icon: 'chat' },
    { id: 'saved',     label: 'Guardado',    icon: 'bookmark' },
    { id: 'profile',   label: 'Mi perfil',   icon: 'user' },
    { id: 'settings',  label: 'Ajustes',     icon: 'compass' },
  ];
  if (profile.isAdmin) {
    items.push({ id: 'admin', label: 'Admin', icon: 'user', badge: 'ADMIN' });
  }

  const handleLogout = (e) => {
    e.stopPropagation();
    if (!confirm('¿Cerrar sesión de ' + profile.name + '?')) return;
    if (window.Auth) window.Auth.logout();
    if (window.Toast) window.Toast.info('Sesión cerrada · hasta pronto');
  };

  const initials = profile.name.split(/\s+/).map(p => p[0]).slice(0,2).join('').toUpperCase();
  const openPalette = () => window.__openPalette && window.__openPalette();

  return (
    <aside className="sb">
      <div className="sb-brand" style={{alignItems:'center'}}>
        <img src="sgs-on-logo.png?v=20260427e" style={{height:30, width:'auto', flexShrink:0}} alt="SGS|on"/>
      </div>

      <div className="sb-org">
        <div className="sb-org-logo">R</div>
        <div>
          <div className="sb-org-name">{profile.team}</div>
          <div className="sb-org-sub">Formación Sprinklr</div>
        </div>
      </div>

      <button className="sb-search" onClick={openPalette}>
        <Icon name="search" size={14}/>
        <span>Buscar módulos…</span>
        <span className="kbd">⌘K</span>
      </button>

      <div className="sb-nav">
        {items.map(it => (
          <button key={it.id} className={`sb-item ${view === it.id ? 'active' : ''}`} onClick={() => setView(it.id)}>
            <span className="sb-icon"><Icon name={it.icon} size={15}/></span>
            {it.label}
            {it.badge && <span className="sb-badge sb-badge-new">{it.badge}</span>}
          </button>
        ))}
      </div>

      <div>
        <div className="sb-section-title">Mi progreso</div>
        <div className="sb-paths">
          <div className="sb-path" onClick={() => setView('path')}>
            <div className="sb-path-title">Rol {profile.role} · Certificación</div>
            <div className="sb-progress"><i style={{width:'15%'}}/></div>
            <div className="sb-path-meta"><span>Think Pill 4 / 27</span><span>·</span><span>15%</span></div>
          </div>
        </div>
      </div>

      <div style={{display:'flex', alignItems:'center', gap:6}}>
        <button className="sb-user" onClick={() => setView('profile')} style={{border:'none', background:'transparent', textAlign:'left', cursor:'pointer', padding:0, flex:1, minWidth:0}}>
          <div className="sb-avatar" style={{background:profile.avatarColor}}>{initials}</div>
          <div style={{minWidth:0}}>
            <div className="sb-user-name" style={{display:'flex', alignItems:'center', gap:5}}>
              <span style={{whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{profile.name}</span>
              {profile.isAdmin && <span style={{fontFamily:'var(--mono)', fontSize:8, padding:'1px 5px', background:'var(--ink)', color:'#fff', borderRadius:3, letterSpacing:'0.06em', flexShrink:0}}>ADMIN</span>}
            </div>
            <div className="sb-user-role">{profile.role} · {profile.team}</div>
          </div>
        </button>
        <button onClick={handleLogout} title="Cerrar sesión"
          style={{flexShrink:0, width:32, height:32, borderRadius:8, border:'1px solid var(--line)', background:'var(--paper)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--ink-3)'}}
          onMouseEnter={e => { e.currentTarget.style.background='rgba(235,0,41,0.08)'; e.currentTarget.style.color='var(--repsol-red)'; e.currentTarget.style.borderColor='rgba(235,0,41,0.25)'; }}
          onMouseLeave={e => { e.currentTarget.style.background='var(--paper)'; e.currentTarget.style.color='var(--ink-3)'; e.currentTarget.style.borderColor='var(--line)'; }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
          </svg>
        </button>
      </div>
    </aside>
  );
}

// ── Color por categoría · usado en hero y cards ──────────────────────────
const CAT_HEX = {
  'Fundamentos':    '#0072BE',
  'Estructura':     '#005a96',
  'Gobernanza':     '#3d31cc',
  'Social Publish': '#E50914',
  'Activos':        '#036837',
  'Aprobaciones':   '#8A3992',
  'Compliance':     '#1f2937',
  'Calendario':     '#0072BE',
  'Analytics':      '#004d8a',
  'Care':           '#B8001F',
  'Integraciones':  '#3d31cc',
};

// ── NetflixCard · card autocontenida con cover colorida + hover preview ──
function NetflixCard({ pill, onClick, number, wide }) {
  const [hover, setHover] = useState(false);
  const [preview, setPreview] = useState(false);
  const timerRef = React.useRef(null);

  const onEnter = () => {
    setHover(true);
    if (pill.yt && !(window.matchMedia && window.matchMedia('(pointer: coarse)').matches)) {
      timerRef.current = setTimeout(() => setPreview(true), 1100);
    }
  };
  const onLeave = () => {
    setHover(false);
    setPreview(false);
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  };
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const accent = CAT_HEX[pill.category] || '#0072BE';
  const accentLight = accent + 'aa';

  return (
    <div onClick={onClick} onMouseEnter={onEnter} onMouseLeave={onLeave} style={{
      position:'relative',
      flexShrink: 0,
      width: number ? 340 : (wide ? 320 : 260),
      cursor:'pointer',
      transition: 'transform .25s cubic-bezier(.2,.7,.3,1)',
      transform: hover ? 'scale(1.07) translateY(-6px)' : 'scale(1)',
      zIndex: hover ? 5 : 1,
      scrollSnapAlign: 'start',
    }}>
      {number && (
        <div aria-hidden="true" style={{
          position:'absolute', left:-14, bottom:6,
          fontSize: 140, fontWeight: 900, fontFamily: 'Inter, sans-serif',
          color: '#0D1117',
          WebkitTextStroke: '3px #BCD630',
          lineHeight: 0.85, letterSpacing: '-0.08em',
          zIndex: 0, pointerEvents: 'none', userSelect: 'none',
        }}>{number}</div>
      )}

      <div style={{
        position: 'relative',
        marginLeft: number ? 60 : 0,
        aspectRatio: '16/9',
        borderRadius: 6,
        overflow: 'hidden',
        background: `linear-gradient(135deg, ${accent} 0%, ${accentLight} 45%, #0D1117 100%)`,
        boxShadow: hover ? '0 22px 50px rgba(0,0,0,0.65), 0 4px 12px rgba(0,0,0,0.3)' : '0 4px 14px rgba(0,0,0,0.35)',
        transition: 'box-shadow .25s',
      }}>
        <div style={{position:'absolute', inset:0, backgroundImage:'repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 22px)', mixBlendMode:'overlay', pointerEvents:'none'}}/>
        <div style={{position:'absolute', top:-40, right:-30, width:140, height:140, borderRadius:'50%', background:'rgba(255,255,255,0.12)', filter:'blur(2px)', pointerEvents:'none'}}/>
        {pill.pill != null && (
          <div aria-hidden="true" style={{position:'absolute', right:6, bottom:-12, fontSize:88, fontWeight:900, fontFamily:'Inter, sans-serif', color:'rgba(255,255,255,0.16)', lineHeight:1, letterSpacing:'-0.06em', pointerEvents:'none'}}>
            {String(pill.pill).padStart(2,'0')}
          </div>
        )}
        {pill.yt && (
          <img
            src={`https://img.youtube.com/vi/${pill.yt}/hqdefault.jpg`}
            alt={pill.title}
            style={{position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity: hover ? 0.95 : 1, transition:'opacity .25s'}}
            onError={e => { e.currentTarget.style.display = 'none'; }}
          />
        )}
        {preview && pill.yt && (
          <iframe
            src={`https://www.youtube.com/embed/${pill.yt}?autoplay=1&mute=1&controls=0&loop=1&playlist=${pill.yt}&modestbranding=1&playsinline=1&start=2&rel=0&iv_load_policy=3`}
            style={{position:'absolute', inset:0, width:'100%', height:'100%', border:'none', pointerEvents:'none', transform:'scale(1.05)', zIndex:1}}
            allow="autoplay; encrypted-media"
            tabIndex={-1}
            aria-hidden="true"
          />
        )}
        <div style={{position:'absolute', inset:0, background:'linear-gradient(180deg, transparent 35%, rgba(0,0,0,0.85) 100%)', pointerEvents:'none', zIndex:2}}/>
        <div style={{position:'absolute', top:10, left:10, fontFamily:'JetBrains Mono, monospace', fontSize:9.5, fontWeight:700, color:'#fff', letterSpacing:'0.12em', textTransform:'uppercase', padding:'3px 8px', background:'rgba(0,0,0,0.4)', backdropFilter:'blur(6px)', borderRadius:4, zIndex:3}}>
          {pill.category || 'Módulo'}
        </div>
        {hover && !preview && (
          <div aria-hidden="true" style={{position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:54, height:54, borderRadius:'50%', background:'rgba(255,255,255,0.95)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 18px rgba(0,0,0,0.4)', zIndex:3}}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#0D1117" style={{marginLeft:3}}><path d="M8 5v14l11-7z"/></svg>
          </div>
        )}
        <div style={{position:'absolute', left:12, right:12, bottom:10, color:'#fff', zIndex:3}}>
          <div style={{fontSize:14, fontWeight:700, lineHeight:1.25, marginBottom:4, textShadow:'0 1px 4px rgba(0,0,0,0.7)', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden'}}>
            {pill.title}
          </div>
          <div style={{fontFamily:'JetBrains Mono, monospace', fontSize:10, color:'rgba(255,255,255,0.7)', letterSpacing:'0.06em', textTransform:'uppercase'}}>
            {pill.duration || '4 min'} · {pill.level || 'Principiante'}
          </div>
        </div>
        {pill.progress > 0 && pill.progress < 100 && (
          <div style={{position:'absolute', left:0, right:0, bottom:0, height:3, background:'rgba(255,255,255,0.15)', zIndex:4}}>
            <div style={{height:'100%', width: pill.progress + '%', background:'#E50914'}}/>
          </div>
        )}
      </div>
    </div>
  );
}

// ── NetflixRow · fila horizontal scrolleable ─────────────────────────────
function NetflixRow({ title, sub, items, openDetail, numbered, wide }) {
  if (!items || items.length === 0) return null;
  const scrollRef = React.useRef(null);
  const [canL, setCanL] = useState(false);
  const [canR, setCanR] = useState(true);
  const updateArrows = () => {
    const el = scrollRef.current; if (!el) return;
    setCanL(el.scrollLeft > 10);
    setCanR(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  };
  useEffect(() => {
    updateArrows();
    const el = scrollRef.current; if (!el) return;
    el.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);
    return () => { el.removeEventListener('scroll', updateArrows); window.removeEventListener('resize', updateArrows); };
  }, [items.length]);
  const scroll = dir => { const el = scrollRef.current; if (!el) return; el.scrollBy({ left: dir * Math.max(420, el.clientWidth * 0.8), behavior: 'smooth' }); };
  return (
    <section style={{margin:'0 0 8px'}}>
      <h2 style={{fontFamily:'Inter, sans-serif', fontWeight:700, fontSize:22, color:'#fff', margin:'0 0 14px', padding:'0 64px', letterSpacing:'-0.015em'}}>
        {title}
        {sub && <span style={{marginLeft:10, fontStyle:'italic', fontWeight:400, fontSize:18, color:'rgba(255,255,255,0.55)'}}>{sub}</span>}
      </h2>
      <div style={{position:'relative'}}>
        {canL && (
          <button onClick={() => scroll(-1)} aria-label="Anterior" style={{position:'absolute', left:0, top:'50%', transform:'translateY(-50%)', zIndex:6, width:54, height:'70%', background:'linear-gradient(90deg, rgba(13,17,23,0.85) 0%, transparent 100%)', border:'none', cursor:'pointer', color:'#fff', display:'flex', alignItems:'center', paddingLeft:14}}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
        )}
        {canR && (
          <button onClick={() => scroll(1)} aria-label="Siguiente" style={{position:'absolute', right:0, top:'50%', transform:'translateY(-50%)', zIndex:6, width:54, height:'70%', background:'linear-gradient(270deg, rgba(13,17,23,0.85) 0%, transparent 100%)', border:'none', cursor:'pointer', color:'#fff', display:'flex', alignItems:'center', justifyContent:'flex-end', paddingRight:14}}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 6l6 6-6 6"/></svg>
          </button>
        )}
        <div ref={scrollRef} style={{display:'flex', gap:14, overflowX:'auto', overflowY:'visible', padding:'10px 64px 40px', scrollSnapType:'x mandatory', scrollPaddingLeft:64, scrollbarWidth:'none', msOverflowStyle:'none'}}>
          {items.map((p, i) => (
            <NetflixCard key={p.id} pill={p} onClick={() => openDetail(p)} number={numbered ? i + 1 : null} wide={wide}/>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Home · Netflix-style · BULLETPROOF, inline-styled ────────────────────
function Home({ openDetail, openPlayer, setView }) {
  const featuredPills = React.useMemo(() => {
    const withVideo = PILLS.filter(p => p.yt);
    return withVideo.length > 0 ? withVideo.slice(0, 4) : PILLS.slice(0, 4);
  }, []);
  const [heroIdx, setHeroIdx] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);
  useEffect(() => {
    if (featuredPills.length <= 1 || heroPaused) return;
    const t = setInterval(() => setHeroIdx(i => (i + 1) % featuredPills.length), 12000);
    return () => clearInterval(t);
  }, [featuredPills.length, heroPaused]);
  const heroPill = featuredPills[heroIdx] || PILLS[0] || { title:'Sprinklr', category:'Fundamentos', duration:'4 min' };
  const heroAccent = CAT_HEX[heroPill.category] || '#0072BE';
  const profile = (window.UserProfile && window.UserProfile.get()) || { name:'tú', role:'Publish Agent' };
  const firstName = (profile.name || 'tú').split(' ')[0];

  const inProgress = PILLS.filter(p => p.progress > 0 && p.progress < 100);
  const recommendedRow = PILLS.slice(0, 14);
  const trendingRow = PILLS.slice().sort((a,b) => (b.enrolled||0) - (a.enrolled||0)).slice(0, 10);
  const careRow = PILLS.filter(p => p.category === 'Care').slice(0, 10);
  const analyticsRow = PILLS.filter(p => p.category === 'Analytics' || p.category === 'Integraciones').slice(0, 10);
  const newPillsRow = PILLS.slice(-12).reverse();
  const withVideoRow = PILLS.filter(p => p.yt);

  return (
    <div className="main-inner home-cinema" style={{
      padding: 0, maxWidth: 'none', background: '#0D1117', color: '#fff', minHeight: '100vh',
    }}>
      {/* ============ HERO ============ */}
      <section
        onMouseEnter={() => setHeroPaused(true)}
        onMouseLeave={() => setHeroPaused(false)}
        style={{
          position:'relative', minHeight:560, height:'78vh', maxHeight:880,
          background: `linear-gradient(135deg, ${heroAccent} 0%, #1a2940 50%, #0D1117 100%)`,
          overflow:'hidden', display:'flex', alignItems:'flex-end',
        }}
      >
        {heroPill.yt && (
          <img
            key={'thumb-'+heroPill.id}
            src={`https://img.youtube.com/vi/${heroPill.yt}/maxresdefault.jpg`}
            alt=""
            aria-hidden="true"
            style={{position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:0.85}}
            onError={e => {
              if (!e.currentTarget.dataset.fallback) {
                e.currentTarget.dataset.fallback = '1';
                e.currentTarget.src = `https://img.youtube.com/vi/${heroPill.yt}/hqdefault.jpg`;
              } else { e.currentTarget.style.display = 'none'; }
            }}
          />
        )}
        {heroPill.yt && (
          <iframe
            key={'video-'+heroPill.id}
            src={`https://www.youtube.com/embed/${heroPill.yt}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&loop=1&playlist=${heroPill.yt}&playsinline=1&start=2&iv_load_policy=3&disablekb=1`}
            style={{position:'absolute', inset:0, width:'100%', height:'100%', border:'none', pointerEvents:'none', transform:'scale(1.3)'}}
            allow="autoplay; encrypted-media"
            aria-hidden="true"
            tabIndex={-1}
            title=""
          />
        )}
        <div style={{position:'absolute', inset:0, background:'linear-gradient(90deg, rgba(13,17,23,0.92) 0%, rgba(13,17,23,0.6) 35%, rgba(13,17,23,0.25) 65%, rgba(13,17,23,0.05) 100%), linear-gradient(180deg, rgba(13,17,23,0.4) 0%, transparent 30%, transparent 50%, #0D1117 100%)', pointerEvents:'none', zIndex:2}}/>
        <div key={heroPill.id} style={{
          position:'relative', zIndex:3, padding:'0 64px 90px', maxWidth:720, color:'#fff',
        }}>
          <div style={{display:'inline-flex', alignItems:'center', gap:8, fontFamily:'JetBrains Mono, monospace', fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(255,255,255,0.85)', marginBottom:16, padding:'5px 12px', background:'rgba(255,255,255,0.1)', backdropFilter:'blur(8px)', borderRadius:999, border:'1px solid rgba(255,255,255,0.15)'}}>
            <span style={{width:7, height:7, borderRadius:'50%', background:'linear-gradient(135deg, #BCD630, #0072BE)', boxShadow:'0 0 8px rgba(188,214,48,0.6)'}}/>
            ★ Destacado · Hola {firstName}
          </div>
          <h1 style={{fontFamily:'Inter, sans-serif', fontWeight:800, fontSize:'clamp(40px, 5.5vw, 64px)', letterSpacing:'-0.025em', lineHeight:1.05, margin:'0 0 16px', textShadow:'0 4px 24px rgba(0,0,0,0.5)'}}>
            {heroPill.title}
          </h1>
          {heroPill.one && (
            <p style={{fontFamily:'Instrument Serif, serif', fontStyle:'italic', fontSize:19, color:'rgba(255,255,255,0.93)', margin:'0 0 18px', lineHeight:1.45, textShadow:'0 2px 8px rgba(0,0,0,0.5)'}}>"{heroPill.one}"</p>
          )}
          <p style={{fontFamily:'JetBrains Mono, monospace', fontSize:11.5, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.7)', margin:'0 0 24px'}}>
            {heroPill.category || 'Sprinklr'} · {heroPill.duration || '4 min'} · {heroPill.teacher || 'BeonIt × Repsol'}
          </p>
          <div style={{display:'flex', gap:10, flexWrap:'wrap'}}>
            <button onClick={() => openDetail(heroPill)} style={{display:'inline-flex', alignItems:'center', gap:8, padding:'13px 28px', background:'#fff', color:'#0D1117', border:'none', borderRadius:6, cursor:'pointer', fontFamily:'Inter, sans-serif', fontWeight:700, fontSize:15, boxShadow:'0 8px 24px rgba(0,0,0,0.35)'}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              Reproducir
            </button>
            <button onClick={() => openDetail(heroPill)} style={{display:'inline-flex', alignItems:'center', gap:8, padding:'13px 24px', background:'rgba(110,110,110,0.6)', color:'#fff', border:'1px solid rgba(255,255,255,0.15)', borderRadius:6, cursor:'pointer', fontFamily:'Inter, sans-serif', fontWeight:600, fontSize:14, backdropFilter:'blur(8px)'}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
              Más información
            </button>
            <button onClick={() => setView('coach')} style={{display:'inline-flex', alignItems:'center', gap:8, padding:'13px 20px', background:'transparent', color:'rgba(255,255,255,0.85)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:6, cursor:'pointer', fontFamily:'Inter, sans-serif', fontWeight:500, fontSize:13}}>
              ★ Pregúntale a MENTOR-IA
            </button>
          </div>
        </div>

        {featuredPills.length > 1 && (
          <div style={{position:'absolute', bottom:36, right:64, display:'flex', gap:6, zIndex:4}}>
            {featuredPills.map((p, i) => (
              <button key={p.id} onClick={() => setHeroIdx(i)} aria-label={`Ver ${p.title}`} style={{
                width: i === heroIdx ? 38 : 18, height:3, border:'none',
                background: i === heroIdx ? '#BCD630' : 'rgba(255,255,255,0.32)',
                borderRadius:2, cursor:'pointer', padding:0, transition:'all .3s',
              }}/>
            ))}
          </div>
        )}

        <div style={{position:'absolute', top:30, right:64, zIndex:4, display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6}}>
          <div style={{fontFamily:'JetBrains Mono, monospace', fontSize:10, fontWeight:800, letterSpacing:'0.16em', textTransform:'uppercase', color:'#fff', background:'linear-gradient(135deg, #E50914, #B8001F)', padding:'5px 11px', borderRadius:4, boxShadow:'0 4px 12px rgba(229,9,20,0.4)'}}>
            SGS|on TOP
          </div>
          <div style={{fontFamily:'JetBrains Mono, monospace', fontSize:9.5, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.75)', background:'rgba(13,17,23,0.6)', backdropFilter:'blur(6px)', padding:'3px 9px', borderRadius:3, border:'1px solid rgba(255,255,255,0.1)'}}>
            {heroPill.category || ''}
          </div>
        </div>
      </section>

      {/* ============ ROWS ============ */}
      <div style={{padding:'24px 0 64px', background:'#0D1117'}}>
        {inProgress.length > 0 && (
          <NetflixRow title={`Continúa, ${firstName}`} sub="donde lo dejaste" items={inProgress} openDetail={openDetail}/>
        )}
        {withVideoRow.length > 0 && (
          <NetflixRow title="Vídeos disponibles ahora" sub="reproducir directamente" items={withVideoRow} openDetail={openDetail} wide/>
        )}
        <NetflixRow title="Rutas recomendadas para ti" sub={`para ${profile.role}`} items={recommendedRow} openDetail={openDetail}/>
        <NetflixRow title="Tendencia esta semana" sub="en Repsol" items={trendingRow} openDetail={openDetail} numbered/>
        {careRow.length > 0 && (
          <NetflixRow title="Care · atención al cliente" items={careRow} openDetail={openDetail}/>
        )}
        {analyticsRow.length > 0 && (
          <NetflixRow title="Analytics & Integraciones" items={analyticsRow} openDetail={openDetail}/>
        )}
        <NetflixRow title="Nuevo en SGS|on" items={newPillsRow} openDetail={openDetail}/>

        <div style={{margin:'24px 64px 0', padding:'32px', background:'linear-gradient(135deg, #1a2940 0%, #2a1f4d 100%)', borderRadius:14, border:'1px solid rgba(255,255,255,0.08)', display:'flex', alignItems:'center', gap:24, flexWrap:'wrap'}}>
          <div style={{flex:1, minWidth:280}}>
            <div style={{fontFamily:'JetBrains Mono, monospace', fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'#4D9FE0', fontWeight:700, marginBottom:8}}>★ MENTOR-IA · BETA</div>
            <h2 style={{fontFamily:'Inter, sans-serif', fontSize:24, fontWeight:700, color:'#fff', margin:'0 0 8px', letterSpacing:'-0.015em'}}>
              ¿Dudas sobre Sprinklr? Tu asistente IA conoce el contexto Repsol.
            </h2>
            <p style={{fontSize:13.5, color:'rgba(255,255,255,0.7)', margin:0, lineHeight:1.6}}>
              Pregúntale sobre flujos, atajos, mejores prácticas. Te responde en español adaptado a tu rol.
            </p>
          </div>
          <button onClick={() => setView('coach')} style={{padding:'14px 24px', background:'#4D9FE0', color:'#0D1117', border:'none', borderRadius:8, cursor:'pointer', fontFamily:'Inter, sans-serif', fontWeight:700, fontSize:14, boxShadow:'0 4px 14px rgba(77,159,224,0.4)'}}>
            Abrir MENTOR-IA →
          </button>
        </div>
      </div>
    </div>
  );
}

window.Sidebar = Sidebar;
window.NetflixCard = NetflixCard;
window.NetflixRow = NetflixRow;
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
