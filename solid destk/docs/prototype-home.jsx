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
    { id: 'dashboard', label: 'Dashboard',   icon: 'trend' },
    { id: 'coach',     label: 'MENTOR-IA',   icon: 'sparkle', badge: 'BETA' },
    { id: 'cronograma',label: 'Cronograma',  icon: 'trend' },
    { id: 'wa',        label: 'WhatsApp',    icon: 'chat' },
    { id: 'saved',     label: 'Guardado',    icon: 'bookmark' },
    { id: 'profile',   label: 'Mi perfil',   icon: 'user' },
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

// ── Home ──────────────────────────────────────────────────────────────────
function Home({ openDetail, openPlayer, setView }) {
  const [activeCat, setActiveCat] = useState('Todo');
  const inProgress = PILLS.filter(p => p.progress > 0 && p.progress < 100);
  const allContent = [...PILLS, ...SERIES, ...PODCASTS, ...PATHS];
  const filtered = activeCat === 'Todo' ? allContent : allContent.filter(c => c.category === activeCat);

  return (
    <div className="main-inner">

      {/* Hero */}
      <section className="lms-hero">
        <div className="lms-hero-text">
          <div className="lms-hero-eyebrow">
            <span className="repsol-dot"/>Repsol · Formación Sprinklr
          </div>
          <h1>Domina Sprinklr<br/>como <em>Publish Agent</em>.</h1>
          <p>Aprende a gestionar campañas, aprobar contenido y publicar en todos los canales de Repsol — a tu ritmo, con soporte de IA.</p>
          <div style={{display:'flex', gap:12, flexWrap:'wrap'}}>
            <button className="btn glow" onClick={openPlayer}><Icon name="play" size={14}/> Continuar formación</button>
            <button className="btn ghost hero-ghost" onClick={() => setView('path')}>Ver mi ruta →</button>
          </div>
        </div>
        <div className="lms-hero-cards">
          {inProgress.map(p => (
            <div key={p.id} className="hip-card" onClick={openPlayer}>
              <div className="hip-thumb"><div className={`ph ${p.tone}`}/></div>
              <div className="hip-body">
                <span className="hip-cat">{p.category}</span>
                <div className="hip-title">{p.title}</div>
                <div className="hip-bar"><i style={{width: p.progress+'%'}}/></div>
                <div className="hip-meta">{p.progress}% completado · {p.duration}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <div className="lms-stats">
        {[
          { n: '3/41',  l: 'Think Pills completadas', icon: 'check', color: 'var(--beonit-lime)' },
          { n: '15%',   l: 'Progreso en tu ruta',     icon: 'trend', color: 'var(--accent-glow)' },
          { n: '22 min',l: 'Tiempo de formación',     icon: 'clock', color: 'var(--beonit-blue)' },
          { n: '41',    l: 'Think Pills en total',    icon: 'bolt',  color: 'var(--bn-purple)' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{background: s.color + '18', color: s.color}}>
              <Icon name={s.icon} size={16}/>
            </div>
            <div className="stat-n">{s.n}</div>
            <div className="stat-l">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Continue */}
      {inProgress.length > 0 && (
        <Row title="Continúa" emTitle="donde lo dejaste" extraClass="row-continue">
          {inProgress.map(p => <Card key={p.id} {...p} onClick={openPlayer}/>)}
        </Row>
      )}

      {/* Featured path */}
      <div className="featured-banner" onClick={() => setView('path')}>
        <div className="fb-content">
          <span className="eyebrow" style={{color:'var(--accent-glow)'}}>Ruta certificada · 4 semanas</span>
          <h2>Rol Publish Agent<br/><em>Certificación Repsol</em>.</h2>
          <p>27 THINK PILLS · 8 BLOQUES · 1H 50MIN · AVALADA POR REPSOL & BEONIT</p>
          <div style={{display:'flex', gap:12}}>
            <button className="btn glow" onClick={e => { e.stopPropagation(); setView('path'); }}>
              <Icon name="book" size={14}/> Ver programa completo
            </button>
            <button className="btn ghost" style={{color:'var(--paper)', borderColor:'rgba(255,255,255,0.2)'}}>
              Certificado al terminar
            </button>
          </div>
        </div>
        <div className="fb-visual">
          <div className="ph teal" style={{position:'absolute', inset:0}}/>
          <div className="fb-badge">15% completado</div>
        </div>
      </div>

      {/* Rutas preview */}
      <div style={{margin:'40px 0 0'}}>
        <div className="row-head" style={{marginBottom:16}}>
          <h2>Rutas de <em>aprendizaje</em></h2>
          <button className="link-btn" onClick={() => setView('rutas')}>Ver todas →</button>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:10}}>
          {(window.LEARNING_PATHS || [
            {id:'fundamentals', label:'Fundamentals', color:'#0072BE', bg:'linear-gradient(135deg,#0072BE,#004d8a)', icon:'🎓', pills:8},
            {id:'publish-agent', label:'Publish Agent', color:'#EB0029', bg:'linear-gradient(135deg,#EB0029,#9b0018)', icon:'📢', pills:12},
            {id:'care-agent', label:'Care Agent', color:'#036837', bg:'linear-gradient(135deg,#036837,#024024)', icon:'💬', pills:13},
            {id:'managers', label:'Managers', color:'#8A3992', bg:'linear-gradient(135deg,#8A3992,#5a1f6e)', icon:'👑', pills:9},
          ]).slice(0,4).map((p, i) => (
            <div key={p.id||i} onClick={() => setView('rutas')} style={{
              background:'var(--paper)', border:'1px solid var(--line)', borderRadius:12, overflow:'hidden',
              cursor:'pointer', transition:'all .15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='var(--shadow-md)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; }}>
              <div style={{background:p.bg||'var(--paper-3)', padding:'14px 16px', color:'#fff', display:'flex', alignItems:'center', gap:10}}>
                <span style={{fontSize:22}}>{p.icon||'📚'}</span>
                <div style={{fontWeight:800, fontSize:14, letterSpacing:'-0.01em'}}>{p.label}</div>
              </div>
              <div style={{padding:'10px 16px', fontFamily:'var(--mono)', fontSize:10, color:'var(--ink-4)', letterSpacing:'0.06em'}}>
                {p.pills} módulos · Secuencial
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Catalog */}
      <div className="catalog-section">
        <div className="row-head">
          <h2>Todos los <em>módulos</em></h2>
          <button className="link-btn" onClick={() => setView('browse')}>Ver catálogo completo →</button>
        </div>
        <CategoryBar active={activeCat} setActive={setActiveCat}/>
        <div className="catalog-grid">
          {filtered.map(item => <Card key={item.id} {...item} onClick={() => openDetail(item)}/>)}
        </div>
      </div>

      {/* Pills con vídeo real */}
      {PILLS.filter(p => p.yt).length > 0 && (
        <Row title="Think Pills" emTitle="con vídeo real">
          {PILLS.filter(p => p.yt).map(p => <Card key={p.id} {...p} onClick={() => openDetail(p)}/>)}
        </Row>
      )}

      {/* Quick tips */}
      <Row title="Tips rápidos" emTitle="menos de 1 minuto" extraClass="row-reels">
        {REELS.map(r => <Card key={r.id} {...r} onClick={openPlayer}/>)}
      </Row>

      {/* AI CTA */}
      <div className="ai-cta-banner">
        <div className="ai-cta-orb"/>
        <div className="ai-cta-content">
          <span className="eyebrow" style={{color:'var(--accent-glow)'}}>MENTOR-IA <span className="beta-badge" style={{background:'var(--beonit-lime)',color:'var(--ink)'}}>BETA</span> · IA contextualizada · Sprinklr</span>
          <h2>"¿Cómo apruebo un post urgente fuera del horario habitual?"</h2>
          <p>MENTOR-IA conoce los flujos de Repsol, tu perfil competencial y las guías de Sprinklr. Respuestas contextualizadas y transferibles al puesto.</p>
          <button className="btn glow" onClick={() => setView('coach')}>
            <Icon name="sparkle" size={14}/> Abrir MENTOR-IA
          </button>
        </div>
        <div className="ai-cta-visual">
          <div className="ai-cta-chat">
            {[
              { role: 'ai', text: '¡Hola Amaia! Llevas un 58% de tu certificación. ¿Seguimos con el módulo de calendario hoy?' },
              { role: 'user', text: '¿Cuánto me falta para terminar?' },
              { role: 'ai', text: 'Te quedan 5 módulos: Calendario, Analytics, Activos, Compliance y el test final. Unos 90 min en total.' },
            ].map((m, i) => (
              <div key={i} className={`ai-cta-msg ${m.role}`}>{m.text}</div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}

window.Sidebar = Sidebar;
window.Home = Home;
window.PILLS = PILLS; window.SERIES = SERIES; window.REELS = REELS; window.PODCASTS = PODCASTS; window.PATHS = PATHS;
