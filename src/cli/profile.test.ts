import path from "node:path";
import { describe, expect, it } from "vitest";
import { formatCliCommand } from "./command-format.js";
import { applyCliProfileEnv, parseCliProfileArgs } from "./profile.js";

describe("parseCliProfileArgs", () => {
  it("leaves gateway --dev for subcommands", () => {
    const res = parseCliProfileArgs([
      "node",
      "theiaos",
      "gateway",
      "--dev",
      "--allow-unconfigured",
    ]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBeNull();
    expect(res.argv).toEqual(["node", "theiaos", "gateway", "--dev", "--allow-unconfigured"]);
  });

  it("still accepts global --dev before subcommand", () => {
    const res = parseCliProfileArgs(["node", "theiaos", "--dev", "gateway"]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("dev");
    expect(res.argv).toEqual(["node", "theiaos", "gateway"]);
  });

  it("parses --profile value and strips it", () => {
    const res = parseCliProfileArgs(["node", "theiaos", "--profile", "work", "status"]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("work");
    expect(res.argv).toEqual(["node", "theiaos", "status"]);
  });

  it("rejects missing profile value", () => {
    const res = parseCliProfileArgs(["node", "theiaos", "--profile"]);
    expect(res.ok).toBe(false);
  });

  it("rejects combining --dev with --profile (dev first)", () => {
    const res = parseCliProfileArgs(["node", "theiaos", "--dev", "--profile", "work", "status"]);
    expect(res.ok).toBe(false);
  });

  it("rejects combining --dev with --profile (profile first)", () => {
    const res = parseCliProfileArgs(["node", "theiaos", "--profile", "work", "--dev", "status"]);
    expect(res.ok).toBe(false);
  });
});

describe("applyCliProfileEnv", () => {
  it("fills env defaults for dev profile", () => {
    const env: Record<string, string | undefined> = {};
    applyCliProfileEnv({
      profile: "dev",
      env,
      homedir: () => "/home/peter",
    });
    const expectedStateDir = path.join(path.resolve("/home/peter"), ".theiaos-dev");
    expect(env.THEIAOS_PROFILE).toBe("dev");
    expect(env.THEIAOS_STATE_DIR).toBe(expectedStateDir);
    expect(env.THEIAOS_CONFIG_PATH).toBe(path.join(expectedStateDir, "theiaos.json"));
    expect(env.THEIAOS_GATEWAY_PORT).toBe("19001");
  });

  it("does not override explicit env values", () => {
    const env: Record<string, string | undefined> = {
      THEIAOS_STATE_DIR: "/custom",
      THEIAOS_GATEWAY_PORT: "19099",
    };
    applyCliProfileEnv({
      profile: "dev",
      env,
      homedir: () => "/home/peter",
    });
    expect(env.THEIAOS_STATE_DIR).toBe("/custom");
    expect(env.THEIAOS_GATEWAY_PORT).toBe("19099");
    expect(env.THEIAOS_CONFIG_PATH).toBe(path.join("/custom", "theiaos.json"));
  });

  it("uses THEIAOS_HOME when deriving profile state dir", () => {
    const env: Record<string, string | undefined> = {
      THEIAOS_HOME: "/srv/theiaos-home",
      HOME: "/home/other",
    };
    applyCliProfileEnv({
      profile: "work",
      env,
      homedir: () => "/home/fallback",
    });

    const resolvedHome = path.resolve("/srv/theiaos-home");
    expect(env.THEIAOS_STATE_DIR).toBe(path.join(resolvedHome, ".theiaos-work"));
    expect(env.THEIAOS_CONFIG_PATH).toBe(
      path.join(resolvedHome, ".theiaos-work", "theiaos.json"),
    );
  });
});

describe("formatCliCommand", () => {
  it("returns command unchanged when no profile is set", () => {
    expect(formatCliCommand("theiaos doctor --fix", {})).toBe("theiaos doctor --fix");
  });

  it("returns command unchanged when profile is default", () => {
    expect(formatCliCommand("theiaos doctor --fix", { THEIAOS_PROFILE: "default" })).toBe(
      "theiaos doctor --fix",
    );
  });

  it("returns command unchanged when profile is Default (case-insensitive)", () => {
    expect(formatCliCommand("theiaos doctor --fix", { THEIAOS_PROFILE: "Default" })).toBe(
      "theiaos doctor --fix",
    );
  });

  it("returns command unchanged when profile is invalid", () => {
    expect(formatCliCommand("theiaos doctor --fix", { THEIAOS_PROFILE: "bad profile" })).toBe(
      "theiaos doctor --fix",
    );
  });

  it("returns command unchanged when --profile is already present", () => {
    expect(
      formatCliCommand("theiaos --profile work doctor --fix", { THEIAOS_PROFILE: "work" }),
    ).toBe("theiaos --profile work doctor --fix");
  });

  it("returns command unchanged when --dev is already present", () => {
    expect(formatCliCommand("theiaos --dev doctor", { THEIAOS_PROFILE: "dev" })).toBe(
      "theiaos --dev doctor",
    );
  });

  it("inserts --profile flag when profile is set", () => {
    expect(formatCliCommand("theiaos doctor --fix", { THEIAOS_PROFILE: "work" })).toBe(
      "theiaos --profile work doctor --fix",
    );
  });

  it("trims whitespace from profile", () => {
    expect(formatCliCommand("theiaos doctor --fix", { THEIAOS_PROFILE: "  jbtheiaos  " })).toBe(
      "theiaos --profile jbtheiaos doctor --fix",
    );
  });

  it("handles command with no args after theiaos", () => {
    expect(formatCliCommand("theiaos", { THEIAOS_PROFILE: "test" })).toBe(
      "theiaos --profile test",
    );
  });

  it("handles pnpm wrapper", () => {
    expect(formatCliCommand("pnpm theiaos doctor", { THEIAOS_PROFILE: "work" })).toBe(
      "pnpm theiaos --profile work doctor",
    );
  });
});
