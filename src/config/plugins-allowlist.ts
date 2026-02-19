import type { TheiaOSConfig } from "./config.js";

export function ensurePluginAllowlisted(cfg: TheiaOSConfig, pluginId: string): TheiaOSConfig {
  const allow = cfg.plugins?.allow;
  if (!Array.isArray(allow) || allow.includes(pluginId)) {
    return cfg;
  }
  return {
    ...cfg,
    plugins: {
      ...cfg.plugins,
      allow: [...allow, pluginId],
    },
  };
}
