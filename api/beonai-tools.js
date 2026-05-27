// api/beonai-tools.js — Definiciones y handlers de los tools que BeonAI
// puede invocar durante una conversación. Cada toggle del panel admin
// (`tools_enabled.X`) decide si la definición se manda a Claude o no.
//
// Tools client-side (handlers ejecutados aquí):
//   - read_user_progress  · lee progreso del usuario actual desde Supabase
//   - search_pill_catalog · busca pills en api/data/pills.json
//
// Tools server-side (ejecutados por Anthropic, sin handler local):
//   - web_search (web_search_20250305) · restringido a `allowed_domains`
//
// Tool stub (devuelve mensaje explicativo, no implementado aún):
//   - search_microsoft_loop · requiere Azure AD app registration

import { readFileSync } from 'fs';
import { join } from 'path';

// Pills cargadas en cold start. Se extraen una vez desde docs/prototype-home.jsx
// y se vuelcan a api/data/pills.json (ver scripts/extract-pills.mjs).
let PILLS_CACHE = null;
function loadPills() {
  if (PILLS_CACHE) return PILLS_CACHE;
  try {
    const txt = readFileSync(join(process.cwd(), 'api/data/pills.json'), 'utf-8');
    PILLS_CACHE = JSON.parse(txt);
  } catch (e) {
    console.warn('[beonai-tools] pills.json not found', e.message);
    PILLS_CACHE = [];
  }
  return PILLS_CACHE;
}

// Construye el array `tools` que se manda a Claude según los toggles del admin.
// `allowedDomains` filtra el web_search nativo (por defecto sólo Sprinklr Help).
export function buildTools(toolsEnabled = {}, allowedDomains) {
  const tools = [];
  if (toolsEnabled.read_user_progress) {
    tools.push({
      name: 'read_user_progress',
      description: 'Lee el progreso actual del usuario que está conversando contigo: nombre, rol, equipo/workspace, total de pills completadas, pills en curso, % global del programa. No requiere parámetros — usa siempre el contexto del usuario autenticado. Úsala cuando el usuario pregunte por su avance, qué le falta, o cómo va.',
      input_schema: { type: 'object', properties: {}, required: [] },
    });
  }
  if (toolsEnabled.search_pill_catalog) {
    tools.push({
      name: 'search_pill_catalog',
      description: 'Busca pills (think pills · píldoras de microlearning de 3-5 min) en el catálogo completo del programa. Devuelve hasta 8 resultados con id, número de pill, título, categoría, duración y nivel. Úsala cuando el usuario pregunte por temas específicos como "macros", "aprobación", "Care Console", etc.',
      input_schema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Palabras clave a buscar en el título o subtítulo. Ej: "macros", "calendario editorial".' },
          category: { type: 'string', description: 'Categoría opcional. Valores válidos: Fundamentos, Estructura, Gobernanza, Social Publish, Activos, Aprobaciones, Compliance, Calendario, Analytics, Care, Integraciones.' },
        },
        required: ['query'],
      },
    });
  }
  if (toolsEnabled.web_search_sprinklr) {
    tools.push({
      type: 'web_search_20250305',
      name: 'web_search',
      max_uses: 3,
      allowed_domains: allowedDomains || ['help.sprinklr.com'],
    });
  }
  if (toolsEnabled.search_microsoft_loop) {
    // Stub · requiere Azure AD app registration y permisos Graph (Sites.Read.All).
    // Cuando esté implementado, leerá de Microsoft Graph search/query API.
    tools.push({
      name: 'search_microsoft_loop',
      description: 'Busca en el workspace de Microsoft Loop de Repsol. ATENCIÓN: aún no está conectado. Si la llamas, devolverá una nota explicando que falta la configuración OAuth de Azure AD.',
      input_schema: {
        type: 'object',
        properties: { query: { type: 'string', description: 'Texto a buscar en Loop.' } },
        required: ['query'],
      },
    });
  }
  return tools;
}

