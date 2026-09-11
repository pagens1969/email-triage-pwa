// POST /api/run-now — starts the "Email Triage" scheduled task (Claude Code routine) right away.
// The routine applies decisions made in Pigeonhole to Gmail and sweeps new inbox mail into Pending.
//
// Setup (Netlify → Site configuration → Environment variables):
//   ROUTINE_TOKEN  the routine's API trigger token (claude.ai/code/routines → Pigeonhole – Run sweep now → Edit → API trigger → Generate token)
//   ROUTINE_ID     optional; defaults to the Email Triage routine below
//
// Only a caller holding a working Airtable token for the Email Triage base can start a run,
// so the public URL can't be used by anyone else to burn through the daily run allowance.

const BASE = 'appxjiuh85jwY8bKO';
const CATEGORIES_TABLE = 'tblcfRSlMxBl5d0Yu';
// The "Pigeonhole – Run sweep now" routine (claude.ai/code/routines) — an API-triggered copy of
// the scheduled Cowork task's instructions. Cowork scheduled tasks can't have API triggers.
const DEFAULT_ROUTINE_ID = 'trig_01UZUnQjiLDzB5khTm65zdSi';

const json = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

export default async (req) => {
  if (req.method !== 'POST') return json(405, { error: 'method_not_allowed' });

  const routineToken = (process.env.ROUTINE_TOKEN || '').trim();
  const routineId = (process.env.ROUTINE_ID || DEFAULT_ROUTINE_ID).trim();
  if (!routineToken) return json(503, { error: 'not_configured' });

  const pat = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim();
  if (!/^pat\w{8,}\.\w{20,}$/.test(pat)) return json(401, { error: 'missing_airtable_token' });

  try {
    const check = await fetch(`https://api.airtable.com/v0/${BASE}/${CATEGORIES_TABLE}?pageSize=1`, {
      headers: { Authorization: `Bearer ${pat}` },
    });
    if (!check.ok) return json(403, { error: 'airtable_rejected', status: check.status });
  } catch (e) {
    return json(502, { error: 'airtable_unreachable' });
  }

  let res;
  try {
    res = await fetch(`https://api.anthropic.com/v1/claude_code/routines/${encodeURIComponent(routineId)}/fire`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${routineToken}`,
        'anthropic-beta': 'experimental-cc-routine-2026-04-01',
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: '{}',
    });
  } catch (e) {
    return json(502, { error: 'routine_unreachable' });
  }
  const text = await res.text();
  if (!res.ok) return json(502, { error: 'fire_failed', status: res.status, detail: text.slice(0, 300) });
  let data = {};
  try { data = JSON.parse(text); } catch (e) { /* non-JSON success body */ }
  return json(200, { ok: true, session_url: data.claude_code_session_url || null });
};

export const config = { path: '/api/run-now' };
