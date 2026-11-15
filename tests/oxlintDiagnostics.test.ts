import { describe, expect, it } from "vitest";

import { ArchitectureError } from "../src/errors/architectureError.js";
import { noLetRule } from "../src/rules/noLet.rule.js";
import { parseOxlintOutput } from "../src/runner/oxlintDiagnostics.js";
import { guidanceFor } from "../src/runner/ruleGuidance.js";

const diagnostic = (code: string | undefined, message: string) => ({
  message,
  ...(code === undefined ? {} : { code }),
  severity: "error",
  filename: "/project/src/app.ts",
  labels: [{ span: { offset: 0, length: 3, line: 4, column: 7 } }],
});

const output = (...diagnostics: readonly unknown[]): string => JSON.stringify({ diagnostics });

describe("parseOxlintOutput", () => {
  it("maps lint codes to architecture rule ids", () => {
    const findings = parseOxlintOutput("/project", output(
      diagnostic("architecture(no-let)", "Declare this with const."),
      diagnostic("typescript(no-misused-promises)", "Promise-returning function provided to attribute."),
      diagnostic("eslint(eqeqeq)", "Expected ==="),
    ));
    expect(findings).toEqual([
      { source: "lint", severity: "error", ruleId: "no-let", file: "src/app.ts", line: 4, column: 7, message: "Declare this with const." },
      expect.objectContaining({ ruleId: "no-misused-promises" }),
      expect.objectContaining({ ruleId: "eqeqeq" }),
    ]);
  });

  it("keeps the code of a rule it does not know", () => {
    expect(parseOxlintOutput("/project", output(diagnostic("eslint(no-debugger)", "Unexpected debugger")))).toEqual([expect.objectContaining({ ruleId: "eslint(no-debugger)" })]);
  });

  it("rejects output that is not the lint engine's JSON", () => {
    expect(parseOxlintOutput("/project", "Failed to find tsgolint executable")).toBeInstanceOf(ArchitectureError);
  });
});

describe("guidanceFor", () => {
  it("gives each reporting rule's fix line and page once", () => {
    const findings = parseOxlintOutput("/project", output(diagnostic("architecture(no-let)", "a"), diagnostic("architecture(no-let)", "b")));
    if (findings instanceof ArchitectureError) return expect.unreachable(findings.message);
    const guidance = guidanceFor("/project", findings);
    expect(guidance.map((rule) => rule.ruleId)).toEqual(["no-let"]);
    expect(guidance.at(0)?.instead).toBe(noLetRule.instead);
    expect(guidance.at(0)?.docs).toMatch(/docs\/rules\/no-let\.md$/);
  });
});