// Ejecuta un tool client-side. ctx contiene { supa, userId, workspaceId }.
// Para tools server-side de Anthropic (web_search), esto NO se llama.
export async function handleToolCall(name, input, ctx) {
  try {
    if (name === 'read_user_progress') return await readUserProgress(ctx);
    if (name === 'search_pill_catalog') return await searchPillCatalog(input, ctx);
    if (name === 'search_microsoft_loop') return {
      ok: false,
      message: 'La integración con Microsoft Loop aún no está activa. Falta registrar la app en Azure AD y configurar permisos Graph (Sites.Read.All, Files.Read.All). Avisa al admin de la plataforma para que complete el setup.',
    };
    return { ok: false, error: `Tool desconocido: ${name}` };
  } catch (e) {
    console.error('[beonai-tool]', name, 'failed:', e.message);
    return { ok: false, error: e.message };
  }
}

async function readUserProgress(ctx) {
  const { supa, userId, workspaceId } = ctx || {};
  if (!supa) return { ok: false, error: 'Backend Supabase no disponible · el agente está en modo local.' };
  if (!userId) return { ok: false, error: 'No hay usuario autenticado en el contexto de la conversación.' };

  // Profile
  const { data: profile } = await supa.from('profiles').select('id,name,role,team,current_workspace_id').eq('id', userId).maybeSingle();

  // Progreso · cuenta completadas vs en curso scopeado al workspace si lo hay
  let progQuery = supa.from('progress').select('pill_id,progress').eq('user_id', userId);
  if (workspaceId) progQuery = progQuery.eq('workspace_id', workspaceId);
  const { data: rows } = await progQuery;

  const pills = loadPills();
  const total = pills.length;
  const completed = (rows || []).filter(r => Number(r.progress) >= 1);
  const inProgress = (rows || []).filter(r => Number(r.progress) > 0 && Number(r.progress) < 1);
  const pct = total > 0 ? Math.round((completed.length / total) * 100) : 0;

  // Lookup titles para los en curso (más útil que solo IDs para el agente)
  const inProgressDetail = inProgress.slice(0, 5).map(r => {
    const p = pills.find(x => x.id === r.pill_id);
    return p ? { id: p.id, pill: p.pill, title: p.title, category: p.category, progress: Math.round(Number(r.progress) * 100) + '%' } : { id: r.pill_id, progress: Math.round(Number(r.progress) * 100) + '%' };
  });

  return {
    ok: true,
    user: {
      name: profile?.name || '—',
      role: profile?.role || '—',
      team: profile?.team || '—',
    },
    progress: {
      total_pills: total,
      completed_count: completed.length,
      in_progress_count: inProgress.length,
      remaining_count: total - completed.length,
      percent: pct,
    },
    in_progress_pills: inProgressDetail,
  };
}

async function searchPillCatalog(input) {
  const query = String(input?.query || '').toLowerCase().trim();
  const category = input?.category ? String(input.category).toLowerCase() : null;
  if (!query) return { ok: false, error: 'query requerido' };

  const pills = loadPills();
  const tokens = query.split(/\s+/).filter(Boolean);
  // Score: +3 título · +1 subtítulo (one) · +2 categoría · cap a 8 resultados.
  const scored = pills.map(p => {
    const hayTitle = (p.title || '').toLowerCase();
    const haySub = (p.one || '').toLowerCase();
    const hayCat = (p.category || '').toLowerCase();
    if (category && !hayCat.includes(category)) return null;
    let score = 0;
    for (const t of tokens) {
      if (hayTitle.includes(t)) score += 3;
      if (haySub.includes(t)) score += 1;
      if (hayCat.includes(t)) score += 2;
    }
    return score > 0 ? { p, score } : null;
  }).filter(Boolean).sort((a, b) => b.score - a.score).slice(0, 8);

  return {
    ok: true,
    query,
    category: category || null,
    results: scored.map(({ p }) => ({
      id: p.id,
      pill_number: p.pill,
      title: p.title,
      summary: p.one,
      category: p.category,
      duration: p.duration,
      level: p.level,
    })),
    count: scored.length,
  };
}
