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

  it("accepts JSON output and repeated --file selections", () => {
    expect(parseArgs(["--format", "json", "--file", "src/a.ts", "--file", "src/b.ts"])).toEqual({
      kind: "run",
      target: ".",
      fix: false,
      format: "json",
      files: ["src/a.ts", "src/b.ts"],
    });
    expect(parseArgs(["--format", "text"])).toEqual({ kind: "run", target: ".", fix: false });
    expect(parseArgs(["--format", "xml"]).kind).toBe("error");
    expect(parseArgs(["--file"]).kind).toBe("error");
  });

  it("accepts report with an optional project directory", () => {
    expect(parseArgs(["report"])).toEqual({ kind: "run", target: ".", fix: false, format: "report" });
    expect(parseArgs(["report", "../app", "--config", "a.config.ts"])).toEqual({ kind: "run", target: "../app", fix: false, format: "report", config: "a.config.ts" });
    expect(parseArgs(["report", "--fix"]).kind).toBe("error");
    expect(parseArgs(["report", "--format", "json"]).kind).toBe("error");
  });

});
