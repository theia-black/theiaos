import { describe, expect, it } from "vitest";
import {
  buildParseArgv,
  getFlagValue,
  getCommandPath,
  getPrimaryCommand,
  getPositiveIntFlagValue,
  getVerboseFlag,
  hasHelpOrVersion,
  hasFlag,
  shouldMigrateState,
  shouldMigrateStateFromPath,
} from "./argv.js";

describe("argv helpers", () => {
  it("detects help/version flags", () => {
    expect(hasHelpOrVersion(["node", "theiaos", "--help"])).toBe(true);
    expect(hasHelpOrVersion(["node", "theiaos", "-V"])).toBe(true);
    expect(hasHelpOrVersion(["node", "theiaos", "status"])).toBe(false);
  });

  it("extracts command path ignoring flags and terminator", () => {
    expect(getCommandPath(["node", "theiaos", "status", "--json"], 2)).toEqual(["status"]);
    expect(getCommandPath(["node", "theiaos", "agents", "list"], 2)).toEqual(["agents", "list"]);
    expect(getCommandPath(["node", "theiaos", "status", "--", "ignored"], 2)).toEqual(["status"]);
  });

  it("returns primary command", () => {
    expect(getPrimaryCommand(["node", "theiaos", "agents", "list"])).toBe("agents");
    expect(getPrimaryCommand(["node", "theiaos"])).toBeNull();
  });

  it("parses boolean flags and ignores terminator", () => {
    expect(hasFlag(["node", "theiaos", "status", "--json"], "--json")).toBe(true);
    expect(hasFlag(["node", "theiaos", "--", "--json"], "--json")).toBe(false);
  });

  it("extracts flag values with equals and missing values", () => {
    expect(getFlagValue(["node", "theiaos", "status", "--timeout", "5000"], "--timeout")).toBe(
      "5000",
    );
    expect(getFlagValue(["node", "theiaos", "status", "--timeout=2500"], "--timeout")).toBe(
      "2500",
    );
    expect(getFlagValue(["node", "theiaos", "status", "--timeout"], "--timeout")).toBeNull();
    expect(getFlagValue(["node", "theiaos", "status", "--timeout", "--json"], "--timeout")).toBe(
      null,
    );
    expect(getFlagValue(["node", "theiaos", "--", "--timeout=99"], "--timeout")).toBeUndefined();
  });

  it("parses verbose flags", () => {
    expect(getVerboseFlag(["node", "theiaos", "status", "--verbose"])).toBe(true);
    expect(getVerboseFlag(["node", "theiaos", "status", "--debug"])).toBe(false);
    expect(getVerboseFlag(["node", "theiaos", "status", "--debug"], { includeDebug: true })).toBe(
      true,
    );
  });

  it("parses positive integer flag values", () => {
    expect(getPositiveIntFlagValue(["node", "theiaos", "status"], "--timeout")).toBeUndefined();
    expect(
      getPositiveIntFlagValue(["node", "theiaos", "status", "--timeout"], "--timeout"),
    ).toBeNull();
    expect(
      getPositiveIntFlagValue(["node", "theiaos", "status", "--timeout", "5000"], "--timeout"),
    ).toBe(5000);
    expect(
      getPositiveIntFlagValue(["node", "theiaos", "status", "--timeout", "nope"], "--timeout"),
    ).toBeUndefined();
  });

  it("builds parse argv from raw args", () => {
    const nodeArgv = buildParseArgv({
      programName: "theiaos",
      rawArgs: ["node", "theiaos", "status"],
    });
    expect(nodeArgv).toEqual(["node", "theiaos", "status"]);

    const versionedNodeArgv = buildParseArgv({
      programName: "theiaos",
      rawArgs: ["node-22", "theiaos", "status"],
    });
    expect(versionedNodeArgv).toEqual(["node-22", "theiaos", "status"]);

    const versionedNodeWindowsArgv = buildParseArgv({
      programName: "theiaos",
      rawArgs: ["node-22.2.0.exe", "theiaos", "status"],
    });
    expect(versionedNodeWindowsArgv).toEqual(["node-22.2.0.exe", "theiaos", "status"]);

    const versionedNodePatchlessArgv = buildParseArgv({
      programName: "theiaos",
      rawArgs: ["node-22.2", "theiaos", "status"],
    });
    expect(versionedNodePatchlessArgv).toEqual(["node-22.2", "theiaos", "status"]);

    const versionedNodeWindowsPatchlessArgv = buildParseArgv({
      programName: "theiaos",
      rawArgs: ["node-22.2.exe", "theiaos", "status"],
    });
    expect(versionedNodeWindowsPatchlessArgv).toEqual(["node-22.2.exe", "theiaos", "status"]);

    const versionedNodeWithPathArgv = buildParseArgv({
      programName: "theiaos",
      rawArgs: ["/usr/bin/node-22.2.0", "theiaos", "status"],
    });
    expect(versionedNodeWithPathArgv).toEqual(["/usr/bin/node-22.2.0", "theiaos", "status"]);

    const nodejsArgv = buildParseArgv({
      programName: "theiaos",
      rawArgs: ["nodejs", "theiaos", "status"],
    });
    expect(nodejsArgv).toEqual(["nodejs", "theiaos", "status"]);

    const nonVersionedNodeArgv = buildParseArgv({
      programName: "theiaos",
      rawArgs: ["node-dev", "theiaos", "status"],
    });
    expect(nonVersionedNodeArgv).toEqual(["node", "theiaos", "node-dev", "theiaos", "status"]);

    const directArgv = buildParseArgv({
      programName: "theiaos",
      rawArgs: ["theiaos", "status"],
    });
    expect(directArgv).toEqual(["node", "theiaos", "status"]);

    const bunArgv = buildParseArgv({
      programName: "theiaos",
      rawArgs: ["bun", "src/entry.ts", "status"],
    });
    expect(bunArgv).toEqual(["bun", "src/entry.ts", "status"]);
  });

  it("builds parse argv from fallback args", () => {
    const fallbackArgv = buildParseArgv({
      programName: "theiaos",
      fallbackArgv: ["status"],
    });
    expect(fallbackArgv).toEqual(["node", "theiaos", "status"]);
  });

  it("decides when to migrate state", () => {
    expect(shouldMigrateState(["node", "theiaos", "status"])).toBe(false);
    expect(shouldMigrateState(["node", "theiaos", "health"])).toBe(false);
    expect(shouldMigrateState(["node", "theiaos", "sessions"])).toBe(false);
    expect(shouldMigrateState(["node", "theiaos", "config", "get", "update"])).toBe(false);
    expect(shouldMigrateState(["node", "theiaos", "config", "unset", "update"])).toBe(false);
    expect(shouldMigrateState(["node", "theiaos", "models", "list"])).toBe(false);
    expect(shouldMigrateState(["node", "theiaos", "models", "status"])).toBe(false);
    expect(shouldMigrateState(["node", "theiaos", "memory", "status"])).toBe(false);
    expect(shouldMigrateState(["node", "theiaos", "agent", "--message", "hi"])).toBe(false);
    expect(shouldMigrateState(["node", "theiaos", "agents", "list"])).toBe(true);
    expect(shouldMigrateState(["node", "theiaos", "message", "send"])).toBe(true);
  });

  it("reuses command path for migrate state decisions", () => {
    expect(shouldMigrateStateFromPath(["status"])).toBe(false);
    expect(shouldMigrateStateFromPath(["config", "get"])).toBe(false);
    expect(shouldMigrateStateFromPath(["models", "status"])).toBe(false);
    expect(shouldMigrateStateFromPath(["agents", "list"])).toBe(true);
  });
});
