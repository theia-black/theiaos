import { describe, expect, it } from "vitest";
import { formatPluginSourceForTable } from "./source-display.js";

describe("formatPluginSourceForTable", () => {
  it("shortens bundled plugin sources under the stock root", () => {
    const out = formatPluginSourceForTable(
      {
        origin: "bundled",
        source: "/opt/homebrew/lib/node_modules/theiaos/extensions/bluebubbles/index.ts",
      },
      {
        stock: "/opt/homebrew/lib/node_modules/theiaos/extensions",
        global: "/Users/x/.theiaos/extensions",
        workspace: "/Users/x/ws/.theiaos/extensions",
      },
    );
    expect(out.value).toBe("stock:bluebubbles/index.ts");
    expect(out.rootKey).toBe("stock");
  });

  it("shortens workspace plugin sources under the workspace root", () => {
    const out = formatPluginSourceForTable(
      {
        origin: "workspace",
        source: "/Users/x/ws/.theiaos/extensions/matrix/index.ts",
      },
      {
        stock: "/opt/homebrew/lib/node_modules/theiaos/extensions",
        global: "/Users/x/.theiaos/extensions",
        workspace: "/Users/x/ws/.theiaos/extensions",
      },
    );
    expect(out.value).toBe("workspace:matrix/index.ts");
    expect(out.rootKey).toBe("workspace");
  });

  it("shortens global plugin sources under the global root", () => {
    const out = formatPluginSourceForTable(
      {
        origin: "global",
        source: "/Users/x/.theiaos/extensions/zalo/index.js",
      },
      {
        stock: "/opt/homebrew/lib/node_modules/theiaos/extensions",
        global: "/Users/x/.theiaos/extensions",
        workspace: "/Users/x/ws/.theiaos/extensions",
      },
    );
    expect(out.value).toBe("global:zalo/index.js");
    expect(out.rootKey).toBe("global");
  });
});
