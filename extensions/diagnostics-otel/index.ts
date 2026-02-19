import type { TheiaOSPluginApi } from "theiaos/plugin-sdk";
import { emptyPluginConfigSchema } from "theiaos/plugin-sdk";
import { createDiagnosticsOtelService } from "./src/service.js";

const plugin = {
  id: "diagnostics-otel",
  name: "Diagnostics OpenTelemetry",
  description: "Export diagnostics events to OpenTelemetry",
  configSchema: emptyPluginConfigSchema(),
  register(api: TheiaOSPluginApi) {
    api.registerService(createDiagnosticsOtelService());
  },
};

export default plugin;
