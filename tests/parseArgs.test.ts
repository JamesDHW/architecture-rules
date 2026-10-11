import { describe, expect, it } from "vitest";

import { parseArgs } from "../src/cli/parseArgs.js";

describe("parseArgs", () => {
  it("defaults to the current directory without --fix", () => {
    expect(parseArgs([])).toEqual({
      kind: "run",
      target: ".",
      fix: false,
    });
  });

  it("accepts a path and --fix", () => {
    expect(parseArgs(["--fix", "../other-app"])).toEqual({
      kind: "run",
      target: "../other-app",
      fix: true,
    });
  });

  it("prints help", () => {
    expect(parseArgs(["--help"]).kind).toBe("help");
    expect(parseArgs(["-h"]).kind).toBe("help");
  });

  it("rejects unknown flags and extra paths", () => {
    expect(parseArgs(["--quiet"])).toEqual({
      kind: "error",
      message: "Unknown option: --quiet",
    });
    expect(parseArgs(["src", "lib"])).toEqual({
      kind: "error",
      message: "Expected at most one path argument.",
    });
  });
  it("accepts explicit config and explain", () => {
    expect(parseArgs(["explain", "src/a.ts", "--config", "architecture.config.ts"])).toEqual({ kind: "run", target: ".", fix: false, config: "architecture.config.ts", explain: "src/a.ts" });
    expect(parseArgs(["--config"]).kind).toBe("error");
    expect(parseArgs(["explain", "src/a.ts", "--fix"]).kind).toBe("error");
  });
  it("accepts describe with an optional format and project directory", () => {
    expect(parseArgs(["describe"])).toEqual({ kind: "run", target: ".", fix: false, describe: "text" });
    expect(parseArgs(["describe", "--json", "../app"])).toEqual({ kind: "run", target: "../app", fix: false, describe: "json" });
    expect(parseArgs(["describe", "--mermaid", "--config", "a.config.ts"])).toEqual({ kind: "run", target: ".", fix: false, describe: "mermaid", config: "a.config.ts" });
  });
  it("rejects formats outside describe and conflicting formats", () => {
    expect(parseArgs(["--json"])).toEqual({ kind: "error", message: "--json and --mermaid only apply to describe" });
    expect(parseArgs(["describe", "--json", "--mermaid"])).toEqual({ kind: "error", message: "Choose one of --json and --mermaid" });
    expect(parseArgs(["describe", "--fix"]).kind).toBe("error");
    expect(parseArgs(["explain", "src/a.ts", "--json"]).kind).toBe("error");
  });

});
