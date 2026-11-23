import { describe, expect, it } from "vitest";

import { inventory } from "../src/analysis/inventory.js";
import { exceptionMigrations, readExceptions } from "../src/analysis/suppressions.js";
import { applyExceptions } from "../src/runner/exceptions.js";
import type { Finding } from "../src/runner/findings.js";
import { openFixtureProjects } from "./utils/fixtures.js";
import { projectFixture, twoLayerArchitecture } from "./utils/projectFixture.js";

const read = (source: string) => {
  const root = projectFixture({ "src/domain/model.ts": source });
  const architecture = twoLayerArchitecture();
  const opened = openFixtureProjects(root, architecture);
  const { files } = inventory(root, architecture, opened.sources);
  return { ...readExceptions(files, opened.projects), migrations: exceptionMigrations(files, opened.projects) };
};

const lintFinding = (ruleId: string, line: number, source: Finding["source"] = "lint"): Finding => ({
  source, severity: "error", ruleId, file: "src/domain/model.ts", line, column: 1, message: "Message.",
});

describe("readExceptions", () => {
  it("applies next-line exceptions to the following line and line exceptions to their own", () => {
    const { exceptions, issues } = read(`// architecture-disable-next-line no-let, no-binding-alias -- The adapter needs a mutable counter.
export const a = 1;
export const b = 2; // architecture-disable-line no-let -- Same reason, on this line.
/* architecture-disable-next-line generic-name-denylist --
   The protocol names this field data. */
export const data = 3;`);
    expect(issues).toEqual([]);
    expect(exceptions).toEqual([
      { file: "src/domain/model.ts", line: 1, target: 2, rules: ["no-let", "no-binding-alias"], reason: "The adapter needs a mutable counter." },
      { file: "src/domain/model.ts", line: 3, target: 3, rules: ["no-let"], reason: "Same reason, on this line." },
      { file: "src/domain/model.ts", line: 4, target: 6, rules: ["generic-name-denylist"], reason: "The protocol names this field data." },
    ]);
  });

  it("rejects unknown rules and checks that cannot be excepted", () => {
    const { exceptions, issues } = read(`// architecture-disable-next-line no-such-rule -- Typo.
export const a = 1;
// architecture-disable-next-line file-classification -- Structural.
export const b = 2;`);
    expect(exceptions).toEqual([]);
    expect(issues.map((issue) => issue.message)).toEqual([
      expect.stringContaining('Unknown rule "no-such-rule"'),
      expect.stringContaining('"file-classification" cannot be excepted'),
    ]);
  });

  it("reads a directive on its own line before a closing brace", () => {
    const { issues } = read(`export const run = (start: () => void): void => {
  start();
  // oxlint-disable-next-line react-hooks/exhaustive-deps -- Not read by the engine either.
};`);
    expect(issues).toEqual([expect.objectContaining({ ruleId: "reasoned-suppressions", line: 3 })]);
    expect(issues.at(0)?.message).toContain("--fix converts this one");
  });

  it("names no engine in its messages", () => {
    const { issues } = read("/* oxlint-disable */\nexport const a = 1;");
    expect(issues.map((issue) => issue.message.toLowerCase()).join(" ")).not.toMatch(/oxlint|eslint/);
  });
});

describe("exceptionMigrations", () => {
  it("rewrites reasoned engine comments with architecture rule ids, keeping the comment delimiters", () => {
    const { migrations } = read(`// oxlint-disable-next-line architecture/no-let, eslint/id-denylist -- Needed here.
export const a = 1;
/* eslint-disable-line no-shadow -- Kept. */
// oxlint-disable-next-line some-plugin/unknown -- Left alone.
export const b = 2;`);
    expect(migrations.map((edit) => edit.replacement)).toEqual([
      "architecture-disable-next-line no-let, generic-name-denylist -- Needed here.",
      "architecture-disable-line no-shadow -- Kept.",
    ]);
  });
});

describe("applyExceptions", () => {
  const exception = { file: "src/domain/model.ts", line: 1, target: 2, rules: ["no-let", "no-binding-alias"], reason: "Reason." };

  it("drops covered findings and reports each excepted rule that covered nothing", () => {
    const findings = applyExceptions([lintFinding("no-let", 2), lintFinding("no-let", 3)], [exception]);
    expect(findings).toEqual([lintFinding("no-let", 3), expect.objectContaining({ ruleId: "reasoned-suppressions", line: 1 })]);
    expect(findings.at(1)?.message).toContain("no-binding-alias");
  });

  it("never excepts structural or compiler findings", () => {
    const structural = lintFinding("no-let", 2, "structure");
    expect(applyExceptions([structural], [{ ...exception, rules: ["no-let"] }])).toEqual([structural, expect.objectContaining({ ruleId: "reasoned-suppressions" })]);
  });
});
