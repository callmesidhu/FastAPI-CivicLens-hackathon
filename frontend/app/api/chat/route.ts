import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

// Groq client will be instantiated lazily inside the route handler

const API_BASE =
  process.env.BACKEND_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:8000/api';

// ─── Server-side facility cache (2-min TTL) ───────────────────────────────────
// Avoids a backend round-trip on every single message.
interface CachedFacilities {
  context: string;
  expiresAt: number;
}
const facilityCache = new Map<string, CachedFacilities>();
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes

/** Return compact 1-line facility context, cached per location bucket. */
async function getFacilityContext(lat: number | null, lng: number | null): Promise<string> {
  // Bucket to ~0.01 degrees (~1 km) so nearby users share the same cache entry
  const key = lat != null && lng != null ? `${lat.toFixed(2)},${lng.toFixed(2)}` : 'all';
  const cached = facilityCache.get(key);
  if (cached && Date.now() < cached.expiresAt) return cached.context;

  try {
    // Fetch nearby facilities when GPS is available, otherwise use the full facility list.
    const url = lat != null && lng != null
      ? `${API_BASE}/facilities/nearby?lat=${lat}&lng=${lng}&radius=5000&limit=5`
      : `${API_BASE}/facilities?limit=5`;
    const res = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    const facilities: Array<{
      name: string; type: string; address: string;
      condition: string; availability: string;
      distanceMeters?: number;
      accessibility?: { wheelchairAccessible: boolean };
    }> = (json.data ?? []).slice(0, 60);

    if (!facilities.length) return 'No facility data available.';

    // Compact single-line format — ~60 tokens per facility vs ~120 before
    const context = facilities.map((f, i) => {
      const type  = f.type === 'toilet' ? 'TOILET' : 'WATER';
      const dist  = f.distanceMeters != null ? `${Math.round(f.distanceMeters)}m` : '?m';
      const wc    = f.accessibility?.wheelchairAccessible ? 'WC✓' : '';
      return `${i + 1}. [${type}] ${f.name} | ${f.address} | ${f.condition} | ${dist} ${wc}`.trim();
    }).join('\n');

    facilityCache.set(key, { context, expiresAt: Date.now() + CACHE_TTL_MS });
    return context;
  } catch (err) {
    console.error('[CivicCare AI] Facility fetch failed:', err);
    // Return stale cache if available rather than failing completely
    return facilityCache.get(key)?.context ?? 'Facility data temporarily unavailable.';
  }
}

function buildSystemPrompt(facilityContext: string): string {
  return `You are CivicCare AI for CivicLens, Kochi. Answer ONLY civic facility questions (toilets, water points, reporting, tickets). Decline everything else.
Rules: use ONLY the data below. Be concise — max 2 short sentences. No bullet lists unless asked.
Conditions: clean=ok, usable=ok, broken/locked/no_water=problem.

LIVE FACILITIES:
${facilityContext}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, userLat, userLng } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Invalid messages' }, { status: 400 });
    }

    const lat = typeof userLat === 'number' ? userLat : null;
    const lng = typeof userLng === 'number' ? userLng : null;

    // Run facility fetch and LLM call concurrently where possible
    const facilityContext = await getFacilityContext(lat, lng);
    const systemPrompt = buildSystemPrompt(facilityContext);

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || 'dummy_build_key' });

    const completion = await groq.chat.completions.create({
      model: 'qwen/qwen3.8-27b',     // only confirmed-working model on this account
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.slice(-6),        // last 3 turns only (was 10)
      ],
      max_tokens: 160,                // was 450 — short focused answers
      temperature: 0.3,
      stream: false,
    });

    const reply =
      completion.choices[0]?.message?.content?.trim() ||
      'Sorry, no response generated.';

    return NextResponse.json({ reply });
  } catch (err: unknown) {
    console.error('[CivicCare AI] Error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
