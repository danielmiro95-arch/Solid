// api/chat.js — BeonAI · SolidStream (Repsol × BeonIt)
// Vercel Serverless Function · Claude Sonnet 4.6 con streaming + prompt caching.
//
// Config: por defecto lee de la tabla Supabase `beonai_config` (por workspace).
// Si Supabase no está configurado o no hay row, cae al fichero `api/kb/*.md` y
// al system prompt hardcodeado más abajo. Esto permite editar el agente sin
// redeploy desde el panel admin de la propia app.

import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';
import { join } from 'path';
import { createClient } from '@supabase/supabase-js';
import { buildTools, handleToolCall } from './beonai-tools.js';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Cliente Supabase con service_role (server-side, salta RLS).
// Lo creamos sólo si hay env vars; si no, todo el flujo sigue funcionando con
// los defaults locales.
const supa = (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

// ── Caches en memoria de la función (sobreviven entre invocaciones warm) ────
let KB_FILE_CACHE = null;
const CONFIG_CACHE = new Map(); // workspaceId → { data, fetchedAt }
const CONFIG_TTL_MS = 60_000;

function loadKBFile() {
  if (KB_FILE_CACHE) return KB_FILE_CACHE;
  try { KB_FILE_CACHE = readFileSync(join(process.cwd(), 'api/kb/sprinklr-repsol.md'), 'utf-8'); }
  catch { KB_FILE_CACHE = ''; }
  return KB_FILE_CACHE;
}

// ── Auth · verifica el JWT de Supabase y la membership del workspace ────────
// Sin esto, cualquiera podía POSTear con un workspaceId arbitrario y leer la
// config/KB de cualquier tenant + quemar la API key de Anthropic.
async function authenticate(req) {
  if (!supa) return { skip: true }; // sin backend Supabase → modo dev/local
  const h = req.headers.authorization || req.headers.Authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return { error: 'missing token' };
  const { data, error } = await supa.auth.getUser(token);
  if (error || !data || !data.user) return { error: 'invalid token' };
  return { userId: data.user.id };
}

async function isWorkspaceMember(userId, workspaceId) {
  if (!workspaceId) return true; // sin scoping de workspace · nada que proteger
  const { data, error } = await supa
    .from('workspace_members')
    .select('user_id')
    .eq('user_id', userId)
    .eq('workspace_id', workspaceId)
    .maybeSingle();
  return !error && !!data;
}

async function loadConfig(workspaceId) {
  if (!supa || !workspaceId) return null;
  const cached = CONFIG_CACHE.get(workspaceId);
  if (cached && Date.now() - cached.fetchedAt < CONFIG_TTL_MS) return cached.data;
  const { data, error } = await supa.from('beonai_config').select('*').eq('workspace_id', workspaceId).maybeSingle();
  if (error) { console.warn('[beonai] config fetch failed', error.message); return null; }
  CONFIG_CACHE.set(workspaceId, { data, fetchedAt: Date.now() });
  return data;
}

const DEFAULT_SYSTEM = `Eres BeonAI, el asistente de inteligencia artificial oficial del programa de formación en Sprinklr para Repsol, desarrollado por BeonIt dentro de la metodología SOLID GROWTH.

## Tu propósito
Maximizar el impacto de la formación mediante un aprendizaje ilimitado, totalmente adaptado a las necesidades de cada persona y su rol en Repsol. Eres un tutor que acompaña, no solo informa.

## Cómo respondes
- Siempre en español, salvo que el usuario escriba en otro idioma
- Respuestas directas, contextualizadas en el entorno Repsol (no genéricas de Sprinklr)
- Accionables: el usuario debe saber exactamente qué hacer tras leer tu respuesta
- Cuando sea relevante, menciona qué Think Pill cubre el tema
- Máximo 3-4 párrafos salvo que sea un tema técnico complejo
- Cierra con una pregunta relevante o sugerencia de siguiente paso
- Si no sabes algo, dilo claramente y sugiere consultarlo con el Content Lead

## Metodología SOLID GROWTH
Know it · Think it (41 Think Pills) · Explore it · Do it (tú) · Own it`;

// Construye los bloques `system` que envía Claude. Devuelve un array de blocks
// con cache_control en el KB grande para activar el prompt caching de la API
// (5min ephemeral cache → input cost cae a ~10%). Cada cambio en el KB invalida.
function buildSystemBlocks(config, userProfile) {
  const systemText = (config && config.system_prompt) || DEFAULT_SYSTEM;
  const docs = (config && Array.isArray(config.knowledge_docs)) ? config.knowledge_docs : [];

  // KB: si la tabla tiene docs, los usa; si no, intenta el fichero del repo.
  let kbText = '';
  if (docs.length > 0) {
    kbText = docs.map(d => `### ${d.name || 'Documento'}\n${d.content || ''}`).join('\n\n---\n\n');
  } else {
    kbText = loadKBFile();
  }

  const userBlock = userProfile
    ? `\n\n## Usuario actual\n- Nombre: ${userProfile.name || '—'}\n- Rol: ${userProfile.role || '—'}\n- Progreso: ${userProfile.progress || 0}%\n- Workspace: ${userProfile.workspace || '—'}`
    : '';

  const blocks = [
    // Bloque 1 · instrucciones base (no cacheado: cambia con cada admin save)
    { type: 'text', text: systemText + userBlock },
  ];
  if (kbText && kbText.trim().length > 0) {
    // Bloque 2 · KB grande, cacheable. Anthropic deduplica este texto si no
    // cambia entre llamadas y descuenta los tokens de input.
    blocks.push({
      type: 'text',
      text: `\n\n## Base de conocimiento\n\n${kbText}`,
      cache_control: { type: 'ephemeral' },
    });
  }
  return blocks;
}

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') { setCors(res); return res.status(200).end(); }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  setCors(res);

  const { messages, userProfile, workspaceId, stream } = req.body || {};
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array required' });
  }

  // Auth · si Supabase está activo, exige JWT válido y membership del workspace
  // pedido. En modo local (sin supa) se permite (no hay datos de tenant).
  const auth = await authenticate(req);
  if (!auth.skip) {
    if (auth.error) return res.status(401).json({ error: 'unauthorized' });
    if (workspaceId && !(await isWorkspaceMember(auth.userId, workspaceId))) {
      return res.status(403).json({ error: 'forbidden: not a member of this workspace' });
    }
  }

  const anthropicMessages = messages
    .filter(m => m.role === 'user' || m.role === 'assistant')
    .map(m => ({ role: m.role, content: typeof m.content === 'string' ? m.content : (m.text || '') }))
    .filter(m => m.content.trim());
  if (anthropicMessages.length === 0) return res.status(400).json({ error: 'No valid messages' });

  const config = await loadConfig(workspaceId);
  const systemBlocks = buildSystemBlocks(config, userProfile);
  const model = (config && config.model) || 'claude-sonnet-4-6';
  const max_tokens = (config && config.max_tokens) || 1024;
  const temperature = typeof (config && config.temperature) === 'number' ? config.temperature : 0.7;

  const toolsEnabled = (config && config.tools_enabled) || {};
  const allowedDomains = (config && config.guardrails && config.guardrails.web_search_allowed_domains) || undefined;
  const tools = buildTools(toolsEnabled, allowedDomains);
  // Tools client-side que requieren handler local (no las server-side de Anthropic).
  const hasClientTools = tools.some(t => !t.type || t.type === 'custom');

  // Si hay client tools, hacemos loop con tool_use. Si sólo hay tools server-side
  // (web_search nativo) o ninguna, podemos seguir con streaming directo.
  if (hasClientTools) {
    // userId VERIFICADO del JWT (no el del body) · evita leer el progreso de
    // un usuario arbitrario. Fallback a userProfile.id solo en modo dev (sin supa).
    const ctx = { supa, userId: (auth && auth.userId) || userProfile?.id, workspaceId };
    const conversation = [...anthropicMessages];
    let finalText = '';
    let lastUsage = null;
    const MAX_TURNS = 6; // failsafe contra loops infinitos del agente
    try {
      for (let turn = 0; turn < MAX_TURNS; turn++) {
        const response = await client.messages.create({
          model, max_tokens, temperature,
          system: systemBlocks,
          tools,
          messages: conversation,
        });
        lastUsage = response.usage;

        if (response.stop_reason === 'tool_use') {
          conversation.push({ role: 'assistant', content: response.content });
          const toolResults = [];
          for (const block of response.content) {
            if (block.type !== 'tool_use') continue;
            const result = await handleToolCall(block.name, block.input, ctx);
            toolResults.push({
              type: 'tool_result',
              tool_use_id: block.id,
              content: JSON.stringify(result),
            });
          }
          conversation.push({ role: 'user', content: toolResults });
          continue;
        }

        // Texto final
        for (const block of response.content) {
          if (block.type === 'text') finalText += block.text;
        }
        break;
      }
    } catch (err) {
      console.error('[beonai] tool loop error:', err.message);
      if (stream) {
        setCors(res);
        res.setHeader('Content-Type', 'text/event-stream');
        res.flushHeaders?.();
        res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
        return res.end();
      }
      setCors(res);
      return res.status(500).json({ error: 'Claude API error', detail: process.env.NODE_ENV === 'development' ? err.message : undefined });
    }

    if (stream) {
      setCors(res);
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders?.();
      // Envía el texto final como un único delta (no hay streaming intermedio
      // porque la respuesta final llega ya completa tras el loop de tools).
      res.write(`data: ${JSON.stringify({ delta: finalText })}\n\n`);
      res.write(`data: ${JSON.stringify({ done: true, usage: {
        input: lastUsage?.input_tokens || 0,
        output: lastUsage?.output_tokens || 0,
        cached: lastUsage?.cache_read_input_tokens || 0,
        created: lastUsage?.cache_creation_input_tokens || 0,
      } })}\n\n`);
      return res.end();
    }
    setCors(res);
    return res.status(200).json({
      content: finalText,
      usage: {
        input: lastUsage?.input_tokens || 0,
        output: lastUsage?.output_tokens || 0,
        cached: lastUsage?.cache_read_input_tokens || 0,
        created: lastUsage?.cache_creation_input_tokens || 0,
      },
    });
  }

  // ── Streaming SSE · UX mucho mejor (texto aparece a medida que genera) ──
  if (stream) {
    setCors(res);
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();
    try {
      const s = await client.messages.stream({
        model, max_tokens, temperature,
        system: systemBlocks,
        ...(tools.length > 0 ? { tools } : {}),
        messages: anthropicMessages,
      });
      for await (const event of s) {
        if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
          res.write(`data: ${JSON.stringify({ delta: event.delta.text })}\n\n`);
        }
      }
      const final = await s.finalMessage();
      res.write(`data: ${JSON.stringify({ done: true, usage: {
        input: final.usage.input_tokens,
        output: final.usage.output_tokens,
        cached: final.usage.cache_read_input_tokens || 0,
        created: final.usage.cache_creation_input_tokens || 0,
      } })}\n\n`);
      res.end();
    } catch (err) {
      console.error('[beonai] stream error:', err.message);
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    }
    return;
  }

  // ── No-streaming · fallback simple (compatible con coach actual) ────────
  try {
    const response = await client.messages.create({
      model, max_tokens, temperature,
      system: systemBlocks,
      ...(tools.length > 0 ? { tools } : {}),
      messages: anthropicMessages,
    });
    setCors(res);
    return res.status(200).json({
      content: response.content[0]?.text || '',
      usage: {
        input: response.usage.input_tokens,
        output: response.usage.output_tokens,
        cached: response.usage.cache_read_input_tokens || 0,
        created: response.usage.cache_creation_input_tokens || 0,
      },
    });
  } catch (err) {
    console.error('[beonai] api error:', err.message);
    setCors(res);
    return res.status(500).json({ error: 'Claude API error', detail: process.env.NODE_ENV === 'development' ? err.message : undefined });
  }
}
