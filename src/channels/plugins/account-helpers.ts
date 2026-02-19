import type { TheiaOSConfig } from "../../config/config.js";
import { DEFAULT_ACCOUNT_ID } from "../../routing/session-key.js";

export function createAccountListHelpers(channelKey: string) {
  function listConfiguredAccountIds(cfg: TheiaOSConfig): string[] {
    const channel = cfg.channels?.[channelKey];
    const accounts = (channel as Record<string, unknown> | undefined)?.accounts;
    if (!accounts || typeof accounts !== "object") {
      return [];
    }
    return Object.keys(accounts as Record<string, unknown>).filter(Boolean);
  }

  function listAccountIds(cfg: TheiaOSConfig): string[] {
    const ids = listConfiguredAccountIds(cfg);
    if (ids.length === 0) {
      return [DEFAULT_ACCOUNT_ID];
    }
    return ids.toSorted((a, b) => a.localeCompare(b));
  }

  function resolveDefaultAccountId(cfg: TheiaOSConfig): string {
    const ids = listAccountIds(cfg);
    if (ids.includes(DEFAULT_ACCOUNT_ID)) {
      return DEFAULT_ACCOUNT_ID;
    }
    return ids[0] ?? DEFAULT_ACCOUNT_ID;
  }

  return { listConfiguredAccountIds, listAccountIds, resolveDefaultAccountId };
}
