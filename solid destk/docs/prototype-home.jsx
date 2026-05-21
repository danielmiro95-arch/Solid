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

  // Hero cinematográfico: rota entre el último pill en progreso o el destacado
  const heroPill = inProgress[0] || PILLS.find(p => p.yt) || PILLS[0];
  const heroBg = heroPill && heroPill.yt
    ? `url(https://img.youtube.com/vi/${heroPill.yt}/maxresdefault.jpg)`
    : 'linear-gradient(135deg, #003a72 0%, #0072BE 35%, #8A3992 100%)';

  const profile = window.UserProfile ? window.UserProfile.get() : { name:'', role:'Publish Agent' };
  const firstName = (profile.name || 'tú').split(' ')[0];

  // Filas personalizadas por rol
  const myPathPills = PILLS.filter(p => (p.pill || 0) <= 10); // simulado: Bloque 1+2
  const trendingPills = PILLS.slice().sort((a, b) => (b.enrolled || 0) - (a.enrolled || 0)).slice(0, 10);
  const shortsAndReels = PILLS.filter(p => (p.duration || '').match(/^[0-9]+\s*min/) && parseInt(p.duration) <= 3).slice(0, 10);
  const careAndAnalytics = PILLS.filter(p => ['Care','Analytics','Integraciones'].includes(p.category)).slice(0, 10);

  return (
    <div className="main-inner home-cinema">

      {/* HERO CINEMATOGRÁFICO · estilo Netflix featured */}
      <section className="cine-hero" style={{
        backgroundImage: heroBg,
        backgroundSize:'cover',
        backgroundPosition:'center',
      }}>
        <div className="cine-hero-overlay"/>
        <div className="cine-hero-content">
          <div className="cine-hero-eyebrow">
            <span className="cine-dot"/>
            {heroPill && heroPill.progress > 0
              ? `Continúa donde lo dejaste · ${heroPill.progress}% completado`
              : `Repsol · Formación Sprinklr · Hola ${firstName}`}
          </div>
          <h1 className="cine-hero-title">{heroPill ? heroPill.title : 'Domina Sprinklr como experto'}</h1>
          {heroPill && heroPill.one && (
            <p className="cine-hero-th1ng"><span className="cine-th1ng-label">TH1NG</span> {heroPill.one}</p>
          )}
          <p className="cine-hero-lead">
            {heroPill && heroPill.category
              ? `${heroPill.category} · ${heroPill.duration || '4 min'} · ${heroPill.teacher || 'BeonIt × Repsol'}`
              : 'Plataforma de formación con MENTOR-IA, 41 Think Pills, 3 talleres y certificación oficial.'}
          </p>
          <div className="cine-hero-ctas">
            <button className="btn glow cine-cta-primary" onClick={() => heroPill ? openDetail(heroPill) : openPlayer()}>
              <Icon name="play" size={16}/> {heroPill && heroPill.progress > 0 ? 'Continuar' : 'Empezar'}
            </button>
            <button className="btn ghost cine-cta-info" onClick={() => heroPill && openDetail(heroPill)}>
              <Icon name="book" size={14}/> Más información
            </button>
            <button className="btn ghost cine-cta-info" onClick={() => setView('coach')}>
              <Icon name="sparkle" size={14}/> Pregúntale a MENTOR-IA
            </button>
          </div>
        </div>
      </section>

      {/* STATS SLIM · estilo dashboard Sprinklr */}
      <div className="cine-stats">
        {[
          { n: '3/41',  l: 'Think Pills completadas', icon: 'check', color: 'var(--bn-lime)' },
          { n: '15%',   l: 'Progreso en tu ruta',     icon: 'trend', color: 'var(--accent-glow)' },
          { n: '22 min',l: 'Tiempo de formación',     icon: 'clock', color: 'var(--bn-blue)' },
          { n: '41',    l: 'Think Pills en total',    icon: 'bolt',  color: 'var(--bn-purple)' },
        ].map((s, i) => (
          <button key={i} className="cine-stat" onClick={() => setView('dashboard')}>
            <span className="cine-stat-icon" style={{background: s.color + '18', color: s.color}}>
              <Icon name={s.icon} size={14}/>
            </span>
            <div>
              <div className="cine-stat-n">{s.n}</div>
              <div className="cine-stat-l">{s.l}</div>
            </div>
          </button>
        ))}
      </div>

      {/* CONTINÚA · si hay progreso */}
      {inProgress.length > 0 && (
        <CineRow title="Continúa" emTitle={`donde lo dejaste, ${firstName}`} onSeeAll={() => setView('path')}>
          {inProgress.map(p => <Card key={p.id} {...p} onClick={() => openDetail(p)}/>)}
        </CineRow>
      )}

      {/* RECOMENDADO PARA TI · rol del usuario */}
      <CineRow title="Recomendado para ti" emTitle={`· ${profile.role}`} onSeeAll={() => setView('rutas')}>
        {myPathPills.map(p => <Card key={p.id} {...p} onClick={() => openDetail(p)}/>)}
      </CineRow>

      {/* TRENDING ESTA SEMANA */}
      <CineRow title="Trending" emTitle="esta semana en Repsol" onSeeAll={() => setView('browse')}>
        {trendingPills.map((p, i) => (
          <div key={p.id} className="cine-card-trending">
            <span className="cine-trending-num">{i + 1}</span>
            <Card {...p} onClick={() => openDetail(p)}/>
          </div>
        ))}
      </CineRow>

      {/* RUTAS DE APRENDIZAJE · big colored cards */}
      <CineRow title="Rutas" emTitle="de certificación por rol" onSeeAll={() => setView('rutas')}>
        {(window.LEARNING_PATHS || [
          {id:'fundamentals', label:'Fundamentals', color:'#0072BE', bg:'linear-gradient(135deg,#0072BE,#004d8a)', icon:'🎓', pills:8, desc:'Base obligatoria · 6 pills · 22 min'},
          {id:'publish-agent', label:'Publish Agent', color:'#BD2882', bg:'linear-gradient(135deg,#BD2882,#7a1456)', icon:'📢', pills:12, desc:'Para publicación multicanal · 12 pills'},
          {id:'care-agent', label:'Care Agent', color:'#036837', bg:'linear-gradient(135deg,#036837,#024024)', icon:'💬', pills:13, desc:'Atención y SLAs · 13 pills'},
          {id:'managers', label:'Managers', color:'#8A3992', bg:'linear-gradient(135deg,#8A3992,#5a1f6e)', icon:'👑', pills:9, desc:'Gobernanza y aprobación · 9 pills'},
        ]).slice(0, 6).map((p) => (
          <div key={p.id} className="cine-path-card" onClick={() => setView('rutas')} style={{background: p.bg || 'var(--paper-3)'}}>
            <div className="cine-path-icon">{p.icon || '📚'}</div>
            <div className="cine-path-title">{p.label}</div>
            <div className="cine-path-desc">{p.desc || `${p.pills} módulos`}</div>
            <div className="cine-path-cta">Ver ruta →</div>
          </div>
        ))}
      </CineRow>

      {/* MICRO-PILLS · cortas */}
      {shortsAndReels.length > 0 && (
        <CineRow title="Micropíldoras" emTitle="bajo 3 minutos" onSeeAll={() => setView('browse')}>
          {shortsAndReels.map(p => <Card key={p.id} {...p} onClick={() => openDetail(p)}/>)}
        </CineRow>
      )}

      {/* CARE & ANALYTICS · contenido especializado */}
      {careAndAnalytics.length > 0 && (
        <CineRow title="Especializado" emTitle="· Care, Analytics, Integraciones" onSeeAll={() => setView('browse')}>
          {careAndAnalytics.map(p => <Card key={p.id} {...p} onClick={() => openDetail(p)}/>)}
        </CineRow>
      )}

      {/* CATÁLOGO COMPLETO con filtro categorías */}
      <div className="catalog-section">
        <div className="row-head" style={{marginBottom:14}}>
          <h2>Todos los <em>módulos</em></h2>
          <button className="link-btn" onClick={() => setView('browse')}>Ver catálogo completo →</button>
        </div>
        <CategoryBar active={activeCat} setActive={setActiveCat}/>
        <div className="catalog-grid">
          {filtered.slice(0, 12).map(item => <Card key={item.id} {...item} onClick={() => openDetail(item)}/>)}
        </div>
      </div>

      {/* PILLS CON VÍDEO REAL */}
      {PILLS.filter(p => p.yt).length > 0 && (
        <CineRow title="Think Pills" emTitle="con vídeo">
          {PILLS.filter(p => p.yt).map(p => <Card key={p.id} {...p} onClick={() => openDetail(p)}/>)}
        </CineRow>
      )}

      {/* Quick tips · reels < 1 min */}
      <CineRow title="Tips rápidos" emTitle="menos de 1 minuto">
        {REELS.map(r => <Card key={r.id} {...r} onClick={openPlayer}/>)}
      </CineRow>

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
// ── CineRow · fila horizontal scrolleable estilo Netflix ──────────────────
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
window.Home = Home;
window.PILLS = PILLS; window.SERIES = SERIES; window.REELS = REELS; window.PODCASTS = PODCASTS; window.PATHS = PATHS;
