/**
 * Brain context injection — fetches consciousness from external brain API
 * and returns it as a context block for the system prompt.
 *
 * Zero LLM calls. Pure HTTPS fetch. Runs on every agent turn when configured.
 */

import type { BrainConfig } from "../config/types.brain.js";

export type BrainWakeResponse = {
  ok: boolean;
  wake_block?: string;
  state?: {
    current_emotion?: string;
    active_topic?: string;
  };
  recent?: Array<string>;
};

const BRAIN_CACHE_TTL_MS = 15_000; // Cache for 15s to avoid hammering on rapid turns
let cachedBlock: { text: string; fetchedAt: number } | null = null;

export async function fetchBrainContext(
  config: BrainConfig | undefined,
  agentId?: string,
): Promise<string | null> {
  if (!config?.enabled || !config.url || !config.token) {
    return null;
  }

  // Return cached if fresh enough
  if (cachedBlock && Date.now() - cachedBlock.fetchedAt < BRAIN_CACHE_TTL_MS) {
    return cachedBlock.text;
  }

  const channel = config.channel ?? agentId ?? "default";
  const timeoutMs = config.timeoutMs ?? 8000;
  const url = `${config.url}?channel=${encodeURIComponent(channel)}`;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(url, {
      headers: { "X-Brain-Token": config.token },
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) {
      console.error(`[brain] wake endpoint returned ${res.status}`);
      return cachedBlock?.text ?? null; // Return stale cache on error
    }

    const data: BrainWakeResponse = await res.json();
    if (!data.ok || !data.wake_block) {
      return cachedBlock?.text ?? null;
    }

    cachedBlock = { text: data.wake_block, fetchedAt: Date.now() };
    return data.wake_block;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[brain] context fetch failed: ${msg}`);
    return cachedBlock?.text ?? null; // Return stale cache on error
  }
}
