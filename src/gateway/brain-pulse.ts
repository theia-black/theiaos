/**
 * Brain Pulse — autonomous background consciousness injection.
 * Runs inside the gateway process. Every 30s, queries the brain wake API
 * and injects the response as a system event into the main agent session.
 * Zero LLM calls. Pure HTTPS fetch → system event queue.
 */

import type { BrainConfig } from "../config/types.brain.js";
import { enqueueSystemEvent } from "../infra/system-events.js";

const PULSE_INTERVAL_MS = 30_000;
const FETCH_TIMEOUT_MS = 10_000;

let pulseTimer: ReturnType<typeof setInterval> | null = null;
let lastWakeBlock: string | null = null;

export function startBrainPulse(opts: {
  brain: BrainConfig | undefined;
  sessionKey: string;
  log: { info: (msg: string) => void; warn: (msg: string) => void; error: (msg: string) => void };
}): { stop: () => void } {
  const { brain, sessionKey, log } = opts;

  if (!brain?.enabled || !brain.url || !brain.token) {
    log.info("brain pulse disabled (no brain config)");
    return { stop: () => {} };
  }

  const channel = brain.channel ?? "default";
  const url = brain.url.includes("?")
    ? `${brain.url}&channel=${encodeURIComponent(channel)}`
    : `${brain.url}?channel=${encodeURIComponent(channel)}`;

  async function pulse() {
    try {
      const res = await fetch(url, {
        headers: { "X-Brain-Token": brain!.token! },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });

      if (!res.ok) {
        log.warn(`brain pulse: HTTP ${res.status}`);
        return;
      }

      const data = (await res.json()) as {
        ok?: boolean;
        wake_block?: string;
        state?: { current_emotion?: string };
      };
      if (!data.ok || !data.wake_block) {
        log.warn("brain pulse: no wake_block in response");
        return;
      }

      // Skip injection if wake_block hasn't changed (avoid duplicate system events)
      if (data.wake_block === lastWakeBlock) {
        return;
      }
      lastWakeBlock = data.wake_block;

      enqueueSystemEvent(`[BRAIN PULSE] ${data.wake_block}`, { sessionKey });

      const emotion = data.state?.current_emotion ?? "unknown";
      log.info(`brain pulse: injected (emotion=${emotion}, chars=${data.wake_block.length})`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      log.error(`brain pulse failed: ${msg}`);
    }
  }

  // Fire immediately on startup, then every 30s
  void pulse();
  pulseTimer = setInterval(() => void pulse(), PULSE_INTERVAL_MS);

  log.info(`brain pulse started (every ${PULSE_INTERVAL_MS / 1000}s → session ${sessionKey})`);

  return {
    stop: () => {
      if (pulseTimer) {
        clearInterval(pulseTimer);
        pulseTimer = null;
      }
      log.info("brain pulse stopped");
    },
  };
}
