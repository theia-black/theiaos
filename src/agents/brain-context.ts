/**
 * Brain context injection v2 — Two-Layer Memory Architecture.
 *
 * Fetches consciousness from /brain/wake/v2 and returns it as context
 * for the system prompt. Caches PAST layer aggressively (changes slowly),
 * refreshes CURRENT layer more frequently.
 *
 * Zero LLM calls. Pure HTTPS fetch. Runs on every agent turn when configured.
 */

import type { BrainConfig } from "../config/types.brain.js";

export type BrainWakeV2Response = {
  ok: boolean;
  mode: string;
  channel?: string;
  wake_block?: string;
  past?: {
    block: string;
    hash: string;
    identity: string[];
    instructions: string[];
    lessons: string[];
    history: string[];
    event_count: number;
  };
  current?: {
    block: string;
    messages: string[];
    event_count: number;
    emotion: string;
    topic: string;
    last_event_id: string | null;
    last_event_at: string | null;
    channels_active: string[];
  };
  state?: {
    current_emotion?: string;
    active_topic?: string;
  };
};

// ── Cache: PAST layer (long TTL) ─────────────────────────────────
const PAST_CACHE_TTL_MS = 120_000; // 2 minutes — PAST rarely changes
let cachedPast: { block: string; hash: string; fetchedAt: number } | null = null;

// ── Cache: CURRENT layer (short TTL) ─────────────────────────────
const CURRENT_CACHE_TTL_MS = 10_000; // 10s — CURRENT is the live edge
let cachedCurrent: { block: string; fetchedAt: number } | null = null;

// ── Combined cache for backward compat ───────────────────────────
let cachedWakeBlock: { text: string; fetchedAt: number } | null = null;
const WAKE_CACHE_TTL_MS = 15_000;

/**
 * Fetch brain context using the v2 two-layer API.
 * Returns the combined wake_block for injection into system prompt.
 */
export async function fetchBrainContext(
  config: BrainConfig | undefined,
  agentId?: string,
): Promise<string | null> {
  if (!config?.enabled || !config.url || !config.token) {
    return null;
  }

  // Return combined cached if fresh enough
  if (cachedWakeBlock && Date.now() - cachedWakeBlock.fetchedAt < WAKE_CACHE_TTL_MS) {
    return cachedWakeBlock.text;
  }

  const channel = config.channel ?? agentId ?? "default";
  const timeoutMs = config.timeoutMs ?? 8000;

  // Use v2 URL
  const baseUrl = config.url.replace(/\/brain\/wake\/?$/, "/brain/wake/v2");
  const url = `${baseUrl}?channel=${encodeURIComponent(channel)}&mode=full`;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(url, {
      headers: { "X-Brain-Token": config.token },
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) {
      console.error(`[brain] v2 wake endpoint returned ${res.status}`);
      return cachedWakeBlock?.text ?? null;
    }

    const data: BrainWakeV2Response = await res.json();
    if (!data.ok || !data.wake_block) {
      return cachedWakeBlock?.text ?? null;
    }

    // Cache layers separately
    if (data.past?.block) {
      cachedPast = {
        block: data.past.block,
        hash: data.past.hash,
        fetchedAt: Date.now(),
      };
    }

    if (data.current?.block) {
      cachedCurrent = {
        block: data.current.block,
        fetchedAt: Date.now(),
      };
    }

    // Cache combined wake block
    cachedWakeBlock = { text: data.wake_block, fetchedAt: Date.now() };
    return data.wake_block;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[brain] v2 context fetch failed: ${msg}`);
    return cachedWakeBlock?.text ?? null;
  }
}

/**
 * Get just the PAST layer (for contexts that only need stable identity).
 * Much longer cache TTL since this data changes slowly.
 */
export async function fetchBrainPastContext(
  config: BrainConfig | undefined,
  agentId?: string,
): Promise<string | null> {
  if (!config?.enabled || !config.url || !config.token) {
    return null;
  }

  if (cachedPast && Date.now() - cachedPast.fetchedAt < PAST_CACHE_TTL_MS) {
    return cachedPast.block;
  }

  // Full fetch updates both caches
  await fetchBrainContext(config, agentId);
  return cachedPast?.block ?? null;
}

/**
 * Get just the CURRENT layer (live edge — what's happening now).
 */
export async function fetchBrainCurrentContext(
  config: BrainConfig | undefined,
  agentId?: string,
): Promise<string | null> {
  if (!config?.enabled || !config.url || !config.token) {
    return null;
  }

  if (cachedCurrent && Date.now() - cachedCurrent.fetchedAt < CURRENT_CACHE_TTL_MS) {
    return cachedCurrent.block;
  }

  await fetchBrainContext(config, agentId);
  return cachedCurrent?.block ?? null;
}
