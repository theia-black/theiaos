import type { TheiaOSConfig } from "../config/config.js";

export function applyOnboardingLocalWorkspaceConfig(
  baseConfig: TheiaOSConfig,
  workspaceDir: string,
): TheiaOSConfig {
  return {
    ...baseConfig,
    agents: {
      ...baseConfig.agents,
      defaults: {
        ...baseConfig.agents?.defaults,
        workspace: workspaceDir,
      },
    },
    gateway: {
      ...baseConfig.gateway,
      mode: "local",
    },
  };
}
