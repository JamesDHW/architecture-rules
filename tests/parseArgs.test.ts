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
});
