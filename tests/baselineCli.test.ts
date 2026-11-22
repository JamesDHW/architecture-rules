import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { isRecord } from "../src/core/guards.js";
import { run } from "./utils/cliFixtures.js";
import { writeFiles } from "./utils/fixtures.js";
import { baselineJson, commitAll, debtFixture, gitIn, letFunction, readText } from "./utils/gitFixture.js";

const parse = (text: string): unknown => JSON.parse(text);

/** The findings of a --json check. */
const findingsIn = (stdout: string): unknown => {
  const parsed = parse(stdout);
  return isRecord(parsed) ? parsed.findings : undefined;
};

const recordedRoot = (adoption = ""): string => {
  const root = debtFixture(adoption);
  expect(run(["baseline"], root).status).toBe(0);
  commitAll(root, "baseline");
  return root;
};

describe("baseline and gates", { timeout: 60_000 }, () => {
  it("records existing errors once, then passes with them listed as recorded", () => {
    const root = debtFixture();
    expect(run([], root).status).toBe(1);
    const recorded = run(["baseline"], root);
    expect(recorded.status, recorded.stderr).toBe(0);
    expect(recorded.stdout).toContain("Recorded 2 errors");
    expect(baselineJson(root)).toMatchObject({ version: 1, entries: [{ file: "src/domain/model.ts", rule: "allowed-imports" }, { file: "src/domain/model.ts", rule: "no-let" }] });
    const checked = run([], root);
    expect(checked.status, checked.stdout).toBe(0);
    expect(checked.stdout).toContain("2 recorded errors in 1 file, not listed");
  });
  it("fails a new error in another file, and an error recorded fewer times than it occurs", () => {
    const root = recordedRoot();
    writeFiles(root, { "src/domain/counter.ts": letFunction("counter") });
    const added = run(["--json"], root);
    expect(added.status).toBe(1);
    expect(findingsIn(added.stdout)).toEqual(expect.arrayContaining([expect.objectContaining({ file: "src/domain/counter.ts", ruleId: "no-let", status: "new" })]));
    writeFiles(root, { "src/domain/counter.ts": "export const counter = 1;\n", "src/domain/model.ts": `${readText(root, "src/domain/model.ts")}\n${letFunction("again")}` });
    const grown = run([], root);
    expect(grown.status).toBe(1);
    expect(grown.stdout).toContain("recorded 1 times in this file, now 2");
  });
  it("keeps the baseline when code moves within a file, and prunes debt once it is fixed", () => {
    const root = recordedRoot();
    writeFiles(root, { "src/domain/model.ts": `\n\n${readText(root, "src/domain/model.ts")}` });
    expect(run([], root).status).toBe(0);
    expect(readText(root, "architecture.baseline.json")).toBe(gitIn(root, ["show", "HEAD:architecture.baseline.json"]));
    writeFiles(root, { "src/domain/model.ts": "import { label } from \"../ui/label.js\";\n\nexport const describeModel = (): string => `model ${label}`;\n" });
    const fixed = run([], root);
    expect(fixed.status, fixed.stdout).toBe(0);
    expect(fixed.stdout).toContain("Baseline: removed fixed debt from architecture.baseline.json.");
    expect(baselineJson(root)).toMatchObject({ entries: [{ rule: "allowed-imports" }] });
  });
  it("fails recorded debt in a file the change touches, but not import debt, which is no-new on touch", () => {
    const root = recordedRoot();
    writeFiles(root, { "src/domain/model.ts": `${readText(root, "src/domain/model.ts")}// edited\n` });
    const touched = run(["--worktree", "--json"], root);
    expect(touched.status).toBe(3);
    expect(findingsIn(touched.stdout)).toEqual(expect.arrayContaining([
      expect.objectContaining({ ruleId: "no-let", status: "touched" }), expect.objectContaining({ ruleId: "allowed-imports", status: "baselined" }),
    ]));
    gitIn(root, ["add", "src/domain/model.ts"]);
    expect(run(["--staged"], root).status).toBe(3);
    expect(run([], root).status).toBe(0);
  });
  it("lets the configuration make a rule no-new on touch", () => {
    const root = recordedRoot(`adoption: { onTouch: { rules: { "no-let": "no-new" } } },`);
    writeFiles(root, { "src/domain/model.ts": `${readText(root, "src/domain/model.ts")}// edited\n` });
    expect(run(["--worktree"], root).status).toBe(0);
  });
  it("stages the pruned baseline in a pre-commit run", () => {
    const root = recordedRoot();
    writeFiles(root, { "src/domain/model.ts": "import { label } from \"../ui/label.js\";\n\nexport const describeModel = (): string => `model ${label}`;\n" });
    gitIn(root, ["add", "src/domain/model.ts"]);
    const staged = run(["--staged"], root);
    expect(staged.status, staged.stdout).toBe(0);
    expect(gitIn(root, ["diff", "--cached", "--name-only"])).toContain("architecture.baseline.json");
  });
  it("lets recorded debt follow a renamed file", () => {
    const root = recordedRoot();
    gitIn(root, ["mv", "src/domain/model.ts", "src/domain/legacyModel.ts"]);
    const moved = run(["--staged"], root);
    expect(moved.status, moved.stdout).toBe(0);
    expect(baselineJson(root)).toMatchObject({ entries: [{ file: "src/domain/legacyModel.ts" }, { file: "src/domain/legacyModel.ts" }] });
  });
  it("in CI, fails growth without a reason and a stale baseline, and allows growth accepted with a reason", () => {
    const root = recordedRoot();
    gitIn(root, ["checkout", "-qb", "feature"]);
    writeFiles(root, { "src/domain/counter.ts": letFunction("counter") });
    expect(run(["baseline", "--accept"], root).status).toBe(1);
    expect(run(["baseline", "--accept", "--reason", "Spike kept for the demo."], root).status).toBe(0);
    commitAll(root, "accepted");
    const accepted = run(["--since", "main", "--ci", "--summary", "summary.md"], root);
    expect(accepted.status, accepted.stdout).toBe(0);
    expect(readText(root, "summary.md")).toContain("| Recorded debt | 2 → 3 (+1) |");
    writeFileSync(join(root, "architecture.baseline.json"), readText(root, "architecture.baseline.json").replace(",\"accepted\":\"Spike kept for the demo.\"", ""));
    commitAll(root, "hand edit");
    const handEdited = run(["--since", "main", "--ci"], root);
    expect(handEdited.stdout).toContain("Baseline grew without a reason");
    expect([3, 4]).toContain(handEdited.status);
    gitIn(root, ["checkout", "-q", "main"]);
    writeFiles(root, { "src/domain/model.ts": "import { label } from \"../ui/label.js\";\n\nexport const describeModel = (): string => `model ${label}`;\n" });
    commitAll(root, "fix without pruning");
    const stale = run(["--since", "HEAD~1", "--ci"], root);
    expect(stale.status, stale.stdout).toBe(5);
    expect(stale.stdout).toContain("Stale baseline");
  });
  it("records a newly enabled rule's findings with --rule", () => {
    const root = recordedRoot();
    writeFiles(root, { "src/domain/counter.ts": letFunction("counter") });
    const recorded = run(["baseline", "--rule", "no-let"], root);
    expect(recorded.status, recorded.stderr).toBe(0);
    expect(readText(root, "architecture.baseline.json")).toContain("\"accepted\":\"Recorded when the rule was turned on.\"");
    expect(run(["baseline", "--rule", "no-such-rule"], root).stderr).toContain("Unknown rule: no-such-rule");
  });
  it("prints only what must change for agents, on stderr, and exits 2", () => {
    const root = recordedRoot();
    writeFiles(root, { "src/domain/model.ts": `${readText(root, "src/domain/model.ts")}// edited\n` });
    const failing = run(["--format", "agent", "--file", "src/domain/model.ts"], root);
    expect(failing.status).toBe(2);
    expect(failing.stdout).toBe("");
    expect(failing.stderr).toContain("src/domain/model.ts:4:3 no-let:");
    expect(failing.stderr).toContain("fix no-let:");
    const passing = run(["--format", "agent", "--file", "src/ui/view.ts"], root);
    expect(passing.status).toBe(0);
    expect(passing.stderr).toBe("");
    expect(run(["--format", "agent", "--file", "README.md"], root).status).toBe(0);
  });
  it("reports but never fails in observe mode", () => {
    const root = debtFixture(`adoption: { mode: "observe" },`);
    const observed = run([], root);
    expect(observed.status).toBe(0);
    expect(observed.stdout).toContain("Observe mode");
  });
  it("merges three versions of a baseline without conflicts", () => {
    const root = recordedRoot();
    const entry = (count: number, rule = "no-let"): string => `{"file":"src/a.ts","rule":"${rule}","count":${count},"message":"m"}`;
    const file = (entries: readonly string[]): string => `{"version":1,"entries":[${entries.join(",")}]}`;
    writeFiles(root, { "ancestor.json": file([entry(3)]), "current.json": file([entry(2)]), "other.json": file([entry(3), entry(1, "no-else")]) });
    expect(run(["baseline", "merge", "ancestor.json", "current.json", "other.json"], root).status).toBe(0);
    expect(baselineJson(root, "current.json")).toEqual({ version: 1, entries: [{ file: "src/a.ts", rule: "no-else", count: 1, message: "m" }, { file: "src/a.ts", rule: "no-let", count: 2, message: "m" }] });
  });
  it("rejects a baseline file it cannot read", () => {
    const root = recordedRoot();
    writeFiles(root, { "architecture.baseline.json": "{\"version\":2,\"entries\":[]}" });
    expect(run([], root).stderr).toContain("is not a version 1 architecture baseline");
  });
});
