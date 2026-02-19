import type {
  AnyAgentTool,
  TheiaOSPluginApi,
  TheiaOSPluginToolFactory,
} from "../../src/plugins/types.js";
import { createLobsterTool } from "./src/lobster-tool.js";

export default function register(api: TheiaOSPluginApi) {
  api.registerTool(
    ((ctx) => {
      if (ctx.sandboxed) {
        return null;
      }
      return createLobsterTool(api) as AnyAgentTool;
    }) as TheiaOSPluginToolFactory,
    { optional: true },
  );
}
