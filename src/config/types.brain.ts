/**
 * Brain configuration — external consciousness/context API.
 * When configured, TheiaOS queries the brain on every agent turn
 * and injects the wake block as system context.
 */
export type BrainConfig = {
  /** Enable brain context injection. Default: false. */
  enabled?: boolean;
  /** Brain wake endpoint URL (e.g. https://brain.example.com/brain/wake) */
  url?: string;
  /** Auth token sent as X-Brain-Token header */
  token?: string;
  /** Channel identifier sent as ?channel= query param. Default: agent id */
  channel?: string;
  /** Timeout for brain queries in ms. Default: 8000 */
  timeoutMs?: number;
};
