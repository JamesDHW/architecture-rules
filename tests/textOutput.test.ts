import { describe, expect, it } from "vitest";

import { defineArchitecture } from "../src/index.js";
import type { ClassifiedFile } from "../src/analysis/inventory.js";
import type { CheckResult } from "../src/runner/checkResult.js";
import type { Finding } from "../src/runner/findings.js";
import { renderJson, renderText } from "../src/runner/textOutput.js";

const architecture = defineArchitecture({
  projects: { tsconfigs: ["tsconfig.json"] },
  layers: {
    domain: { description: "Domain", files: ["src/domain/**"] },
    route: { description: "Routes", files: ["src/routes/**"] },
  },
});

const file = (relative: string, layer: string): ClassifiedFile => {
  const policy = architecture.layers[layer]?.policy ?? expect.unreachable(`layer ${layer} is defined`);
  return { path: `/root/${relative}`, relative, layer, policy };
};

const finding = (overrides: Partial<Finding> & Pick<Finding, "file" | "ruleId">): Finding => ({
  source: "lint", severity: "error", line: 1, column: 1, message: "Message.", ...overrides,
});

const projectFinding = (ruleId: string): Finding => ({ source: "lint", severity: "warning", ruleId, file: "package.json", message: "Message." });

const result = (findings: readonly Finding[]): CheckResult => ({
  architecture,
  projects: 2,
  files: [file("src/domain/order.ts", "domain"), file("src/routes/about.tsx", "route")],
  findings,
  suppressions: [],
  stages: [{ name: "structure", status: "passed" }, { name: "lint", status: findings.length === 0 ? "passed" : "failed" }, { name: "types", status: "passed" }],
  durationMs: 2400,
});

describe("renderText", () => {
  it("groups findings by file and summarises them by rule, layer and stage", () => {
    const text = renderText(result([
      finding({ file: "src/domain/order.ts", ruleId: "no-let", line: 12, column: 5 }),
      finding({ file: "src/domain/order.ts", ruleId: "no-let", line: 40 }),
      finding({ file: "src/routes/about.tsx", ruleId: "allowed-imports", line: 3 }),
      projectFinding("unused-dependencies"),
    ]), []);
    expect(text).toContain("architecture-check · 2 projects · 2 files · 2 layers");
    expect(text).toContain("src/domain/order.ts\n  12:5  error    no-let");
    expect(text).toContain("✗ 3 errors and 1 warning in 3 files");
    expect(text).toContain("by rule:   no-let 2 · allowed-imports 1 · unused-dependencies 1");
    expect(text).toContain("by layer:  domain 2 · project 1 · route 1");
    expect(text).toContain("stages:    structure ✓ · lint ✗ · types ✓ · 2.4s");
  });

  it("prints one line when nothing was found", () => {
    const text = renderText(result([]), []);
    expect(text).toContain("✓ No findings");
    expect(text).not.toContain("by rule");
    expect(text).not.toContain("How to fix");
  });

  it("names no tool in its output", () => {
    const text = renderText(result([finding({ file: "src/domain/order.ts", ruleId: "no-let" })]), []);
    expect(text.toLowerCase()).not.toMatch(/oxlint|knip|tsgolint/);
  });
});

describe("renderJson", () => {
  it("adds a summary next to the findings and guidance", () => {
    const parsed: unknown = JSON.parse(renderJson(result([finding({ file: "src/domain/order.ts", ruleId: "no-let" })]), []));
    expect(parsed).toMatchObject({ findings: [{ ruleId: "no-let" }], rules: [], summary: { projects: 2, files: 2, layers: 2, errors: 1, warnings: 0 } });
  });
});
