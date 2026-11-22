import { describe, expect, it } from "vitest";

import { touchPolicyFor } from "../src/config/adoption.js";
import { normalizeArchitecture } from "../src/config/defineArchitecture.js";
import { ArchitectureError } from "../src/errors/architectureError.js";

const config = (adoption: unknown): unknown => ({
  projects: { tsconfigs: ["tsconfig.json"] },
  layers: { app: { description: "App", files: ["src/**"] } },
  ...(adoption === undefined ? {} : { adoption }),
});

describe("adoption settings", () => {
  it("enforces by default, fixing every rule on touch except imports", () => {
    const architecture = normalizeArchitecture(config(undefined));
    if (architecture instanceof ArchitectureError) return expect.unreachable(architecture.message);
    expect(architecture.adoption.mode).toBe("enforce");
    expect(touchPolicyFor(architecture.adoption, "no-let")).toBe("fix");
    expect(touchPolicyFor(architecture.adoption, "allowed-imports")).toBe("no-new");
  });
  it("reads the mode, a default and per-rule policies", () => {
    const architecture = normalizeArchitecture(config({ mode: "observe", onTouch: { default: "no-new", rules: { "no-let": "fix" } } }));
    if (architecture instanceof ArchitectureError) return expect.unreachable(architecture.message);
    expect(architecture.adoption.mode).toBe("observe");
    expect(touchPolicyFor(architecture.adoption, "no-else")).toBe("no-new");
    expect(touchPolicyFor(architecture.adoption, "no-let")).toBe("fix");
  });
  it("rejects unknown fields, modes, policies and rules", () => {
    const invalid = normalizeArchitecture(config({ mode: "loud", extra: true, onTouch: { default: "maybe", rules: { "no-such-rule": "fix" } } }));
    expect(invalid).toBeInstanceOf(ArchitectureError);
    const issues = invalid instanceof ArchitectureError ? invalid.issues : [];
    expect(issues).toEqual(expect.arrayContaining([
      "Unknown adoption field: extra",
      "adoption.mode must be enforce or observe",
      "adoption.onTouch.default must be fix or no-new",
      "adoption.onTouch.rules: unknown rule no-such-rule",
    ]));
  });
});
