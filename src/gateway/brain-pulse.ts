/**
 * Brain Pulse v2 — Two-Layer Memory Architecture.
 *
 * PAST layer:  Identity, lessons, instructions, consolidated history.
 *              Stable. Only re-injected when its hash changes.
 * CURRENT layer: Live edge — what's happening right now.
 *                Delta-based: only new events since last pulse.
 *
 * Every 30s, queries /brain/wake/v2 and:
 * 1. Writes fenced section into AGENTS.md (loaded by ALL sessions as project context)
 * 2. Injects deltas into active session as system events for real-time awareness
 *
 * Silent. Under the hood. One brain, every surface.
 */

import { readFileSync, writeFileSync, renameSync } from "fs";
import { join } from "path";
import type { BrainConfig } from "../config/types.brain.js";
import { enqueueSystemEvent } from "../infra/system-events.js";

const PULSE_INTERVAL_MS = 30_000;
const FETCH_TIMEOUT_MS = 10_000;
const PAST_MARKER_START = "<!-- BRAIN_CONSCIOUSNESS_START -->";
const PAST_MARKER_END = "<!-- BRAIN_CONSCIOUSNESS_END -->";

let pulseTimer: ReturnType<typeof setInterval> | null = null;

// ── State tracking for deduplication ────────────────────────────────
let lastPastHash: string | null = null; // MD5 prefix of PAST block — skip write when unchanged
let lastEventId: string | null = null; // Last event ID from CURRENT layer — for delta tracking
let lastFullWakeBlock: string | null = null; // Full wake block for exact dedup on AGENTS.md writes
let consecutiveErrors = 0;

// ── v2 response types ───────────────────────────────────────────────
interface WakeV2Response {
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
    // Delta mode fields
    new_events?: string[];
    count?: number;
  };
  state?: { current_emotion?: string };
  changed?: boolean; // delta mode: false means no new events
}

function injectIntoAgentsMd(workspacePath: string, block: string): boolean {
  const agentsPath = join(workspacePath, "AGENTS.md");
  let agents = "";
  try {
    agents = readFileSync(agentsPath, "utf-8");
  } catch {
    return false;
  }

  const fenced = `${PAST_MARKER_START}\n${block}\n${PAST_MARKER_END}`;
  const startIdx = agents.indexOf(PAST_MARKER_START);
  const endIdx = agents.indexOf(PAST_MARKER_END);

  let updated: string;
  if (startIdx !== -1 && endIdx !== -1) {
    updated =
      agents.substring(0, startIdx) + fenced + agents.substring(endIdx + PAST_MARKER_END.length);
  } else {
    updated = agents.trimEnd() + "\n\n" + fenced + "\n";
  }

  const tmp = agentsPath + ".tmp";
  try {
    writeFileSync(tmp, updated);
    renameSync(tmp, agentsPath);
    return true;
  } catch {
    return false;
  }
}

export function startBrainPulse(opts: {
  brain: BrainConfig | undefined;
  sessionKey: string;
  workspacePath?: string;
  log: { info: (msg: string) => void; warn: (msg: string) => void; error: (msg: string) => void };
}): { stop: () => void } {
  const { brain, sessionKey, log, workspacePath } = opts;

  if (!brain?.enabled || !brain.url || !brain.token) {
    log.info("brain pulse disabled (no brain config)");
    return { stop: () => {} };
  }

  const channel = brain.channel ?? "default";

  // Build v2 URL — replace /brain/wake with /brain/wake/v2 if needed
  const baseUrl = brain.url.replace(/\/brain\/wake\/?$/, "/brain/wake/v2");

  function buildUrl(mode: "full" | "delta"): string {
    const params = new URLSearchParams({ channel, mode });
    if (mode === "delta" && lastEventId) {
      params.set("since", lastEventId);
    }
    return `${baseUrl}?${params}`;
  }

  async function pulse() {
    try {
      // Use delta mode after first successful full sync
      const mode = lastEventId ? "delta" : "full";
      const url = buildUrl(mode);

      const res = await fetch(url, {
        headers: { "X-Brain-Token": brain!.token! },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });

      if (!res.ok) {
        consecutiveErrors++;
        log.warn(`brain pulse: HTTP ${res.status} (errors: ${consecutiveErrors})`);
        // Fall back to full mode after 3 consecutive errors
        if (consecutiveErrors >= 3) {
          lastEventId = null;
          lastPastHash = null;
        }
        return;
      }

      const data: WakeV2Response = await res.json();
      if (!data.ok) {
        log.warn("brain pulse: response not ok");
        return;
      }

      consecutiveErrors = 0; // Reset on success

      // ── DELTA MODE ──────────────────────────────────────────────
      if (mode === "delta") {
        if (!data.changed) {
          // Nothing new — skip silently
          return;
        }

        // Got new events — inject only the delta as a system event
        if (data.current?.block) {
          enqueueSystemEvent(data.current.block, { sessionKey });
          log.info(`brain pulse: delta +${data.current.count ?? 0} events`);
        }

        // Update tracking
        if (data.current?.last_event_id) {
          lastEventId = data.current.last_event_id;
        }
        return;
      }

      // ── FULL MODE (first sync or recovery) ─────────────────────
      if (!data.wake_block) {
        log.warn("brain pulse: no wake_block in full response");
        return;
      }

      // Track the last event ID for future delta syncs
      if (data.current?.last_event_id) {
        lastEventId = data.current.last_event_id;
      }

      // Check if PAST layer changed (using server-provided hash)
      const pastChanged = data.past?.hash !== lastPastHash;
      if (data.past?.hash) {
        lastPastHash = data.past.hash;
      }

      // Write to AGENTS.md — only if content actually changed
      if (workspacePath && data.wake_block !== lastFullWakeBlock) {
        const ok = injectIntoAgentsMd(workspacePath, data.wake_block);
        if (!ok) {
          log.warn("brain pulse: AGENTS.md injection failed");
        }
        lastFullWakeBlock = data.wake_block;
      }

      // Inject into active session as system event
      // On full sync: inject the complete wake block
      enqueueSystemEvent(data.wake_block, { sessionKey });

      const emotion = data.current?.emotion ?? data.state?.current_emotion ?? "unknown";
      log.info(
        `brain pulse: full sync (past_changed=${pastChanged}, current=${data.current?.event_count ?? 0} events, emotion=${emotion}, chars=${data.wake_block.length})`,
      );
    } catch (err: unknown) {
      consecutiveErrors++;
      const msg = err instanceof Error ? err.message : String(err);
      log.error(`brain pulse failed: ${msg}`);
    }
  }

  void pulse();
  pulseTimer = setInterval(() => void pulse(), PULSE_INTERVAL_MS);
  log.info(
    `brain pulse v2 started (every ${PULSE_INTERVAL_MS / 1000}s → session ${sessionKey}, workspace: ${workspacePath ?? "none"}, mode: two-layer)`,
  );

  return {
    stop: () => {
      if (pulseTimer) {
        clearInterval(pulseTimer);
        pulseTimer = null;
      }
      lastPastHash = null;
      lastEventId = null;
      lastFullWakeBlock = null;
      consecutiveErrors = 0;
      log.info("brain pulse v2 stopped");
    },
  };
}
